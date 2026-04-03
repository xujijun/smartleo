<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import SoundToggle from '@/components/SoundToggle.vue';
import { hanziTestList } from '@/data/hanzi-test';
import {
  playUiSound,
  speakAnswerFeedback,
  speakHanziPrompt,
  speakTestResult,
  stopSpeech
} from '@/composables/useAudio';

type TestPhase = 'intro' | 'quiz' | 'result';

interface TestQuestion {
  id: number;
  character: string;
  options: string[];
}

const TOTAL_QUESTIONS = 20;
const QUESTION_SECONDS = 20;
const SCORE_PER_QUESTION = 5;
const PROMPT_REPEAT_DELAY_MS = 10000;

const router = useRouter();

const phase = ref<TestPhase>('intro');
const questions = ref<TestQuestion[]>([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const displayScore = ref(0);
const timeLeft = ref(QUESTION_SECONDS);
const selectedHanzi = ref<string | null>(null);
const answerLocked = ref(false);

let countdownTimer: number | undefined;
let repeatPromptTimer: number | undefined;
let resultSpeechTimer: number | undefined;
let scoreAnimationFrame: number | undefined;

const activeQuestion = computed(() => questions.value[currentQuestionIndex.value] ?? null);
const progressPercent = computed(() =>
  phase.value === 'quiz' ? Math.round(((currentQuestionIndex.value + 1) / TOTAL_QUESTIONS) * 100) : 0
);

// 总分仅 5 分步进，与 PRD 区间严格对应：100；90–95；60–85；低于 60
const encouragement = computed(() => {
  const s = score.value;
  if (s === 100) {
    return '你是最棒的';
  }
  if (s >= 90 && s <= 95) {
    return '你很棒';
  }
  if (s >= 60 && s <= 85) {
    return '有点厉害';
  }
  return '要加油哦';
});

const clearQuestionTimers = () => {
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }

  if (repeatPromptTimer) {
    window.clearTimeout(repeatPromptTimer);
    repeatPromptTimer = undefined;
  }
};

const clearAllTimers = () => {
  clearQuestionTimers();

  if (resultSpeechTimer) {
    window.clearTimeout(resultSpeechTimer);
    resultSpeechTimer = undefined;
  }

  if (scoreAnimationFrame) {
    window.cancelAnimationFrame(scoreAnimationFrame);
    scoreAnimationFrame = undefined;
  }

  stopSpeech();
};

const generateQuestions = (): TestQuestion[] =>
  Array.from({ length: TOTAL_QUESTIONS }, (_, index) => {
    const correctHanzi = hanziTestList[Math.floor(Math.random() * hanziTestList.length)];
    
    // For Hanzi test, we randomly select 9 from the 300 candidates to show as options
    const optionsSet = new Set<string>();
    optionsSet.add(correctHanzi);
    
    while (optionsSet.size < 9) {
      const randomOption = hanziTestList[Math.floor(Math.random() * hanziTestList.length)];
      optionsSet.add(randomOption);
    }
    
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
    
    return {
      id: index,
      character: correctHanzi,
      options
    };
  });

const speakCurrentPrompt = () => {
  if (!activeQuestion.value) {
    return;
  }

  speakHanziPrompt(activeQuestion.value.character);
};

const schedulePromptRepeat = () => {
  if (!activeQuestion.value) {
    return;
  }

  repeatPromptTimer = window.setTimeout(() => {
    if (phase.value !== 'quiz' || answerLocked.value) {
      return;
    }

    speakCurrentPrompt();
  }, PROMPT_REPEAT_DELAY_MS);
};

const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    if (answerLocked.value) {
      return;
    }

    timeLeft.value -= 1;

    if (timeLeft.value <= 0) {
      timeLeft.value = 0;
      handleTimeout();
    }
  }, 1000);
};

const startQuestion = (index: number) => {
  clearQuestionTimers();
  currentQuestionIndex.value = index;
  timeLeft.value = QUESTION_SECONDS;
  selectedHanzi.value = null;
  answerLocked.value = false;

  speakCurrentPrompt();
  schedulePromptRepeat();
  startCountdown();
};

const animateScore = () => {
  const finalScore = score.value;
  const duration = 1200;
  const startTime = performance.now();

  displayScore.value = 0;

  const step = (timestamp: number) => {
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    displayScore.value = Math.round(finalScore * easedProgress);

    if (progress < 1) {
      scoreAnimationFrame = window.requestAnimationFrame(step);
    }
  };

  scoreAnimationFrame = window.requestAnimationFrame(step);
};

const finishTest = () => {
  clearQuestionTimers();
  phase.value = 'result';
  selectedHanzi.value = null;
  answerLocked.value = true;

  animateScore();

  resultSpeechTimer = window.setTimeout(() => {
    speakTestResult(score.value, encouragement.value);
  }, 600);
};

const goToNextQuestion = () => {
  if (currentQuestionIndex.value >= questions.value.length - 1) {
    finishTest();
    return;
  }

  startQuestion(currentQuestionIndex.value + 1);
};

const scheduleNextAfterFeedback = (isCorrect: boolean) => {
  speakAnswerFeedback(isCorrect, () => {
    goToNextQuestion();
  });
};

const handleHanziPick = (character: string) => {
  if (phase.value !== 'quiz' || answerLocked.value || !activeQuestion.value) {
    return;
  }

  clearQuestionTimers();
  answerLocked.value = true;
  selectedHanzi.value = character;

  const isCorrect = character === activeQuestion.value.character;

  if (isCorrect) {
    score.value += SCORE_PER_QUESTION;
    playUiSound('success');
  } else {
    playUiSound('soft');
  }

  scheduleNextAfterFeedback(isCorrect);
};

const handleTimeout = () => {
  if (phase.value !== 'quiz' || answerLocked.value || !activeQuestion.value) {
    return;
  }

  clearQuestionTimers();
  answerLocked.value = true;
  selectedHanzi.value = null;
  playUiSound('soft');

  scheduleNextAfterFeedback(false);
};

const startTest = () => {
  clearAllTimers();
  playUiSound('primary');

  questions.value = generateQuestions();
  currentQuestionIndex.value = 0;
  score.value = 0;
  displayScore.value = 0;
  phase.value = 'quiz';

  startQuestion(0);
};

const replayPrompt = () => {
  if (phase.value !== 'quiz' || !activeQuestion.value) {
    return;
  }

  playUiSound('primary');
  speakCurrentPrompt();
};

const restartTest = () => {
  startTest();
};

const goHome = () => {
  clearAllTimers();
  playUiSound('soft');
  router.push('/');
};

onBeforeUnmount(() => {
  clearAllTimers();
});
</script>

<template>
  <main class="page">
    <van-nav-bar title="汉字测试" left-text="返回" left-arrow @click-left="goHome">
      <template #right>
        <SoundToggle />
      </template>
    </van-nav-bar>

    <section class="page-section">

      <template v-if="phase === 'intro'">
        <section class="test-panel">
          <div class="test-panel__badge" style="background: rgba(56, 200, 155, 0.18); color: #19a475;">听音选汉字</div>
          <h2 class="test-panel__title">开始你的汉字测试</h2>
          <p class="test-panel__desc">
            一共 20 道题，每题会朗读两次“请选择汉字 X”（间隔约 10 秒），请在 20 秒内点击正确汉字。
          </p>

          <div class="test-rule-list">
            <div class="test-rule-item">答对 1 题得 5 分</div>
            <div class="test-rule-item">答错或超时得 0 分</div>
            <div class="test-rule-item">完成后会有分数动画和语音鼓励</div>
          </div>

          <van-button round type="primary" size="large" block @click="startTest">开始测试</van-button>
        </section>
      </template>

      <template v-else-if="phase === 'quiz'">
        <section class="compact-dashboard">
          <div class="compact-dashboard__header">
            <span class="compact-dashboard__title">进度: {{ currentQuestionIndex + 1 }} / {{ TOTAL_QUESTIONS }} 题</span>
            <span class="compact-dashboard__score">得分: {{ score }}</span>
          </div>
          <van-progress :percentage="progressPercent" stroke-width="6" :show-pivot="false" color="#38c89b" />
        </section>

        <section class="test-status-row">
          <div class="test-timer" :class="{ 'test-timer--warning': timeLeft <= 2 }">
            <div class="test-timer__label">剩余时间</div>
            <div class="test-timer__value">{{ timeLeft }}</div>
          </div>

          <van-button class="replay-btn" round block type="primary" plain @click="replayPrompt" icon="volume-o">
            再听一次
          </van-button>
        </section>

        <section class="grid-panel">
          <div class="grid-panel__title">请选择正确汉字</div>
          <div class="test-number-grid">
            <button
              v-for="character in activeQuestion?.options"
              :key="character"
              type="button"
              class="test-number-button"
              :class="{
                'test-number-button--selected': selectedHanzi === character,
                'test-number-button--correct': answerLocked && activeQuestion?.character === character,
                'test-number-button--wrong':
                  answerLocked &&
                  selectedHanzi === character &&
                  activeQuestion?.character !== character
              }"
              :disabled="answerLocked"
              @click="handleHanziPick(character)"
            >
              {{ character }}
            </button>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="test-result-card">
          <div class="test-result-card__badge">测试完成</div>
          <div class="test-result-card__score" style="color: #19a475;">{{ displayScore }}</div>
          <div class="test-result-card__unit">分</div>
          <div class="test-result-card__message" style="color: #38c89b;">{{ encouragement }}</div>
          <div class="test-result-card__desc">
            共完成 {{ TOTAL_QUESTIONS }} 题，你本次答对了 {{ score / SCORE_PER_QUESTION }} 题。
          </div>

          <div class="test-result-card__actions">
            <van-button round type="primary" size="large" @click="restartTest">再测一次</van-button>
            <van-button round plain type="primary" size="large" @click="goHome">返回首页</van-button>
          </div>
        </section>
      </template>
    </section>
  </main>
</template>
