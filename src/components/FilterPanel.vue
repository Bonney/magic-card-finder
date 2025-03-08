<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Define the filter state interface
interface FilterState {
  colors: string[];
  types: string[];
  set: string | null;
  cmc: {
    min: number | null;
    max: number | null;
  };
  text: string;
}

// Define available options
const colorOptions = [
  { value: 'W', label: 'White', icon: '☀️' },
  { value: 'U', label: 'Blue', icon: '💧' },
  { value: 'B', label: 'Black', icon: '💀' },
  { value: 'R', label: 'Red', icon: '🔥' },
  { value: 'G', label: 'Green', icon: '🌳' },
  { value: 'C', label: 'Colorless', icon: '💎' }
];

const typeOptions = [
  'Creature',
  'Instant',
  'Sorcery',
  'Artifact',
  'Enchantment',
  'Planeswalker',
  'Land'
];

// Initialize filter state
const filters = ref<FilterState>({
  colors: [],
  types: [],
  set: null,
  cmc: {
    min: null,
    max: null
  },
  text: ''
});

// Emit events
const emit = defineEmits<{
  (e: 'filter', filters: FilterState): void;
  (e: 'reset'): void;
}>();

// Computed property for the filter query
const filterQuery = computed(() => {
  const parts: string[] = [];
  
  // Add color filter
  if (filters.value.colors.length > 0) {
    parts.push(`c:${filters.value.colors.join('')}`);
  }
  
  // Add type filter
  if (filters.value.types.length > 0) {
    parts.push(`t:${filters.value.types.join(' OR t:')}`);
  }
  
  // Add set filter
  if (filters.value.set) {
    parts.push(`s:${filters.value.set}`);
  }
  
  // Add CMC filter
  if (filters.value.cmc.min !== null) {
    parts.push(`cmc>=${filters.value.cmc.min}`);
  }
  if (filters.value.cmc.max !== null) {
    parts.push(`cmc<=${filters.value.cmc.max}`);
  }
  
  // Add text filter
  if (filters.value.text.trim()) {
    parts.push(`o:"${filters.value.text.trim()}"`);
  }
  
  return parts.join(' ');
});

// Watch for changes and emit filter event
watch(filterQuery, () => {
  emit('filter', filters.value);
});

// Reset filters
const resetFilters = () => {
  filters.value = {
    colors: [],
    types: [],
    set: null,
    cmc: {
      min: null,
      max: null
    },
    text: ''
  };
  emit('reset');
};

// Toggle color selection
const toggleColor = (color: string) => {
  const index = filters.value.colors.indexOf(color);
  if (index === -1) {
    filters.value.colors.push(color);
  } else {
    filters.value.colors.splice(index, 1);
  }
};

// Toggle type selection
const toggleType = (type: string) => {
  const index = filters.value.types.indexOf(type);
  if (index === -1) {
    filters.value.types.push(type);
  } else {
    filters.value.types.splice(index, 1);
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-4">
    <div class="space-y-6">
      <!-- Color Filter -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Colors</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in colorOptions"
            :key="color.value"
            @click="toggleColor(color.value)"
            :class="[
              'px-3 py-1 rounded-full border transition-colors',
              filters.colors.includes(color.value)
                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                : 'border-gray-300 hover:border-indigo-500'
            ]"
          >
            <span>{{ color.icon }} {{ color.label }}</span>
          </button>
        </div>
      </div>

      <!-- Type Filter -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Card Types</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in typeOptions"
            :key="type"
            @click="toggleType(type)"
            :class="[
              'px-3 py-1 rounded-full border transition-colors',
              filters.types.includes(type)
                ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                : 'border-gray-300 hover:border-indigo-500'
            ]"
          >
            {{ type }}
          </button>
        </div>
      </div>

      <!-- CMC Filter -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Mana Value (CMC)</h3>
        <div class="flex items-center gap-2">
          <input
            v-model.number="filters.cmc.min"
            type="number"
            min="0"
            placeholder="Min"
            class="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span class="text-gray-500">to</span>
          <input
            v-model.number="filters.cmc.max"
            type="number"
            min="0"
            placeholder="Max"
            class="w-24 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <!-- Card Text Filter -->
      <div>
        <h3 class="text-sm font-medium text-gray-700 mb-2">Card Text</h3>
        <input
          v-model="filters.text"
          type="text"
          placeholder="Search in card text..."
          class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <!-- Reset Button -->
      <div class="flex justify-end">
        <button
          @click="resetFilters"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  </div>
</template> 