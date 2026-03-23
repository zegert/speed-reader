<template>
  <div :class="['reader-view', { 'focus-mode': isFocusMode, 'chunk-mode': chunkSize > 1 }]">
    <div class="word-display-area">
      <div class="word-display-box">
         <div class="reticle-top"></div>
         <div class="reticle-bottom"></div>
         
         <div 
           class="word-stage" 
           v-if="chunkSize === 1 && currentChunk[0]" 
           :style="{ transform: 'translateX(-' + offset + 'px)' }"
         >
            <span class="word-left" ref="wordLeftRef">{{ parsedWord.left }}</span>
            <span class="focus-letter" ref="wordCenterRef">{{ parsedWord.center }}</span>
            <span class="word-right">{{ parsedWord.right }}</span>
         </div>
         
         <div class="word-stage" v-else>
            {{ currentChunk.join(' ') }}
         </div>
      </div>
    </div>
  
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  currentChunk: string[]
  chunkSize: number
  isFocusMode: boolean
}>()

const wordLeftRef = ref<HTMLElement | null>(null)
const wordCenterRef = ref<HTMLElement | null>(null)
const offset = ref(0)

function getPivot(len: number) {
  if (len === 1) return 0;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 7) return 3;
  if (len <= 9) return 4;
  if (len <= 11) return 5;
  return 6;
}

const parsedWord = computed(() => {
  const word = props.currentChunk[0] || ''
  const len = word.length
  if (len === 0) return { left: '', center: '', right: '' }
  
  let pivot = getPivot(len)
  pivot = Math.min(pivot, len - 1)
  
  return {
    left: word.substring(0, pivot),
    center: word.substring(pivot, pivot + 1),
    right: word.substring(pivot + 1)
  }
})

watch(() => props.currentChunk, async () => {
  if (props.chunkSize === 1) {
    await nextTick()
    if (wordLeftRef.value && wordCenterRef.value) {
      const lw = wordLeftRef.value.offsetWidth
      const cw = wordCenterRef.value.offsetWidth
      offset.value = lw + (cw / 2)
    }
  }
}, { immediate: true })
</script>
