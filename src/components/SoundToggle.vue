<script setup lang="ts">
import { useAudioPreferences } from '@/composables/useAudio';

const { soundEnabled, toggleSound } = useAudioPreferences();
</script>

<template>
  <button 
    class="sound-toggle-btn" 
    @click="toggleSound"
    :title="soundEnabled ? '关闭声音' : '开启声音'"
  >
    <span class="sound-toggle-btn__icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
  </button>
</template>
