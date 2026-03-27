<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import StudyCard from '@/components/StudyCard.vue';
import { hanziList } from '@/data/hanzi';

const router = useRouter();
const currentIndex = ref(0);

const currentHanzi = computed(() => hanziList[currentIndex.value]);
const progressPercent = computed(() => Math.round(((currentIndex.value + 1) / hanziList.length) * 100));

const selectHanzi = (index: number) => {
  currentIndex.value = index;
};

const goPrev = () => {
  currentIndex.value = currentIndex.value === 0 ? hanziList.length - 1 : currentIndex.value - 1;
};

const goNext = () => {
  currentIndex.value = currentIndex.value === hanziList.length - 1 ? 0 : currentIndex.value + 1;
};
</script>

<template>
  <main class="page">
    <van-nav-bar title="简单汉字学习" left-text="返回" left-arrow @click-left="router.push('/')" />

    <section class="page-section">
      <div class="section-intro">
        <h2>学习常见基础汉字</h2>
        <p>点一点汉字按钮，就能切换到对应的学习卡片。</p>
      </div>

      <section class="learning-summary learning-summary--hanzi">
        <div class="learning-summary__head">
          <div>
            <div class="learning-summary__eyebrow">当前进度</div>
            <div class="learning-summary__title">
              第 {{ currentIndex + 1 }} 个 / 共 {{ hanziList.length }} 个
            </div>
          </div>
          <van-tag round type="success">{{ progressPercent }}%</van-tag>
        </div>
        <van-progress :percentage="progressPercent" stroke-width="10" color="#2f9b79" />
        <div class="learning-summary__meta">
          <span>当前汉字：{{ currentHanzi.character }}</span>
          <span>拼音：{{ currentHanzi.pinyin }}</span>
        </div>
      </section>

      <StudyCard
        :title="currentHanzi.character"
        :subtitle="`拼音：${currentHanzi.pinyin}`"
        :meaning="currentHanzi.meaning"
        :tip="currentHanzi.tip"
        accent-class="study-card--hanzi"
      />

      <div class="actions">
        <van-button round plain type="success" @click="goPrev">上一个</van-button>
        <van-button round type="success" @click="goNext">下一个</van-button>
      </div>

      <section class="grid-panel">
        <div class="grid-panel__title">汉字列表</div>
        <div class="hanzi-grid">
          <button
            v-for="(item, index) in hanziList"
            :key="item.character"
            type="button"
            class="hanzi-chip"
            :class="{ 'hanzi-chip--active': index === currentIndex }"
            @click="selectHanzi(index)"
          >
            {{ item.character }}
          </button>
        </div>
      </section>
    </section>
  </main>
</template>
