<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import type { PropType } from 'vue';
import type { ScryfallCard } from '../services/ScryfallService';
import CardDrawingOverlay from './CardDrawingOverlay.vue';

const props = defineProps({
  card: {
    type: Object as PropType<ScryfallCard | undefined>,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Track image loading state
const frontImageLoaded = ref(false);
const backImageLoaded = ref(false);
const frontImageError = ref(false);
const backImageError = ref(false);
const debugInfo = ref('');

// Reset image states when card changes
watch(() => props.card, () => {
  frontImageLoaded.value = false;
  backImageLoaded.value = false;
  frontImageError.value = false;
  backImageError.value = false;
  debugInfo.value = '';
}, { deep: true });

// Handle image load events
const onFrontImageLoad = () => {
  console.log('Front image loaded successfully');
  frontImageLoaded.value = true;
  debugInfo.value += 'Front image loaded. ';
};

const onBackImageLoad = () => {
  console.log('Back image loaded successfully');
  backImageLoaded.value = true;
  debugInfo.value += 'Back image loaded. ';
};

const onFrontImageError = (e: Event) => {
  console.error('Front image failed to load', e);
  frontImageError.value = true;
  debugInfo.value += 'Front image error. ';
};

const onBackImageError = (e: Event) => {
  console.error('Back image failed to load', e);
  backImageError.value = true;
  debugInfo.value += 'Back image error. ';
};

// Check if the card is double-faced
const isDoubleFaced = computed(() => {
  if (!props.card?.card_faces) return false;
  return props.card.card_faces.length > 1 && props.card.card_faces[0]?.image_uris != null;
});

// Get the appropriate image URI
const cardImage = computed(() => {
  if (!props.card) return null;
  
  let imageUrl = null;
  
  if (isDoubleFaced.value && props.card.card_faces?.[0]?.image_uris) {
    // For double-faced cards, use the front face
    imageUrl = props.card.card_faces[0].image_uris.normal || 
               props.card.card_faces[0].image_uris.large || 
               props.card.card_faces[0].image_uris.png;
  } else if (props.card.image_uris) {
    // For regular cards
    imageUrl = props.card.image_uris.normal || 
               props.card.image_uris.large || 
               props.card.image_uris.png;
  }
  
  // Add a cache-busting parameter to prevent CORS issues
  if (imageUrl) {
    imageUrl = `${imageUrl}?${Date.now()}`;
  }
  
  console.log('Card image URL:', imageUrl);
  return imageUrl;
});

// Get the back face image if available
const backFaceImage = computed(() => {
  if (!props.card?.card_faces?.[1]?.image_uris) return null;
  
  const imageUrl = props.card.card_faces[1].image_uris.normal || 
                   props.card.card_faces[1].image_uris.large || 
                   props.card.card_faces[1].image_uris.png;
  
  // Add a cache-busting parameter to prevent CORS issues
  const finalUrl = imageUrl ? `${imageUrl}?${Date.now()}` : null;
  
  console.log('Back face image URL:', finalUrl);
  return finalUrl;
});

// Get art crop for fallback
const artCropImage = computed(() => {
  if (!props.card) return null;
  
  if (isDoubleFaced.value && props.card.card_faces && props.card.card_faces[0].image_uris) {
    return props.card.card_faces[0].image_uris.art_crop;
  } else if (props.card.image_uris) {
    return props.card.image_uris.art_crop;
  }
  
  return null;
});

// For debugging - log the card data when it changes
watch(() => props.card, (newCard) => {
  if (newCard) {
    console.log('Card data:', JSON.stringify(newCard, null, 2));
  }
}, { immediate: true, deep: true });

// Add refs for card dimensions
const cardWidth = ref(288); // w-72 = 18rem = 288px
const cardHeight = ref(384); // Aspect ratio 5:7 for Magic cards

// Add drawing mode state
const isDrawingMode = ref(false);
</script>

<template>
  <div class="mt-12 flex flex-col items-center">
    <div v-if="loading" class="flex flex-col items-center">
      <div class="w-72 h-96 rounded-lg bg-gray-200 animate-pulse"></div>
      <p class="mt-6 text-gray-500 text-lg">Loading card...</p>
    </div>
    
    <div v-else-if="card" class="flex flex-col items-center w-full max-w-6xl">
      <!-- Add drawing mode toggle -->
      <div class="mb-4">
        <button 
          @click="isDrawingMode = !isDrawingMode"
          class="px-4 py-2 rounded-lg"
          :class="isDrawingMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
        >
          {{ isDrawingMode ? 'Exit Drawing Mode' : 'Enter Drawing Mode' }}
        </button>
      </div>

      <!-- Debug info (only in development) -->
      <div v-if="debugInfo" class="mb-4 p-2 bg-yellow-100 text-xs text-gray-700 rounded w-full max-w-md">
        <p>Debug: {{ debugInfo }}</p>
        <p v-if="cardImage">Image URL: {{ cardImage }}</p>
      </div>
      
      <!-- Card images container -->
      <div :class="[
        'w-full flex gap-8',
        isDoubleFaced ? 'flex-col lg:flex-row justify-center items-center' : 'justify-center'
      ]">
        <!-- Regular or front face of double-faced card -->
        <div class="relative group" v-if="cardImage">
          <!-- Loading placeholder -->
          <div v-if="!frontImageLoaded && !frontImageError" class="w-72 h-96 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <p class="text-gray-500">Loading image...</p>
          </div>
          
          <!-- Error fallback -->
          <div v-if="frontImageError" class="w-72 h-96 rounded-lg bg-gray-100 flex flex-col items-center justify-center p-4 border border-gray-300">
            <p class="text-red-500 mb-2">Image failed to load</p>
            <img 
              v-if="artCropImage" 
              :src="artCropImage" 
              :alt="card.name + ' (art crop)'"
              class="max-w-full rounded"
            />
            <p v-else class="text-gray-500">No image available</p>
            <a 
              :href="cardImage" 
              target="_blank" 
              class="mt-2 text-blue-500 text-sm underline"
            >
              Open image directly
            </a>
          </div>
          
          <!-- Direct image link for testing -->
          <div class="mb-4 text-center">
            <a 
              :href="cardImage" 
              target="_blank" 
              class="text-blue-500 text-sm underline"
            >
              View image in new tab
            </a>
          </div>
          
          <!-- Front face label for double-faced cards -->
          <div v-if="isDoubleFaced" class="text-center mb-3 text-gray-700 lg:absolute lg:-top-8 lg:left-0 lg:right-0">
            <span class="bg-gray-200 px-3 py-1 rounded text-sm font-medium">Front Face</span>
          </div>
          
          <!-- Card container with drawing overlay -->
          <div class="relative">
            <img 
              v-show="!frontImageError"
              :src="cardImage" 
              :alt="card.name"
              class="rounded-lg shadow-lg w-auto h-auto max-w-xs md:max-w-sm transition-transform duration-300"
              :class="{ 'group-hover:scale-105': !isDrawingMode }"
              style="min-height: 300px; min-width: 215px;"
              @load="onFrontImageLoad"
              @error="onFrontImageError"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
            />
            <CardDrawingOverlay
              v-if="isDrawingMode && frontImageLoaded"
              :width="cardWidth"
              :height="cardHeight"
            />
          </div>
        </div>
        
        <!-- Back face of double-faced card (if applicable) -->
        <div class="relative group mt-8 lg:mt-0" v-if="backFaceImage">
          <!-- Loading placeholder -->
          <div v-if="!backImageLoaded && !backImageError" class="w-72 h-96 rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
            <p class="text-gray-500">Loading back face...</p>
          </div>
          
          <!-- Error fallback -->
          <div v-if="backImageError" class="w-72 h-96 rounded-lg bg-gray-100 flex items-center justify-center p-4 border border-gray-300">
            <p class="text-red-500">Back face image failed to load</p>
            <a 
              :href="backFaceImage" 
              target="_blank" 
              class="mt-2 text-blue-500 text-sm underline"
            >
              Open image directly
            </a>
          </div>
          
          <!-- Back face label -->
          <div class="text-center mb-3 text-gray-700 lg:absolute lg:-top-8 lg:left-0 lg:right-0">
            <span class="bg-gray-200 px-3 py-1 rounded text-sm font-medium">Back Face</span>
          </div>
          
          <!-- Card container with drawing overlay -->
          <div class="relative">
            <img 
              v-show="!backImageError"
              :src="backFaceImage" 
              :alt="`${card.name} (back face)`"
              class="rounded-lg shadow-lg w-auto h-auto max-w-xs md:max-w-sm transition-transform duration-300"
              :class="{ 'group-hover:scale-105': !isDrawingMode }"
              style="min-height: 300px; min-width: 215px;"
              @load="onBackImageLoad"
              @error="onBackImageError"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
            />
            <CardDrawingOverlay
              v-if="isDrawingMode && backImageLoaded"
              :width="cardWidth"
              :height="cardHeight"
            />
          </div>
        </div>
      </div>
      
      <!-- Card information -->
      <div class="mt-8 text-center max-w-2xl">
        <h2 class="text-2xl font-bold text-gray-800">{{ card.name }}</h2>
        <p class="text-gray-600 mt-2">{{ card.type_line }}</p>
        <p v-if="card.oracle_text" class="mt-4 text-gray-700">{{ card.oracle_text }}</p>
        
        <a 
          :href="card.scryfall_uri" 
          target="_blank" 
          class="inline-block mt-6 text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          View on Scryfall
        </a>
      </div>
    </div>
    
    <div v-else class="text-center text-gray-500 p-8 bg-gray-50 rounded-lg shadow-sm">
      <p class="text-lg">No card to display. Try searching for a Magic: The Gathering card.</p>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style> 