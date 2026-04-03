import { computed, ref } from 'vue';

type SoundPreset = 'primary' | 'success' | 'soft';

const STORAGE_KEY = 'smartleo:sound-enabled';

const soundEnabledState = ref(true);
let hasLoadedPreference = false;
let audioContext: AudioContext | null = null;

const loadPreference = () => {
  if (hasLoadedPreference || typeof window === 'undefined') {
    return;
  }

  const savedValue = window.localStorage.getItem(STORAGE_KEY);
  if (savedValue !== null) {
    soundEnabledState.value = savedValue === 'true';
  }

  hasLoadedPreference = true;
};

const persistPreference = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, String(soundEnabledState.value));
};

const getAudioContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const BrowserAudioContext =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!BrowserAudioContext) {
    return null;
  }

  if (!audioContext) {
    audioContext = new BrowserAudioContext();
  }

  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }

  return audioContext;
};

const soundPresets: Record<SoundPreset, { frequency: number; duration: number; gain: number }> = {
  primary: {
    frequency: 660,
    duration: 0.12,
    gain: 0.035
  },
  success: {
    frequency: 720,
    duration: 0.14,
    gain: 0.04
  },
  soft: {
    frequency: 560,
    duration: 0.1,
    gain: 0.028
  }
};

export const playUiSound = (preset: SoundPreset = 'primary') => {
  loadPreference();
  if (!soundEnabledState.value) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  const config = soundPresets[preset];
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const startTime = context.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(config.frequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(config.frequency * 1.08, startTime + config.duration);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(config.gain, startTime + 0.015);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + config.duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + config.duration);
};

const getBestVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return null;
  }

  const isZh = lang.startsWith('zh');
  const targetVoices = voices.filter((v) => v.lang.startsWith(isZh ? 'zh' : 'en'));

  if (isZh) {
    // 偏好更活泼/儿童/女性的中文语音
    const preferredNames = ['Xiaoxiao', 'Yaoyao', 'Ting-Ting', 'Meijia', 'Huihui', 'Google 普通话', 'Tingting'];
    for (const name of preferredNames) {
      const match = targetVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
  } else {
    // 偏好更清晰/活泼的英文语音
    const preferredNames = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Google US English', 'Microsoft Zira'];
    for (const name of preferredNames) {
      const match = targetVoices.find((v) => v.name.includes(name));
      if (match) return match;
    }
  }

  return targetVoices[0] || null;
};

export const speakText = (text: string, lang: string) => {
  loadPreference();
  if (!soundEnabledState.value || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const normalizedText = text.trim();
  if (!normalizedText) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(normalizedText);
  utterance.lang = lang;
  
  const voice = getBestVoice(lang);
  if (voice) {
    utterance.voice = voice;
  }

  // 稍微调高音调让声音更“童声”、活泼，语速稍放慢以适合儿童听清
  utterance.rate = lang.startsWith('zh') ? 0.85 : 0.8;
  utterance.pitch = 1.4;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};

export const speakLetter = (letter: string) => {
  speakText(letter, 'en-US');
};

export const speakHanzi = (hanzi: string) => {
  speakText(hanzi, 'zh-CN');
};

export const speakLetterPrompt = (letter: string) => {
  speakText(`请选择字母 ${letter}`, 'zh-CN');
};

export const speakNumberPrompt = (number: number) => {
  speakText(`请选择数字 ${number}`, 'zh-CN');
};

export const speakHanziPrompt = (hanzi: string) => {
  // 中间加上逗号和省略号，强制 TTS 发音时产生短暂亦清晰的停顿
  speakText(`请选择汉字，... ${hanzi}`, 'zh-CN');
};

export const speakTestResult = (score: number, encouragement: string) => {
  speakText(`本次测试得分 ${score} 分，... ${encouragement}`, 'zh-CN');
};

/** 答题反馈：播报「正确」或「错误」后执行后续流程（静音或无 TTS 时用短延迟兜底） */
export const speakAnswerFeedback = (isCorrect: boolean, onComplete: () => void) => {
  loadPreference();
  if (!soundEnabledState.value || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    window.setTimeout(onComplete, 500);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(isCorrect ? '正确' : '错误');
  utterance.lang = 'zh-CN';
  
  const voice = getBestVoice('zh-CN');
  if (voice) {
    utterance.voice = voice;
  }
  
  utterance.rate = 0.9;
  utterance.pitch = 1.4;
  utterance.volume = 1;

  const finish = () => {
    window.setTimeout(onComplete, 350);
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
};

export const useAudioPreferences = () => {
  loadPreference();

  const toggleSound = () => {
    soundEnabledState.value = !soundEnabledState.value;
    persistPreference();

    if (soundEnabledState.value) {
      playUiSound('success');
    } else {
      stopSpeech();
    }
  };

  return {
    soundEnabled: computed(() => soundEnabledState.value),
    toggleSound
  };
};
