<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  meaning: string;
  tip: string;
  accentClass?: string;
}>();
</script>

<template>
  <section class="study-card" :class="accentClass">
    <div class="study-card__title">{{ title }}</div>
    <div class="study-card__subtitle">{{ subtitle }}</div>
    <div class="study-card__meaning">{{ meaning }}</div>
    <p class="study-card__tip">{{ tip }}</p>
  </section>
</template>
