<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavigationBar from '../components/NavigationBar.vue';
import CardDisplay from '../components/CardDisplay.vue';
import { ScryfallService, type ScryfallCard } from '../services/ScryfallService';

const props = defineProps<{
  id: string
}>();

const route = useRoute();
const loading = ref(false);
const error = ref<string | null>(null);
const card = ref<ScryfallCard | null>(null);

// Load card details
const loadCard = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    if (props.id === 'random') {
      card.value = await ScryfallService.getRandomCard();
    } else {
      card.value = await ScryfallService.getCard(props.id);
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load card details.';
    card.value = null;
  } finally {
    loading.value = false;
  }
};

// Load card on mount
onMounted(() => {
  loadCard();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
    <!-- Navigation Bar -->
    <NavigationBar />
    
    <!-- Main Content -->
    <main class="pt-20 px-4 sm:px-6 lg:px-8 pb-16">
      <div v-if="error" class="max-w-md mx-auto p-5 bg-red-100 border border-red-300 rounded-lg text-red-700 mb-10">
        {{ error }}
      </div>
      
      <CardDisplay :card="card" :loading="loading" />
    </main>
  </div>
</template> 