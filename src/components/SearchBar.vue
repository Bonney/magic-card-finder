<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search...'
  }
});

const searchQuery = ref('');
const emit = defineEmits(['search']);

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value);
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};
</script>

<template>
  <div class="w-full max-w-xl">
    <div class="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 outline-none text-gray-900"
        @keydown="handleKeyDown"
      />
      <button
        @click="handleSearch"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition-colors"
        type="button"
      >
        Search
      </button>
    </div>
  </div>
</template> 