<template>
  <div class="textarea-wrapper">
    <textarea 
      v-model="text" 
      placeholder="Paste your text here to begin speed reading...
Example text: The quick brown fox jumps over the lazy dog."
      autofocus
    ></textarea>
    <button :disabled="!text.trim()" @click="start">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
      Start Reading
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'start', text: string): void
}>()

const text = ref('')
const start = () => emit('start', text.value)
</script>
