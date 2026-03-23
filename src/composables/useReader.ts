import { ref, computed, watch, onUnmounted } from 'vue'
import { useTiming } from './useTiming'

export function useReader() {
  const words = ref<string[]>([]);
  const currentIndex = ref(0);
  const isPlaying = ref(false);
  
  // Settings
  const wpm = ref(parseInt(localStorage.getItem('wpm') || '400'));
  const chunkSize = ref(parseInt(localStorage.getItem('chunkSize') || '1'));
  const isSmartTimingEnabled = ref(localStorage.getItem('smartTiming') !== 'false');
  const isFocusMode = ref(false);
  const isTrainingMode = ref(localStorage.getItem('trainingMode') === 'true');
  const isDarkMode = ref(localStorage.getItem('darkMode') !== 'false');

  let playbackTimer: number | null = null;
  let trainingTimer: number | null = null;
  
  // Apply initial theme
  document.body.classList.toggle('dark-mode', isDarkMode.value);

  // Save settings automatically
  watch([wpm, chunkSize, isSmartTimingEnabled, isDarkMode, isTrainingMode], () => {
    localStorage.setItem('wpm', wpm.value.toString());
    localStorage.setItem('chunkSize', chunkSize.value.toString());
    localStorage.setItem('smartTiming', isSmartTimingEnabled.value.toString());
    localStorage.setItem('darkMode', isDarkMode.value.toString());
    localStorage.setItem('trainingMode', isTrainingMode.value.toString());
    
    document.body.classList.toggle('dark-mode', isDarkMode.value);
  }, { deep: true });
  
  const { getInterval } = useTiming(wpm, isSmartTimingEnabled);
  
  const progress = computed(() => {
    if (words.value.length === 0) return 0;
    return (currentIndex.value / words.value.length) * 100;
  });
  
  const estimatedTimeRemaining = computed(() => {
    const remainingWords = words.value.length - currentIndex.value;
    const minutes = remainingWords / wpm.value;
    if (minutes < 1) {
      const seconds = Math.round(minutes * 60);
      return `${seconds}s left`;
    }
    return `${Math.ceil(minutes)}m left`;
  });
  
  const currentChunk = computed(() => {
    return words.value.slice(currentIndex.value, currentIndex.value + chunkSize.value);
  });
  
  const startTraining = () => {
     if (trainingTimer) clearInterval(trainingTimer);
     trainingTimer = window.setInterval(() => {
        if (isPlaying.value && isTrainingMode.value && wpm.value < 800) {
           wpm.value += 20;
        }
     }, 10000); 
  }
  
  const nextChunk = () => {
     if (currentIndex.value + chunkSize.value >= words.value.length) {
        pause();
        return;
     }
     currentIndex.value += chunkSize.value;
     if (isPlaying.value) {
        scheduleNext();
     }
  }
  
  const scheduleNext = () => {
     if (!isPlaying.value) return;
     const chunk = currentChunk.value;
     const lastWord = chunk[chunk.length - 1] || '';
     const delay = getInterval(lastWord);
     
     if (playbackTimer !== null) clearTimeout(playbackTimer);
     playbackTimer = window.setTimeout(() => {
        nextChunk();
     }, delay);
  }
  
  const play = () => {
     if (words.value.length === 0 || currentIndex.value >= words.value.length) {
       currentIndex.value = 0; 
     }
     isPlaying.value = true;
     scheduleNext();
  }
  
  const pause = () => {
     isPlaying.value = false;
     if (playbackTimer !== null) clearTimeout(playbackTimer);
  }
  
  const togglePlay = () => {
     if (isPlaying.value) pause(); else play();
  }
  
  const restart = () => {
     currentIndex.value = 0;
     if (isPlaying.value) scheduleNext();
  }
  
  const stepBack = (amount = 5) => {
     currentIndex.value = Math.max(0, currentIndex.value - amount);
     if (isPlaying.value) scheduleNext();
  }
  
  const stepForward = (amount = 1) => {
     currentIndex.value = Math.min(words.value.length - 1, currentIndex.value + amount);
     if (isPlaying.value) scheduleNext();
  }
  
  const seek = (percentage: number) => {
     const idx = Math.floor((percentage / 100) * words.value.length);
     currentIndex.value = Math.max(0, Math.min(words.value.length - 1, idx));
     if (isPlaying.value) scheduleNext();
  }
  
  const loadText = (text: string) => {
     // Regex to split by whitespace but preserve punctuation attached to words
     words.value = text.trim().split(/\s+/).filter(w => w.length > 0);
     currentIndex.value = 0;
  }
  
  watch(isTrainingMode, (val) => {
     if (val) startTraining();
     else if (trainingTimer !== null) clearInterval(trainingTimer);
  });
  
  // start training immediately if enabled on load
  if (isTrainingMode.value) startTraining();

  onUnmounted(() => {
     if (playbackTimer !== null) clearTimeout(playbackTimer);
     if (trainingTimer !== null) clearInterval(trainingTimer);
  });

  return {
    words,
    currentIndex,
    isPlaying,
    wpm,
    chunkSize,
    isSmartTimingEnabled,
    isFocusMode,
    isTrainingMode,
    isDarkMode,
    progress,
    estimatedTimeRemaining,
    currentChunk,
    play,
    pause,
    togglePlay,
    restart,
    stepBack,
    stepForward,
    seek,
    loadText
  }
}
