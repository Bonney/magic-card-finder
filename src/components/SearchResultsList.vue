<script setup lang="ts">
import { ref, computed } from 'vue';
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

// Filter functionality
const filterText = ref('');
const filteredResults = computed(() => {
  if (!filterText.value.trim()) {
    return props.results;
  }
  
  const searchTerm = filterText.value.toLowerCase();
  return props.results.filter(card => 
    card.name.toLowerCase().includes(searchTerm) || 
    (card.type_line && card.type_line.toLowerCase().includes(searchTerm))
  );
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
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Results header -->
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-semibold text-gray-800">
        <span v-if="!loading && totalCards > 0">{{ totalCards }} cards found</span>
        <span v-else-if="loading">Searching...</span>
        <span v-else>No results</span>
      </h2>
      
      <!-- Filter input -->
      <div class="relative w-64">
        <input
          v-model="filterText"
          type="text"
          placeholder="Filter results..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div v-if="filterText && filteredResults.length !== results.length" class="bg-blue-50 px-4 py-2 text-sm text-blue-700 border-b border-blue-100">
        Showing {{ filteredResults.length }} of {{ results.length }} cards
        <button @click="clearFilter" class="ml-2 text-blue-600 hover:underline">Clear filter</button>
      </div>
      
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="card in filteredResults" 
          :key="card.id" 
          class="hover:bg-blue-50 transition-colors cursor-pointer"
          @click="selectCard(card)"
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