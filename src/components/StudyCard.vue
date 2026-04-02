<script setup lang="ts">
const props = defineProps<{
  title: string;
  subtitle: string;
  meaning: string;
  tip: string;
  accentClass?: string;
  actionText?: string;
  actionType?: 'primary' | 'success';
  clickable?: boolean;
}>();

defineEmits<{
  click: [];
  action: [];
}>();
</script>

<template>
  <section
    class="study-card"
    :class="[accentClass, { 'study-card--clickable': props.clickable }]"
    :role="props.clickable ? 'button' : undefined"
    :tabindex="props.clickable ? 0 : undefined"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="study-card__title">{{ title }}</div>
    <div class="study-card__subtitle">{{ subtitle }}</div>
    <div class="study-card__meaning">{{ meaning }}</div>
    <p class="study-card__tip">{{ tip }}</p>
    <div v-if="props.actionText" class="study-card__actions">
      <van-button
        round
        plain
        size="small"
        :type="props.actionType ?? 'primary'"
        @click.stop="$emit('action')"
      >
        {{ props.actionText }}
      </van-button>
    </div>
  </section>
</template>
