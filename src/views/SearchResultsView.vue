<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import NavigationBar from '../components/NavigationBar.vue';
import SearchResultsList from '../components/SearchResultsList.vue';
import FilterPanel from '../components/FilterPanel.vue';
import { ScryfallService, type ScryfallCard, type SearchFilters } from '../services/ScryfallService';

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
const currentFilters = ref<SearchFilters | undefined>();

// Search for cards
const searchCards = async (query: string, filters?: SearchFilters) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await ScryfallService.searchCards(query, filters);
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
      const response = await ScryfallService.searchCards(props.query, currentFilters.value, parseInt(page));
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
    query: { q: props.query }
  });
};

// Handle filter changes
const handleFilterChange = (filters: SearchFilters) => {
  currentFilters.value = filters;
  if (props.query) {
    searchCards(props.query, filters);
  }
};

// Handle filter reset
const handleFilterReset = () => {
  currentFilters.value = undefined;
  if (props.query) {
    searchCards(props.query);
  }
};

// Watch for query changes
watch(() => props.query, (newQuery) => {
  if (newQuery) {
    searchCards(newQuery, currentFilters.value);
  } else {
    // Redirect to home if no query
    router.push({ name: 'home' });
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
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
    <!-- Navigation Bar -->
    <NavigationBar />
    
    <!-- Main Content -->
    <main class="pt-20 px-4 sm:px-6 lg:px-8 pb-16">
      <!-- Error Display -->
      <div v-if="error" class="max-w-md mx-auto p-5 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-10">
        {{ error }}
      </div>
      
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Filter Panel -->
        <div class="lg:w-80">
          <FilterPanel
            @filter="handleFilterChange"
            @reset="handleFilterReset"
          />
        </div>
        
        <!-- Search Results -->
        <div class="flex-1">
          <SearchResultsList 
            :results="searchResults" 
            :loading="loading" 
            :totalCards="totalCards"
            @select-card="selectCard"
            @load-more="loadMoreResults"
          />
        </div>
      </div>
    </main>
  </div>
</template> 