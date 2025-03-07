<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import SearchResultsList from '../components/SearchResultsList.vue';
import { ScryfallService, type ScryfallCard } from '../services/ScryfallService';

const props = defineProps<{
  query?: string
}>();

const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const searchResults = ref<ScryfallCard[]>([]);
const totalCards = ref(0);
const hasMore = ref(false);
const nextPage = ref<string | null>(null);

// Search for cards
const searchCards = async (query: string) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await ScryfallService.searchCards(query);
    searchResults.value = response.data;
    totalCards.value = response.total_cards;
    hasMore.value = response.has_more;
    nextPage.value = response.next_page || null;
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
  if (!hasMore.value || !nextPage.value || !props.query) return;
  
  loading.value = true;
  
  try {
    const url = new URL(nextPage.value);
    const page = url.searchParams.get('page');
    
    if (page) {
      const response = await ScryfallService.searchCards(props.query, parseInt(page));
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

// Handle card selection
const selectCard = (card: ScryfallCard) => {
  router.push({
    name: 'card-details',
    params: { id: card.id },
    query: { from: 'search', q: props.query }
  });
};

// Watch for query changes
watch(() => props.query, (newQuery) => {
  if (newQuery) {
    searchCards(newQuery);
  }
}, { immediate: true });

// Initial search if query is present
onMounted(() => {
  if (props.query) {
    searchCards(props.query);
  }
});
</script>

<template>
  <div>
    <div class="mb-8">
      <router-link 
        to="/" 
        class="inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Search
      </router-link>
    </div>

    <div v-if="error" class="max-w-md mx-auto p-5 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-10">
      {{ error }}
    </div>
    
    <SearchResultsList 
      :results="searchResults" 
      :loading="loading" 
      :totalCards="totalCards"
      @select-card="selectCard"
      @load-more="loadMoreResults"
    />
  </div>
</template> 