<template>
  <div class="progress-container">
    <div class="progress-bar-bg" @click="seek">
      <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="progress-stats">
      <span>{{ Math.round(progress) }}% completed</span>
      <span>{{ estimatedTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  progress: number
  estimatedTime: string
}>()

const emit = defineEmits<{
  (e: 'seek', percentage: number): void
}>()

const seek = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const percentage = (clickX / rect.width) * 100
  emit('seek', percentage)
}
</script>
