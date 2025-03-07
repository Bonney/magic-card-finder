<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search...'
  },
  initialValue: {
    type: String,
    default: ''
  }
});

const searchQuery = ref(props.initialValue);
const emit = defineEmits(['search']);

// Watch for initial value changes
watch(() => props.initialValue, (newValue) => {
  if (newValue !== searchQuery.value) {
    searchQuery.value = newValue;
  }
});

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
  <div class="w-full">
    <div class="flex items-center bg-gray-50 border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        class="w-full px-4 py-2 bg-transparent outline-none text-gray-900 placeholder-gray-500"
        @keydown="handleKeyDown"
      />
      <button
        @click="handleSearch"
        class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 transition-colors flex items-center"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template> 