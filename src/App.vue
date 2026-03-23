<template>
  <div class="container">
    <header class="app-header" v-if="!reader.isFocusMode.value">
      <h1 class="logo">Speed Reader</h1>
      <div class="header-controls">
         <label class="toggle-label">
           <input type="checkbox" v-model="reader.isDarkMode.value"> Dark Mode
         </label>
         <label class="toggle-label">
           <input type="checkbox" v-model="reader.isTrainingMode.value" title="Automatically increase WPM by 20 every 10 seconds"> Training Mode
         </label>
         <label class="toggle-label">
           <input type="checkbox" v-model="reader.isSmartTimingEnabled.value"> Smart Timing
         </label>
         <label class="toggle-label">
           Chunk Size: 
           <select v-model.number="reader.chunkSize.value" style="margin-left:5px;">
             <option :value="1">1</option>
             <option :value="2">2</option>
             <option :value="3">3</option>
           </select>
         </label>
         <button class="btn-secondary btn-small" @click="reader.isFocusMode.value = true">Focus Mode</button>
         <button class="btn-secondary btn-small" v-if="hasStarted" @click="resetToInput">New Text</button>
      </div>
    </header>
    
    <TextInput v-if="!hasStarted" @start="onStartReading" />
    
    <transition name="fade">
      <div v-if="hasStarted" style="display: flex; flex-direction: column; flex: 1;">
        <Reader 
          :currentChunk="reader.currentChunk.value" 
          :chunkSize="reader.chunkSize.value" 
          :isFocusMode="reader.isFocusMode.value"
        >
          <div class="text-sync-wrapper">
             <ProgressBar 
               :progress="reader.progress.value" 
               :estimatedTime="reader.estimatedTimeRemaining.value" 
               @seek="reader.seek" 
             />
             
             <div class="text-sync-panel" ref="syncPanel">
               <span 
                 v-for="(word, index) in reader.words.value" 
                 :key="index"
                 :class="['sync-word', { active: isWordActive(index) }]"
                 :data-index="index"
               >
                 {{ word }}
               </span>
             </div>
          </div>
          
          <Controls 
            :isPlaying="reader.isPlaying.value" 
            :wpm="reader.wpm.value" 
            @update:wpm="v => reader.wpm.value = v"
            @togglePlay="reader.togglePlay"
            @restart="reader.restart"
            @stepBack="reader.stepBack"
            @stepForward="reader.stepForward"
          />
          
          <button v-if="reader.isFocusMode.value" @click="reader.isFocusMode.value = false" style="position: absolute; top: 1rem; right: 2rem; z-index: 200;" class="btn-secondary">Exit Focus</button>
        </Reader>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useReader } from './composables/useReader'
import TextInput from './components/TextInput.vue'
import Reader from './components/Reader.vue'
import Controls from './components/Controls.vue'
import ProgressBar from './components/ProgressBar.vue'

const reader = useReader()
const hasStarted = ref(false)
const syncPanel = ref<HTMLElement | null>(null)

const onStartReading = (text: string) => {
  reader.loadText(text)
  hasStarted.value = true
}

const resetToInput = () => {
  hasStarted.value = false
  reader.pause()
}

watch(() => reader.currentIndex.value, (idx) => {
  if (!syncPanel.value || reader.isFocusMode.value) return
  
  const activeEl = syncPanel.value.querySelector(`.sync-word[data-index="${idx}"]`) as HTMLElement
  if (activeEl) {
    syncPanel.value.scrollTop = activeEl.offsetTop - (syncPanel.value.clientHeight / 2)
  }
})

const isWordActive = (index: number) => {
  return index >= reader.currentIndex.value && index < reader.currentIndex.value + reader.chunkSize.value
}

const handleKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName.toLowerCase() === 'textarea' || target.tagName.toLowerCase() === 'input') return
  
  if (e.code === 'Space') {
     e.preventDefault()
     if (hasStarted.value) reader.togglePlay()
  } else if (e.code === 'ArrowLeft') {
     e.preventDefault()
     if (hasStarted.value) reader.stepBack(reader.chunkSize.value)
  } else if (e.code === 'ArrowRight') {
     e.preventDefault()
     if (hasStarted.value) reader.stepForward(reader.chunkSize.value)
  } else if (e.code === 'ArrowUp') {
     e.preventDefault()
     reader.wpm.value = Math.min(800, reader.wpm.value + 10)
  } else if (e.code === 'ArrowDown') {
     e.preventDefault()
     reader.wpm.value = Math.max(100, reader.wpm.value - 10)
  } else if (e.code === 'Escape' && reader.isFocusMode.value) {
     e.preventDefault()
     reader.isFocusMode.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
