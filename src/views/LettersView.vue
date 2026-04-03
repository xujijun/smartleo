<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import SoundToggle from '@/components/SoundToggle.vue';
import StudyCard from '@/components/StudyCard.vue';
import { playUiSound, speakLetter } from '@/composables/useAudio';
import { letters } from '@/data/letters';

const router = useRouter();
const currentIndex = ref(0);

const currentLetter = computed(() => letters[currentIndex.value]);
const progressPercent = computed(() => Math.round(((currentIndex.value + 1) / letters.length) * 100));

const playCurrentLetter = () => {
  speakLetter(currentLetter.value.uppercase);
};

const updateLetter = (index: number) => {
  currentIndex.value = index;
  playUiSound('primary');
  speakLetter(letters[index].uppercase);
};

const selectLetter = (index: number) => {
  updateLetter(index);
};

const goPrev = () => {
  const nextIndex = currentIndex.value === 0 ? letters.length - 1 : currentIndex.value - 1;
  updateLetter(nextIndex);
};

const goNext = () => {
  const nextIndex = currentIndex.value === letters.length - 1 ? 0 : currentIndex.value + 1;
  updateLetter(nextIndex);
};

const goHome = () => {
  playUiSound('soft');
  router.push('/');
};
</script>

<template>
  <main class="page">
    <van-nav-bar title="英文字母学习" left-text="返回" left-arrow @click-left="goHome">
      <template #right>
        <SoundToggle />
      </template>
    </van-nav-bar>

    <section class="page-section">

      <div class="section-intro">
        <h2>认识 26 个英文字母</h2>
        <p>点击下方字母按钮，或使用上一页、下一页切换学习内容，并可播放字母发音。</p>
      </div>

      <section class="learning-summary learning-summary--letters">
        <div class="learning-summary__head">
          <div>
            <div class="learning-summary__eyebrow">当前进度</div>
            <div class="learning-summary__title">
              第 {{ currentIndex + 1 }} 个 / 共 {{ letters.length }} 个
            </div>
          </div>
          <van-tag round type="primary">{{ progressPercent }}%</van-tag>
        </div>
        <van-progress :percentage="progressPercent" stroke-width="10" color="#566ef6" />
        <div class="learning-summary__meta">
          <span>当前字母：{{ currentLetter.uppercase }} {{ currentLetter.lowercase }}</span>
          <span>示例单词：{{ currentLetter.word }}</span>
        </div>
      </section>

      <StudyCard
        :title="currentLetter.uppercase"
        :subtitle="`小写：${currentLetter.lowercase}`"
        :meaning="`单词：${currentLetter.word} · 含义：${currentLetter.meaning}`"
        :tip="currentLetter.tip"
        accent-class="study-card--letters"
        action-text="播放字母发音"
        action-type="primary"
        clickable
        @click="playCurrentLetter"
        @action="playCurrentLetter"
      />

      <div class="actions">
        <van-button round plain type="primary" @click="goPrev">上一个</van-button>
        <van-button round type="primary" @click="goNext">下一个</van-button>
      </div>

      <section class="grid-panel">
        <div class="grid-panel__title">字母列表</div>
        <div class="letter-grid">
          <button
            v-for="(item, index) in letters"
            :key="item.uppercase"
            type="button"
            class="letter-chip"
            :class="{ 'letter-chip--active': index === currentIndex }"
            @click="selectLetter(index)"
          >
            {{ item.uppercase }}
          </button>
        </div>
      </section>
    </section>
  </main>
</template>
