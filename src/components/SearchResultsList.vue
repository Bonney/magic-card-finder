<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ScryfallCard } from '../services/ScryfallService';

const props = defineProps({
  results: {
    type: Array as () => ScryfallCard[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  totalCards: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['select-card', 'load-more']);

// Sorting functionality
const sortOptions = [
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'rarity', label: 'Rarity (Common → Mythic)' },
  { value: 'rarity-desc', label: 'Rarity (Mythic → Common)' },
  { value: 'set', label: 'Set (A-Z)' },
  { value: 'set-desc', label: 'Set (Z-A)' }
];

const currentSort = ref('name');

// Filter functionality
const filterText = ref('');
const filteredResults = computed(() => {
  if (!filterText.value.trim()) {
    return sortedResults.value;
  }
  
  const searchTerm = filterText.value.toLowerCase();
  return sortedResults.value.filter(card => 
    card.name.toLowerCase().includes(searchTerm) || 
    (card.type_line && card.type_line.toLowerCase().includes(searchTerm))
  );
});

// Rarity order for sorting
const rarityOrder = {
  'common': 1,
  'uncommon': 2,
  'rare': 3,
  'mythic': 4
};

// Sort results based on current sort option
const sortedResults = computed(() => {
  if (!props.results.length) return [];
  
  const sorted = [...props.results];
  
  switch (currentSort.value) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'rarity':
      return sorted.sort((a, b) => {
        const rarityA = a.rarity?.toLowerCase() || 'common';
        const rarityB = b.rarity?.toLowerCase() || 'common';
        return (rarityOrder[rarityA] || 0) - (rarityOrder[rarityB] || 0);
      });
    case 'rarity-desc':
      return sorted.sort((a, b) => {
        const rarityA = a.rarity?.toLowerCase() || 'common';
        const rarityB = b.rarity?.toLowerCase() || 'common';
        return (rarityOrder[rarityB] || 0) - (rarityOrder[rarityA] || 0);
      });
    case 'set':
      return sorted.sort((a, b) => (a.set_name || '').localeCompare(b.set_name || ''));
    case 'set-desc':
      return sorted.sort((a, b) => (b.set_name || '').localeCompare(a.set_name || ''));
    default:
      return sorted;
  }
});

// Keyboard navigation
const selectedIndex = ref(-1);
const listRef = ref<HTMLElement | null>(null);
const cardRefs = ref<HTMLElement[]>([]);

// Reset selected index when results change
const resetSelection = () => {
  selectedIndex.value = -1;
  cardRefs.value = [];
};

// Watch for changes in filtered results
const updateCardRefs = () => {
  // Wait for DOM to update
  setTimeout(() => {
    if (listRef.value) {
      cardRefs.value = Array.from(listRef.value.querySelectorAll('li[data-card-index]'));
    }
  }, 100);
};

// Scroll to the selected card
const scrollToSelectedCard = () => {
  // Use setTimeout to ensure DOM is updated
  setTimeout(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < filteredResults.value.length) {
      const selectedCard = document.querySelector(`li[data-card-index="${selectedIndex.value}"]`);
      if (selectedCard) {
        // Check if the element is not fully visible in the viewport
        const rect = selectedCard.getBoundingClientRect();
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        
        if (!isVisible) {
          // Use scrollIntoView with specific options for better control
          selectedCard.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }
  }, 10);
};

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  // Only handle keyboard navigation when we have results
  if (filteredResults.value.length === 0) return;
  
  // Focus filter input when pressing '/'
  if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
    event.preventDefault();
    const filterInput = document.querySelector('input[placeholder="Filter results..."]') as HTMLInputElement;
    if (filterInput) {
      filterInput.focus();
    }
    return;
  }
  
  // Only handle arrow keys, Enter, and Escape when not in an input
  if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
    if (event.key === 'Escape') {
      (document.activeElement as HTMLElement).blur();
      event.preventDefault();
    }
    return;
  }
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      if (selectedIndex.value < filteredResults.value.length - 1) {
        selectedIndex.value++;
        scrollToSelectedCard();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (selectedIndex.value > 0) {
        selectedIndex.value--;
        scrollToSelectedCard();
      } else if (selectedIndex.value === -1 && filteredResults.value.length > 0) {
        // If nothing is selected yet, select the first item
        selectedIndex.value = 0;
        scrollToSelectedCard();
      }
      break;
    case 'Home':
      event.preventDefault();
      if (filteredResults.value.length > 0) {
        selectedIndex.value = 0;
        scrollToSelectedCard();
      }
      break;
    case 'End':
      event.preventDefault();
      if (filteredResults.value.length > 0) {
        selectedIndex.value = filteredResults.value.length - 1;
        scrollToSelectedCard();
      }
      break;
    case 'Enter':
      event.preventDefault();
      if (selectedIndex.value >= 0 && selectedIndex.value < filteredResults.value.length) {
        selectCard(filteredResults.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      resetSelection();
      break;
  }
};

// Set up keyboard event listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  updateCardRefs();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Get a thumbnail image for the card
const getCardThumbnail = (card: ScryfallCard): string | null => {
  if (card.image_uris?.art_crop) {
    return card.image_uris.art_crop;
  } else if (card.card_faces && card.card_faces[0]?.image_uris?.art_crop) {
    return card.card_faces[0].image_uris.art_crop;
  }
  return null;
};

// Get card colors or mana cost for display
const getCardColorInfo = (card: ScryfallCard): string => {
  return card.mana_cost || '';
};

// Handle card selection
const selectCard = (card: ScryfallCard) => {
  emit('select-card', card);
};

// Handle load more button click
const loadMore = () => {
  emit('load-more');
};

// Clear filter
const clearFilter = () => {
  filterText.value = '';
};

// Handle sort change
const handleSortChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  currentSort.value = select.value;
  resetSelection();
};

// Watch for changes in filtered results to update card refs
const watchFilteredResults = () => {
  resetSelection();
  updateCardRefs();
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Results header -->
    <div class="mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
      <h2 class="text-xl font-semibold text-gray-800">
        <span v-if="!loading && totalCards > 0">{{ totalCards }} cards found</span>
        <span v-else-if="loading">Searching...</span>
        <span v-else>No results</span>
      </h2>
      
      <div class="flex flex-col md:flex-row gap-3 md:items-center">
        <!-- Sort dropdown -->
        <div class="relative">
          <select
            :value="currentSort"
            @change="handleSortChange"
            class="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option disabled>Sort by</option>
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </div>
        </div>
        
        <!-- Filter input -->
        <div class="relative w-full md:w-64">
          <input
            v-model="filterText"
            type="text"
            placeholder="Filter results..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="watchFilteredResults"
          />
          <button 
            v-if="filterText" 
            @click="clearFilter"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Keyboard navigation help -->
    <div class="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
      <p class="font-medium mb-1">Keyboard shortcuts:</p>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div><span class="font-mono bg-gray-200 px-1 rounded">↑/↓</span> Navigate cards</div>
        <div><span class="font-mono bg-gray-200 px-1 rounded">Enter</span> Select card</div>
        <div><span class="font-mono bg-gray-200 px-1 rounded">/</span> Focus filter</div>
        <div><span class="font-mono bg-gray-200 px-1 rounded">Home/End</span> First/Last card</div>
        <div><span class="font-mono bg-gray-200 px-1 rounded">Esc</span> Clear selection</div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading && results.length === 0" class="py-8">
      <div class="flex flex-col items-center">
        <div class="w-full h-16 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
        <div class="w-full h-16 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
        <div class="w-full h-16 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
      </div>
    </div>
    
    <!-- Results list -->
    <div v-else-if="results.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Filter info -->
      <div v-if="filterText && filteredResults.length !== sortedResults.length" class="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b border-blue-100">
        Showing {{ filteredResults.length }} of {{ results.length }} cards
        <button @click="clearFilter" class="ml-2 text-blue-600 hover:underline">Clear filter</button>
      </div>
      
      <ul ref="listRef" class="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
        <li 
          v-for="(card, index) in filteredResults" 
          :key="card.id" 
          :data-card-index="index"
          :class="[
            'transition-colors cursor-pointer', 
            selectedIndex === index ? 'bg-blue-100' : 'hover:bg-blue-50'
          ]"
          @click="selectCard(card)"
          @mouseover="selectedIndex = index"
        >
          <div class="flex items-center p-4">
            <!-- Card thumbnail -->
            <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded overflow-hidden">
              <img 
                v-if="getCardThumbnail(card)" 
                :src="getCardThumbnail(card)" 
                :alt="card.name" 
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                No image
              </div>
            </div>
            
            <!-- Card info -->
            <div class="ml-4 flex-1">
              <div class="flex justify-between">
                <h3 class="text-lg font-medium text-gray-900">{{ card.name }}</h3>
                <span class="text-sm text-gray-500">{{ getCardColorInfo(card) }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ card.type_line }}</p>
              <div class="flex mt-1">
                <span class="text-xs bg-gray-200 rounded px-2 py-1 mr-2">{{ card.set_name }}</span>
                <span class="text-xs bg-gray-200 rounded px-2 py-1 capitalize">{{ card.rarity }}</span>
              </div>
            </div>
            
            <!-- Arrow icon -->
            <div class="ml-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </li>
      </ul>
      
      <!-- No results after filtering -->
      <div v-if="filterText && filteredResults.length === 0" class="p-8 text-center">
        <p class="text-gray-600">No cards match your filter.</p>
        <button @click="clearFilter" class="mt-2 text-blue-600 hover:underline">Clear filter</button>
      </div>
      
      <!-- Load more button -->
      <div v-if="!filterText && props.results.length < totalCards" class="p-4 bg-gray-50 border-t border-gray-200">
        <button 
          @click="loadMore" 
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          :disabled="loading"
        >
          <span v-if="loading">Loading more...</span>
          <span v-else>Load more cards</span>
        </button>
      </div>
    </div>
    
    <!-- No results -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600">No cards found matching your search.</p>
      <p class="text-gray-500 text-sm mt-2">Try a different search term or check your spelling.</p>
    </div>
  </div>
</template> 