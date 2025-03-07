<script setup lang="ts">
import NavigationBar from '../components/NavigationBar.vue';
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
    <!-- Navigation Bar -->
    <NavigationBar />
    
    <!-- Main Content -->
    <main class="pt-20 px-4 sm:px-6 lg:px-8 pb-16">
      <div class="max-w-2xl mx-auto text-center mt-16">
        <h1 class="text-4xl font-bold text-indigo-800 mb-4">Welcome to Magic Card Finder</h1>
        <p class="text-gray-600 text-lg">
          Search for any Magic: The Gathering card using the search bar above.
          You can find cards by name, type, or text.
        </p>
      </div>
    </main>
  </div>
</template> 