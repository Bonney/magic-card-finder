<script setup lang="ts">
import { ref } from 'vue';
import SearchBar from './components/SearchBar.vue';
import CardDisplay from './components/CardDisplay.vue';
import SearchResultsList from './components/SearchResultsList.vue';
import { ScryfallService, type ScryfallCard } from './services/ScryfallService';

const card = ref<ScryfallCard | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Search results state
const searchResults = ref<ScryfallCard[]>([]);
const totalCards = ref(0);
const hasMore = ref(false);
const nextPage = ref<string | null>(null);
const currentQuery = ref('');
const showResults = ref(false);

// Search for a single card (legacy method)
const searchCard = async (query: string) => {
  loading.value = true;
  error.value = null;
  
  try {
    card.value = await ScryfallService.searchCard(query);
  } catch (err: any) {
    error.value = err.message || 'Failed to find card. Please try another search.';
    card.value = null;
  } finally {
    loading.value = false;
  }
};

// Search for multiple cards
const searchCards = async (query: string) => {
  loading.value = true;
  error.value = null;
  showResults.value = true;
  currentQuery.value = query;
  
  try {
    const response = await ScryfallService.searchCards(query);
    searchResults.value = response.data;
    totalCards.value = response.total_cards;
    hasMore.value = response.has_more;
    nextPage.value = response.next_page || null;
    
    // Clear the selected card when showing search results
    card.value = null;
  } catch (err: any) {
    error.value = err.message || 'Failed to find cards. Please try another search.';
    searchResults.value = [];
    totalCards.value = 0;
    hasMore.value = false;
    nextPage.value = null;
  } finally {
    loading.value = false;
  }
};

// Load more results
const loadMoreResults = async () => {
  if (!hasMore.value || !nextPage.value) return;
  
  loading.value = true;
  
  try {
    // Extract page number from next_page URL
    const url = new URL(nextPage.value);
    const page = url.searchParams.get('page');
    
    if (page) {
      const response = await ScryfallService.searchCards(currentQuery.value, parseInt(page));
      searchResults.value = [...searchResults.value, ...response.data];
      hasMore.value = response.has_more;
      nextPage.value = response.next_page || null;
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load more cards.';
  } finally {
    loading.value = false;
  }
};

// Handle card selection from search results
const selectCard = (selectedCard: ScryfallCard) => {
  card.value = selectedCard;
  showResults.value = false;
};

// Get a random card
const getRandomCard = async () => {
  loading.value = true;
  error.value = null;
  showResults.value = false;
  
  try {
    card.value = await ScryfallService.getRandomCard();
  } catch (err: any) {
    error.value = err.message || 'Failed to get a random card.';
    card.value = null;
  } finally {
    loading.value = false;
  }
};

// Back to results
const backToResults = () => {
  showResults.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-16">
    <div class="container mx-auto px-4">
      <header class="flex flex-col items-center mb-16">
        <h1 class="text-4xl font-bold text-indigo-800 mb-4">Magic Card Finder</h1>
        <p class="text-gray-600 mb-12">Search for any Magic: The Gathering card and view its artwork</p>
        
        <div class="w-full max-w-xl">
          <SearchBar 
            placeholder="Enter card name..." 
            @search="searchCards" 
          />
          
          <div class="mt-6 flex justify-center">
            <button 
              @click="getRandomCard" 
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors text-lg"
            >
              Get Random Card
            </button>
          </div>
        </div>
      </header>
      
      <div v-if="error" class="max-w-md mx-auto p-5 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-10">
        {{ error }}
      </div>
      
      <!-- Search Results List -->
      <div v-if="showResults" class="mb-10">
        <SearchResultsList 
          :results="searchResults" 
          :loading="loading" 
          :totalCards="totalCards"
          @select-card="selectCard"
          @load-more="loadMoreResults"
        />
      </div>
      
      <!-- Card Display -->
      <div v-else>
        <div v-if="card" class="mb-6 flex justify-center">
          <button 
            v-if="searchResults.length > 0" 
            @click="backToResults" 
            class="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to search results
          </button>
        </div>
        
        <CardDisplay :card="card" :loading="loading" />
      </div>
      
      <footer class="mt-24 text-center text-gray-500 text-sm py-6">
        <p>Powered by <a href="https://scryfall.com/docs/api" target="_blank" class="text-indigo-600 hover:underline">Scryfall API</a></p>
      </footer>
    </div>
  </div>
</template>
