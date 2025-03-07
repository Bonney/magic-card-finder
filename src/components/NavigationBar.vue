<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import SearchBar from './SearchBar.vue';

const router = useRouter();
const route = useRoute();

// Handle search
const handleSearch = (query: string) => {
  if (route.name === 'search' && route.query.q === query) {
    return; // Already on the same search
  }
  router.push({
    name: 'search',
    query: { q: query }
  });
};

// Get a random card
const getRandomCard = async () => {
  router.push({
    name: 'card-details',
    params: { id: 'random' }
  });
};
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Home Link -->
        <router-link 
          to="/" 
          class="flex items-center space-x-2"
        >
          <span class="text-xl font-bold text-indigo-800">Magic Card Finder</span>
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 max-w-2xl mx-4">
          <SearchBar 
            :placeholder="'Search for any card...'" 
            @search="handleSearch"
            :initial-value="route.query.q as string || ''"
          />
        </div>

        <!-- Random Card Button -->
        <button 
          @click="getRandomCard"
          class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Random Card
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
nav {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
}
</style> 