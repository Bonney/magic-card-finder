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
      <ul class="divide-y divide-gray-200">
        <li 
          v-for="card in results" 
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
      
      <!-- Load more button -->
      <div v-if="props.results.length < totalCards" class="p-4 bg-gray-50 border-t border-gray-200">
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