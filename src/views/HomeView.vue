<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import SoundToggle from '@/components/SoundToggle.vue';
import { playUiSound } from '@/composables/useAudio';

const router = useRouter();

const modules = computed(() => [
  {
    title: '字母测试',
    description: '听音选字母，完成 20 题。',
    routeName: 'letter-test',
    emoji: '测',
    accent: 'home-card--test'
  },
  {
    title: '数字测试',
    description: '听音选数字，完成 20 题。',
    routeName: 'number-test',
    emoji: '123',
    accent: 'home-card--number-test'
  },
  {
    title: '英文字母学习',
    description: '从 A 到 Z，认识字母。',
    routeName: 'letters',
    emoji: 'Aa',
    accent: 'home-card--letters'
  },
  {
    title: '简单汉字学习',
    description: '学习基础汉字和含义。',
    routeName: 'hanzi',
    emoji: '汉',
    accent: 'home-card--hanzi'
  }
]);

const installSteps = computed(() => [
  '用手机浏览器打开应用首页',
  '点击浏览器菜单中的“添加到主屏幕”',
  '回到桌面后，点击 SmartLeo 图标快速进入'
]);

const highlights = computed(() => [
  { label: '学习模块', value: '4+' },
  { label: '字母内容', value: '26' },
  { label: '测试题数', value: '20' }
]);

const goToModule = (routeName: string) => {
  playUiSound('primary');
  router.push({ name: routeName });
};
</script>

<template>
  <main class="page page-home">
    <section class="hero">
      <div class="hero__top">
        <div class="hero__badge">PWA 儿童启蒙学习</div>
        <SoundToggle />
      </div>
      <div class="hero__content">
        <div class="hero__main">
          <h1 class="hero__title">SmartLeo</h1>
          <p class="hero__desc">
            专为儿童设计的移动端启蒙学习助手。
          </p>
        </div>
      </div>
    </section>

    <section class="module-list">
      <div
        v-for="item in modules"
        :key="item.routeName"
        class="home-card"
        :class="item.accent"
        role="button"
        tabindex="0"
        @click="goToModule(item.routeName)"
        @keydown.enter="goToModule(item.routeName)"
        @keydown.space.prevent="goToModule(item.routeName)"
      >
        <div class="home-card__icon">{{ item.emoji }}</div>
        <div class="home-card__body">
          <div class="home-card__title">{{ item.title }}</div>
          <div class="home-card__desc">{{ item.description }}</div>
        </div>
        <van-button class="start-btn" round type="primary" size="normal" @click.stop="goToModule(item.routeName)">
          开始
        </van-button>
      </div>
    </section>

    <section class="panel install-panel">
      <div>
        <div class="panel__title">安装提示</div>
        <div class="panel__text">
          在支持的手机浏览器中打开后，可使用浏览器菜单将应用添加到主屏幕。
        </div>
      </div>
      <van-tag round type="primary">可安装</van-tag>
    </section>

    <section class="panel install-guide">
      <div class="panel__title">添加到主屏幕</div>
      <div class="install-guide__steps">
        <div v-for="(step, index) in installSteps" :key="step" class="install-step">
          <div class="install-step__index">{{ index + 1 }}</div>
          <div class="install-step__text">{{ step }}</div>
        </div>
      </div>
    </section>

    <section class="panel feature-panel">
      <div class="panel__title">适合当前版本的使用方式</div>
      <div class="feature-panel__items">
        <div class="feature-item">
          <div class="feature-item__title">亲子陪学</div>
          <div class="feature-item__text">家长可陪孩子一起点选卡片、讲解字母和汉字。</div>
        </div>
        <div class="feature-item">
          <div class="feature-item__title">碎片学习</div>
          <div class="feature-item__text">每次学习一个字母或一个汉字，适合短时间反复记忆。</div>
        </div>
        <div class="feature-item">
          <div class="feature-item__title">测试功能</div>
          <div class="feature-item__text">听语音选字母或数字，完成 20 道题并获得语音结果鼓励。</div>
        </div>
      </div>
    </section>
  </main>
</template>
