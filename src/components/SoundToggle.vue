<script setup lang="ts">
import { computed } from 'vue';
import { useAudioPreferences } from '@/composables/useAudio';

const { soundEnabled, toggleSound } = useAudioPreferences();

const buttonLabel = computed(() => (soundEnabled.value ? '声音已开' : '声音已关'));
</script>

<template>
  <van-button round plain size="small" class="sound-toggle" @click="toggleSound">
    {{ buttonLabel }}
  </van-button>
</template>
