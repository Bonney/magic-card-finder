<script setup lang="ts">
defineProps({
  msg: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8">
    <h1 class="text-3xl font-bold text-blue-600 mb-4">{{ msg }}</h1>
    <div class="bg-gray-100 p-6 rounded-lg shadow-md max-w-md">
      <p class="text-gray-700 mb-4">
        Welcome to your Vue.js application with Tailwind CSS!
      </p>
      <div class="grid grid-cols-2 gap-4">
        <a href="https://vuejs.org/" target="_blank" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center transition-colors">
          Vue.js Docs
        </a>
        <a href="https://tailwindcss.com/docs" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center transition-colors">
          Tailwind CSS Docs
        </a>
      </div>
    </div>
  </div>
</template>
