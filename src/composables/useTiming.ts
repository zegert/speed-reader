import type { Ref } from 'vue'

export function useTiming(wpm: Ref<number>, isSmartTimingEnabled: Ref<boolean>) {
  const getInterval = (word: string) => {
    let baseMs = 60000 / wpm.value;
    
    if (!isSmartTimingEnabled.value) return baseMs;
    
    // Smart timing rules
    let multiplier = 1.0;
    
    // Longer words require slightly more time to process
    if (word.length > 8) multiplier += 0.2;
    if (word.length > 12) multiplier += 0.3;
    
    // Punctuation delays help parsing syntax
    if (word.endsWith(',')) multiplier += 0.5;
    else if (word.endsWith('.') || word.endsWith('!') || word.endsWith('?') || word.endsWith(';')) multiplier += 1.0;
    else if (word.includes('\n')) multiplier += 1.5;
    
    return baseMs * multiplier;
  }
  
  return { getInterval }
}
