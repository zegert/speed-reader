<template>
  <div class="controls-panel">
    <div class="controls-main-row">
      <button class="btn-secondary" @click="$emit('restart')" title="Restart">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
      <button class="btn-secondary" @click="$emit('stepBack')" title="Step Back 5 words">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
      </button>
      
      <button @click="$emit('togglePlay')" :title="isPlaying ? 'Pause (Space)' : 'Play (Space)'" style="width: 120px; justify-content: center;">
         <span v-if="isPlaying" style="display: flex; align-items: center; gap: 8px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
           Pause
         </span>
         <span v-else style="display: flex; align-items: center; gap: 8px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
           Play
         </span>
      </button>
      
      <button class="btn-secondary" @click="$emit('stepForward')" title="Step Forward">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
      </button>
    </div>
    
    <div class="controls-main-row" style="margin-top: 1rem;">
      <div class="slider-container">
         <input type="range" min="100" max="800" step="10" :value="wpm" @input="updateWpm" />
         <div class="presets">
           <button class="btn-secondary btn-small" @click="setWpm(250)">Beginner</button>
           <button class="btn-secondary btn-small" @click="setWpm(400)">Average</button>
           <button class="btn-secondary btn-small" @click="setWpm(600)">Advanced</button>
         </div>
      </div>
      <div class="wpm-display">{{ wpm }} WPM</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isPlaying: boolean
  wpm: number
}>()

const emit = defineEmits<{
  (e: 'update:wpm', value: number): void
  (e: 'togglePlay'): void
  (e: 'restart'): void
  (e: 'stepBack'): void
  (e: 'stepForward'): void
}>()

const updateWpm = (e: Event) => emit('update:wpm', parseInt((e.target as HTMLInputElement).value))
const setWpm = (val: number) => emit('update:wpm', val)
</script>
