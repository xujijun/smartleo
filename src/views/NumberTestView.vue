<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import SoundToggle from '@/components/SoundToggle.vue';
import {
  playUiSound,
  speakAnswerFeedback,
  speakNumberPrompt,
  speakTestResult,
  stopSpeech
} from '@/composables/useAudio';

type TestPhase = 'intro' | 'quiz' | 'result';

interface TestQuestion {
  id: number;
  numberStr: string;
}

const TOTAL_QUESTIONS = 20;
const QUESTION_SECONDS = 20;
const SCORE_PER_QUESTION = 5;
const PROMPT_REPEAT_DELAY_MS = 10000;

const numbersList = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const router = useRouter();

const phase = ref<TestPhase>('intro');
const questions = ref<TestQuestion[]>([]);
const currentQuestionIndex = ref(0);
const score = ref(0);
const displayScore = ref(0);
const timeLeft = ref(QUESTION_SECONDS);
const selectedNumber = ref<string | null>(null);
const answerLocked = ref(false);
const statusMessage = ref('请点击开始测试');
const lastAnswerCorrect = ref<boolean | null>(null);

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
    const randomNumber = numbersList[Math.floor(Math.random() * numbersList.length)];
    return {
      id: index,
      numberStr: randomNumber
    };
  });

const speakCurrentPrompt = () => {
  if (!activeQuestion.value) {
    return;
  }

  speakNumberPrompt(Number(activeQuestion.value.numberStr));
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
  selectedNumber.value = null;
  answerLocked.value = false;
  lastAnswerCorrect.value = null;
  statusMessage.value = '请听语音后，点击正确的数字';

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
  selectedNumber.value = null;
  answerLocked.value = true;
  statusMessage.value = '';
  lastAnswerCorrect.value = null;

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

const handleNumberPick = (numStr: string) => {
  if (phase.value !== 'quiz' || answerLocked.value || !activeQuestion.value) {
    return;
  }

  clearQuestionTimers();
  answerLocked.value = true;
  selectedNumber.value = numStr;

  const isCorrect = numStr === activeQuestion.value.numberStr;
  lastAnswerCorrect.value = isCorrect;

  if (isCorrect) {
    score.value += SCORE_PER_QUESTION;
    statusMessage.value = '回答正确，加 5 分';
    playUiSound('success');
  } else {
    statusMessage.value = `答错了，正确答案是 ${activeQuestion.value.numberStr}`;
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
  selectedNumber.value = null;
  lastAnswerCorrect.value = false;
  statusMessage.value = `时间到，正确答案是 ${activeQuestion.value.numberStr}`;
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
    <van-nav-bar title="数字测试" left-text="返回" left-arrow @click-left="goHome" />

    <section class="page-section">
      <div class="page-tools">
        <SoundToggle />
      </div>

      <template v-if="phase === 'intro'">
        <section class="test-panel">
          <div class="test-panel__badge">听音选数字</div>
          <h2 class="test-panel__title">开始你的数字测试</h2>
          <p class="test-panel__desc">
            一共 20 道题，每题会朗读两次“请选择数字 X”（间隔约 10 秒），请在 20 秒内点击正确数字。
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
        <section class="learning-summary learning-summary--number-test">
          <div class="learning-summary__head">
            <div>
              <div class="learning-summary__eyebrow">测试进度</div>
              <div class="learning-summary__title">
                第 {{ currentQuestionIndex + 1 }} 题 / 共 {{ TOTAL_QUESTIONS }} 题
              </div>
            </div>
            <van-tag round type="primary">当前分数 {{ score }}</van-tag>
          </div>
          <van-progress :percentage="progressPercent" stroke-width="10" color="#ffb347" />
          <div class="learning-summary__meta">
            <span>每题限时 {{ QUESTION_SECONDS }} 秒</span>
            <span>答对加 {{ SCORE_PER_QUESTION }} 分</span>
          </div>
        </section>

        <section class="test-prompt-card test-prompt-card--number">
          <div class="test-prompt-card__icon">1?</div>
          <div class="test-prompt-card__title">请听语音后选择正确的数字</div>
          <div class="test-prompt-card__desc">
            系统会在题目开始时朗读一次，并在 10 秒后再朗读一次。
          </div>
          <div class="test-prompt-card__actions">
            <van-button round plain type="primary" size="small" @click="replayPrompt">
              再听一次
            </van-button>
          </div>
        </section>

        <section class="test-status-row">
          <div class="test-timer" :class="{ 'test-timer--warning': timeLeft <= 2 }">
            <div class="test-timer__label">剩余时间</div>
            <div class="test-timer__value">{{ timeLeft }}</div>
          </div>

          <div class="test-feedback" :class="{
            'test-feedback--correct': lastAnswerCorrect === true,
            'test-feedback--wrong': lastAnswerCorrect === false
          }">
            {{ statusMessage }}
          </div>
        </section>

        <section class="grid-panel">
          <div class="grid-panel__title">请选择正确数字</div>
          <div class="test-number-grid">
            <button
              v-for="numStr in numbersList"
              :key="numStr"
              type="button"
              class="test-number-button"
              :class="{
                'test-number-button--selected': selectedNumber === numStr,
                'test-number-button--correct': answerLocked && activeQuestion?.numberStr === numStr,
                'test-number-button--wrong':
                  answerLocked &&
                  selectedNumber === numStr &&
                  activeQuestion?.numberStr !== numStr
              }"
              :disabled="answerLocked"
              @click="handleNumberPick(numStr)"
            >
              {{ numStr }}
            </button>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="test-result-card">
          <div class="test-result-card__badge">测试完成</div>
          <div class="test-result-card__score">{{ displayScore }}</div>
          <div class="test-result-card__unit">分</div>
          <div class="test-result-card__message">{{ encouragement }}</div>
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
