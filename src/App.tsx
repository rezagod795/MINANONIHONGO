import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Volume2, VolumeX, Trophy, Play, Star, BookOpen, SkipForward, Heart, ArrowLeft, Users, Globe, Medal, Share2, LogIn, LogOut, User, Sun, Moon, Sunrise, Sunset, ExternalLink, Headphones, Zap, Pencil, Layers, Contrast, Eye, Type, Accessibility, CheckCircle2, Languages, Sparkles, RotateCcw } from 'lucide-react';
import { Howl } from 'howler';
import { levelsData } from './vocabulary';
import { VocabItem } from './types';
import confetti from 'canvas-confetti';
import { ProgressChart } from './components/ProgressChart';
import { KoiPond } from './components/KoiPond';
import { DrawingCanvas } from './components/DrawingCanvas';
import { KanaReading } from './components/KanaReading';
import { KanaWriting } from './components/KanaWriting';
import { KanjiHub } from './components/KanjiHub';
import { IRODORI_KANJI_LIST, KANJI_TIERS, KANJI_LEVEL_CHUNKS, KanjiVocabItem } from './data/kanji_data';
import { RippleButton } from './components/RippleButton';
import { FlightLoading } from './components/FlightLoading';
import { CinematicCurtain } from './components/CinematicCurtain';
import { AchievementCelebration, triggerSuperchargedConfetti, playVictoryFanfare } from './components/AchievementCelebration';
import { 
  loginWithGoogle, 
  loginWithGoogleRedirect,
  handleRedirectResult,
  loginAsGuest,
  loginWithEmail,
  registerWithEmail,
  logout, 
  getAppAuth, 
  saveUserProgress, 
  subscribeToUserProgress,
  isFirebaseConfigured,
  getFirebaseProjectId,
  createDuel,
  joinDuel,
  updateDuelShared,
  subscribeToDuel,
  updatePresence,
  subscribeToPresence,
  logVisitor,
  subscribeToVisitors
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// Sound definitions
const sounds = {
  correct: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'], volume: 0.5 }),
  wrong: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'], volume: 0.5 }),
  click: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.3 }),
  win: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], volume: 0.6 }),
};

// Smooth & Cinematic view transitions
const viewVariants = {
  initial: (custom: { direction?: number; effect?: 'curtain' | 'slide' | 'fade' } = {}) => {
    const dir = custom?.direction ?? 1;
    const eff = custom?.effect ?? 'curtain';
    if (eff === 'slide') {
      return {
        opacity: 0,
        x: dir > 0 ? 38 : -38,
        scale: 0.97,
        filter: 'blur(4px)',
      };
    }
    if (eff === 'curtain') {
      return {
        opacity: 0.85,
        scale: 0.99,
      };
    }
    return {
      opacity: 0,
      scale: 0.98,
    };
  },
  animate: (custom: { direction?: number; effect?: 'curtain' | 'slide' | 'fade' } = {}) => {
    const eff = custom?.effect ?? 'curtain';
    return {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: eff === 'slide' ? 0.35 : 0.22,
        ease: [0.16, 1, 0.3, 1],
      },
    };
  },
  exit: (custom: { direction?: number; effect?: 'curtain' | 'slide' | 'fade' } = {}) => {
    const dir = custom?.direction ?? 1;
    const eff = custom?.effect ?? 'curtain';
    if (eff === 'slide') {
      return {
        opacity: 0,
        x: dir > 0 ? -30 : 30,
        scale: 0.97,
        filter: 'blur(4px)',
        transition: {
          duration: 0.22,
          ease: [0.16, 1, 0.3, 1],
        },
      };
    }
    return {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
    };
  },
};

// Subtle Web Audio synthesized cinematic transition swoosh
const playTransitionSwoosh = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.32);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.34);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (_) {}
};




export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
    setDeferredPrompt(null);
  };

  const [view, setView] = useState<'intro' | 'mode_select' | 'quiz' | 'leaderboard' | 'multiplayer' | 'duel_setup' | 'visitors' | 'flashcards' | 'sandbox' | 'dictionary' | 'time_attack' | 'listening_practice' | 'word_match' | 'kana_reading' | 'kana_writing' | 'kanji_hub'>('intro');
  // Selalu tampilkan intro loading animasi setiap aplikasi dibuka, di-refresh, atau di-restart
  const [isLoadingIntro, setIsLoadingIntro] = useState<boolean>(true);
  
  // Force cache clear for data fixes (Version 1.0.7)
  useEffect(() => {
    const APP_VERSION = '1.0.8';
    const storedVersion = localStorage.getItem('app_data_version');
    if (storedVersion !== APP_VERSION) {
      localStorage.setItem('app_data_version', APP_VERSION);
      if (storedVersion) {
        // Clear session data that might be stale
        sessionStorage.clear();
        // Clear highscores if they are corrupted? No, just keep them but clear session.
        window.location.reload();
      }
    }
  }, []);

  const resetApp = () => {
    if (confirm('Bersihkan semua data cache dan mulai ulang aplikasi? Progres lokal akan terhapus.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_darkmode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  const [multiplayerMode, setMultiplayerMode] = useState<'p1' | 'p2' | null>(null);
  const [p1Stats, setP1Stats] = useState({ score: 0, lives: 5 });
  const [p2Stats, setP2Stats] = useState({ score: 0, lives: 5 });
  
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_local_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = async () => {
    try {
      localStorage.removeItem('minanihongo_local_user');
      localStorage.removeItem('minanihongo_saved_login_password');
      setUser(null);
      if (isFirebaseConfigured()) {
        await logout();
      }
    } catch (err) {
      console.warn('Logout error:', err);
    }
  };

  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncLock = useRef(false);

  const [remoteDuel, setRemoteDuel] = useState<any>(null);
  const [isRemoteMode, setIsRemoteMode] = useState<boolean>(false);
  const [duelTimeLeft, setDuelTimeLeft] = useState<number>(5);
  const isMyTurn = useMemo(() => {
    if (!isRemoteMode || !remoteDuel) return true;
    const isCreator = user?.uid === remoteDuel.creator?.uid;
    const activeRole = remoteDuel.turn;
    return (isCreator && activeRole === 'creator') || (!isCreator && activeRole === 'opponent');
  }, [isRemoteMode, remoteDuel, user?.uid]);
  const [invitedDuelId, setInvitedDuelId] = useState<string | null>(null);
  const [showInvitingDialog, setShowInvitingDialog] = useState<boolean>(false);
  const [inviteIdInput, setInviteIdInput] = useState<string>('');

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [activeMode, setActiveMode] = useState<'vocab' | 'kanji' | 'letters'>('vocab');
  const [customQuizList, setCustomQuizList] = useState<{ list: VocabItem[]; title: string } | null>(null);
  const [selectedDuelLevel, setSelectedDuelLevel] = useState<number>(1);
  const [celebratingLevel100, setCelebratingLevel100] = useState<number | null>(null);
  const [highScores, setHighScores] = useState<Record<number, number>>(() => {
    try {
      const savedUserStr = localStorage.getItem('minanihongo_local_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.uid && u.uid.startsWith('local_')) {
          const uScores = localStorage.getItem(`scores_${u.uid}`);
          if (uScores) return JSON.parse(uScores);
        }
      }
      const saved = localStorage.getItem('minanihongo_highscores');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [favorites, setFavorites] = useState<VocabItem[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('minanihongo_local_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u && u.uid && u.uid.startsWith('local_')) {
          const uFavs = localStorage.getItem(`favorites_${u.uid}`);
          if (uFavs) return JSON.parse(uFavs);
        }
      }
      const saved = localStorage.getItem('minanihongo_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isFavoritesMode, setIsFavoritesMode] = useState<boolean>(false);
  const [showLoginHelp, setShowLoginHelp] = useState<boolean>(false);
  const [showGuestInput, setShowGuestInput] = useState<boolean>(false);
  const [guestNickname, setGuestNickname] = useState<string>('');
  const [guestModeTab, setGuestModeTab] = useState<'guest' | 'login' | 'register'>('guest');
  const [localEmailInput, setLocalEmailInput] = useState<string>(() => {
    try {
      return localStorage.getItem('minanihongo_saved_login_email') || '';
    } catch {
      return '';
    }
  });
  const [localPasswordInput, setLocalPasswordInput] = useState<string>(() => {
    try {
      return localStorage.getItem('minanihongo_saved_login_password') || '';
    } catch {
      return '';
    }
  });
  const [localNicknameInput, setLocalNicknameInput] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [shuffleTrigger, setShuffleTrigger] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [scorePopups, setScorePopups] = useState<{ id: number; text: string; type: 'single' | 'p1' | 'p2' | 'remote-self' }[]>([]);

  // Premium Study Features States
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showDictionary, setShowDictionary] = useState<boolean>(false);
  const [dictionaryQuery, setDictionaryQuery] = useState<string>('');
  const [dictionaryTab, setDictionaryTab] = useState<'all' | 'vocab' | 'kanji'>('all');
  const [activeKanjiTierFilter, setActiveKanjiTierFilter] = useState<'all' | 'nyuumon' | 'shokyuu1' | 'shokyuu2'>('all');
  const [kanjiHubInitialTab, setKanjiHubInitialTab] = useState<'quiz' | 'flashcards' | 'dictionary' | 'practice_write'>('quiz');
  const [flashcardKnownCount, setFlashcardKnownCount] = useState<Record<string, 'known' | 'unknown'>>({});

  const triggerScorePopup = (type: 'single' | 'p1' | 'p2' | 'remote-self') => {
    const animations = ['+1', '🎉 +1', '👏 +1', '✨ +1', '🔥 +1', '🌟 +1'];
    const text = animations[Math.floor(Math.random() * animations.length)];
    const id = Date.now() + Math.random();
    setScorePopups(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== id));
    }, 1200);
  };
  
  // Dynamic Theme Logic
  const currentHour = new Date().getHours();
  const theme = useMemo(() => {
    if (currentHour >= 5 && currentHour < 11) {
      return { id: 'morning', label: 'Pagi', color: 'rose', icon: Sunrise, bg: 'from-rose-500/10 to-transparent' };
    } else if (currentHour >= 11 && currentHour < 16) {
      return { id: 'day', label: 'Siang', color: 'blue', icon: Sun, bg: 'from-blue-500/10 to-transparent' };
    } else if (currentHour >= 16 && currentHour < 19) {
      return { id: 'evening', label: 'Sore', color: 'amber', icon: Sunset, bg: 'from-amber-500/10 to-transparent' };
    } else {
      return { id: 'night', label: 'Malam', color: 'indigo', icon: Moon, bg: 'from-indigo-500/10 to-transparent' };
    }
  }, [currentHour]);

  const totalXP = useMemo(() => Object.values(highScores).reduce((a: number, b: number) => a + b, 0), [highScores]);
  const isMaster = totalXP >= 50; // Threshold for mastery effect

  const themeClasses = {
    text: isMaster ? 'text-amber-500' : `text-${theme.color}-500`,
    border: isMaster ? 'border-amber-500/40' : `border-${theme.color}-500/20`,
    bg: isMaster ? 'bg-amber-500' : `bg-${theme.color}-500`,
    accent: isMaster ? 'amber' : theme.color
  };

  const [lives, setLives] = useState<number>(5);
  const [activeLives, setActiveLives] = useState<number>(5); // Sync with player logic
  const [answerLock, setAnswerLock] = useState<boolean>(false);
  const [selectedInd, setSelectedInd] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [clickVolume, setClickVolume] = useState<number>(() => {
    const val = localStorage.getItem('sound_vol_click');
    return val !== null ? parseFloat(val) : 0.3;
  });
  const [correctVolume, setCorrectVolume] = useState<number>(() => {
    const val = localStorage.getItem('sound_vol_correct');
    return val !== null ? parseFloat(val) : 0.5;
  });
  const [wrongVolume, setWrongVolume] = useState<number>(() => {
    const val = localStorage.getItem('sound_vol_wrong');
    return val !== null ? parseFloat(val) : 0.5;
  });
  const [winVolume, setWinVolume] = useState<number>(() => {
    const val = localStorage.getItem('sound_vol_win');
    return val !== null ? parseFloat(val) : 0.6;
  });

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<'audio' | 'accessibility' | 'transitions'>('transitions');

  // Screen Transition State (Curtain / Slide / Fade)
  const [transitionEffect, setTransitionEffect] = useState<'curtain' | 'slide' | 'fade'>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_transition_effect');
      return (saved === 'curtain' || saved === 'slide' || saved === 'fade') ? saved : 'curtain';
    } catch {
      return 'curtain';
    }
  });
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [curtainState, setCurtainState] = useState<{
    isActive: boolean;
    phase: 'idle' | 'closing' | 'closed' | 'opening';
    title?: string;
    subtitle?: string;
    badgeType?: 'quiz' | 'menu' | 'kana' | 'game' | 'general';
  }>({
    isActive: false,
    phase: 'idle',
  });

  const updateTransitionEffect = (eff: 'curtain' | 'slide' | 'fade') => {
    setTransitionEffect(eff);
    try {
      localStorage.setItem('minanihongo_transition_effect', eff);
    } catch (_) {}
  };

  const previewCurtain = () => {
    playTransitionSwoosh();
    setCurtainState({
      isActive: true,
      phase: 'closing',
      title: 'クイズ開始',
      subtitle: 'CONTOH TRANSISI TIRAI SINEMATIK',
      badgeType: 'quiz',
    });
    setTimeout(() => {
      setCurtainState(prev => ({ ...prev, phase: 'closed' }));
      setTimeout(() => {
        setCurtainState(prev => ({ ...prev, phase: 'opening' }));
        setTimeout(() => {
          setCurtainState({ isActive: false, phase: 'idle' });
        }, 320);
      }, 160);
    }, 280);
  };

  // Accessibility States (Screen Reader & High Contrast)
  const [highContrastMode, setHighContrastMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_high_contrast');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_text_size');
      return (saved === 'large' || saved === 'xlarge') ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_voice_assistant');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [srAnnouncement, setSrAnnouncement] = useState<string>('');

  const announce = useCallback((message: string) => {
    setSrAnnouncement('');
    setTimeout(() => {
      setSrAnnouncement(message);
    }, 50);
  }, []);

  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('minanihongo_high_contrast', JSON.stringify(highContrastMode));
  }, [highContrastMode]);

  useEffect(() => {
    document.documentElement.classList.remove('text-size-large', 'text-size-xlarge');
    if (textSize === 'large') {
      document.documentElement.classList.add('text-size-large');
    } else if (textSize === 'xlarge') {
      document.documentElement.classList.add('text-size-xlarge');
    }
    localStorage.setItem('minanihongo_text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('minanihongo_voice_assistant', JSON.stringify(voiceAssistantEnabled));
  }, [voiceAssistantEnabled]);

  useEffect(() => {
    if (sounds?.click) sounds.click.volume(clickVolume);
    localStorage.setItem('sound_vol_click', clickVolume.toString());
  }, [clickVolume]);

  useEffect(() => {
    if (sounds?.correct) sounds.correct.volume(correctVolume);
    localStorage.setItem('sound_vol_correct', correctVolume.toString());
  }, [correctVolume]);

  useEffect(() => {
    if (sounds?.wrong) sounds.wrong.volume(wrongVolume);
    localStorage.setItem('sound_vol_wrong', wrongVolume.toString());
  }, [wrongVolume]);

  useEffect(() => {
    if (sounds?.win) sounds.win.volume(winVolume);
    localStorage.setItem('sound_vol_win', winVolume.toString());
  }, [winVolume]);


  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | null; message: string }>({ type: null, message: '' });
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Time Attack Mode State
  const [timeAttackTimeLeft, setTimeAttackTimeLeft] = useState<number>(60);
  const [timeAttackActive, setTimeAttackActive] = useState<boolean>(false);
  const [timeAttackScore, setTimeAttackScore] = useState<number>(0);
  const [timeAttackTotal, setTimeAttackTotal] = useState<number>(0);
  const [timeAttackCompleted, setTimeAttackCompleted] = useState<boolean>(false);
  const [timeAttackIndex, setTimeAttackIndex] = useState<number>(0);
  const [timeAttackOptions, setTimeAttackOptions] = useState<string[]>([]);
  const [timeAttackSelected, setTimeAttackSelected] = useState<string | null>(null);
  const [timeAttackLocked, setTimeAttackLocked] = useState<boolean>(false);
  const [timeAttackHighScore, setTimeAttackHighScore] = useState<number>(() => {
    const val = localStorage.getItem('time_attack_highscore');
    return val !== null ? parseInt(val, 10) : 0;
  });

  // Listening Practice Mode State
  const [listeningActive, setListeningActive] = useState<boolean>(false);
  const [listeningScore, setListeningScore] = useState<number>(0);
  const [listeningTotal, setListeningTotal] = useState<number>(0);
  const [listeningLives, setListeningLives] = useState<number>(5);
  const [listeningCompleted, setListeningCompleted] = useState<boolean>(false);
  const [listeningIndex, setListeningIndex] = useState<number>(0);
  const [listeningOptions, setListeningOptions] = useState<string[]>([]);
  const [listeningSelected, setListeningSelected] = useState<string | null>(null);
  const [listeningLocked, setListeningLocked] = useState<boolean>(false);

  // Word Matching Game State
  interface MatchCard {
    id: string;
    text: string;
    type: 'jpn' | 'ind';
    pairId: string;
    isMatched: boolean;
  }
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [matchSelected, setMatchSelected] = useState<MatchCard[]>([]);
  const [matchCompleted, setMatchCompleted] = useState<boolean>(false);
  const [matchTime, setMatchTime] = useState<number>(0);
  const [matchActive, setMatchActive] = useState<boolean>(false);
  const [matchMoves, setMatchMoves] = useState<number>(0);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstSync = useRef<boolean>(true);
  const currentTtsAudioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (currentTtsAudioRef.current) {
        currentTtsAudioRef.current.pause();
        currentTtsAudioRef.current = null;
      }
    };
  }, []);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const speakJapanese = (text: string) => {
    // Help parse elements with HTML
    const stripHtml = (htmlStr: string) => {
      try {
        const doc = new DOMParser().parseFromString(htmlStr, 'text/html');
        return doc.body.textContent || htmlStr;
      } catch {
        return htmlStr.replace(/<[^>]*>/g, '');
      }
    };

    let processedText = stripHtml(text);

    if (processedText.includes("【")) {
      processedText = processedText
        .replace(/【.*?】/g, '')
        .replace(/(Pertanyaan|質問|しつもん)[:：].*?$/gi, '')
        .replace(/(A|B|男|女|男性|女性)[:：]/g, '');
    }

    // Clean up decorative tokens
    let cleanedText = processedText
      .replace(/―/g, '')
      .replace(/[（）()]/g, '')
      .trim();

    if (!cleanedText) cleanedText = processedText;

    // 1. Cancel any active browser Web Speech synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Failed to cancel window.speechSynthesis", e);
      }
    }

    // 2. Stop any active HTML5 Google Cloud TTS playback
    if (currentTtsAudioRef.current) {
      try {
        currentTtsAudioRef.current.pause();
      } catch (e) {
        console.warn("Failed to pause currentTtsAudioRef", e);
      }
      currentTtsAudioRef.current = null;
    }

    // Fallback runner to local browser speech synthesis
    const playFallback = () => {
      if (!('speechSynthesis' in window)) return;
      try {
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'ja-JP';

        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'));
        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error("Local TTS Fallback Error:", err);
      }
    };

    // 3. Try Premium Google Cloud TTS via server proxy
    const audioUrl = `/api/tts?text=${encodeURIComponent(cleanedText)}`;
    const audio = new Audio(audioUrl);
    currentTtsAudioRef.current = audio;

    // Handle initial loading errors (e.g. backend key missing or GCP/API offline)
    audio.addEventListener('error', (event) => {
      console.warn("Google Cloud TTS stream failed, playing Web Speech synthesis fallback.");
      playFallback();
    });

    audio.play().catch(err => {
      // "AbortError" is triggered when audio.pause() stops the track (e.g. user clicked another item)
      // Only invoke the fallback if it's an actual playback initiation failure.
      if (err.name !== 'AbortError') {
        console.warn("Google Cloud TTS play initiation failed, using fallback:", err);
        playFallback();
      }
    });
  };

  const currentVocabList = useMemo<VocabItem[]>(() => {
    if (isRemoteMode && remoteDuel?.vocabList) {
      return remoteDuel.vocabList as VocabItem[];
    }
    let list: VocabItem[] = [];
    if (isFavoritesMode) {
      list = [...favorites];
    } else {
      list = [...(levelsData[currentLevel]?.vocab || [])];
    }
    return shuffleArray(list) as VocabItem[];
  }, [isRemoteMode, remoteDuel?.vocabList, currentLevel, isFavoritesMode, shuffleTrigger]);

  // Combine question and options into one memo to ensure they are ALWAYS in sync
  const currentStep = useMemo(() => {
    const question = currentVocabList[currentIndex];
    if (!question) return null;

    // Filter decoys:
    // 1. Must NOT have the same Japanese text as the question
    // 2. Must NOT have the same Indonesian translation as the question
    // 3. We must build a set of decoys such that each has a UNIQUE Indonesian translation AND Japanese text.
    const selected: VocabItem[] = [];
    const seenInd = new Set<string>([question.ind.toLowerCase().trim()]);
    const seenJpn = new Set<string>([question.jpn.toLowerCase().trim()]);

    const others = (currentVocabList as VocabItem[]).filter((v: VocabItem) => {
      const j = v.jpn.toLowerCase().trim();
      const i = v.ind.toLowerCase().trim();
      return j !== question.jpn.toLowerCase().trim() && i !== question.ind.toLowerCase().trim();
    });

    const shuffledOthers = shuffleArray(others) as VocabItem[];
    for (const item of shuffledOthers) {
      if (selected.length >= 3) break;
      const iNorm = item.ind.toLowerCase().trim();
      const jNorm = item.jpn.toLowerCase().trim();
      if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
        selected.push(item);
        seenInd.add(iNorm);
        seenJpn.add(jNorm);
      }
    }

    // Fallback: If we couldn't find enough unique decoys in the current list, try fallback from all levels
    if (selected.length < 3) {
      const allVocabs = (Object.values(levelsData) as any[]).flatMap(lvl => lvl.vocab || []) as VocabItem[];
      const shuffledAll = shuffleArray(allVocabs);
      for (const item of shuffledAll) {
        if (selected.length >= 3) break;
        const iNorm = item.ind.toLowerCase().trim();
        const jNorm = item.jpn.toLowerCase().trim();
        if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
          selected.push(item);
          seenInd.add(iNorm);
          seenJpn.add(jNorm);
        }
      }
    }

    const options = shuffleArray([question, ...selected]);

    return { question, options };
  }, [currentVocabList, currentIndex]);

  const activeQuestion = currentStep?.question || null;
  const options = currentStep?.options || [];

  // Reset quiz states when question changes
  useEffect(() => {
    setAnswerLock(false);
    setSelectedInd(null);
    setFeedback({ type: null, message: '' });
  }, [currentIndex, currentLevel, isFavoritesMode]);

  // Screen reader announcement on view change
  useEffect(() => {
    const viewNames: Record<string, string> = {
      intro: 'Halaman Utama',
      mode_select: 'Pilihan Mode Belajar',
      quiz: 'Kuis Kosakata',
      duel_setup: 'Pengaturan Duel 1 lawan 1',
      leaderboard: 'Papan Peringkat',
      visitors: 'Daftar Pengunjung',
      flashcards: 'Belajar Flashcards',
      sandbox: 'Papan Goresan Kana',
      dictionary: 'Kamus Kosakata',
      time_attack: 'Tantangan Time Attack 60 Detik',
      listening_practice: 'Latihan Mendengarkan Audio',
      word_match: 'Permainan Mencocokkan Kata',
      kana_reading: 'Latihan Membaca Huruf',
      kana_writing: 'Papan Menulis Huruf'
    };
    const title = viewNames[view] || view;
    announce(`Beralih ke layar: ${title}`);
  }, [view, announce]);

  // TTS (Text-to-Speech) auto-play effect when active question changes
  useEffect(() => {
    if (view === 'quiz' && activeQuestion) {
      const cleanJpn = activeQuestion.jpn.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();
      announce(`Soal kuis nomor ${currentIndex + 1}. Kata Jepang: ${cleanJpn}. Silakan pilih arti bahasa Indonesia.`);

      if (soundEnabled || voiceAssistantEnabled) {
        const text = activeQuestion.jpn;
        
        // Auto-speak if it is not excessively long (e.g. Dokai / reading)
        if (!text.includes("【DOKAI") && !text.includes("【読解") && text.length < 185) {
          const timer = setTimeout(() => {
            speakJapanese(text);
          }, 180);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [activeQuestion?.jpn, currentIndex, view, soundEnabled, voiceAssistantEnabled, announce]);

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Loader Component
  const Loader = ({ message = "Memuat data..." }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`w-10 h-10 border-4 border-t-transparent rounded-full ${darkMode ? 'border-rose-500' : 'border-rose-400'}`}
      />
      <p className={`text-sm font-bold animate-pulse ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {message}
      </p>
    </div>
  );

  // Dark Mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('minanihongo_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Initial Data Loading Simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsDataLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Remote Duel URL Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dId = params.get('duelId');
    if (dId) {
      setInviteIdInput(dId);
      setShowInvitingDialog(true);
    }
  }, []);

  // Sync Favorites to LocalStorage & Firestore
  useEffect(() => {
    localStorage.setItem('minanihongo_favorites', JSON.stringify(favorites));

    if (user) {
      if (user.uid.startsWith('local_')) {
        localStorage.setItem(`scores_${user.uid}`, JSON.stringify(highScores));
        localStorage.setItem(`favorites_${user.uid}`, JSON.stringify(favorites));

        if (user.uid.startsWith('local_user_')) {
          try {
            const accountsStr = localStorage.getItem('minanihongo_local_accounts');
            if (accountsStr) {
              const accounts = JSON.parse(accountsStr);
              const idx = accounts.findIndex((a: any) => `local_user_${a.email}` === user.uid);
              if (idx !== -1) {
                accounts[idx].highScores = highScores;
                accounts[idx].favorites = favorites;
                localStorage.setItem('minanihongo_local_accounts', JSON.stringify(accounts));
              }
            }
          } catch (e) {
            console.error("Gagal menyinkronkan progres ke akun lokal:", e);
          }
        }
      } else if (!syncLock.current && isFirebaseConfigured()) {
        saveUserProgress(user.uid, highScores, favorites)
          .then(() => {
            if (!isFirstSync.current) {
              showToast("Progres berhasil disinkronkan ke Cloud! ☁️", "success");
            }
            isFirstSync.current = false;
          })
          .catch(console.error);
      }
    }

    // Set first sync to false after the first run so subsequent state updates trigger toast
    if (isFirstSync.current) {
      // Small timeout to bypass initial state assignments
      setTimeout(() => {
        isFirstSync.current = false;
      }, 1500);
    }

    if (isFavoritesMode && favorites.length === 0) {
      switchView('intro');
      setIsFavoritesMode(false);
    }
  }, [favorites, isFavoritesMode, user, highScores]);

  // Auth & Presence Listener
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    
    logVisitor();

    // Catch redirect login results if any
    handleRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        localStorage.removeItem('minanihongo_local_user');
        setUser(redirectUser);
        alert(`🎉 LOGIN GOOGLE BERHASIL!\n\nSelamat Datang kembali, ${redirectUser.displayName || redirectUser.email || "User"}!\nAkun Google Cloud Firebase Anda kini aktif terhubung.`);
      }
    }).catch((err: any) => {
      console.warn("Gagal memproses redirect login google:", err);
      const errCode = err?.code || "";
      const errMsg = err?.message || "";
      
      if (errCode === "auth/unauthorized-domain" || errMsg.includes("unauthorized-domain") || errMsg.includes("unauthorized domain")) {
        alert(
          `⚠️ DOMAIN BELUM TERDAFTAR DI FIREBASE:\n\n` +
          `Aplikasi tidak bisa memproses masuk menggunakan Google karena domain web ini belum ditambahkan ke daftar resmi di Firebase Console Anda.\n\n` +
          `Langkah Solusi Tercepat:\n` +
          `1. Buka Firebase Console proyek Anda.\n` +
          `2. Masuk ke menu "Authentication" > tab "Settings" > pilih "Authorized Domains".\n` +
          `3. Klik tombol "Add Domain" (Tambah Domain).\n` +
          `4. Masukkan nama domain berikut:\n` +
          `   👉 ${window.location.hostname}\n` +
          `5. Klik Simpan lalu muat ulang halaman ini dan coba login kembali!\n\n` +
          `💡 Tips: Sebagai alternatif, Anda bisa mendaftar lewat tab "Masuk via Akun Lokal / Tamu" di bawah menggunakan Email dan Password yang sangat praktis.`
        );
      } else if (errCode && errCode !== "auth/popup-closed-by-user" && errCode !== "auth/cancelled-popup-request") {
        alert(`Gagal login via Google: ${errMsg} (${errCode})`);
      }
    });

    try {
      const auth = getAppAuth();
      const unsubAuth = onAuthStateChanged(auth, (u) => {
        if (u) {
          localStorage.removeItem('minanihongo_local_user');
          setUser(u);
          updatePresence(u.uid, u);
        } else {
          try {
            const saved = localStorage.getItem('minanihongo_local_user');
            if (saved) {
              setUser(JSON.parse(saved));
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      });

      const heartbeat = setInterval(() => {
        if (auth.currentUser) {
          updatePresence(auth.currentUser.uid, auth.currentUser);
        }
      }, 120000);

      const handleUnload = () => {
        if (auth.currentUser) {
          updatePresence(auth.currentUser.uid, null);
        }
      };
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        unsubAuth();
        clearInterval(heartbeat);
        window.removeEventListener('beforeunload', handleUnload);
      };
    } catch (err) {
      console.warn('Auth/Presence Error:', err);
    }
  }, []);

  // Dynamic Presence subscription based on active Firebase Authentication
  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    
    // Check if we have a real Firebase user (not a sandbox local user)
    const isRealCloudUser = user && !user.uid.startsWith('local_');
    
    if (isRealCloudUser) {
      try {
        const unsubPresence = subscribeToPresence((users) => {
          const now = Date.now();
          const filtered = users.filter(u => {
            if (!u.lastSeen) return false;
            const lastSeen = u.lastSeen?.toMillis ? u.lastSeen.toMillis() : 0;
            return (now - lastSeen) < 600000;
          });
          setActiveUsers(filtered);
        });
        
        return () => {
          unsubPresence();
        };
      } catch (err) {
        console.warn('Gagal berlangganan kehadiran online:', err);
      }
    } else {
      setActiveUsers([]);
    }
  }, [user]);

  // Session Auto-Login logic for email credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('minanihongo_saved_login_email');
    const savedPass = localStorage.getItem('minanihongo_saved_login_password');
    const localUserStr = localStorage.getItem('minanihongo_local_user');
    
    // Auto-login only if we have saved credentials and no active user session in State
    if (savedEmail && savedPass && !localUserStr && !user) {
      const email = savedEmail.trim().toLowerCase();
      
      if (isFirebaseConfigured()) {
        loginWithEmail(email, savedPass)
          .then((cloudUser) => {
            if (cloudUser) {
              localStorage.removeItem('minanihongo_local_user');
              setUser(cloudUser);
              console.log("Auto-login cloud success for:", email);
            }
          })
          .catch((err) => {
            console.warn("Auto-login cloud failed, trying local fallback:", err);
            attemptLocalAutoLogin(email, savedPass);
          });
      } else {
        attemptLocalAutoLogin(email, savedPass);
      }
    }
    
    function attemptLocalAutoLogin(email: string, pass: string) {
      try {
        const accountsStr = localStorage.getItem('minanihongo_local_accounts') || '[]';
        const accounts = JSON.parse(accountsStr);
        const account = accounts.find((a: any) => a.email === email && a.password === pass);
        if (account) {
          const localUser = {
            uid: `local_user_${account.email}`,
            displayName: account.displayName,
            email: account.email,
            isAnonymous: false,
            photoURL: null
          };
          localStorage.setItem('minanihongo_local_user', JSON.stringify(localUser));
          setHighScores(account.highScores || {});
          setFavorites(account.favorites || []);
          setUser(localUser as any);
          console.log("Auto-login local success for:", email);
        }
      } catch (e) {
        console.warn("Auto-login local error:", e);
      }
    }
  }, []);

  // Developer Log Listener
  useEffect(() => {
    if (user?.email === 'duta070905@gmail.com') {
      const unsubVisitors = subscribeToVisitors((data) => {
        setVisitors(data);
      });
      return () => unsubVisitors();
    }
  }, [user]);

  // Firestore Sync Listener
  useEffect(() => {
    if (!user || !isFirebaseConfigured()) return;

    try {
      return subscribeToUserProgress(user.uid, (data) => {
        if (data) {
          syncLock.current = true;
          if (data.highScores) setHighScores(data.highScores);
          if (data.favorites) setFavorites(data.favorites);
          setTimeout(() => { syncLock.current = false; }, 500);
        }
      });
    } catch (err) {
      console.warn('Sync Error:', err);
    }
  }, [user]);

  const playSfx = useCallback((type: keyof typeof sounds) => {
    if (soundEnabled) {
      sounds[type].play();
    }
  }, [soundEnabled]);



  // Remote Duel Listener
  useEffect(() => {
    if (!user || !isRemoteMode || !remoteDuel?.id) return;

    try {
      return subscribeToDuel(remoteDuel.id, (data) => {
        if (data) {
          const isCreator = user?.uid === data.creator?.uid;
          
          if (remoteDuel.status === 'pending' && data.status === 'joined') {
            playSfx('correct');
            setFeedback({ type: 'correct', message: `${data.opponent?.name || 'Lawan'} Bergabung!` });
          }

          // Creator transitions status 'joined' to 'ongoing' turn 'creator' (First Question)
          if (isCreator && data.status === 'joined') {
            updateDuelShared(data.id, {
              status: 'ongoing',
              turn: 'creator',
              currentIndex: 0,
              turnStartedAt: Date.now()
            });
            return;
          }

          setRemoteDuel(data);
          
          if (data.level && currentLevel !== data.level) {
            setCurrentLevel(data.level);
          }

          if (typeof data.currentIndex === 'number') {
            setCurrentIndex(data.currentIndex);
          }

          if (data.status === 'ongoing') {
            setQuizFinished(false);
          }

          if (data.status === 'finished') {
            setQuizFinished(true);
          }
        }
      });
    } catch (err) {
      console.warn('Remote Duel Sync Error:', err);
    }
  }, [user, isRemoteMode, remoteDuel?.id, remoteDuel?.status, currentLevel]);

  // Handle game timeout for multiplayer duel
  const handleRemoteTimeout = useCallback(() => {
    if (!isRemoteMode || !remoteDuel || remoteDuel.status !== 'ongoing') return;
    
    const isCreator = user?.uid === remoteDuel.creator?.uid;
    const currentActiveRole = remoteDuel.turn; // 'creator' or 'opponent'
    const isMeActive = (isCreator && currentActiveRole === 'creator') || (!isCreator && currentActiveRole === 'opponent');
    
    // Safety check: Only write if either I'm active, or extra fallback time elapsed
    const elapsed = Date.now() - (remoteDuel.turnStartedAt || 0);
    const isFallback = !isMeActive && elapsed > 7500;

    if (isMeActive || isFallback) {
      const nextRole = currentActiveRole === 'creator' ? 'opponent' : 'creator';
      const currentLives = remoteDuel.lives?.[currentActiveRole] ?? 5;
      const newLives = Math.max(0, currentLives - 1);
      const nextIndex = (remoteDuel.currentIndex ?? 0) + 1;
      
      const isGameFinished = newLives === 0 || nextIndex >= (remoteDuel.vocabList?.length ?? 20);
      
      playSfx('wrong');
      setFeedback({ type: 'wrong', message: 'WAKTU HABIS!' });
      
      updateDuelShared(remoteDuel.id, {
        [`lives.${currentActiveRole}`]: newLives,
        currentIndex: nextIndex,
        turn: nextRole,
        turnStartedAt: Date.now(),
        status: isGameFinished ? 'finished' : 'ongoing'
      });
    }
  }, [isRemoteMode, remoteDuel, user?.uid, playSfx]);

  // Turn real-time countdown
  useEffect(() => {
    if (!isRemoteMode || !remoteDuel || remoteDuel.status !== 'ongoing') {
      return;
    }

    setDuelTimeLeft(5);

    const interval = setInterval(() => {
      setDuelTimeLeft((prev) => {
        const next = prev - 1;
        
        const isCreator = user?.uid === remoteDuel.creator?.uid;
        const activeRole = remoteDuel.turn;
        const isMeActive = (isCreator && activeRole === 'creator') || (!isCreator && activeRole === 'opponent');
        
        if (isMeActive && next === 0) {
          handleRemoteTimeout();
        } else if (!isMeActive && next <= -3) {
          const elapsed = Date.now() - (remoteDuel.turnStartedAt || 0);
          if (elapsed > 7500) {
            handleRemoteTimeout();
          }
        }
        
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRemoteMode, remoteDuel?.turn, remoteDuel?.currentIndex, remoteDuel?.status, user?.uid, handleRemoteTimeout]);

  const toggleFavorite = (item: VocabItem) => {
    playSfx('click');
    setFavorites(prev => {
      const exists = prev.find(f => f.jpn === item.jpn && f.ind === item.ind);
      if (exists) {
        showToast(`Dihapus dari favorit: "${item.jpn}"`, 'info');
        return prev.filter(f => !(f.jpn === item.jpn && f.ind === item.ind));
      }
      showToast(`Ditambahkan ke favorit: "${item.jpn}" ⭐`, 'success');
      return [...prev, item];
    });
  };

  const isFavorited = (item: VocabItem | null) => {
    if (!item) return false;
    return !!favorites.find(f => f.jpn === item.jpn && f.ind === item.ind);
  };

  const handleAnswer = (selectedIndText: string) => {
    if (answerLock || !activeQuestion) return;
    setAnswerLock(true);
    setSelectedInd(selectedIndText);

    const isCorrect = selectedIndText === activeQuestion.ind;
    
    if (isRemoteMode && remoteDuel) {
      const isCreator = user?.uid === remoteDuel.creator?.uid;
      const role = isCreator ? 'creator' : 'opponent';
      const nextRole = role === 'creator' ? 'opponent' : 'creator';
      
      const currentScore = remoteDuel.scores?.[role] ?? 0;
      const currentLives = remoteDuel.lives?.[role] ?? 5;
      
      const newScore = isCorrect ? currentScore + 1 : currentScore;
      const newLives = isCorrect ? currentLives : Math.max(0, currentLives - 1);
      const nextIndex = (remoteDuel.currentIndex ?? 0) + 1;
      
      const isGameFinished = newLives === 0 || nextIndex >= (remoteDuel.vocabList?.length ?? 20);
      
      if (isCorrect) {
        setFeedback({ type: 'correct', message: 'Benar! +1 poin' });
        announce(`Jawaban Benar! Pilihan "${selectedIndText}" tepat. Skor Anda bertambah satu.`);
        playSfx('correct');
        triggerScorePopup('remote-self');
      } else {
        setFeedback({ type: 'wrong', message: `Salah! Jawaban benar: "${activeQuestion.ind}"` });
        announce(`Jawaban Kurang Tepat. Jawaban yang benar adalah: "${activeQuestion.ind}".`);
        playSfx('wrong');
        const container = document.getElementById('quiz-container');
        if (container) {
          container.classList.add('animate-shake');
          setTimeout(() => container.classList.remove('animate-shake'), 500);
        }
      }

      setTimeout(() => {
        setAnswerLock(false);
        setSelectedInd(null);
        setFeedback({ type: null, message: '' });
        
        updateDuelShared(remoteDuel.id, {
          [`scores.${role}`]: newScore,
          [`lives.${role}`]: newLives,
          currentIndex: nextIndex,
          turn: nextRole,
          turnStartedAt: Date.now(),
          status: isGameFinished ? 'finished' : 'ongoing'
        });
      }, 1500);
      return;
    }

    if (isCorrect) {
      setScore(s => s + 1);
      if (multiplayerMode === 'p1') {
        setP1Stats(prev => ({ ...prev, score: prev.score + 1 }));
        triggerScorePopup('p1');
      } else if (multiplayerMode === 'p2') {
        setP2Stats(prev => ({ ...prev, score: prev.score + 1 }));
        triggerScorePopup('p2');
      } else {
        triggerScorePopup('single');
      }
      
      setFeedback({ type: 'correct', message: 'Benar! +1 poin' });
      announce(`Jawaban Benar! Pilihan "${selectedIndText}" tepat. Skor Anda bertambah satu.`);
      playSfx('correct');

      setTimeout(() => {
        nextQuestion();
      }, 90);
    } else {
      const decreaseLives = (prev: number) => {
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          setTimeout(() => {
            setQuizFinished(true);
            playSfx('win');
            
            if (!isFavoritesMode && !multiplayerMode) {
              setHighScores(current => {
                const finalScore = score + (isCorrect ? 1 : 0);
                const prevScore = current[currentLevel] || 0;
                const totalVocab = levelsData[currentLevel]?.vocab.length || 0;
                const updated = { ...current, [currentLevel]: Math.max(prevScore, finalScore) };
                localStorage.setItem('minanihongo_highscores', JSON.stringify(updated));
                if (totalVocab > 0 && finalScore >= totalVocab) {
                  setCelebratingLevel100(currentLevel);
                }
                showToast(`Progres disimpan! Skor akhir: ${finalScore} 🏆`, 'success');
                return updated;
              });
            } else {
              showToast("Pelajaran selesai! 🎉", "success");
            }
          }, 600);
        }
        return next;
      };

      if (multiplayerMode === 'p1') setP1Stats(prev => ({ ...prev, lives: decreaseLives(prev.lives) }));
      if (multiplayerMode === 'p2') setP2Stats(prev => ({ ...prev, lives: decreaseLives(prev.lives) }));
      if (!multiplayerMode) setLives(decreaseLives);

      setFeedback({ type: 'wrong', message: `Salah! Jawaban benar: "${activeQuestion.ind}"` });
      announce(`Jawaban Kurang Tepat. Jawaban yang benar adalah: "${activeQuestion.ind}".`);
      playSfx('wrong');
      
      const container = document.getElementById('quiz-container');
      if (container) {
        container.classList.add('animate-shake');
        setTimeout(() => container.classList.remove('animate-shake'), 500);
      }
    }
  };

  const triggerConfetti = (duration = 4500) => {
    try {
      playVictoryFanfare();
      triggerSuperchargedConfetti(duration);
    } catch (e) {
      console.warn("Confetti error:", e);
    }
  };

  const celebrateLevel100 = (levelNum: number) => {
    playSfx('win');
    setTimeout(() => playSfx('levelup'), 450);
    triggerConfetti(4500);
    setCelebratingLevel100(levelNum);
  };

  const nextQuestion = () => {
    playSfx('click');
    if (currentIndex + 1 < currentVocabList.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setQuizFinished(true);
      playSfx('win');
      setTimeout(() => playSfx('levelup'), 500);
      
      // Trigger intense canvas-confetti celebration when successfully completes the full level
      triggerConfetti(4200);
      
      // Save high score on completion
      if (!isFavoritesMode && !multiplayerMode) {
        setHighScores(current => {
          const prevScore = current[currentLevel] || 0;
          const totalVocab = levelsData[currentLevel]?.vocab.length || 0;
          const updated = { ...current, [currentLevel]: Math.max(prevScore, score) };
          localStorage.setItem('minanihongo_highscores', JSON.stringify(updated));
          if (totalVocab > 0 && score >= totalVocab) {
            setCelebratingLevel100(currentLevel);
          }
          showToast(`Kuis selesai! Skor ${score}/${currentVocabList.length} disimpan! 🏆`, 'success');
          return updated;
        });
      } else {
        showToast("Pelajaran selesai! 🎉", "success");
      }
    }
  };

  const switchView = useCallback((
    nextView: typeof view,
    options?: {
      levelNumber?: number;
      beforeChange?: () => void;
      immediate?: boolean;
    }
  ) => {
    if (nextView === view && !options?.levelNumber) return;

    const isLeavingToMain = nextView === 'mode_select' || nextView === 'intro';
    const isEnteringActivity = nextView === 'quiz' || nextView === 'kana_reading' || nextView === 'kana_writing' || nextView === 'time_attack' || nextView === 'listening_practice' || nextView === 'word_match' || nextView === 'dictionary' || nextView === 'flashcards';

    const direction = isLeavingToMain ? -1 : 1;
    setSlideDirection(direction);

    if (transitionEffect === 'curtain' && !options?.immediate && (isEnteringActivity || isLeavingToMain)) {
      let title = 'みなのにほんご';
      let subtitle = 'Mina no Nihongo';
      let badgeType: 'quiz' | 'menu' | 'kana' | 'game' | 'general' = 'general';

      if (nextView === 'quiz') {
        const lvl = options?.levelNumber ?? currentLevel;
        title = `第${lvl}課`;
        subtitle = `LEVEL ${lvl} • ${levelsData[lvl]?.name?.split(' (')[0] || 'KOSAKATA'}`;
        badgeType = 'quiz';
      } else if (nextView === 'kana_reading') {
        title = 'かな練習';
        subtitle = 'LATIHAN MEMBACA HURUF';
        badgeType = 'kana';
      } else if (nextView === 'kana_writing') {
        title = 'かな書取';
        subtitle = 'PAPAN MENULIS HURUF';
        badgeType = 'kana';
      } else if (nextView === 'time_attack') {
        title = 'タイムアタック';
        subtitle = 'TANTANGAN CEPAT 60 DETIK';
        badgeType = 'game';
      } else if (nextView === 'listening_practice') {
        title = 'リスニング';
        subtitle = 'LATIHAN MENDENGARKAN SUARA';
        badgeType = 'game';
      } else if (nextView === 'word_match') {
        title = '単語マッチ';
        subtitle = 'PERMAINAN MENCOCOKKAN KATA';
        badgeType = 'game';
      } else if (nextView === 'mode_select' || nextView === 'intro') {
        title = 'メニュー';
        subtitle = 'KEMBALI KE MENU UTAMA';
        badgeType = 'menu';
      }

      playTransitionSwoosh();
      setCurtainState({
        isActive: true,
        phase: 'closing',
        title,
        subtitle,
        badgeType,
      });

      setTimeout(() => {
        options?.beforeChange?.();
        setView(nextView);
        setCurtainState(prev => ({ ...prev, phase: 'closed' }));

        setTimeout(() => {
          setCurtainState(prev => ({ ...prev, phase: 'opening' }));

          setTimeout(() => {
            setCurtainState({ isActive: false, phase: 'idle' });
          }, 320);
        }, 70);
      }, 280);
    } else {
      if (transitionEffect === 'slide') {
        playTransitionSwoosh();
      }
      options?.beforeChange?.();
      setView(nextView);
    }
  }, [view, transitionEffect, currentLevel]);

  const changeLevel = (level: number) => {
    playSfx('click');
    setCurrentLevel(level);
    setIsFavoritesMode(false);
    setCurrentIndex(0);
    setScore(0);
    setLives(5);
    setQuizFinished(false);
    setShuffleTrigger(prev => prev + 1);
  };

  // Time Attack Actions & Effects
  const generateTimeAttackQuestion = (nextIndex: number) => {
    let list: VocabItem[] = currentVocabList;
    if (list.length === 0) {
      list = (levelsData[currentLevel]?.vocab || []) as VocabItem[];
    }
    if (list.length === 0) return;

    // Wrap around index if we run out of words
    const idx = nextIndex % list.length;
    const question = list[idx];
    if (!question) return;

    // Filter decoy alternatives with unique translations and unique Japanese text
    const seenInd = new Set<string>([question.ind.toLowerCase().trim()]);
    const seenJpn = new Set<string>([question.jpn.toLowerCase().trim()]);
    const decoys: VocabItem[] = [];

    const listOthers = list.filter((v: VocabItem) => {
      const j = v.jpn.toLowerCase().trim();
      const i = v.ind.toLowerCase().trim();
      return j !== question.jpn.toLowerCase().trim() && i !== question.ind.toLowerCase().trim();
    });

    for (const item of shuffleArray(listOthers) as VocabItem[]) {
      if (decoys.length >= 3) break;
      const iNorm = item.ind.toLowerCase().trim();
      const jNorm = item.jpn.toLowerCase().trim();
      if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
        decoys.push(item);
        seenInd.add(iNorm);
        seenJpn.add(jNorm);
      }
    }

    if (decoys.length < 3) {
      const allVocabs = (Object.values(levelsData) as any[]).flatMap(lvl => lvl.vocab || []) as VocabItem[];
      for (const item of shuffleArray(allVocabs)) {
        if (decoys.length >= 3) break;
        const iNorm = item.ind.toLowerCase().trim();
        const jNorm = item.jpn.toLowerCase().trim();
        if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
          decoys.push(item);
          seenInd.add(iNorm);
          seenJpn.add(jNorm);
        }
      }
    }

    const options = shuffleArray([question.ind, ...decoys.map(d => d.ind)]);

    setTimeAttackIndex(nextIndex);
    setTimeAttackOptions(options);
    setTimeAttackSelected(null);
    setTimeAttackLocked(false);
  };

  const startTimeAttack = () => {
    playSfx('click');
    setTimeAttackScore(0);
    setTimeAttackTotal(0);
    setTimeAttackTimeLeft(60);
    setTimeAttackActive(true);
    setTimeAttackCompleted(false);
    switchView('time_attack');
    generateTimeAttackQuestion(0);
  };

  const handleTimeAttackAnswer = (selectedOption: string) => {
    if (timeAttackLocked || !timeAttackActive) return;

    setTimeAttackSelected(selectedOption);
    setTimeAttackLocked(true);
    setTimeAttackTotal(prev => prev + 1);

    let list = currentVocabList;
    if (list.length === 0) {
      list = levelsData[currentLevel]?.vocab || [];
    }
    const idx = timeAttackIndex % list.length;
    const question = list[idx];

    const isCorrect = selectedOption === question?.ind;

    if (isCorrect) {
      playSfx('correct');
      setTimeAttackScore(prev => prev + 1);
    } else {
      playSfx('wrong');
    }

    setTimeout(() => {
      generateTimeAttackQuestion(timeAttackIndex + 1);
    }, 800);
  };

  // Timer Countdown Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (view === 'time_attack' && timeAttackActive && timeAttackTimeLeft > 0) {
      interval = setInterval(() => {
        setTimeAttackTimeLeft(prev => {
          if (prev <= 1) {
            setTimeAttackActive(false);
            setTimeAttackCompleted(true);
            playSfx('win');
            triggerConfetti();
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view, timeAttackActive, timeAttackTimeLeft]);

  // Word Matching Game Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (view === 'word_match' && matchActive && !matchCompleted) {
      interval = setInterval(() => {
        setMatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view, matchActive, matchCompleted]);

  // Highscore Saved LocalStorage Effect
  useEffect(() => {
    if (timeAttackCompleted && timeAttackScore > timeAttackHighScore) {
      setTimeAttackHighScore(timeAttackScore);
      localStorage.setItem('time_attack_highscore', timeAttackScore.toString());
    }
  }, [timeAttackCompleted, timeAttackScore, timeAttackHighScore]);

  // Listening Practice Actions & Effects
  const generateListeningQuestion = (nextIndex: number) => {
    const list = (currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || [])) as VocabItem[];
    if (list.length === 0) return;

    // Check if we reached the maximum of 10 questions or total of vocabs
    const maxQuestions = Math.min(10, list.length);
    if (nextIndex >= maxQuestions) {
      setListeningActive(false);
      setListeningCompleted(true);
      playSfx('win');
      triggerConfetti();
      return;
    }

    const question = list[nextIndex];
    if (!question) return;

    // Filter decoy alternatives with unique translations and unique Japanese text
    const seenInd = new Set<string>([question.ind.toLowerCase().trim()]);
    const seenJpn = new Set<string>([question.jpn.toLowerCase().trim()]);
    const decoys: VocabItem[] = [];

    const listOthers = list.filter((v: VocabItem) => {
      const j = v.jpn.toLowerCase().trim();
      const i = v.ind.toLowerCase().trim();
      return j !== question.jpn.toLowerCase().trim() && i !== question.ind.toLowerCase().trim();
    });

    for (const item of shuffleArray(listOthers) as VocabItem[]) {
      if (decoys.length >= 3) break;
      const iNorm = item.ind.toLowerCase().trim();
      const jNorm = item.jpn.toLowerCase().trim();
      if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
        decoys.push(item);
        seenInd.add(iNorm);
        seenJpn.add(jNorm);
      }
    }

    if (decoys.length < 3) {
      const allVocabs = (Object.values(levelsData) as any[]).flatMap(lvl => lvl.vocab || []) as VocabItem[];
      for (const item of shuffleArray(allVocabs)) {
        if (decoys.length >= 3) break;
        const iNorm = item.ind.toLowerCase().trim();
        const jNorm = item.jpn.toLowerCase().trim();
        if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
          decoys.push(item);
          seenInd.add(iNorm);
          seenJpn.add(jNorm);
        }
      }
    }

    const options = shuffleArray([question.ind, ...decoys.map(d => d.ind)]);

    setListeningIndex(nextIndex);
    setListeningOptions(options);
    setListeningSelected(null);
    setListeningLocked(false);

    // Speak the Japanese word automatically after a small delay
    setTimeout(() => {
      speakJapanese(question.jpn);
    }, 250);
  };

  const startListeningPractice = () => {
    playSfx('click');
    setListeningScore(0);
    setListeningTotal(0);
    setListeningLives(5);
    setListeningActive(true);
    setListeningCompleted(false);
    switchView('listening_practice');
    generateListeningQuestion(0);
  };

  const handleListeningAnswer = (selectedOption: string) => {
    if (listeningLocked || !listeningActive) return;

    setListeningSelected(selectedOption);
    setListeningLocked(true);

    const list = (currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || [])) as VocabItem[];
    const question = list[listeningIndex];

    const isCorrect = selectedOption === question?.ind;

    if (isCorrect) {
      playSfx('correct');
      setListeningScore(prev => prev + 1);
    } else {
      playSfx('wrong');
    }
    setListeningTotal(prev => prev + 1);

    setTimeout(() => {
      if (!isCorrect) {
        setListeningLives(prev => {
          const nextLives = prev - 1;
          if (nextLives <= 0) {
            setListeningActive(false);
            setListeningCompleted(true);
            return 0;
          }
          // Only generate next question if they still have lives
          generateListeningQuestion(listeningIndex + 1);
          return nextLives;
        });
      } else {
        generateListeningQuestion(listeningIndex + 1);
      }
    }, 1200);
  };

  // Word Matching Game Actions
  const startWordMatch = () => {
    playSfx('click');
    setMatchCompleted(false);
    setMatchTime(0);
    setMatchActive(true);
    setMatchMoves(0);
    setMatchSelected([]);

    const list = (currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || [])) as VocabItem[];
    if (list.length === 0) {
      switchView('mode_select');
      return;
    }

    // Select up to 6 random vocabulary words for the grid, ensuring UNIQUE 'ind' and UNIQUE 'jpn' values
    const uniqueList: VocabItem[] = [];
    const seenInd = new Set<string>();
    const seenJpn = new Set<string>();

    const shuffledList = shuffleArray(list);
    for (const item of shuffledList) {
      if (uniqueList.length >= 6) break;
      const iNorm = item.ind.toLowerCase().trim();
      const jNorm = item.jpn.toLowerCase().trim();
      if (!seenInd.has(iNorm) && !seenJpn.has(jNorm)) {
        uniqueList.push(item);
        seenInd.add(iNorm);
        seenJpn.add(jNorm);
      }
    }
    
    // Create card objects representing Japanese words and Indonesian translations
    const cards: MatchCard[] = [];
    uniqueList.forEach((item, index) => {
      // Japanese Card
      cards.push({
        id: `jpn-${item.jpn}-${index}`,
        text: item.jpn,
        type: 'jpn',
        pairId: `${item.jpn}-${item.ind}`,
        isMatched: false
      });
      // Indonesian Translation Card
      cards.push({
        id: `ind-${item.ind}-${index}`,
        text: item.ind,
        type: 'ind',
        pairId: `${item.jpn}-${item.ind}`,
        isMatched: false
      });
    });

    setMatchCards(shuffleArray(cards));
    switchView('word_match');
  };

  const handleMatchCardClick = (card: MatchCard) => {
    if (!matchActive || matchCompleted) return;
    if (card.isMatched) return;
    // Prevent selecting the same card twice or selecting more than 2 cards
    if (matchSelected.some(c => c.id === card.id) || matchSelected.length >= 2) return;

    playSfx('click');
    const newSelected = [...matchSelected, card];
    setMatchSelected(newSelected);

    if (newSelected.length === 2) {
      const [card1, card2] = newSelected;
      setMatchMoves(prev => prev + 1);

      if (card1.pairId === card2.pairId) {
        // MATCH found!
        playSfx('correct');
        // Update matched status of cards
        setMatchCards(prev => prev.map(c => {
          if (c.pairId === card1.pairId) {
            return { ...c, isMatched: true };
          }
          return c;
        }));
        setMatchSelected([]);

        // Check if all cards matched
        setTimeout(() => {
          setMatchCards(currentCards => {
            const allMatched = currentCards.every(c => c.isMatched || c.pairId === card1.pairId);
            if (allMatched) {
              setMatchActive(false);
              setMatchCompleted(true);
              playSfx('win');
              triggerConfetti();
            }
            return currentCards;
          });
        }, 300);
      } else {
        // WRONG match
        playSfx('wrong');
        // Delay resetting selection so the user can see their mismatch
        setTimeout(() => {
          setMatchSelected([]);
        }, 850);
      }
    }
  };

  const startFavoritesQuiz = () => {
    playSfx('click');
    if (favorites.length === 0) {
      alert('Belum ada kata favorit! Tandai kata dengan bintang saat kuis untuk menambahkannya.');
      return;
    }
    setIsFavoritesMode(true);
    setCurrentIndex(0);
    setScore(0);
    setLives(5);
    setQuizFinished(false);
    setAnswerLock(false);
    setFeedback({ type: null, message: '' });
    setShuffleTrigger(prev => prev + 1);
    switchView('quiz');
  };

  const startDuelSetup = () => {
    playSfx('click');
    switchView('duel_setup');
  };

  const createRemoteDuelHandler = async () => {
    if (!user) {
      alert("⚠️ HARAP MASUK/LOGIN TERLEBIH DAHULU\n\nFitur Duel PVP Online memerlukan profil pengguna. Silakan login dengan Google atau gunakan Tamu Instan (Bebas Hambatan) terlebih dahulu!");
      return;
    }
    if (user.uid.startsWith('local_')) {
      if (isFirebaseConfigured()) {
        const upgrade = confirm(
          `⚠️ AKUN OFFLINE LOKAL TERDETEKSI\n\n` +
          `Akun Anda saat ini berjalan dalam mode Offline Sandbox Lokal. Duel PVP Online memerlukan koneksi cloud Firebase aktif.\n\n` +
          `Apakah Anda ingin beralih secara otomatis ke Akun Tamu Cloud sekarang agar bisa langsung bermain?`
        );
        if (upgrade) {
          setIsLoggingIn(true);
          try {
            const cleanName = user.displayName || "Pemain Jepang";
            const cloudUser = await loginAsGuest(cleanName);
            if (cloudUser) {
              localStorage.removeItem('minanihongo_local_user');
              setUser(cloudUser);
              alert(`🎉 Berhasil beralih ke Cloud! Selamat datang, ${cleanName}. Memulai pembuatan sesi duel...`);
              
              // Proceed with duel creation using newly elevated cloudUser
              const availableLevels = Object.keys(levelsData).map(Number);
              const randomLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)];
              const rawVocab = levelsData[randomLevel]?.vocab || [];
              const shuffledVocab = shuffleArray(rawVocab);
              const finalVocabList = shuffledVocab.slice(0, 20);

              const dId = await createDuel(cloudUser, randomLevel, finalVocabList);
              if (dId) {
                setRemoteDuel({ 
                  id: dId, 
                  creator: { uid: cloudUser.uid, name: cloudUser.displayName || cloudUser.email }, 
                  level: randomLevel, 
                  vocabList: finalVocabList,
                  currentIndex: 0,
                  turn: 'creator',
                  turnStartedAt: Date.now(),
                  status: 'pending',
                  scores: { creator: 0, opponent: 0 },
                  lives: { creator: 5, opponent: 5 }
                });
                setIsRemoteMode(true);
                setCurrentLevel(randomLevel);
                setCurrentIndex(0);
                setQuizFinished(false);
                setScore(0);
                setLives(5);
                setAnswerLock(false);
                setFeedback({ type: null, message: '' });
                setShuffleTrigger(prev => prev + 1);
                
                const shareLink = `${window.location.origin}${window.location.pathname}?duelId=${dId}`;
                await navigator.clipboard.writeText(shareLink);
                alert(`Sesi Duel Berhasil Dibuat!\nID Duel: ${dId}\nLevel Terpilih Acak: Level ${randomLevel}\n\nLink undangan telah disalin! Bagikan ke temanmu agar mereka bisa bergabung.`);
                switchView('quiz', { levelNumber: randomLevel });
              }
              return;
            }
          } catch (e: any) {
            alert("Gagal beralih ke Cloud: " + (e.message || "Pastikan setingan Firebase Anda benar."));
          } finally {
            setIsLoggingIn(false);
          }
        }
        return;
      } else {
        alert(
          "⚠️ FITUR ONLINE MEMBUTUHKAN CONFIG CLOUD:\n\n" +
          "Duel PVP Online memerlukan server cloud. Silakan selesaikan konfigurasi Firebase di AI Studio terlebih dahulu!"
        );
        return;
      }
    }
    if (!isFirebaseConfigured()) {
      alert("Firebase belum terkonfigurasi.");
      return;
    }
    try {
      const availableLevels = Object.keys(levelsData).map(Number);
      const randomLevel = availableLevels[Math.floor(Math.random() * availableLevels.length)];
      const rawVocab = levelsData[randomLevel]?.vocab || [];
      const shuffledVocab = shuffleArray(rawVocab);
      const finalVocabList = shuffledVocab.slice(0, 20);

      const dId = await createDuel(user, randomLevel, finalVocabList);
      if (dId) {
        setRemoteDuel({ 
          id: dId, 
          creator: { uid: user.uid, name: user.displayName || user.email }, 
          level: randomLevel, 
          vocabList: finalVocabList,
          currentIndex: 0,
          turn: 'creator',
          turnStartedAt: Date.now(),
          status: 'pending',
          scores: { creator: 0, opponent: 0 },
          lives: { creator: 5, opponent: 5 }
        });
        setIsRemoteMode(true);
        setCurrentLevel(randomLevel);
        setCurrentIndex(0);
        setQuizFinished(false);
        setScore(0);
        setLives(5);
        setAnswerLock(false);
        setFeedback({ type: null, message: '' });
        setShuffleTrigger(prev => prev + 1);
        
        // Show share options or just wait
        const shareLink = `${window.location.origin}${window.location.pathname}?duelId=${dId}`;
        await navigator.clipboard.writeText(shareLink);
        alert(`Sesi Duel Berhasil Dibuat!\nID Duel: ${dId}\nLevel Terpilih Acak: Level ${randomLevel}\n\nLink undangan telah disalin! Bagikan ke temanmu agar mereka bisa bergabung.`);
        switchView('quiz', { levelNumber: randomLevel });
      }
    } catch (e: any) {
      alert("Gagal membuat duel: " + e.message);
    }
  };

  const joinRemoteDuelHandler = async (dId: string) => {
    if (!user) {
      alert("⚠️ HARAP MASUK/LOGIN TERLEBIH DAHULU\n\nFitur Duel PVP Online memerlukan profil pengguna. Silakan login dengan Google atau gunakan Tamu Instan (Bebas Hambatan) terlebih dahulu!");
      return;
    }
    if (user.uid.startsWith('local_')) {
      if (isFirebaseConfigured()) {
        const upgrade = confirm(
          `⚠️ AKUN OFFLINE LOKAL TERDETEKSI\n\n` +
          `Akun Anda saat ini berjalan dalam mode Offline Sandbox Lokal. Duel PVP Online memerlukan koneksi cloud Firebase aktif.\n\n` +
          `Apakah Anda ingin beralih secara otomatis ke Akun Tamu Cloud sekarang agar bisa bergabung ke duel?`
        );
        if (upgrade) {
          setIsLoggingIn(true);
          try {
            const cleanName = user.displayName || "Pemain Jepang";
            const cloudUser = await loginAsGuest(cleanName);
            if (cloudUser) {
              localStorage.removeItem('minanihongo_local_user');
              setUser(cloudUser);
              alert(`🎉 Berhasil beralih ke Cloud! Selamat datang, ${cleanName}. Memproses gabung duel...`);
              
              // Proceed with join using newly elevated cloudUser
              const joinedDuelData = await joinDuel(cloudUser, dId);
              setIsRemoteMode(true);
              setCurrentIndex(0);
              setQuizFinished(false);
              setScore(0);
              setLives(5);
              setAnswerLock(false);
              setFeedback({ type: null, message: '' });
              setShuffleTrigger(prev => prev + 1);
              if (joinedDuelData) {
                setRemoteDuel(joinedDuelData);
                if (joinedDuelData.level) {
                  setCurrentLevel(joinedDuelData.level);
                }
              } else {
                setRemoteDuel({ id: dId, status: 'joined' });
              }
              switchView('quiz');
              setShowInvitingDialog(false);
              return;
            }
          } catch (e: any) {
            alert("Gagal beralih ke Cloud: " + (e.message || "Pastikan setingan Firebase Anda benar."));
          } finally {
            setIsLoggingIn(false);
          }
        }
        return;
      } else {
        alert(
          "⚠️ FITUR ONLINE MEMBUTUHKAN CONFIG CLOUD:\n\n" +
          "Duel PVP Online memerlukan server cloud. Silakan selesaikan konfigurasi Firebase di AI Studio terlebih dahulu!"
        );
        return;
      }
    }
    if (!isFirebaseConfigured()) {
      alert("Firebase belum terkonfigurasi. Silakan hubungi pengembang.");
      return;
    }
    if (!dId || dId.trim() === "") {
      alert("Harap masukkan ID Duel.");
      return;
    }
    try {
      const joinedDuelData = await joinDuel(user, dId);
      setIsRemoteMode(true);
      setCurrentIndex(0);
      setQuizFinished(false);
      setScore(0);
      setLives(5);
      setAnswerLock(false);
      setFeedback({ type: null, message: '' });
      setShuffleTrigger(prev => prev + 1);
      if (joinedDuelData) {
        setRemoteDuel(joinedDuelData);
        if (joinedDuelData.level) {
          setCurrentLevel(joinedDuelData.level);
        }
      } else {
        setRemoteDuel({ id: dId, status: 'joined' });
      }
      switchView('quiz');
      setShowInvitingDialog(false);
    } catch (e: any) {
      alert("Gagal bergabung: " + (e.message || "Pastikan ID benar."));
    }
  };

  const startActualDuel = (level: number) => {
    playSfx('click');
    setCurrentLevel(level);
    setMultiplayerMode('p1');
    setP1Stats({ score: 0, lives: 5 });
    setP2Stats({ score: 0, lives: 5 });
    setCurrentIndex(0);
    setQuizFinished(false);
    setScore(0);
    setLives(5);
    setShuffleTrigger(prev => prev + 1);
    switchView('quiz', { levelNumber: level });
  };

  const switchPlayer = () => {
    playSfx('click');
    if (multiplayerMode === 'p1') {
      setMultiplayerMode('p2');
      setCurrentIndex(0);
      setQuizFinished(false);
      setAnswerLock(false);
    } else {
      // End duel
      switchView('leaderboard');
    }
  };

  const shareScore = () => {
    const text = `Saya baru saja belajar Hiragana di Minanihongo dan dapet skor ${score}! Ayo main bareng!`;
    if (navigator.share) {
      navigator.share({ title: 'Minanihongo Score', text, url: window.location.href });
    } else {
      alert(text);
    }
  };

  const progress = currentVocabList.length > 0 ? (currentIndex / currentVocabList.length) * 100 : 0;
  const questionProgressPercent = currentVocabList.length > 0 
    ? Math.min(100, Math.max(0, ((currentIndex + 1) / currentVocabList.length) * 100)) 
    : 0;

  const getLevelProgress = (level: number) => {
    const total = levelsData[level]?.vocab.length || 0;
    const score = highScores[level] || 0;
    return total > 0 ? (score / total) * 100 : 0;
  };

  const completed100Levels = useMemo(() => {
    return Object.keys(levelsData)
      .map(Number)
      .filter((lvl) => {
        const total = levelsData[lvl]?.vocab.length || 0;
        const score = highScores[lvl] || 0;
        return total > 0 && score >= total;
      });
  }, [highScores]);

  const duelAvailableLevels = useMemo(() => {
    return Object.keys(levelsData).map(Number);
  }, []);

  useEffect(() => {
    if (view === 'duel_setup' && duelAvailableLevels.length > 0) {
      if (!duelAvailableLevels.includes(selectedDuelLevel)) {
        setSelectedDuelLevel(duelAvailableLevels[0]);
      }
    }
  }, [view, duelAvailableLevels, selectedDuelLevel]);

  const renderQuestionBody = () => {
    if (!activeQuestion) return null;

    const text = activeQuestion.jpn;
    
    if (text.includes("【RAMBU") || text.includes("【標識") || text.includes("【標示")) {
      const lines = text.split("\n");
      const qIndex = lines.findIndex(l => l.includes("Pertanyaan:") || l.includes("質問：") || l.includes("しつもん：") || l.includes("しつもん:"));
      const symbolLines = lines.slice(1, qIndex > 0 ? qIndex : lines.length);
      const symbolText = symbolLines.join("\n").replace(/❓|Pertanyaan:|質問：|しつもん：|しつもん:/g, "").trim();
      const questionText = qIndex > 0 ? lines.slice(qIndex + 1).join("\n").trim() : "";

      const cleanSymbol = symbolText.replace(/【Keterangan:.*?】/g, "").replace(/【説明:.*?】/g, "").replace(/【説明：.*?】/g, "").trim();
      const matchKeterangan = symbolText.match(/【Keterangan:.*?】/) || symbolText.match(/【説明:.*?】/) || symbolText.match(/【説明：.*?】/);

      return (
        <div className="flex flex-col items-center justify-center py-2">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-450 border border-orange-500/20 text-[9px] font-black tracking-widest uppercase mb-3">
            🖼️ かんばん・標識 (SIGNBOARD/SYMBOL)
          </span>
          
          <div className="flex items-center gap-2.5 mb-3 justify-center">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border-4 border-rose-500 flex items-center justify-center text-4xl shadow-lg relative">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-rose-500/30" />
              <span translate="no" className="select-none">{cleanSymbol?.split(" ")[0]}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => speakJapanese(cleanSymbol)}
              className={`p-2 rounded-full flex items-center justify-center transition-colors shadow-sm border ${
                darkMode 
                  ? 'bg-slate-800 text-slate-305 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700' 
                  : 'bg-white text-slate-650 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
              }`}
              title="Dengarkan Pengucapan"
            >
              <Volume2 className="w-4 h-4" />
            </motion.button>
          </div>

          {matchKeterangan && (
            <span 
              className="text-[10px] text-slate-500 dark:text-slate-400 italic mb-3 tracking-wide font-medium bg-slate-500/5 dark:bg-slate-500/15 px-2.5 py-1 rounded-md max-w-xs text-center border border-slate-500/10"
              dangerouslySetInnerHTML={{ __html: matchKeterangan[0] }}
            />
          )}

          <p className={`text-sm font-extrabold leading-relaxed px-1 text-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            <span dangerouslySetInnerHTML={{ __html: questionText || "どんな意味ですか。" }} />
          </p>
        </div>
      );
    }

    if (text.includes("【EKSPRESI") || text.includes("【会話") || text.includes("【会話・表現")) {
      const lines = text.split("\n");
      const qIndex = lines.findIndex(l => l.includes("Pertanyaan:") || l.includes("質問：") || l.includes("しつもん：") || l.includes("しつもん:"));
      const dialogueLines = lines.slice(1, qIndex > 0 ? qIndex : lines.length);
      const questionText = qIndex > 0 ? lines.slice(qIndex + 1).join("\n").trim() : "";

      return (
        <div className="flex flex-col items-center justify-center py-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase">
              💬 会話・表現 (DIALOGUE/EXPRESSION)
            </span>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => speakJapanese(dialogueLines.join(" "))}
              className={`p-1.5 rounded-full flex items-center justify-center transition-colors shadow-sm border ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700' 
                  : 'bg-white text-slate-650 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
              }`}
              title="Dengarkan Percakapan"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-2 my-2 mb-3">
            {dialogueLines.map((line, idx) => {
              if (!line.trim()) return null;
              const isA = line.includes("A:") || line.includes("A：") || line.includes("Rekan Kerja:") || line.includes("Manajer:") || line.includes("佐藤さん：") || line.includes("女：") || line.includes("女性：");
              const isB = line.includes("B:") || line.includes("B：") || line.includes("Sato-san:") || line.includes("Pekerja:") || line.includes("アラムさん：") || line.includes("男：") || line.includes("男性：");
              const labelText = line.includes(":") ? line.split(":")[0]?.replace(/🗣️|🚪🚶/g, "").trim() : line.includes("：") ? line.split("：")[0]?.replace(/🗣️|🚪🚶/g, "").trim() : "会話";
              const contentText = line.includes(":") ? line.split(":").slice(1).join(":").trim() : line.includes("：") ? line.split("：").slice(1).join("：").trim() : line.trim();

              return (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] rounded-2xl px-3.5 py-1.5 text-left text-xs ${
                    isA 
                      ? 'self-start bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700' 
                      : isB
                        ? 'self-end bg-emerald-500 text-white rounded-tr-none shadow-sm shadow-emerald-500/10'
                        : 'self-center bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[10px] italic border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center'
                  }`}
                >
                  {(isA || isB || line.includes(":") || line.includes("：")) && (
                    <span className="font-extrabold text-[8px] uppercase tracking-wider opacity-75 mb-0.5 block">
                      {labelText}
                    </span>
                  )}
                  <span className="text-sm font-bold block leading-relaxed" translate="no" dangerouslySetInnerHTML={{ __html: contentText }} />
                </div>
              );
            })}
          </div>

          <p className={`text-xs font-extrabold leading-relaxed px-1 text-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            <span dangerouslySetInnerHTML={{ __html: questionText || "空欄に入る最もよい言葉は何ですか。" }} />
          </p>
        </div>
      );
    }

    if (text.includes("【CHOKAI") || text.includes("【聴解")) {
      const lines = text.split("\n");
      const qIndex = lines.findIndex(l => l.includes("Pertanyaan:") || l.includes("質問：") || l.includes("しつもん：") || l.includes("しつもん:"));
      const voiceLines = lines.slice(1, qIndex > 0 ? qIndex : lines.length);
      const questionText = qIndex > 0 ? lines.slice(qIndex + 1).join("\n").trim() : "";

      return (
        <div className="flex flex-col items-center justify-center py-1">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-black tracking-widest uppercase mb-3 animate-pulse">
            🎧 聴解 (LISTENING DIALOGUE)
          </span>

          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-3 mb-3 flex flex-col shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5 mb-2.5 w-full">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-extrabold text-sky-400 uppercase tracking-widest">AUDIO TRACK REPRO</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[8px] text-slate-500 font-mono">Status: playing transcript</p>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speakJapanese(voiceLines.join(" "))}
                className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-450 text-sky-400 hover:bg-sky-500/30 border border-sky-500/30 text-[8.5px] font-bold flex items-center gap-1 transition-colors"
                title="Putar Ulang Audio"
              >
                <Volume2 className="w-2.5 h-2.5" /> Replay
              </motion.button>
            </div>

            <div className="flex items-center justify-center gap-1 my-1.5 h-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-sky-500 rounded-full h-2 animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col gap-1.5 mt-1.5 text-left text-slate-300 font-mono max-h-[110px] overflow-y-auto pr-0.5">
              {voiceLines.map((line, idx) => {
                if (!line.trim()) return null;
                const cleanLine = line.replace(/🔊/g, "").trim();
                const isW = cleanLine.includes("女") || cleanLine.includes("女性") || cleanLine.includes("Perempuan");
                const isM = cleanLine.includes("男") || cleanLine.includes("男性") || cleanLine.includes("Laki-laki");
                const label = isW ? "女性 (Female)" : isM ? "男性 (Male)" : "ナレーション";
                
                let dialogText = cleanLine;
                if (cleanLine.includes("「") || cleanLine.includes("「")) {
                  const firstQuote = cleanLine.indexOf("「");
                  const lastQuote = cleanLine.lastIndexOf("」");
                  if (firstQuote !== -1 && lastQuote !== -1 && lastQuote > firstQuote) {
                    dialogText = cleanLine.substring(firstQuote + 1, lastQuote).trim();
                  }
                } else if (cleanLine.includes("（")) {
                  dialogText = cleanLine.replace(/（.*?）/g, "").trim();
                }

                if (dialogText.includes("（") || dialogText.includes("）")) {
                  dialogText = dialogText.replace(/（.*?）/g, "").trim();
                }

                // If colon notation exists in dialog, strip it
                if (dialogText.includes("：")) {
                  dialogText = dialogText.split("：").slice(1).join("：").trim();
                } else if (dialogText.includes(":")) {
                  dialogText = dialogText.split(":").slice(1).join(":").trim();
                }

                return (
                  <div key={idx} className="flex gap-1.5 bg-slate-800/40 p-1 rounded border border-slate-800/60 items-start">
                    <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded flex-shrink-0 mt-0.5 ${isW ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>
                      {label}
                    </span>
                    <p className="text-[10px] font-semibold text-slate-100" translate="no" dangerouslySetInnerHTML={{ __html: dialogText }} />
                  </div>
                );
              })}
            </div>
          </div>

          <p className={`text-xs font-extrabold leading-relaxed px-1 text-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            <span dangerouslySetInnerHTML={{ __html: questionText || "質問に答えてください。" }} />
          </p>
        </div>
      );
    }

    if (text.includes("【DOKAI") || text.includes("【読解")) {
      const lines = text.split("\n");
      const qIndex = lines.findIndex(l => l.includes("Pertanyaan:") || l.includes("質問：") || l.includes("しつもん：") || l.includes("しつもん:"));
      const readingLines = lines.slice(1, qIndex > 0 ? qIndex : lines.length);
      const questionText = qIndex > 0 ? lines.slice(qIndex + 1).join("\n").trim() : "";

      return (
        <div className="flex flex-col items-center justify-center py-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black tracking-widest uppercase">
              📖 読解 (READING COMPREHENSION)
            </span>
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => speakJapanese(readingLines.join(" "))}
              className={`p-1.5 rounded-full flex items-center justify-center transition-colors shadow-sm border ${
                darkMode 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700' 
                  : 'bg-white text-slate-650 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
              }`}
              title="Dengarkan Teks Bacaan"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className={`w-full max-w-sm text-left p-3.5 rounded-xl shadow-md mb-3 border-2 ${
            darkMode 
              ? 'bg-slate-900 border-indigo-900/30 text-slate-200' 
              : 'bg-amber-50/45 border-amber-900/15 text-amber-950'
          }`}>
            {readingLines.map((line, idx) => {
              if (!line.trim()) return null;
              const isEmailHeader = line.includes("差出人：") || line.includes("本文：") || line.includes("差出人:") || line.includes("本文:");
              if (isEmailHeader) {
                const isSender = line.includes("差出人：") || line.includes("差出人:");
                const label = isSender ? "差出人 (Sender):" : "本文 (Body):";
                let desc = isSender 
                  ? line.replace("差出人：", "").replace("差出人:", "")
                  : line.replace("本文：", "").replace("本文:", "");
                return (
                  <div key={idx} className="mb-1.5 text-xs font-sans tracking-wide">
                    <span className="text-[8px] font-black uppercase opacity-60 tracking-wider block">{label}</span>
                    <span className="text-[11px] font-bold block" translate="no" dangerouslySetInnerHTML={{ __html: desc.trim() }} />
                  </div>
                );
              }
              return (
                <p key={idx} className="text-[11px] leading-relaxed mb-1 font-sans " translate="no" dangerouslySetInnerHTML={{ __html: line.trim() }} />
              );
            })}
          </div>

          <p className={`text-xs font-extrabold leading-relaxed px-1 text-center ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            <span dangerouslySetInnerHTML={{ __html: questionText || "質問に答えてください。" }} />
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center">
        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          日本語
        </p>
        <div className="flex items-center justify-center gap-2.5 leading-relaxed">
          <motion.h1 
            key={activeQuestion?.jpn}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`text-2xl font-black tracking-tighter text-center ${darkMode ? 'text-white' : 'text-slate-900'}`}
            translate="no"
          >
            <span dangerouslySetInnerHTML={{ __html: activeQuestion?.jpn || "" }} />
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => speakJapanese(activeQuestion.jpn)}
            className={`p-2 rounded-full flex items-center justify-center transition-colors shadow-sm border ${
              darkMode 
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-slate-700' 
                : 'bg-white text-slate-800 hover:bg-slate-100 hover:text-black border-slate-300'
            }`}
            title="Dengarkan Pengucapan"
            aria-label={`Dengarkan pengucapan audio bahasa Jepang untuk ${activeQuestion.jpn.replace(/<[^>]*>/g, '')}`}
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Accessible Screen Reader Skip Link */}
      <a 
        href="#main-container" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-[9999] px-4 py-2.5 bg-amber-500 text-slate-950 font-black rounded-xl shadow-2xl border-2 border-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-300"
      >
        Lewati ke Konten Utama
      </a>

      {/* Animated Flight Loading Intro (Indonesia ke Jepang via Gunung Fuji) */}
      <AnimatePresence>
        {isLoadingIntro && (
          <FlightLoading
            darkMode={darkMode}
            onComplete={() => {
              setIsLoadingIntro(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Screen Reader Live Announcer */}
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only" 
        role="status"
        id="a11y-live-announcer"
      >
        {srAnnouncement}
      </div>

      {/* Background Image Container with Blur */}
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div 
          className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[60px] opacity-10 transition-colors duration-1000 ${
            theme.id === 'morning' ? 'bg-rose-400' : 
            theme.id === 'day' ? 'bg-blue-400' : 
            theme.id === 'evening' ? 'bg-amber-400' : 'bg-indigo-600'
          }`}
        />
        <div 
          className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-[60px] opacity-10 transition-colors duration-1000 ${
            theme.id === 'morning' ? 'bg-orange-400' : 
            theme.id === 'day' ? 'bg-sky-400' : 
            theme.id === 'evening' ? 'bg-rose-400' : 'bg-purple-600'
          }`}
        />
      </div>

      <div 
        className={`fixed inset-0 z-0 pointer-events-none transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}
        aria-hidden="true"
      >
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${darkMode ? 'opacity-20 grayscale' : 'opacity-40 grayscale-[20%]'}`}
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=2070&auto=format&fit=crop")',
          }}
        />
        <div className={`absolute inset-0 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900/40 to-slate-950' : 'bg-gradient-to-br from-white/80 via-transparent to-white/80'}`} />
      </div>

      {/* Theme Toggle & Indicator - Centered Top Toolbar */}
      {view !== 'mode_select' && view !== 'intro' && (
      <motion.div 
        drag
        dragConstraints={{ left: -140, right: 140, top: 0, bottom: 450 }}
        className="fixed top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing pointer-events-auto"
        role="toolbar"
        aria-label="Pengaturan Cepat Tampilan dan Aksesibilitas"
      >
        <div className="flex items-center justify-center gap-2">
          {/* User Profile Card next to Dark Theme Toggle */}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl border text-xs font-semibold shadow-md backdrop-blur-xl transition-all ${
                darkMode 
                ? 'bg-slate-800/90 border-slate-700 text-white' 
                : 'bg-white/90 border-slate-200 text-slate-800'
              }`}
            >
              {user.photoURL ? (
                <img referrerPolicy="no-referrer" src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-xl object-cover border border-violet-400" />
              ) : (
                <div className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-[10px] uppercase ${
                  user.uid.startsWith('local_') ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'
                }`}>
                  {(user.displayName || user.email || 'U').charAt(0)}
                </div>
              )}
              <div className="flex flex-col text-left max-w-[90px]">
                <span className="font-extrabold truncate text-[10px] leading-tight text-violet-500">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'Tamu')}
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {user.uid.startsWith('local_') ? 'Sandbox' : 'Cloud'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playSfx('click');
                  handleLogout();
                }}
                className={`p-1 rounded-lg transition-colors hover:bg-rose-500/10 hover:text-rose-500 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
                title="Keluar / Logout"
                aria-label="Keluar / Logout dari Akun"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </motion.div>
          )}



          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              playSfx('click');
              setShowSettingsModal(true);
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-xl border transition-all ${
              darkMode 
              ? 'bg-slate-800/90 text-violet-400 border-slate-700 hover:bg-slate-700 hover:text-white' 
              : 'bg-white/95 text-violet-700 border-slate-200 hover:bg-white shadow-slate-200'
            }`}
            title="Pengaturan Suara & Aksesibilitas"
            aria-label="Buka Pengaturan Suara dan Aksesibilitas"
          >
            <Settings className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              const nextVal = !highContrastMode;
              setHighContrastMode(nextVal);
              playSfx('click');
              announce(nextVal ? "Mode Kontras Tinggi diaktifkan" : "Mode Kontras Tinggi dinonaktifkan");
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-xl border transition-all ${
              highContrastMode
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold ring-2 ring-amber-400'
              : darkMode 
                ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700' 
                : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white shadow-slate-200'
            }`}
            title={highContrastMode ? "Mode Kontras Tinggi Aktif (WCAG AAA)" : "Mode Kontras Tinggi"}
            aria-label={highContrastMode ? "Nonaktifkan Mode Kontras Tinggi" : "Aktifkan Mode Kontras Tinggi (WCAG AAA)"}
            aria-pressed={highContrastMode}
          >
            <Contrast className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              const nextDark = !darkMode;
              setDarkMode(nextDark);
              playSfx('click');
              announce(nextDark ? "Mode Gelap aktif" : "Mode Terang aktif");
            }}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-md backdrop-blur-xl border transition-all ${
              darkMode 
              ? 'bg-slate-800/90 text-amber-400 border-slate-700 hover:bg-slate-700' 
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white shadow-slate-200'
            }`}
            title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            aria-label={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
          >
            {darkMode ? <Sun className="w-5 h-5 sm:w-5.5 sm:h-5.5" /> : <Moon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />}
          </motion.button>
        </div>

        {/* Dynamic Theme Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-colors ${
            darkMode 
            ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' 
            : 'bg-white/90 border-slate-200 text-slate-700 font-extrabold shadow-xs'
          }`}
        >
          <theme.icon className={`w-3 h-3 ${themeClasses.text}`} />
          <span>Tema: {theme.label}</span>
          {isMaster && (
            <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5 ml-0.5 text-amber-500">
              <Medal className="w-2.5 h-2.5 fill-amber-500" />
              <span>Master</span>
            </div>
          )}
        </motion.div>
      </motion.div>
      )}

      <div id="main-container" tabIndex={-1} className={`relative w-full max-w-[420px] flex items-center justify-center outline-none ${view !== 'intro' && view !== 'mode_select' ? 'pt-18 sm:pt-20' : ''}`}>
        <AnimatePresence mode="wait" initial={false} custom={{ direction: slideDirection, effect: transitionEffect }}>
          {view === 'intro' ? (
            <motion.div
              key="intro"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-md transition-colors duration-200 flex flex-col px-6 pt-6 pb-8 items-center text-center gap-3.5 min-h-[75vh] justify-start ${
                darkMode 
                ? 'bg-slate-900/90 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/90 border-white/40 shadow-slate-200'
              }`}
            >
            {/* Header Judul (Dinaikkan ke atas) */}
            <div className="space-y-1">
              <h1 className={`text-4xl sm:text-5xl font-black tracking-normal mb-0.5 transition-colors ${themeClasses.text}`}>みなのにほんご</h1>
              <p className={`text-base sm:text-lg font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Belajar Bahasa Jepang</p>
              <div className="flex items-center justify-center gap-2 pt-0.5">
                <span className={`w-8 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <p className={`text-[10px] font-black uppercase tracking-widest ${themeClasses.text}`}>Hiragana Mastery</p>
                <span className={`w-8 h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* Quick Toolbar (Pengaturan, Kontras Tinggi, Tema Gelap/Terang & Indikator Tema - Dipindah ke Lingkaran Kuning) */}
            <div className="flex flex-col items-center gap-1.5 my-1" role="toolbar" aria-label="Pengaturan Cepat Tampilan">
              <div className="flex items-center gap-2.5">
                {/* User Profile Card jika login */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-2xl border text-xs font-semibold shadow-sm backdrop-blur-md transition-all ${
                      darkMode 
                      ? 'bg-slate-800/90 border-slate-700 text-white' 
                      : 'bg-white/90 border-slate-200 text-slate-800'
                    }`}
                  >
                    {user.photoURL ? (
                      <img referrerPolicy="no-referrer" src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-xl object-cover border border-violet-400" />
                    ) : (
                      <div className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-[10px] uppercase ${
                        user.uid.startsWith('local_') ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {(user.displayName || user.email || 'U').charAt(0)}
                      </div>
                    )}
                    <span className="font-extrabold truncate text-[10px] leading-tight text-violet-500 max-w-[80px]">
                      {user.displayName || (user.email ? user.email.split('@')[0] : 'Tamu')}
                    </span>
                  </motion.div>
                )}



                {/* Tombol Pengaturan Suara & Aksesibilitas */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    playSfx('click');
                    setShowSettingsModal(true);
                  }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border transition-all ${
                    darkMode 
                    ? 'bg-slate-800/90 text-violet-400 border-slate-700 hover:bg-slate-700 hover:text-white' 
                    : 'bg-white/95 text-violet-700 border-slate-200 hover:bg-white shadow-slate-200'
                  }`}
                  title="Pengaturan Suara & Aksesibilitas"
                  aria-label="Buka Pengaturan Suara dan Aksesibilitas"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                {/* Tombol Mode Kontras Tinggi */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const nextVal = !highContrastMode;
                    setHighContrastMode(nextVal);
                    playSfx('click');
                    announce(nextVal ? "Mode Kontras Tinggi diaktifkan" : "Mode Kontras Tinggi dinonaktifkan");
                  }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border transition-all ${
                    highContrastMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold ring-2 ring-amber-400'
                    : darkMode 
                      ? 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700' 
                      : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white shadow-slate-200'
                  }`}
                  title={highContrastMode ? "Mode Kontras Tinggi Aktif (WCAG AAA)" : "Mode Kontras Tinggi"}
                  aria-label={highContrastMode ? "Nonaktifkan Mode Kontras Tinggi" : "Aktifkan Mode Kontras Tinggi (WCAG AAA)"}
                  aria-pressed={highContrastMode}
                >
                  <Contrast className="w-5 h-5" />
                </motion.button>

                {/* Tombol Ganti Mode Gelap / Terang */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    const nextDark = !darkMode;
                    setDarkMode(nextDark);
                    playSfx('click');
                    announce(nextDark ? "Mode Gelap aktif" : "Mode Terang aktif");
                  }}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md border transition-all ${
                    darkMode 
                    ? 'bg-slate-800/90 text-amber-400 border-slate-700 hover:bg-slate-700' 
                    : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white shadow-slate-200'
                  }`}
                  title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                  aria-label={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>
              </div>

              {/* Dynamic Theme Indicator Pill */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-colors ${
                  darkMode 
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' 
                  : 'bg-white/90 border-slate-200/90 text-slate-700 font-extrabold shadow-xs'
                }`}
              >
                <theme.icon className={`w-3 h-3 ${themeClasses.text}`} />
                <span>TEMA: {theme.label.toUpperCase()}</span>
                {isMaster && (
                  <div className="flex items-center gap-1 border-l border-slate-700 pl-1.5 ml-0.5 text-amber-500">
                    <Medal className="w-2.5 h-2.5 fill-amber-500" />
                    <span>MASTER</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full aspect-[4/5] max-w-[280px] mx-auto group mb-2">
              {/* Main Image Container */}
              <div className={`absolute inset-0 rounded-[32px] overflow-hidden shadow-2xl border-4 transition-colors ${
                darkMode ? 'border-slate-800 shadow-slate-950/50' : 'border-white shadow-slate-200'
              }`}>
                <img 
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop" 
                  alt="Mount Fuji and Sakura" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${
                  darkMode ? 'from-slate-900/60' : 'from-black/40'
                }`} />
              </div>

              {/* Mini Authentic Chalkboard 'あ' */}
              <motion.div 
                initial={{ y: 20, rotate: -4, opacity: 0 }}
                animate={{ y: 0, rotate: -2, opacity: 1 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 350, damping: 24 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30 select-none cursor-pointer"
                title="Papan Tulis Kana"
              >
                {/* Wooden Board Frame */}
                <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#8B5A2B] via-[#6e431f] to-[#4a2e15] shadow-2xl border border-[#a76f36]/40 shadow-black/60 ring-1 ring-black/30">
                  {/* Wood Corner Screws / Joints subtle effect */}
                  <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#3d2410] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]" />
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#3d2410] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]" />
                  <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#3d2410] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]" />
                  <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#3d2410] shadow-[0_0.5px_0_rgba(255,255,255,0.2)]" />

                  {/* Dark Chalkboard Slate Inner Area */}
                  <div className="relative px-6 py-3 rounded-md bg-[#1e2d24] border border-[#142019] shadow-inner overflow-hidden flex flex-col items-center justify-center">
                    {/* Chalk texture dust gradient / grain overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.08] pointer-events-none" />
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/[0.03] rounded-full blur-sm pointer-events-none" />

                    {/* Chalk Letter 'あ' with realistic chalk smudge shadow */}
                    <span className="relative font-serif text-5xl font-normal text-[#F4F6F0] tracking-wide select-none drop-shadow-[0_0_1.5px_rgba(255,255,255,0.85)] filter contrast-125">
                      あ
                    </span>

                    {/* Tiny chalk tray ledge at the bottom */}
                    <div className="absolute bottom-0 inset-x-2 h-[2px] bg-[#3a2312] rounded-full opacity-70" />
                    {/* Tiny piece of white chalk on the tray */}
                    <div className="absolute bottom-[2px] right-3 w-2.5 h-[3px] bg-amber-50/90 rounded-xs shadow-xs" />
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => {
                  playSfx('click');
                  switchView('mode_select');
                }}
                className="w-full bg-rose-500 text-white font-bold py-4 rounded-[24px] shadow-xl hover:bg-rose-600 transition-transform duration-75 flex items-center justify-center gap-3 active:scale-95 border-b-4 border-rose-800 touch-manipulation cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                Mulai
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('leaderboard');
                  }}
                  className={`font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    darkMode 
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Medal className="w-4 h-4 text-amber-500" />
                  Peringkat
                </button>
                <button
                  onClick={startDuelSetup}
                  className={`font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    darkMode 
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  Duel (1v1)
                </button>
              </div>

              {showInstallBtn && (
                <button
                  onClick={handleInstallClick}
                  className={`w-full font-bold py-3 rounded-[20px] shadow-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-emerald-500 hover:text-white`}
                >
                  <BookOpen className="w-4 h-4" />
                  Pasang Aplikasi (Install)
                </button>
              )}


              <button
                onClick={startFavoritesQuiz}
                className={`w-full font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  darkMode 
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700' 
                  : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Star className={`w-4 h-4 ${favorites.length > 0 ? 'fill-amber-400 text-amber-500' : (darkMode ? 'text-slate-600' : 'text-slate-300')}`} />
                Kuis Favorit ({favorites.length})
              </button>

              <div className="pt-2">
                {(!user || user.uid.startsWith('local_')) ? (
                  <div className="flex flex-col gap-2">
                    {/* Local User Active Indicator calling Google Sign-in */}
                    {user && user.uid.startsWith('local_') && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/35 text-amber-500 rounded-2xl text-[10px] font-black leading-relaxed flex flex-col gap-1 text-center mb-1">
                        <span className="tracking-wide">⚠️ AKUN OFFLINE LOKAL AKTIF</span>
                        <span className="font-bold text-slate-400 normal-case">Fitur Duel PVP membutuhkan jaringan. Hubungkan akun Anda dengan Google atau Tamu Instan di bawah!</span>
                      </div>
                    )}

                    {/* Google Login button - Popup (PC) */}
                    <button
                      onClick={async () => {
                        if (!isFirebaseConfigured()) {
                          alert("Firebase belum terkonfigurasi. Silakan klik tombol 'Setup Firebase' di panel kontrol AI Studio.");
                          return;
                        }
                        setIsLoggingIn(true);
                        try {
                          const cloudUser = await loginWithGoogle();
                          if (cloudUser) {
                            alert(`🎉 LOGIN GOOGLE BERHASIL!\n\nSelamat Datang, ${cloudUser.displayName || cloudUser.email || "User"}!\nAkun Google Cloud Firebase Anda kini aktif terhubung.`);
                          }
                        } catch (e: any) {
                          setShowLoginHelp(true);
                          const errCode = e?.code || "";
                          const errMsg = e?.message || "";
                          if (errCode === "auth/unauthorized-domain" || errMsg.includes("unauthorized-domain") || errMsg.includes("unauthorized domain")) {
                            alert(
                              `⚠️ DOMAIN BELUM TERDAFTAR DI FIREBASE:\n\n` +
                              `Firebase menolak login popup karena domain web ini belum ditambahkan ke daftar resmi di Firebase Console Anda.\n\n` +
                              `Cara mengatasinya:\n` +
                              `1. Buka Firebase Console Anda.\n` +
                              `2. Masuk ke Authentication > Settings > Authorized Domains.\n` +
                              `3. Tambahkan domain berikut:\n` +
                              `   👉 ${window.location.hostname}\n` +
                              `4. Setelah disimpan, ulangi klik login Google!`
                            );
                          } else {
                            alert(`Gagal login popup: ${errMsg || ""}`);
                          }
                        } finally {
                          setIsLoggingIn(false);
                        }
                      }}
                      disabled={isLoggingIn}
                      className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-[20px] shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-blue-800 disabled:opacity-50 text-xs"
                    >
                      <LogIn className="w-4 h-4" />
                      {isLoggingIn ? "Menghubungkan..." : "Google Sign-In (Metode Popup - PC)"}
                    </button>

                    {/* Or Separator */}
                    <div className="flex items-center my-1 gap-2">
                      <div className="flex-1 h-[1px] bg-slate-500/20" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Atau</span>
                      <div className="flex-1 h-[1px] bg-slate-500/20" />
                    </div>

                    {/* Guest Sign-In form / toggle */}
                     {!showGuestInput ? (
                      <button
                        onClick={() => setShowGuestInput(true)}
                        className={`w-full font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                          darkMode 
                          ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-violet-400' 
                          : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-violet-600'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Masuk via Akun Lokal / Tamu (Bebas Hambatan)
                      </button>
                    ) : (
                      <div className={`p-4 rounded-[20px] border flex flex-col gap-3 transition-all ${
                        darkMode 
                        ? 'bg-slate-900/80 border-slate-800/80' 
                        : 'bg-white border-slate-200'
                      }`}>
                        
                        {/* Tabs */}
                        <div className="flex bg-slate-500/10 p-1 rounded-xl">
                          <button
                            onClick={() => setGuestModeTab('guest')}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              guestModeTab === 'guest'
                                ? (darkMode ? 'bg-slate-800 text-violet-400 shadow-sm' : 'bg-white text-violet-600 shadow-sm')
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Tamu Instan
                          </button>
                          <button
                            onClick={() => setGuestModeTab('login')}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              guestModeTab === 'login'
                                ? (darkMode ? 'bg-slate-800 text-violet-400 shadow-sm' : 'bg-white text-violet-600 shadow-sm')
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Masuk Akun
                          </button>
                          <button
                            onClick={() => setGuestModeTab('register')}
                            className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                              guestModeTab === 'register'
                                ? (darkMode ? 'bg-slate-800 text-violet-400 shadow-sm' : 'bg-white text-violet-600 shadow-sm')
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Daftar Akun
                          </button>
                        </div>

                        {/* Guest Tab */}
                        {guestModeTab === 'guest' && (
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Siapkan Profil Tamu Lokal</span>
                            <input
                              type="text"
                              value={guestNickname}
                              onChange={(e) => setGuestNickname(e.target.value.slice(0, 15))}
                              placeholder="Masukkan Panggilan Anda (contoh: Kenji)"
                              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <button
                              onClick={async () => {
                                let cleanName = guestNickname.trim();
                                if (!cleanName) {
                                  const nicknames = [
                                    "Kenji 🎋", "Sakura 🌸", "Takeshi ⚔️", "Haruto ⚡", 
                                    "Yuki ❄️", "Taro 🐟", "Hana 🌺", "Ryu 🐉", 
                                    "Sora ☁️", "Mina 🇯🇵", "Aiko 🎀", "Yuto 🌟"
                                  ];
                                  cleanName = nicknames[Math.floor(Math.random() * nicknames.length)];
                                }
                                setIsLoggingIn(true);
                                try {
                                  let finalUser: any = null;
                                  if (isFirebaseConfigured()) {
                                    try {
                                      const cloudUser = await loginAsGuest(cleanName);
                                      if (cloudUser) {
                                        finalUser = cloudUser;
                                        alert(`Selamat Datang, ${cleanName}! Profil Tamu Online Anda berhasil dibuat di Cloud.\n\nSekarang Anda bebas bermain game dan ikut Duel Online bersama teman-teman!`);
                                      }
                                    } catch (cloudErr) {
                                      console.warn("Gagal terhubung ke Cloud Auth, beralih ke mode offline lokal:", cloudErr);
                                    }
                                  }

                                  if (!finalUser) {
                                    finalUser = {
                                      uid: `local_guest_${Math.random().toString(36).substr(2, 9)}`,
                                      displayName: cleanName,
                                      email: 'guest@local.app',
                                      isAnonymous: true,
                                      photoURL: null
                                    };
                                    localStorage.setItem('minanihongo_local_user', JSON.stringify(finalUser));
                                  }

                                  const guestScores = localStorage.getItem(`scores_${finalUser.uid}`);
                                  const guestFavs = localStorage.getItem(`favorites_${finalUser.uid}`);
                                  setHighScores(guestScores ? JSON.parse(guestScores) : {});
                                  setFavorites(guestFavs ? JSON.parse(guestFavs) : []);

                                  setUser(finalUser);
                                } catch (e: any) {
                                  alert("Gagal membuat profil tamu.");
                                } finally {
                                  setIsLoggingIn(false);
                                }
                              }}
                              className="w-full py-2.5 text-xs font-black rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all active:scale-95 border-b-2 border-violet-800"
                            >
                              Mulai sebagai Tamu
                            </button>
                          </div>
                        )}

                        {/* Login Tab */}
                        {guestModeTab === 'login' && (
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Masuk Akun Sandbox Lokal</span>
                            <input
                              type="email"
                              value={localEmailInput}
                              onChange={(e) => setLocalEmailInput(e.target.value)}
                              placeholder="Alamat Email (contoh: user@gmail.com)"
                              className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <input
                              type="password"
                              value={localPasswordInput}
                              onChange={(e) => setLocalPasswordInput(e.target.value)}
                              placeholder="Kata Sandi / Password"
                              className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <button
                              disabled={isLoggingIn}
                              onClick={async () => {
                                const email = localEmailInput.trim().toLowerCase();
                                const pass = localPasswordInput;
                                if (!email || !pass) {
                                  alert("Harap lengkapi email dan password!");
                                  return;
                                }
                                setIsLoggingIn(true);
                                try {
                                  let loggedInUser: any = null;
                                  
                                  // 1. Try Firebase Cloud Email Auth if configured
                                  if (isFirebaseConfigured()) {
                                    try {
                                      const u = await loginWithEmail(email, pass);
                                      if (u) {
                                        loggedInUser = u;
                                        localStorage.removeItem('minanihongo_local_user');
                                        alert(`Berhasil masuk ke cloud! Selamat datang kembali, ${u.displayName || u.email}!`);
                                      }
                                    } catch (firebaseErr: any) {
                                      console.warn("Firebase email login failed or disabled, falling back to local database...", firebaseErr);
                                    }
                                  }
                                  
                                  // 2. Fallback to Local Sandbox database if cloud failed or not configured
                                  if (!loggedInUser) {
                                    const accountsStr = localStorage.getItem('minanihongo_local_accounts') || '[]';
                                    const accounts = JSON.parse(accountsStr);
                                    const account = accounts.find((a: any) => a.email === email && a.password === pass);
                                    if (!account) {
                                      alert("Email atau Sandi salah / tidak ditemukan. Silakan daftarkan akun baru di tab sebelah!");
                                      setIsLoggingIn(false);
                                      return;
                                    }
                                    
                                    loggedInUser = {
                                      uid: `local_user_${account.email}`,
                                      displayName: account.displayName,
                                      email: account.email,
                                      isAnonymous: false,
                                      photoURL: null
                                    };
                                    localStorage.setItem('minanihongo_local_user', JSON.stringify(loggedInUser));
                                    setHighScores(account.highScores || {});
                                    setFavorites(account.favorites || []);
                                    alert(`Berhasil masuk secara offline lokal! Selamat datang, ${account.displayName}!`);
                                  }
                                  
                                  // Preserve email and password session for auto-login on reload
                                  localStorage.setItem('minanihongo_saved_login_email', email);
                                  localStorage.setItem('minanihongo_saved_login_password', pass);
                                  
                                  setUser(loggedInUser);
                                  setShowGuestInput(false);
                                } catch (e: any) {
                                  alert("Gagal masuk akun: " + (e.message || "Pastikan format benar"));
                                } finally {
                                  setIsLoggingIn(false);
                                }
                              }}
                              className="w-full py-2.5 text-xs font-black rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all active:scale-95 border-b-2 border-violet-800 disabled:opacity-50"
                            >
                              {isLoggingIn ? "Menghubungkan..." : "Masuk Akun"}
                            </button>
                          </div>
                        )}

                        {/* Register Tab */}
                        {guestModeTab === 'register' && (
                          <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">Daftar Akun Sandbox Baru (Lokal Browser)</span>
                            <input
                              type="text"
                              value={localNicknameInput}
                              onChange={(e) => setLocalNicknameInput(e.target.value.slice(0, 15))}
                              placeholder="Nama Panggilan Anda (contoh: Kenji)"
                              className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <input
                              type="email"
                              value={localEmailInput}
                              onChange={(e) => setLocalEmailInput(e.target.value)}
                              placeholder="Alamat Email Akun Baru"
                              className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <input
                              type="password"
                              value={localPasswordInput}
                              onChange={(e) => setLocalPasswordInput(e.target.value)}
                              placeholder="Ketik Sandi Baru Anda"
                              className={`w-full px-4 py-2 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-1 ${
                                darkMode 
                                ? 'bg-slate-950 border-slate-800 text-white focus:ring-violet-500 focus:border-violet-500' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-violet-500 focus:border-violet-500'
                              }`}
                            />
                            <button
                              disabled={isLoggingIn}
                              onClick={async () => {
                                const nick = localNicknameInput.trim();
                                const email = localEmailInput.trim().toLowerCase();
                                const pass = localPasswordInput;
                                if (!nick || !email || !pass) {
                                  alert("Harap lengkapi nama panggilan, email, dan password!");
                                  return;
                                }
                                setIsLoggingIn(true);
                                try {
                                  let registeredUser: any = null;
                                  
                                  // 1. Try Firebase Cloud registration if configured
                                  if (isFirebaseConfigured()) {
                                    try {
                                      const u = await registerWithEmail(email, pass, nick);
                                      if (u) {
                                        registeredUser = u;
                                        localStorage.removeItem('minanihongo_local_user');
                                        alert(`Pendaftaran Cloud Berhasil! Akun diaktifkan secara online sebagai ${nick}.\n\nAnda sekarang bebas bermain dan berpartisipasi dalam Duel Online!`);
                                      }
                                    } catch (firebaseErr: any) {
                                      console.warn("Firebase email registration failed, falling back to local database...", firebaseErr);
                                    }
                                  }
                                  
                                  // 2. Fallbox or use local mock sandbox
                                  if (!registeredUser) {
                                    const accountsStr = localStorage.getItem('minanihongo_local_accounts') || '[]';
                                    const accounts = JSON.parse(accountsStr);
                                    const exists = accounts.some((a: any) => a.email === email);
                                    if (exists) {
                                      alert("Email ini sudah terdaftar sebagai akun lokal. Silakan ganti tab ke 'Masuk Akun'.");
                                      setIsLoggingIn(false);
                                      return;
                                    }
                                    
                                    const newAccount = {
                                      email,
                                      password: pass,
                                      displayName: nick,
                                      highScores: { ...highScores },
                                      favorites: [...favorites]
                                    };
                                    
                                    accounts.push(newAccount);
                                    localStorage.setItem('minanihongo_local_accounts', JSON.stringify(accounts));
                                    
                                    registeredUser = {
                                      uid: `local_user_${email}`,
                                      displayName: nick,
                                      email,
                                      isAnonymous: false,
                                      photoURL: null
                                    };
                                    localStorage.setItem('minanihongo_local_user', JSON.stringify(registeredUser));
                                    localStorage.setItem(`scores_${registeredUser.uid}`, JSON.stringify(newAccount.highScores));
                                    localStorage.setItem(`favorites_${registeredUser.uid}`, JSON.stringify(newAccount.favorites));
                                    
                                    alert(`Pendaftaran Offline Berhasil! Akun lokal dibuat & aktif sebagai ${nick}!`);
                                  }
                                  
                                  // Store credentials session for secure reload auto-login
                                  localStorage.setItem('minanihongo_saved_login_email', email);
                                  localStorage.setItem('minanihongo_saved_login_password', pass);
                                  
                                  setUser(registeredUser);
                                  setShowGuestInput(false);
                                } catch (e: any) {
                                  alert("Gagal daftar akun: " + (e.message || "Gunakan format email dan sandi minimal 6 karakter."));
                                } finally {
                                  setIsLoggingIn(false);
                                }
                              }}
                              className="w-full py-2.5 text-xs font-black rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all active:scale-95 border-b-2 border-violet-800 disabled:opacity-50"
                            >
                              {isLoggingIn ? "Mengirim Data..." : "Daftar Akun Baru"}
                            </button>
                          </div>
                        )}
                        
                        {/* Close button */}
                        <button
                          onClick={() => setShowGuestInput(false)}
                          className="w-full py-2 text-[10px] font-bold rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 transition-all"
                        >
                          Tutup Form Akun
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowLoginHelp(prev => !prev)}
                      className={`text-[9px] font-bold uppercase tracking-wider text-center mt-1 cursor-pointer hover:underline ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {showLoginHelp ? 'Sembunyikan Bantuan' : 'Mengalami Kendala Login? Klik di Sini'}
                    </button>

                    {showLoginHelp && (
                      <div className={`p-4 rounded-2xl border text-[10px] leading-relaxed transition-colors ${
                        darkMode ? 'bg-amber-950/20 border-amber-900/30 text-amber-300' : 'bg-amber-50 border-amber-100 text-amber-800'
                      }`}>
                        <span className="font-extrabold uppercase block mb-1">Panduan Mengatasi Kendala Login:</span>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>
                            <strong>Mengapa Google Login tidak bekerja di dalam AI Studio?</strong>
                            <p className="mt-0.5 text-slate-400">
                              Frame preview bawaan AI Studio memblokir popup Google Auth demi alasan keamanan browser.
                            </p>
                          </li>
                          <li className="mt-1">
                            <strong>Solusi Mudah (Gunakan Tab Baru):</strong>
                            <p className="mt-0.5">
                              Klik tombol <strong>"Buka App" / "Buka di tab baru"</strong> di sudut kanan atas panel preview AI Studio, lalu lakukan login Google dari tab baru tersebut. Google login akan langsung bekerja dengan lancar 100%!
                            </p>
                          </li>
                          <li className="mt-1">
                            <strong>Solusi Alternatif (Masuk Tamu):</strong>
                            <p className="mt-0.5 text-slate-400">
                              Gunakan tombol <strong>"Masuk sebagai Tamu"</strong> di atas. Progres dan nilai skor Anda akan tetap disimpan dengan aman di local storage browser Anda!
                            </p>
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 text-emerald-500 rounded-[15px] text-[10px] font-black border border-emerald-500/20 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>TERHUBUNG (GOOGLE CLOUD READY)</span>
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                      darkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          <img src={user.photoURL} className="w-8 h-8 rounded-full border border-indigo-300" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-5 h-5 text-indigo-400" />
                        )}
                        <span className={`text-[10px] font-extrabold truncate max-w-[120px] ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
                          {user.displayName || user.email}
                        </span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600"
                      >
                        Keluar
                      </button>
                    </div>
                    <p className="text-[8px] text-emerald-500 font-black uppercase">✔ Progres Tersinkronisasi Otomatis</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({ 
                      title: 'Minanihongo', 
                      text: 'Yuk belajar Bahasa Jepang di Minanihongo! Seru dan interaktif.', 
                      url 
                    }).catch(() => {
                      navigator.clipboard.writeText(url);
                      alert('Link disalin!');
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                    alert('Link aplikasi disalin ke clipboard!');
                  }
                }}
                className={`w-full font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  darkMode 
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700' 
                  : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4 text-emerald-500" />
                Bagikan Aplikasi
              </button>

              <button
                onClick={startDuelSetup}
                className={`w-full font-bold py-3 rounded-[20px] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  darkMode 
                  ? 'bg-slate-100 text-slate-900 hover:bg-white' 
                  : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                <Globe className="w-4 h-4" />
                Dunia (Online) {activeUsers.length > 0 && <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </button>

              {user?.email === 'duta070905@gmail.com' && (
                <button
                  onClick={() => switchView('visitors')}
                  className={`w-full font-bold py-3 rounded-[20px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 ${
                    darkMode 
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-white/60 hover:bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-500" />
                  Log Pengunjung ({visitors.length})
                </button>
              )}
            </div>

            {/* Who's Online Section */}
            {activeUsers.length > 0 && (
              <div className="w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`h-px flex-grow ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`} />
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Siapa yang Online ({activeUsers.length})
                  </p>
                  <div className={`h-px flex-grow ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`} />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1 min-h-[48px] items-center">
                  {activeUsers.map((u) => (
                    <motion.div
                      key={u.uid}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ willChange: 'transform, opacity' }}
                      className={`flex-shrink-0 flex flex-col items-center gap-1 p-1 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-100'
                      }`}
                    >
                      <div className="relative">
                        {u.photo ? (
                          <img src={u.photo} className="w-8 h-8 rounded-full border-2 border-emerald-500/30" referrerPolicy="no-referrer" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-emerald-500/30 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                      </div>
                      <span className={`text-[7px] font-bold truncate max-w-[40px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {u.name.split(' ')[0]}
                      </span>
                    </motion.div>
                  ))}
                  {activeUsers.length === 0 && (
                    <p className="text-[10px] text-slate-400 italic w-full text-center py-2">Hanya Anda yang online...</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 w-full space-y-4">
              {/* Mina no Nihongo Levels (1-17) */}
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`h-px flex-grow ${darkMode ? 'bg-rose-500/20' : 'bg-rose-100'}`} />
                  <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] whitespace-nowrap">Mina no Nihongo (Level 1-17)</p>
                  <div className={`h-px flex-grow ${darkMode ? 'bg-rose-500/20' : 'bg-rose-100'}`} />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar px-2 min-h-[75px] items-start">
                  {Object.keys(levelsData)
                    .map(Number)
                    .filter((levelNum) => levelNum <= 17)
                    .map((levelNum, idx) => {
                      const mastery = Math.round(getLevelProgress(levelNum));
                      const isMastered = mastery >= 100;
                      const isActive = currentLevel === levelNum;
                      return (
                        <motion.button
                          key={levelNum}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + idx * 0.03 }}
                          whileHover={{ y: -3, scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ willChange: 'transform' }}
                          onClick={() => {
                            if (isMastered) {
                              celebrateLevel100(levelNum);
                            } else {
                              switchView('quiz', {
                                levelNumber: levelNum,
                                beforeChange: () => changeLevel(levelNum),
                              });
                            }
                          }}
                          className={`flex-shrink-0 w-14 h-14 rounded-[20px] flex flex-col items-center justify-center gap-0.5 transition-all shadow-md relative overflow-hidden group border-2 ${
                            isActive 
                            ? (isMastered ? 'bg-rose-500 border-amber-300 text-white ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.45)]' : 'bg-rose-500 border-rose-400 text-white shadow-rose-500/25')
                            : isMastered
                              ? (darkMode ? 'bg-slate-800 border-amber-400/80 text-amber-300 ring-2 ring-amber-400/50 shadow-[0_0_14px_rgba(251,191,36,0.35)]' : 'bg-amber-50/90 border-amber-400 text-amber-900 ring-2 ring-amber-300/60 shadow-[0_0_14px_rgba(251,191,36,0.25)]')
                              : darkMode 
                                ? 'bg-slate-800 border-slate-700/80 text-slate-400 hover:border-rose-500/50 hover:text-white' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-rose-300 hover:text-rose-500'
                          }`}
                        >
                          {/* 100% Celebration Crown & Sparkles */}
                          {isMastered && (
                            <>
                              <motion.span
                                animate={{ rotate: [-8, 8, -8], scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute -top-1.5 -right-1.5 text-[11px] select-none z-20 filter drop-shadow"
                                title="100% Selesai Sempurna!"
                              >
                                👑
                              </motion.span>
                              <motion.span
                                animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.15, 0.7] }}
                                transition={{ repeat: Infinity, duration: 1.8 }}
                                className="absolute top-0.5 left-1 text-[7px] select-none pointer-events-none text-yellow-300"
                              >
                                ✨
                              </motion.span>
                            </>
                          )}
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">Lv</span>
                          <span className={`text-lg font-black -mt-1 ${isMastered ? 'text-amber-500 dark:text-amber-300 font-extrabold' : ''}`}>{levelNum}</span>
                          {!isMastered && mastery > 0 && (
                            <div className="absolute top-1 right-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            </div>
                          )}
                          <div className={`absolute bottom-0 left-0 w-full h-1.5 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, mastery)}%` }}
                              className={`h-full ${
                                isMastered 
                                  ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 animate-pulse' 
                                  : (isActive ? 'bg-white' : 'bg-rose-400')
                              }`} 
                            />
                          </div>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className={`w-full rounded-[32px] p-6 border transition-all duration-500 hover:shadow-xl ${
              darkMode 
              ? 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50' 
              : 'bg-white border-slate-100 hover:border-slate-200'
            }`}>
              {/* Celebration Milestone Banner in Intro */}
              {completed100Levels.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mb-4 p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                      : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 border-amber-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.15, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-lg shadow-inner"
                    >
                      🏆
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Prestasi 100%</span>
                        <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-mono">SEMPURNA</span>
                      </div>
                      <p className={`text-[10px] font-bold ${darkMode ? 'text-amber-200/90' : 'text-amber-900'}`}>
                        {completed100Levels.length} Level telah dikuasai 100%!
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => celebrateLevel100(completed100Levels[0])}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 text-[9.5px] font-black shadow-md flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>Rayakan</span>
                    <span>🎊</span>
                  </motion.button>
                </motion.div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Tingkat Penguasaan</h3>
                  <p className={`text-[8px] font-bold ${darkMode ? 'text-slate-600' : 'text-slate-500'}`}>Berdasarkan skor terbaik Anda</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[9px] font-black text-rose-500">LIVE</span>
                </div>
              </div>
              <ProgressChart highScores={highScores} levelsData={levelsData} isDarkMode={darkMode} />
              <div className={`mt-4 p-3 rounded-2xl border flex items-start gap-2 transition-colors ${
                darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/30 border-slate-200/50'
              }`}>
                <BookOpen className={`w-3.5 h-3.5 mt-0.5 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                <p className={`text-[9px] leading-relaxed italic ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Grafik menunjukkan persentase kata yang berhasil dikuasai di setiap level. Teruslah berlatih untuk mencapai 100%!
                </p>
              </div>
            </div>
          </motion.div>
          ) : view === 'mode_select' ? (
            <motion.div
              key="mode_select"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-md transition-colors duration-200 flex flex-col p-6 items-center gap-5 min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                {/* Tombol Kembali (Back) */}
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('intro');
                  }}
                  className={`w-10 h-10 rounded-2xl border transition-transform duration-75 active:scale-90 flex items-center justify-center touch-manipulation cursor-pointer ${
                    darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500 hover:border-rose-300 shadow-sm'
                  }`}
                  title="Kembali ke Layar Utama"
                  aria-label="Kembali ke Layar Utama"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>

                {/* Grup Tombol Pengaturan & Aksesibilitas (Menggantikan 'Pilih Mode Belajar') */}
                <div className="flex items-center gap-2" role="toolbar" aria-label="Pengaturan Cepat Tampilan">


                  {/* Tombol Pengaturan Suara & Aksesibilitas */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      playSfx('click');
                      setShowSettingsModal(true);
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${
                      darkMode 
                      ? 'bg-slate-800 text-violet-400 border-slate-700 hover:bg-slate-700 hover:text-white' 
                      : 'bg-white text-violet-700 border-slate-200 hover:bg-slate-50 shadow-slate-100'
                    }`}
                    title="Pengaturan Suara & Aksesibilitas"
                    aria-label="Buka Pengaturan Suara dan Aksesibilitas"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </motion.button>

                  {/* Tombol Mode Kontras Tinggi */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      const nextVal = !highContrastMode;
                      setHighContrastMode(nextVal);
                      playSfx('click');
                      announce(nextVal ? "Mode Kontras Tinggi diaktifkan" : "Mode Kontras Tinggi dinonaktifkan");
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${
                      highContrastMode
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold ring-2 ring-amber-400'
                      : darkMode 
                        ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700' 
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-slate-100'
                    }`}
                    title={highContrastMode ? "Mode Kontras Tinggi Aktif (WCAG AAA)" : "Mode Kontras Tinggi"}
                    aria-label={highContrastMode ? "Nonaktifkan Mode Kontras Tinggi" : "Aktifkan Mode Kontras Tinggi (WCAG AAA)"}
                    aria-pressed={highContrastMode}
                  >
                    <Contrast className="w-4.5 h-4.5" />
                  </motion.button>

                  {/* Tombol Ganti Mode Gelap/Terang */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      const nextDark = !darkMode;
                      setDarkMode(nextDark);
                      playSfx('click');
                      announce(nextDark ? "Mode Gelap aktif" : "Mode Terang aktif");
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-sm ${
                      darkMode 
                      ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-slate-100'
                    }`}
                    title={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                    aria-label={darkMode ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </motion.button>
                </div>

                {/* Tombol Kamus Mini */}
                <button
                  onClick={() => {
                    playSfx('click');
                    setDictionaryQuery('');
                    switchView('dictionary');
                  }}
                  className={`w-10 h-10 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
                    darkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500 hover:border-rose-300 shadow-sm'
                  }`}
                  title="Kamus Mini"
                  aria-label="Buka Kamus Mini"
                >
                  <BookOpen className="w-4.5 h-4.5 text-rose-500" />
                </button>
              </div>

              {/* Japanese Landscape Banner (Top) */}
              <div className={`relative w-full aspect-[16/9.5] rounded-3xl overflow-hidden shadow-md border-2 ${
                darkMode ? 'border-slate-800/80 shadow-slate-950/30' : 'border-slate-100 shadow-slate-100/60'
              }`}>
                <img 
                  src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop" 
                  alt="Gunung Fuji Jepang" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-left z-20">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black tracking-wider uppercase">Jepang</span>
                  <p className="text-white text-xs font-black mt-1">日本語のレッスン (Pelajaran Bahasa Jepang)</p>
                </div>
              </div>

              {/* Three Option Buttons: Kuis Kosakata, Kuis Kanji, Menu Huruf */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {/* Kuis Kosakata */}
                <button
                  id="mode-btn-vocab"
                  onClick={() => {
                    playSfx('click');
                    setActiveMode('vocab');
                  }}
                  className={`p-2 py-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1 select-none relative overflow-hidden group ${
                    activeMode === 'vocab'
                    ? 'bg-rose-500/10 border-rose-500 shadow-md shadow-rose-500/10 scale-[1.02]'
                    : darkMode
                      ? 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${
                    activeMode === 'vocab' ? 'bg-rose-500 text-white' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-rose-50 text-rose-500'
                  } transition-colors`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-black text-[10.5px] leading-tight tracking-tight ${
                      activeMode === 'vocab' ? (darkMode ? 'text-white' : 'text-slate-900') : darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Kosakata
                    </p>
                    <p className={`text-[7.5px] font-semibold mt-0.5 leading-tight ${activeMode === 'vocab' ? 'text-rose-400' : 'text-slate-500'}`}>
                      Mina Lv 1-17
                    </p>
                  </div>
                </button>

                {/* Kuis Kanji */}
                <button
                  id="mode-btn-kanji"
                  onClick={() => {
                    playSfx('click');
                    setActiveMode('kanji');
                  }}
                  className={`p-2 py-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1 select-none relative overflow-hidden group ${
                    activeMode === 'kanji'
                    ? 'bg-purple-500/10 border-purple-500 shadow-md shadow-purple-500/10 scale-[1.02]'
                    : darkMode
                      ? 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${
                    activeMode === 'kanji' ? 'bg-purple-600 text-white' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-purple-50 text-purple-600'
                  } transition-colors`}>
                    <span className="text-xs font-black">🈁</span>
                  </div>
                  <div>
                    <p className={`font-black text-[10.5px] leading-tight tracking-tight ${
                      activeMode === 'kanji' ? (darkMode ? 'text-white' : 'text-slate-900') : darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Kuis Kanji
                    </p>
                    <p className={`text-[7.5px] font-semibold mt-0.5 leading-tight ${activeMode === 'kanji' ? 'text-purple-400' : 'text-slate-500'}`}>
                      580 Kanji JFT
                    </p>
                  </div>
                </button>

                {/* Tombol HURUF */}
                <button
                  id="mode-btn-letters"
                  onClick={() => {
                    playSfx('click');
                    setActiveMode('letters');
                  }}
                  className={`p-2 py-2.5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1 select-none relative overflow-hidden group ${
                    activeMode === 'letters'
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 scale-[1.02]'
                    : darkMode
                      ? 'bg-slate-800/40 border-slate-700/80 text-slate-400 hover:border-slate-600'
                      : 'bg-white border-slate-200/80 text-slate-500 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl ${
                    activeMode === 'letters' ? 'bg-emerald-500 text-white' : darkMode ? 'bg-slate-700 text-slate-400' : 'bg-emerald-50 text-emerald-600'
                  } transition-colors`}>
                    <Languages className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-black text-[10.5px] leading-tight tracking-tight ${
                      activeMode === 'letters' ? (darkMode ? 'text-white' : 'text-slate-900') : darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      HURUF
                    </p>
                    <p className={`text-[7.5px] font-semibold mt-0.5 leading-tight ${activeMode === 'letters' ? 'text-emerald-500' : 'text-slate-500'}`}>
                      Kana & Stroke
                    </p>
                  </div>
                </button>
              </div>

              {/* Dynamic Level Slider / List */}
              <AnimatePresence mode="wait" initial={false}>
                {activeMode === 'vocab' ? (
                  <motion.div
                    key="vocab-grid"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 0.04, ease: "easeOut" }}
                    className="w-full flex-grow flex flex-col items-stretch"
                  >
                    {/* Celebration Milestone Banner in Mode Select */}
                    {completed100Levels.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-2 p-2 px-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs ${
                          darkMode
                            ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/25 to-amber-950/40 border-amber-500/40'
                            : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: [-8, 8, -8], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-sm select-none"
                          >
                            🏆
                          </motion.span>
                          <div>
                            <p className={`text-[9.5px] font-black leading-tight ${darkMode ? 'text-amber-300' : 'text-amber-900'}`}>
                              {completed100Levels.length} Level 100% Sempurna!
                            </p>
                            <p className={`text-[7.5px] font-semibold ${darkMode ? 'text-amber-200/70' : 'text-amber-700'}`}>
                              Pencapaian luar biasa tanpa kesalahan 👑
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => celebrateLevel100(completed100Levels[0])}
                          className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-900 text-[8.5px] font-black shadow-xs flex items-center gap-1 active:scale-95"
                        >
                          <span>Rayakan</span>
                          <span>🎊</span>
                        </motion.button>
                      </motion.div>
                    )}

                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Mina No Nihongo (Lv 1-17):
                      </span>
                      <span className="text-[8.5px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
                        Pilih Level Kuis
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 max-h-[165px] overflow-y-auto pr-1 no-scrollbar pb-1">
                      {Object.keys(levelsData)
                        .map(Number)
                        .filter((levelNum) => levelNum <= 17)
                        .map((levelNum, index) => {
                          const mastery = Math.round(getLevelProgress(levelNum));
                          const isMastered = mastery >= 100;
                          const isActive = currentLevel === levelNum;
                          return (
                            <motion.button
                              key={levelNum}
                              initial={{ opacity: 0, scale: 0.72, y: 15 }}
                              animate={isActive ? {
                                opacity: 1,
                                y: 0,
                                scale: [1, 1.05, 1],
                                boxShadow: darkMode
                                  ? ["0px 0px 0px rgba(244,63,94,0)", "0px 0px 10px rgba(244,63,94,0.45)", "0px 0px 0px rgba(244,63,94,0)"]
                                  : ["0px 0px 0px rgba(244,63,94,0)", "0px 0px 10px rgba(244,63,94,0.35)", "0px 0px 0px rgba(244,63,94,0)"]
                              } : {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                boxShadow: "0px 1px 2px rgba(0,0,0,0.05)"
                              }}
                              transition={isActive ? {
                                opacity: { type: "spring", stiffness: 220, damping: 16, delay: index * 0.025 },
                                y: { type: "spring", stiffness: 220, damping: 16, delay: index * 0.025 },
                                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                                boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                              } : {
                                opacity: { type: "spring", stiffness: 220, damping: 16, delay: index * 0.025 },
                                y: { type: "spring", stiffness: 220, damping: 16, delay: index * 0.025 },
                                scale: { duration: 0.15 },
                                boxShadow: { duration: 0.15 }
                              }}
                              whileHover={{ scale: 1.08, y: -2, zIndex: 10 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (isMastered) {
                                  playSfx('win');
                                  triggerConfetti(2500);
                                  showToast(`🎉 Level ${levelNum} 100% Selesai Sempurna! 👑`, 'success');
                                }
                                switchView('quiz', {
                                  levelNumber: levelNum,
                                  beforeChange: () => changeLevel(levelNum),
                                });
                              }}
                              className={`h-[52px] rounded-2xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden border-2 transition-all shadow-sm ${
                                isActive
                                ? (isMastered ? 'bg-rose-500 border-amber-300 text-white ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.45)]' : 'bg-rose-500 border-rose-400 text-white')
                                : isMastered
                                  ? (darkMode ? 'bg-slate-800/90 border-amber-400/80 text-slate-200 ring-2 ring-amber-400/50 shadow-[0_0_14px_rgba(251,191,36,0.35)]' : 'bg-amber-50/90 border-amber-400 text-slate-800 ring-2 ring-amber-300/60 shadow-[0_0_14px_rgba(251,191,36,0.25)]')
                                  : darkMode
                                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-rose-500/40 hover:text-white'
                                    : 'bg-white border-slate-150 text-slate-600 hover:border-rose-400/40 hover:text-rose-500'
                              }`}
                            >
                              {/* 100% Celebration Crown & Sparkles */}
                              {isMastered && (
                                <>
                                  <motion.span
                                    animate={{ rotate: [-6, 6, -6], scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.8 }}
                                    className="absolute -top-1 -right-1 text-[11px] z-20 select-none filter drop-shadow"
                                    title="Level 100% Selesai Sempurna!"
                                  >
                                    👑
                                  </motion.span>
                                  <motion.span
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.1, 0.7] }}
                                    transition={{ repeat: Infinity, duration: 1.6 }}
                                    className="absolute top-1 left-1.5 text-[7px] select-none pointer-events-none text-yellow-300"
                                  >
                                    ✨
                                  </motion.span>
                                </>
                              )}

                              {/* Floating Sparkle Emots for Active */}
                              {isActive && !isMastered && (
                                <>
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], x: [-12, 12], y: [10, -20] }}
                                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.1 }}
                                    className="absolute pointer-events-none text-[8px] select-none text-yellow-300 left-1/2"
                                  >
                                    ✨
                                  </motion.span>
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: [0, 0.8, 0], scale: [0.4, 0.8, 0.4], x: [8, -8], y: [10, -15] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.7 }}
                                    className="absolute pointer-events-none text-[8px] select-none text-yellow-200 left-1/3"
                                  >
                                    ⭐
                                  </motion.span>
                                </>
                              )}

                              <div className="flex items-center gap-1 z-10">
                                <motion.span 
                                  animate={isActive ? {
                                    y: [0, -3, 0],
                                    rotate: [0, 8, -8, 0],
                                    scale: [1, 1.2, 1],
                                  } : { y: 0, rotate: 0, scale: 1 }}
                                  transition={isActive ? {
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut"
                                  } : {}}
                                  className="text-[13px]"
                                >
                                  {levelsData[levelNum].icon}
                                </motion.span>
                                <div className="flex flex-col items-start leading-none">
                                  <span className="text-[6.5px] opacity-70 font-black uppercase">Lv</span>
                                  <span className={`text-[11px] font-black leading-tight ${isMastered ? 'text-amber-500 dark:text-amber-300' : ''}`}>{levelNum}</span>
                                </div>
                              </div>

                              {mastery > 0 && (
                                <span className={`text-[6.5px] font-black z-10 ${
                                  isMastered 
                                    ? (isActive ? 'text-amber-200 font-extrabold' : 'text-amber-500 font-extrabold')
                                    : (isActive ? 'text-white/80' : 'text-emerald-500 font-bold')
                                }`}>
                                  {isMastered ? '⭐ 100%' : `${mastery}%`}
                                </span>
                              )}
                              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-black/10">
                                <div 
                                  className={`h-full transition-all duration-300 ${
                                    isMastered 
                                      ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 animate-pulse' 
                                      : 'bg-emerald-400'
                                  }`} 
                                  style={{ width: `${Math.min(100, mastery)}%` }} 
                                />
                              </div>
                            </motion.button>
                          );
                        })}
                    </div>
                  </motion.div>
                ) : activeMode === 'kanji' ? (
                  <motion.div
                    key="kanji-hub-options"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 0.04, ease: "easeOut" }}
                    className="w-full flex-grow flex flex-col justify-center gap-2.5 py-1"
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        FITUR KANJI HUB (580 KANJI):
                      </span>
                      <button
                        onClick={() => {
                          playSfx('click');
                          setKanjiHubInitialTab('quiz');
                          switchView('kanji_hub');
                        }}
                        className="text-[8.5px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full hover:bg-purple-500/20 transition-all flex items-center gap-1"
                      >
                        <span>Buka Hub Penuh</span>
                        <span>➔</span>
                      </button>
                    </div>

                    {/* 4 Pilihan Mode Kanji Hub */}
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      {/* Pilihan 1: Kuis Pilihan Ganda */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          setKanjiHubInitialTab('quiz');
                          switchView('kanji_hub');
                        }}
                        className={`p-3 py-3.5 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-1.5 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-purple-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-purple-400 text-slate-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-purple-600/20 group-hover:scale-110 transition-transform">
                          🎯
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Kuis Kanji</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                              Pilihan Ganda
                            </span>
                          </div>
                          <p className={`text-[8px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Kuis arti, bacaan & skor live
                          </p>
                        </div>
                        <span className="text-[8.5px] font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                          Mulai Kuis ➔
                        </span>
                      </motion.button>

                      {/* Pilihan 2: Flashcard 3D */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          setKanjiHubInitialTab('flashcards');
                          switchView('kanji_hub');
                        }}
                        className={`p-3 py-3.5 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-1.5 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-amber-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-amber-400 text-slate-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-amber-500/20 group-hover:scale-110 transition-transform">
                          🗂️
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Flashcard 3D</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              Hafalan
                            </span>
                          </div>
                          <p className={`text-[8px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Kartu bolak-balik & audio lafal
                          </p>
                        </div>
                        <span className="text-[8.5px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          Buka Kartu ➔
                        </span>
                      </motion.button>

                      {/* Pilihan 3: Kamus 580 Kanji */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          setKanjiHubInitialTab('dictionary');
                          switchView('kanji_hub');
                        }}
                        className={`p-3 py-3.5 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-1.5 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-blue-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-blue-400 text-slate-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-600/20 group-hover:scale-110 transition-transform">
                          📖
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Kamus 580</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              Daftar Lengkap
                            </span>
                          </div>
                          <p className={`text-[8px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Cari kanji, arti, & furigana
                          </p>
                        </div>
                        <span className="text-[8.5px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                          Cari Kanji ➔
                        </span>
                      </motion.button>

                      {/* Pilihan 4: Papan Tulis Kanji */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          setKanjiHubInitialTab('practice_write');
                          switchView('kanji_hub');
                        }}
                        className={`p-3 py-3.5 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-1.5 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-emerald-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                          ✍️
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Papan Tulis</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              Coret Kanji
                            </span>
                          </div>
                          <p className={`text-[8px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Latihan gambar & stroke kanji
                          </p>
                        </div>
                        <span className="text-[8.5px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          Tulis Kanji ➔
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="letters-options"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0 } }}
                    transition={{ duration: 0.04, ease: "easeOut" }}
                    className="w-full flex-grow flex flex-col justify-center gap-2.5 py-1"
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className={`text-[9.5px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        PILIHAN BELAJAR HURUF:
                      </span>
                      <span className="text-[8.5px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Hiragana & Katakana
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      {/* Pilihan 1: Membaca */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          switchView('kana_reading');
                        }}
                        className={`p-3.5 py-4 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-2 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-rose-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-rose-400 text-slate-800'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-rose-500/20 group-hover:scale-110 transition-transform">
                          📖
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Membaca</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-rose-500/10 text-rose-500">
                              Kana
                            </span>
                          </div>
                          <p className={`text-[8.5px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tabel huruf, audio lafal, & kuis baca
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full mt-0.5">
                          Mulai Baca ➔
                        </span>
                      </motion.button>

                      {/* Pilihan 2: Menulis */}
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          playSfx('click');
                          switchView('kana_writing');
                        }}
                        className={`p-3.5 py-4 rounded-[22px] border-2 transition-all flex flex-col items-center text-center gap-2 relative overflow-hidden group shadow-sm ${
                          darkMode
                            ? 'bg-slate-800/70 border-slate-700/80 hover:border-emerald-500 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                          ✍️
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <h4 className="font-black text-xs">Menulis</h4>
                            <span className="text-[7.5px] px-1 py-0.2 rounded font-extrabold bg-emerald-500/10 text-emerald-600">
                              Stroke
                            </span>
                          </div>
                          <p className={`text-[8.5px] font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Papan kanvas interaktif & pola huruf
                          </p>
                        </div>
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-0.5">
                          Mulai Tulis ➔
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ANIMATED KOI POND (Bottom) */}
              <div className="w-full">
                <KoiPond />
              </div>

            </motion.div>
          ) : view === 'duel_setup' ? (
            <motion.div
              key="duel_setup"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-md transition-colors duration-200 flex flex-col p-8 items-center text-center gap-6 min-h-[75vh] ${
              darkMode 
              ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
              : 'bg-white/95 border-white/40 shadow-slate-200'
            }`}
          >
            <button 
              onClick={() => {
                playSfx('click');
                switchView('intro');
              }}
              className={`absolute top-8 left-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100/50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner mt-4 transition-colors ${
              darkMode ? 'bg-blue-500/10' : 'bg-blue-50'
            }`}>
              <Users className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
            
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Persiapan Duel</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Pilih Tingkat Kompetisi</p>
            </div>

            <div className="w-full flex-grow">
              <div className={`grid grid-cols-5 gap-2 mb-8 p-4 rounded-3xl border shadow-inner transition-colors ${
                darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50/50 border-slate-100'
              }`}>
                {duelAvailableLevels.length > 0 ? (
                  duelAvailableLevels.map((levelNum) => {
                    const mastery = getLevelProgress(levelNum);
                    return (
                      <motion.button
                        key={levelNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedDuelLevel(levelNum);
                          playSfx('click');
                        }}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all shadow-sm border relative overflow-hidden ${
                          selectedDuelLevel === levelNum 
                          ? 'bg-blue-500 text-white border-blue-600 scale-110 shadow-blue-200' 
                          : darkMode 
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500/50'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-xs font-bold">{levelNum}</span>
                        {mastery > 0 && <span className="text-[7px] font-black opacity-60">{Math.round(mastery)}%</span>}
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${darkMode ? 'bg-slate-700' : 'bg-black/5'}`}>
                          <div 
                            className={`h-full ${selectedDuelLevel === levelNum ? 'bg-white/40' : 'bg-blue-400'}`} 
                            style={{ width: `${mastery}%` }} 
                          />
                        </div>
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="col-span-5 py-12 flex flex-col items-center justify-center gap-2">
                    <BookOpen className={`w-8 h-8 ${darkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                    <p className={`text-[10px] font-bold uppercase tracking-widest text-center px-4 leading-relaxed ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Belum ada tingkat dengan penguasaan ≥ 50%.<br/>
                      Selesaikan kuis di menu utama terlebih dahulu!
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => startActualDuel(selectedDuelLevel)}
                disabled={duelAvailableLevels.length === 0}
                className={`w-full font-bold py-4 rounded-3xl shadow-xl transition-all flex items-center justify-center gap-3 mb-4 border-b-4 ${
                  duelAvailableLevels.length === 0 
                  ? darkMode ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed opacity-50' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 border-blue-800 shadow-blue-200'
                }`}
              >
                Mulai Duel Sekarang! <SkipForward className="w-4 h-4" />
              </button>
              
              <div className="p-4 bg-blue-50/50 rounded-2xl text-[10px] text-blue-700 font-medium border border-blue-100 leading-relaxed mb-4">
                <span className="font-black uppercase block mb-1">Aturan Duel:</span>
                Pemain 1 & 2 akan bergantian menjawab kuis pada tingkat yang sama. Siapkan mentalmu!
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={createRemoteDuelHandler}
                  disabled={duelAvailableLevels.length === 0}
                  className={`w-full font-black py-4 rounded-3xl shadow-md border-2 transition-all flex items-center justify-center gap-2 ${
                    duelAvailableLevels.length === 0 
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' 
                    : 'bg-white text-blue-600 border-blue-100 hover:border-blue-300 active:scale-95'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Buat Duel Online (PVP)
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2 my-1">
                  <span className={`h-px flex-grow ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <span className={`text-[8px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>ATAU GABUNG DENGAN ID</span>
                  <span className={`h-px flex-grow ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </div>

                {/* Join via ID input section directly visible in UI */}
                <div className={`p-4 rounded-3xl border flex flex-col gap-3 transition-all ${
                  darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-200/50'
                }`}>
                  <input 
                    type="text" 
                    placeholder="MASUKKAN ID DUEL" 
                    value={inviteIdInput}
                    onChange={(e) => setInviteIdInput(e.target.value.toUpperCase())}
                    className={`w-full px-4 py-3 rounded-2xl border text-center font-black tracking-widest text-xs uppercase outline-none transition-all ${
                      darkMode 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-700 focus:border-blue-500' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300 focus:border-blue-400'
                    }`}
                  />
                  <button
                    onClick={() => {
                      if (!inviteIdInput.trim()) {
                        alert("⚠️ Harap masukkan ID Duel terlebih dahulu.");
                        return;
                      }
                      joinRemoteDuelHandler(inviteIdInput.trim());
                    }}
                    className={`w-full font-black py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs active:scale-95 border-b-2 ${
                      darkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-800' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 border-blue-700'
                    }`}
                  >
                    Gabung Duel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
          ) : view === 'leaderboard' ? (
            <motion.div
              key="leaderboard"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[75vh] ${
              darkMode 
              ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
              : 'bg-white/95 border-white/40 shadow-slate-200'
            }`}
          >
            <div className="p-8 pb-4 flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  playSfx('click');
                  switchView('intro');
                }}
                className={`absolute top-8 left-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner transition-colors ${
                darkMode ? 'bg-amber-500/10' : 'bg-amber-50'
              }`}>
                <Medal className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Papan Peringkat</h2>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Skor Terbaik Anda</p>
              </div>
            </div>

            <div className="flex-grow px-8 overflow-y-auto max-h-[40vh] no-scrollbar">
              {isDataLoading ? (
                <Loader message="Mengambil Skor..." />
              ) : (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                    <div key={level} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                      darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 border rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                          darkMode ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {level}
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Tingkat {level}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-rose-500">{highScores[level] || 0}</span>
                        <span className={`text-[10px] font-bold ml-1 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`}>pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 pt-4">
              <button 
                onClick={() => {
                  playSfx('click');
                  switchView('intro');
                }}
                className={`w-full font-bold py-4 rounded-3xl shadow-xl active:scale-95 transition-all ${
                  darkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                Kembali
              </button>
            </div>
          </motion.div>
          ) : view === 'visitors' ? (
            <motion.div
              key="visitors"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[75vh] ${
              darkMode 
              ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
              : 'bg-white/95 border-white/40 shadow-slate-200'
            }`}
          >
            <div className="p-8 pb-4 flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  playSfx('click');
                  switchView('intro');
                }}
                className={`absolute top-8 left-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner mt-4 transition-colors ${
                darkMode ? 'bg-purple-500/10' : 'bg-purple-50'
              }`}>
                <Users className={`w-10 h-10 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Log Pengunjung</h2>
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Akses Tanpa Login</p>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-tighter">Developer Only</span>
                </div>
              </div>
            </div>

            <div className="flex-grow px-8 overflow-y-auto max-h-[45vh] no-scrollbar">
              <div className="space-y-3">
                {visitors.map((v, i) => (
                  <motion.div 
                    key={v.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-3xl border transition-all ${
                      darkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {v.platform}
                      </span>
                      <span className={`text-[8px] font-bold ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {v.timestamp ? new Date(v.timestamp.toMillis()).toLocaleString() : 'Baru saja'}
                      </span>
                    </div>
                    <p className={`text-[10px] font-bold line-clamp-2 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {v.userAgent}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full bg-emerald-500`} />
                       <span className={`text-[8px] font-black uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {v.screen} • {v.language}
                       </span>
                    </div>
                  </motion.div>
                ))}
                {visitors.length === 0 && (
                  <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Users className="w-12 h-12 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Belum ada log pengunjung</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 pt-4">
              <button 
                onClick={() => {
                  playSfx('click');
                  switchView('intro');
                }}
                className={`w-full font-bold py-4 rounded-3xl shadow-xl active:scale-95 transition-all ${
                  darkMode ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                Kembali
              </button>
            </div>
          </motion.div>
          ) : view === 'flashcards' ? (
            <motion.div
              key="flashcards"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('mode_select');
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-sm'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-md font-black ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-1.5 justify-center`}>
                    Study Flashcards {levelsData[currentLevel]?.icon}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {levelsData[currentLevel]?.name}
                  </p>
                </div>
                <div className="w-8" />
              </div>

              {currentVocabList.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 opacity-60">
                  <BookOpen className="w-12 h-12 mb-3 text-rose-500" />
                  <p className="text-xs font-black uppercase text-center">Belum ada kata untuk dipelajari</p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col p-6 items-center justify-between gap-4">
                  
                  {/* Card position header indicator */}
                  <div className="w-full flex justify-between items-center text-xs font-bold px-1 text-slate-400">
                    <span className="font-mono">Kosakata {flashcardIndex + 1} / {currentVocabList.length}</span>
                    <span className="bg-rose-500/10 text-rose-500 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wide">
                      Ketuk untuk balik kartu
                    </span>
                  </div>

                  {/* 3D Flashcard Animation Frame */}
                  <div 
                    onClick={() => {
                      setIsFlipped(!isFlipped);
                      playSfx('click');
                    }}
                    className="w-full aspect-[4/3] relative cursor-pointer group"
                    style={{ perspective: "1000px" }}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                      className="w-full h-full relative"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* CARD FRONT: Japanese Word */}
                      <div
                        className={`absolute inset-0 rounded-[32px] p-6 flex flex-col justify-between items-center border shadow-xl ${
                          darkMode 
                          ? 'bg-slate-800/80 border-slate-700 text-white' 
                          : 'bg-gradient-to-br from-amber-50/40 to-white border-slate-150 text-slate-800'
                        }`}
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="w-full flex justify-between items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakJapanese(currentVocabList[flashcardIndex].jpn);
                            }}
                            className={`p-2.5 rounded-full ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-100/60 hover:bg-rose-100 text-rose-500'} transition-transform active:scale-90`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(currentVocabList[flashcardIndex]);
                            }}
                            className="p-2.5 rounded-full text-amber-500"
                          >
                            <Star className={`w-4 h-4 ${isFavorited(currentVocabList[flashcardIndex]) ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>

                        {/* Beautiful Large Japanese Display Typography */}
                        <div className="flex-grow flex flex-col items-center justify-center select-all">
                          <h3 className="text-4xl font-extrabold tracking-normal text-center leading-relaxed">
                            {currentVocabList[flashcardIndex]?.jpn}
                          </h3>
                        </div>

                        <span className={`text-[10px] font-black tracking-widest uppercase opacity-40`}>
                          KLIK UNTUK LIHAT ARTI
                        </span>
                      </div>

                      {/* CARD BACK: Indonesian Translate */}
                      <div
                        className={`absolute inset-0 rounded-[32px] p-6 flex flex-col justify-between items-center border shadow-xl ${
                          darkMode 
                          ? 'bg-slate-900 border-rose-500/30 text-white' 
                          : 'bg-gradient-to-br from-rose-50/30 to-white border-rose-200/60 text-slate-800'
                        }`}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <div className="w-full flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                            INDONESIA
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakJapanese(currentVocabList[flashcardIndex].jpn);
                            }}
                            className={`p-2.5 rounded-full ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-rose-100/60 hover:bg-rose-100 text-rose-500'} transition-transform active:scale-90`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex-grow flex flex-col items-center justify-center">
                          <h3 className="text-2xl font-black text-center leading-normal capitalize tracking-tight px-2">
                            {currentVocabList[flashcardIndex]?.ind}
                          </h3>
                        </div>

                        <span className={`text-[10px] font-black tracking-widest uppercase opacity-40`}>
                          KETUK UNTUK BALIK KEMBALI
                        </span>
                      </div>

                    </motion.div>
                  </div>

                  {/* Known Indicator Controls */}
                  <div className="w-full flex gap-3">
                    <button
                      onClick={() => {
                        playSfx('click');
                        const item = currentVocabList[flashcardIndex];
                        if (item) {
                          setFlashcardKnownCount(prev => ({ ...prev, [item.jpn]: 'unknown' }));
                        }
                        // Auto-advance
                        if (flashcardIndex < currentVocabList.length - 1) {
                          setFlashcardIndex(prev => prev + 1);
                          setIsFlipped(false);
                        }
                      }}
                      className={`flex-1 font-bold py-3 px-4 rounded-2xl border transition-all text-sm flex items-center justify-center gap-2 ${
                        flashcardKnownCount[currentVocabList[flashcardIndex]?.jpn] === 'unknown'
                        ? 'bg-rose-500/15 border-rose-500 text-rose-500'
                        : darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      ❌ Belum Hafal
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        const item = currentVocabList[flashcardIndex];
                        if (item) {
                          setFlashcardKnownCount(prev => ({ ...prev, [item.jpn]: 'known' }));
                        }
                        // Auto-advance
                        if (flashcardIndex < currentVocabList.length - 1) {
                          setFlashcardIndex(prev => prev + 1);
                          setIsFlipped(false);
                        } else {
                          alert("Hebat! Anda telah menyelesaikan seluruh set flashcard untuk level ini.");
                        }
                      }}
                      className={`flex-1 font-bold py-3 px-4 rounded-2xl border transition-all text-sm flex items-center justify-center gap-2 ${
                        flashcardKnownCount[currentVocabList[flashcardIndex]?.jpn] === 'known'
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-500'
                        : darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      ✅ Sudah Hafal
                    </button>
                  </div>

                  {/* Navigation Footer */}
                  <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-500/10 pt-4">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        playSfx('click');
                        setFlashcardIndex(prev => prev - 1);
                        setIsFlipped(false);
                      }}
                      className={`font-black py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                        flashcardIndex === 0 ? 'opacity-40 pointer-events-none' : ''
                      } ${
                        darkMode ? 'bg-slate-800 border-slate-750 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      Kembali
                    </button>

                    <button
                      disabled={flashcardIndex === currentVocabList.length - 1}
                      onClick={() => {
                        playSfx('click');
                        setFlashcardIndex(prev => prev + 1);
                        setIsFlipped(false);
                      }}
                      className={`font-black py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                        flashcardIndex === currentVocabList.length - 1 ? 'opacity-40 pointer-events-none' : ''
                      } ${
                        darkMode ? 'bg-slate-800 border-slate-755 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          ) : view === 'sandbox' ? (
            <motion.div
              key="sandbox"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('mode_select');
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-sm'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-md font-black ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-1.5 justify-center`}>
                    Papan Goresan {levelsData[currentLevel]?.icon}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {levelsData[currentLevel]?.name}
                  </p>
                </div>
                <div className="w-8" />
              </div>

              {currentVocabList.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center p-8 opacity-60">
                  <BookOpen className="w-12 h-12 mb-3 text-rose-500" />
                  <p className="text-xs font-black uppercase text-center font-mono">Belum ada kata</p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col p-6 items-center justify-between gap-4">
                  <div className="w-full flex justify-between items-center text-[10px] font-bold px-1 text-slate-400">
                    <span className="font-mono">Kata ke {flashcardIndex + 1} / {currentVocabList.length}</span>
                    <span className="text-emerald-500 font-extrabold uppercase">
                      Practice Pad
                    </span>
                  </div>

                  <DrawingCanvas 
                    darkMode={darkMode}
                    word={currentVocabList[flashcardIndex]?.jpn || "あ"}
                    onSpeak={() => speakJapanese(currentVocabList[flashcardIndex]?.jpn || "あ")}
                  />

                  <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-500/10 pt-4 mt-2">
                    <button
                      disabled={flashcardIndex === 0}
                      onClick={() => {
                        playSfx('click');
                        setFlashcardIndex(prev => Math.max(0, prev - 1));
                      }}
                      className={`font-black py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                        flashcardIndex === 0 ? 'opacity-40 pointer-events-none' : ''
                      } ${
                        darkMode ? 'bg-slate-800 border-slate-750 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      Sebelumnya
                    </button>

                    <button
                      disabled={flashcardIndex === currentVocabList.length - 1}
                      onClick={() => {
                        playSfx('click');
                        setFlashcardIndex(prev => Math.min(currentVocabList.length - 1, prev + 1));
                      }}
                      className={`font-black py-3 rounded-2xl text-xs uppercase flex items-center justify-center gap-1 border transition-all active:scale-95 ${
                        flashcardIndex === currentVocabList.length - 1 ? 'opacity-40 pointer-events-none' : ''
                      } ${
                        darkMode ? 'bg-slate-800 border-slate-755 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : view === 'dictionary' ? (
            <motion.div
              key="dictionary"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('mode_select');
                  }}
                  className={`p-2 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-sm'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-md font-black ${darkMode ? 'text-white' : 'text-slate-800'} flex items-center gap-1.5 justify-center`}>
                    📖 Kamus Mini & Kanji 580
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Cari Kosakata & 580 Kanji Irodori
                  </p>
                </div>
                <div className="w-8" />
              </div>

              {/* Dictionary Category Selector Tabs */}
              <div className="px-6 pt-3 flex items-center justify-center gap-1.5">
                <button
                  id="dict-tab-all"
                  onClick={() => {
                    playSfx('click');
                    setDictionaryTab('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    dictionaryTab === 'all'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  id="dict-tab-vocab"
                  onClick={() => {
                    playSfx('click');
                    setDictionaryTab('vocab');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    dictionaryTab === 'vocab'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kosakata (Mina)
                </button>
                <button
                  id="dict-tab-kanji"
                  onClick={() => {
                    playSfx('click');
                    setDictionaryTab('kanji');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                    dictionaryTab === 'kanji'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : darkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🈁</span>
                  <span>Kanji 580</span>
                </button>
              </div>

              {/* Real-time search bar */}
              <div className="p-6 pt-3 pb-3">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={dictionaryQuery}
                    onChange={(e) => setDictionaryQuery(e.target.value)}
                    placeholder="Cari kata, kanji, arti, atau cara baca..."
                    maxLength={100}
                    className={`w-full font-bold px-5 py-3 rounded-3xl border focus:outline-none focus:ring-2 focus:ring-rose-500 relative z-10 text-xs transition-colors ${
                      darkMode 
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 shadow-inner'
                    }`}
                  />
                  {dictionaryQuery && (
                    <button
                      onClick={() => setDictionaryQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 hover:text-rose-500 z-20"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Dictionary list explorer */}
              <div className="flex-grow px-6 overflow-y-auto max-h-[46vh] no-scrollbar pb-6 animate-fade-in">
                <div className="space-y-2.5">
                  {(() => {
                    type UnifiedDictItem = {
                      id: string;
                      type: 'vocab' | 'kanji';
                      jpn: string;
                      reading?: string;
                      ind: string;
                      levelName: string;
                      icon: string;
                      badgeColor: string;
                    };

                    const combinedList: UnifiedDictItem[] = [];

                    // 1. Minna no Nihongo vocab
                    if (dictionaryTab === 'all' || dictionaryTab === 'vocab') {
                      Object.keys(levelsData).forEach((lKey) => {
                        const lNum = Number(lKey);
                        const lData = levelsData[lNum];
                        if (lData && lData.vocab) {
                          lData.vocab.forEach((v, vIdx) => {
                            combinedList.push({
                              id: `vocab-${lNum}-${vIdx}`,
                              type: 'vocab',
                              jpn: v.jpn,
                              reading: v.reading,
                              ind: v.ind,
                              levelName: lData.name.split(' (')[0],
                              icon: lData.icon,
                              badgeColor: 'bg-rose-500/10 text-rose-500',
                            });
                          });
                        }
                      });
                    }

                    // 2. Irodori 580 Kanji
                    if (dictionaryTab === 'all' || dictionaryTab === 'kanji') {
                      IRODORI_KANJI_LIST.forEach((k) => {
                        combinedList.push({
                          id: `kanji-${k.id}`,
                          type: 'kanji',
                          jpn: k.kanji,
                          reading: k.reading,
                          ind: k.meaning,
                          levelName: `Kanji Bab ${k.lesson}`,
                          icon: k.tier === 'nyuumon' ? '🌱' : k.tier === 'shokyuu1' ? '⚡' : '👑',
                          badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
                        });
                      });
                    }

                    // Search filtering
                    const cleanedQuery = dictionaryQuery.toLowerCase().trim();
                    const filtered = combinedList.filter((item) => {
                      if (!cleanedQuery) return dictionaryTab !== 'all';
                      return (
                        item.jpn.toLowerCase().includes(cleanedQuery) ||
                        (item.reading && item.reading.toLowerCase().includes(cleanedQuery)) ||
                        item.ind.toLowerCase().includes(cleanedQuery)
                      );
                    });

                    if (!dictionaryQuery && dictionaryTab === 'all') {
                      return (
                        <div className="py-12 flex flex-col items-center text-center opacity-70">
                          <span className="text-4xl mb-3">🎏</span>
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">KAMUS KOSAKATA & 580 KANJI</p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[260px] leading-relaxed">
                            Ketik kata bahasa Jepang, kanji, romaji, atau arti bahasa Indonesia untuk mulai mencari.
                          </p>
                        </div>
                      );
                    }

                    if (filtered.length === 0) {
                      return (
                        <div className="py-12 flex flex-col items-center text-center opacity-50">
                          <span className="text-3xl mb-3">🔍</span>
                          <p className="text-xs font-black uppercase text-slate-400">Kata Tidak Ditemukan</p>
                          <p className="text-[10px] text-slate-500 mt-1">Coba kata penelusuran lainnya</p>
                        </div>
                      );
                    }

                    return filtered.slice(0, 100).map((v, i) => {
                      const isFav = isFavorited({ jpn: v.jpn, ind: v.ind });
                      return (
                        <motion.div
                          key={v.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.02, 0.3) }}
                          className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center ${
                            darkMode 
                            ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 shadow-slate-950/20' 
                            : 'bg-slate-50 border-slate-150 hover:bg-white shadow-xs'
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-3 text-left">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className="text-sm leading-none">{v.icon}</span>
                              <span className={`text-[7.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${v.badgeColor}`}>
                                {v.levelName}
                              </span>
                            </div>

                            <p className={`text-base font-extrabold tracking-tight truncate leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`} translate="no">
                              {v.jpn}
                            </p>
                            {v.reading && (
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5" translate="no">
                                {v.reading}
                              </p>
                            )}
                            <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                              {v.ind}
                            </p>
                          </div>

                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => {
                                playSfx('click');
                                speakJapanese(v.jpn);
                              }}
                              className={`p-2 rounded-full ${
                                darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-650' : 'bg-rose-100/60 text-rose-500 hover:bg-rose-100 shadow-xs'
                              } transition-colors active:scale-[0.93]`}
                              title="Dengar Lafal"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                playSfx('click');
                                toggleFavorite({ jpn: v.jpn, ind: v.ind });
                              }}
                              className="p-2 rounded-full text-amber-500"
                              title="Simpan Favorit"
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          ) : view === 'kana_reading' ? (
            <motion.div
              key="kana_reading"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <KanaReading
                darkMode={darkMode}
                onBack={() => switchView('mode_select')}
                onSwitchToWriting={() => switchView('kana_writing')}
                speakJapanese={speakJapanese}
                playSfx={playSfx}
                showToast={showToast}
              />
            </motion.div>
          ) : view === 'kana_writing' ? (
            <motion.div
              key="kana_writing"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <KanaWriting
                darkMode={darkMode}
                onBack={() => switchView('mode_select')}
                onSwitchToReading={() => switchView('kana_reading')}
                speakJapanese={speakJapanese}
                playSfx={playSfx}
              />
            </motion.div>
          ) : view === 'kanji_hub' ? (
            <motion.div
              key="kanji_hub"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex justify-center"
            >
              <KanjiHub
                darkMode={darkMode}
                onBack={() => switchView('mode_select')}
                speakJapanese={speakJapanese}
                playSfx={playSfx}
                showToast={showToast}
                initialTab={kanjiHubInitialTab}
              />
            </motion.div>
          ) : view === 'time_attack' ? (
            <motion.div
              key="time_attack"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-250 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    setTimeAttackActive(false);
                    switchView('mode_select');
                  }}
                  className={`p-2.5 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-205 shadow-sm'
                  }`}
                  title="Kembali ke Menu"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-850'} flex items-center gap-1.5 justify-center`}>
                    ⚡ Time Attack Challenge
                  </h2>
                  <p className={`text-[9.5px] uppercase font-bold tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Level {currentLevel}: {levelsData[currentLevel]?.name.split(' (')[0] || ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-xl">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-400">PB: {timeAttackHighScore}</span>
                </div>
              </div>

              {!timeAttackCompleted ? (
                // Active Game State
                <div className="flex-grow p-6 flex flex-col justify-between gap-5">
                  {/* Timer Display with progress bar style */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-[10px] uppercase font-black tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Sisa Waktu
                      </span>
                      <span className={`text-xs font-mono font-black py-1 px-3 rounded-full ${
                        timeAttackTimeLeft <= 10 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : (darkMode ? 'bg-slate-800 text-violet-400' : 'bg-violet-50 text-violet-600')
                      }`}>
                        {timeAttackTimeLeft} Detik
                      </span>
                    </div>
                    {/* Progress Bar Timer */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${(timeAttackTimeLeft / 60) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className={`h-full ${timeAttackTimeLeft <= 10 ? 'bg-rose-500' : 'bg-violet-500'}`}
                      />
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className={`p-6 py-8 rounded-[32px] border-2 flex flex-col items-center justify-center relative min-h-[160px] text-center ${
                    darkMode 
                    ? 'bg-slate-850/80 border-slate-800' 
                    : 'bg-slate-50/50 border-slate-100 shadow-inner'
                  }`}>
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 border border-violet-500/20 text-[8px] font-black tracking-widest uppercase mb-4">
                      TERJEMAHKAN KOSAKATA JEPANG
                    </span>

                    {/* Question Japanese Text */}
                    {(() => {
                      const list = currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || []);
                      const idx = timeAttackIndex % list.length;
                      const q = list[idx];
                      if (!q) return <p className="text-slate-450 text-xs">Mengambil soal...</p>;
                      return (
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="flex items-center gap-3">
                            <h1 className={`text-2xl font-black tracking-tight leading-normal ${darkMode ? 'text-white' : 'text-slate-850'}`} translate="no">
                              {q.jpn}
                            </h1>
                            <button
                              onClick={() => {
                                playSfx('click');
                                speakJapanese(q.jpn);
                              }}
                              className={`p-2 rounded-full border transition-all active:scale-90 ${
                                darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                              title="Mainkan Audio"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Score stats */}
                  <div className="flex justify-around items-center py-2 border-y border-slate-500/10">
                    <div className="text-center">
                      <p className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Benar</p>
                      <p className="text-lg font-black text-emerald-500">{timeAttackScore}</p>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-500/20" />
                    <div className="text-center">
                      <p className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Selesai</p>
                      <p className={`text-lg font-black ${darkMode ? 'text-slate-200' : 'text-slate-705'}`}>{timeAttackTotal}</p>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-500/20" />
                    <div className="text-center">
                      <p className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Akurasi</p>
                      <p className="text-lg font-black text-violet-500">
                        {timeAttackTotal > 0 ? `${Math.round((timeAttackScore / timeAttackTotal) * 100)}%` : '0%'}
                      </p>
                    </div>
                  </div>

                  {/* Options Grid */}
                  <div className="flex flex-col gap-2">
                    {timeAttackOptions.map((opt, idx) => {
                      const list = currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || []);
                      const currentQ = list[timeAttackIndex % list.length];
                      const isCorrectAnswer = opt === currentQ?.ind;
                      const isSelected = opt === timeAttackSelected;

                      return (
                        <RippleButton
                          key={`${opt}-${idx}`}
                          onClick={() => handleTimeAttackAnswer(opt)}
                          disabled={timeAttackLocked}
                          whileTap={{ scale: 0.955 }}
                          animate={isSelected ? { scale: [0.955, 1.025, 1] } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                          rippleColor={
                            timeAttackLocked && isCorrectAnswer
                              ? 'rgba(255, 255, 255, 0.45)'
                              : 'rgba(139, 92, 246, 0.25)'
                          }
                          className={`w-full py-3 px-5 rounded-2xl text-left text-xs font-bold transition-all border group select-none ${
                            timeAttackLocked
                              ? isCorrectAnswer
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/10'
                                : isSelected
                                  ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/10'
                                  : darkMode 
                                    ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-40'
                              : darkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-violet-500/50 hover:bg-slate-750'
                                : 'bg-white border-slate-150 text-slate-700 hover:border-violet-300 hover:bg-violet-50/5 shadow-sm'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            timeAttackLocked && isCorrectAnswer 
                            ? 'bg-white border-white text-emerald-500' 
                            : timeAttackLocked && isSelected
                              ? 'bg-white border-white text-rose-500'
                              : 'border-transparent group-hover:border-current opacity-20'
                          }`}>
                            {timeAttackLocked && isCorrectAnswer ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-current" />
                            )}
                          </div>
                        </RippleButton>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Summary State (time expired)
                <div className="flex-grow p-6 flex flex-col justify-center items-center text-center gap-6">
                  {/* Big Expired Circle Illustration */}
                  <div className="relative">
                    <motion.div 
                      className="w-24 h-24 rounded-full bg-rose-500/10 flex items-center justify-center border-4 border-rose-500/30"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <Zap className="w-10 h-10 text-rose-500 fill-rose-500/10" />
                    </motion.div>
                    {timeAttackScore >= timeAttackHighScore && timeAttackScore > 0 && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-3 -right-3 bg-amber-500 text-white font-black text-[8px] uppercase tracking-wider px-2 py-1 rounded-xl shadow-md border-2 border-white"
                      >
                        👑 Rekor Baru
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-850'}`}>
                      Waktu Habis!
                    </h2>
                    <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Hasil Sesi Tantangan Anda
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className={`w-full p-5 rounded-3xl border-2 flex flex-col gap-4 max-w-sm ${
                    darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-100 shadow-inner'
                  }`}>
                    {/* Score stats list */}
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Skor Jawaban Benar:</span>
                      <span className="font-extrabold text-emerald-500 text-base">{timeAttackScore} kata</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Soal Dijawab:</span>
                      <span className={`font-extrabold text-sm ${darkMode ? 'text-white' : 'text-slate-800'}`}>{timeAttackTotal} soal</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rata-rata Akurasi:</span>
                      <span className="font-extrabold text-violet-500 text-sm">
                        {timeAttackTotal > 0 ? `${Math.round((timeAttackScore / timeAttackTotal) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2.5 w-full max-w-xs mt-3">
                    <button
                      onClick={startTimeAttack}
                      className="w-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider bg-violet-600 border border-violet-500 hover:bg-violet-700 text-white float-none py-4 px-6 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      Tantangan Lagi
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        switchView('mode_select');
                      }}
                      className={`w-full font-black text-xs uppercase tracking-wider py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] ${
                        darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100'
                      }`}
                    >
                      Kembali ke Menu Utama
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : view === 'listening_practice' ? (
            <motion.div
              key="listening_practice"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-250 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    setListeningActive(false);
                    switchView('mode_select');
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    if (currentTtsAudioRef.current) {
                      currentTtsAudioRef.current.pause();
                      currentTtsAudioRef.current = null;
                    }
                  }}
                  className={`p-2.5 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-205 shadow-sm'
                  }`}
                  title="Kembali ke Menu"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-850'} flex items-center gap-1.5 justify-center`}>
                    🎧 Latihan Mendengarkan
                  </h2>
                  <p className={`text-[9.5px] uppercase font-bold tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Level {currentLevel}: {levelsData[currentLevel]?.name.split(' (')[0] || ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {/* Hearts / Lives indicator */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < listeningLives 
                          ? 'text-rose-500 fill-rose-500' 
                          : 'text-slate-300 dark:text-slate-700'
                        } transition-colors`} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {!listeningCompleted ? (
                // Active Game State
                <div className="flex-grow p-6 flex flex-col justify-between gap-5">
                  
                  {/* Progress indicators */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <span className={`text-[10px] uppercase font-black tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Progres Latihan
                      </span>
                      <span className="text-xs font-mono font-black text-sky-500">
                        {listeningIndex + 1} / {Math.min(10, currentVocabList.length || levelsData[currentLevel]?.vocab?.length || 10)}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-sky-500 transition-all duration-300"
                        style={{ width: `${((listeningIndex + 1) / Math.min(10, currentVocabList.length || levelsData[currentLevel]?.vocab?.length || 10)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Core Listening Player Card */}
                  <div className={`p-6 py-8 rounded-[32px] border-2 flex flex-col items-center justify-center relative min-h-[200px] text-center ${
                    darkMode 
                    ? 'bg-slate-850/80 border-slate-800' 
                    : 'bg-slate-50/50 border-slate-100 shadow-inner'
                  }`}>
                    {/* Sound Waves Animation */}
                    <div className="flex items-center gap-1.5 mb-5 h-8">
                      {!listeningLocked ? (
                        <div className="flex items-end justify-center gap-1 h-6">
                          <span className="w-1 bg-sky-500 h-3 animate-pulse rounded-full" />
                          <span className="w-1 bg-sky-500 h-5 animate-pulse rounded-full style-delay-150" />
                          <span className="w-1 bg-sky-500 h-2 animate-pulse rounded-full style-delay-300" />
                          <span className="w-1 bg-sky-500 h-6 animate-pulse rounded-full style-delay-450" />
                          <span className="w-1 bg-sky-500 h-4 animate-pulse rounded-full style-delay-600" />
                        </div>
                      ) : (
                        <div className="flex items-end justify-center gap-1 h-3 opacity-30">
                          <span className="w-1 bg-slate-400 h-1.5 rounded-full" />
                          <span className="w-1 bg-slate-400 h-1.5 rounded-full" />
                          <span className="w-1 bg-slate-400 h-1.5 rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Speaking Button */}
                    {(() => {
                      const list = currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || []);
                      const question = list[listeningIndex];
                      if (!question) return <p className="text-slate-400 text-xs">Selesai...</p>;

                      return (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <button
                            onClick={() => {
                              playSfx('click');
                              speakJapanese(question.jpn);
                            }}
                            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all scale-100 active:scale-95 shadow-xl ${
                              darkMode 
                              ? 'bg-sky-500/15 text-sky-400 border-sky-500/40 hover:bg-sky-500/25 hover:border-sky-500/60 shadow-sky-950/50' 
                              : 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 hover:border-sky-300 shadow-sky-100/50'
                            }`}
                            title="Putar Kembali Audio"
                          >
                            <Volume2 className="w-10 h-10 animate-bounce" />
                          </button>
                          
                          <p className={`text-[10px] font-extrabold tracking-wider uppercase ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Klik untuk Dengarkan Lagi
                          </p>

                          {/* Reveal Japanese characters AFTER they select their answer */}
                          <div className={`mt-2 h-14 flex flex-col justify-center transition-all ${
                            listeningLocked ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                          }`}>
                            <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-850'}`} translate="no">
                              {question.jpn}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wide mt-0.5">
                              {question.romaji} {question.kanji ? `/ ${question.kanji}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Feedback Message */}
                  <div className="h-6 flex items-center justify-center">
                    {listeningLocked && (() => {
                      const list = currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || []);
                      const currentQ = list[listeningIndex];
                      const isCorrect = listeningSelected === currentQ?.ind;
                      return (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`text-xs font-black uppercase tracking-wider ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}
                        >
                          {isCorrect ? '✨ Jawaban Anda Benar!' : `❌ Salah! Jawabannya: ${currentQ?.ind}`}
                        </motion.span>
                      );
                    })()}
                  </div>

                  {/* Options List */}
                  <div className="flex flex-col gap-2">
                    {listeningOptions.map((opt, idx) => {
                      const list = currentVocabList.length > 0 ? currentVocabList : (levelsData[currentLevel]?.vocab || []);
                      const currentQ = list[listeningIndex];
                      const isCorrectAnswer = opt === currentQ?.ind;
                      const isSelected = opt === listeningSelected;

                      return (
                        <RippleButton
                          key={`${opt}-${idx}`}
                          onClick={() => handleListeningAnswer(opt)}
                          disabled={listeningLocked}
                          whileTap={{ scale: 0.955 }}
                          animate={isSelected ? { scale: [0.955, 1.025, 1] } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                          rippleColor={
                            listeningLocked && isCorrectAnswer
                              ? 'rgba(255, 255, 255, 0.45)'
                              : 'rgba(14, 165, 233, 0.25)'
                          }
                          className={`w-full py-3.5 px-5 rounded-2xl text-left text-xs font-bold transition-all border group select-none ${
                            listeningLocked
                              ? isCorrectAnswer
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg'
                                : isSelected
                                  ? 'bg-rose-500 border-rose-400 text-white shadow-lg'
                                  : darkMode 
                                    ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-40' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-40'
                              : darkMode
                                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-500/50 hover:bg-slate-750'
                                : 'bg-white border-slate-150 text-slate-700 hover:border-sky-300 hover:bg-sky-50/5 shadow-sm'
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            listeningLocked && isCorrectAnswer 
                            ? 'bg-white border-white text-emerald-500 shadow-md' 
                            : listeningLocked && isSelected
                              ? 'bg-white border-white text-rose-500 shadow-md'
                              : 'border-transparent group-hover:border-current opacity-20'
                          }`}>
                            {listeningLocked && isCorrectAnswer ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-current" />
                            ) : (
                              <div className="w-1 h-1 rounded-full bg-current" />
                            )}
                          </div>
                        </RippleButton>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Summary State
                <div className="flex-grow p-6 flex flex-col justify-center items-center text-center gap-6">
                  {/* Results Trophy */}
                  <div className="relative">
                    <motion.div 
                      className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                        listeningScore >= 7
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Trophy className={`w-12 h-12 ${listeningScore >= 7 ? 'text-emerald-500' : 'text-amber-500'}`} />
                    </motion.div>
                  </div>

                  <div>
                    <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-850'}`}>
                      Latihan Selesai!
                    </h2>
                    <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Penilaian Latihan Mendengarkan
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className={`w-full p-5 rounded-3xl border-2 flex flex-col gap-4 max-w-sm ${
                    darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-100 shadow-inner'
                  }`}>
                    {/* Score stats list */}
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Benar:</span>
                      <span className="font-extrabold text-emerald-500 text-sm">{listeningScore} / {listeningTotal} kata</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Soal:</span>
                      <span className={`font-extrabold text-xs ${darkMode ? 'text-white' : 'text-slate-800'}`}>{listeningTotal} kata</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rata-rata Akurasi:</span>
                      <span className="font-extrabold text-sky-500 text-sm">
                        {listeningTotal > 0 ? `${Math.round((listeningScore / listeningTotal) * 100)}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2.5 w-full max-w-xs mt-3">
                    <button
                      onClick={startListeningPractice}
                      className="w-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider bg-sky-600 border border-sky-500 hover:bg-sky-700 text-white py-4 px-6 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Headphones className="w-3.5 h-3.5 text-white" />
                      Latihan Lagi
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        switchView('mode_select');
                      }}
                      className={`w-full font-black text-xs uppercase tracking-wider py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] ${
                        darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100'
                      }`}
                    >
                      Kembali ke Menu Utama
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : view === 'word_match' ? (
            <motion.div
              key="word_match"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`max-w-[420px] w-full rounded-[48px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-250 flex flex-col min-h-[75vh] ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-700/50 shadow-slate-950/50' 
                : 'bg-white/95 border-white/40 shadow-slate-200'
              }`}
            >
              {/* Header */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10">
                <button
                  onClick={() => {
                    playSfx('click');
                    setMatchActive(false);
                    switchView('mode_select');
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    if (currentTtsAudioRef.current) {
                      currentTtsAudioRef.current.pause();
                      currentTtsAudioRef.current = null;
                    }
                  }}
                  className={`p-2.5 rounded-full border transition-all ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-205 shadow-sm'
                  }`}
                  title="Kembali ke Menu"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <h2 className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-850'} flex items-center gap-1.5 justify-center`}>
                    🎮 Pencocokan Kata
                  </h2>
                  <p className={`text-[9.5px] uppercase font-bold tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Level {currentLevel}: {levelsData[currentLevel]?.name.split(' (')[0] || ""}
                  </p>
                </div>
                <div className={`p-2 px-3 rounded-2xl flex items-center gap-1.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <span className="text-xs font-mono font-extrabold text-pink-500">
                    ⏱️ {matchTime}s
                  </span>
                </div>
              </div>

              {!matchCompleted ? (
                // Active Game Grid
                <div className="flex-grow p-5 flex flex-col justify-between gap-4">
                  {/* Stats Head */}
                  <div className="flex justify-between items-center px-1">
                    <span className={`text-[10px] uppercase font-black tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Misi: Pasangkan 6 Kosakata
                    </span>
                    <span className={`text-[10.5px] font-black ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Langkah: <span className="text-pink-500 font-mono font-extrabold">{matchMoves}</span>
                    </span>
                  </div>

                  {/* Grid Container */}
                  <div className="grid grid-cols-3 gap-2.5 flex-grow content-center py-2">
                    {matchCards.map((card, idx) => {
                      const isSelected = matchSelected.some(c => c.id === card.id);
                      const isMatched = card.isMatched;
                      const hasPairSelected = matchSelected.length === 2;
                      const isWrong = hasPairSelected && isSelected && !matchSelected[0].isMatched && (matchSelected[0].pairId !== matchSelected[1].pairId);

                      return (
                        <motion.button
                          key={card.id}
                          layout
                          onClick={() => handleMatchCardClick(card)}
                          disabled={isMatched || (hasPairSelected && !isSelected)}
                          initial={{ opacity: 0, scale: 0.8, y: 15 }}
                          animate={{ 
                            opacity: isMatched ? 0.42 : 1, 
                            scale: isSelected ? 1.04 : 1,
                            y: 0 
                          }}
                          whileHover={!isMatched ? { scale: 1.03 } : {}}
                          whileTap={!isMatched ? { scale: 0.97 } : {}}
                          className={`aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center p-2.5 relative cursor-pointer select-none transition-all duration-200 text-center ${
                            isMatched
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 pointer-events-none'
                              : isWrong
                                ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-md shadow-rose-500/10 animate-bounce'
                                : isSelected
                                  ? 'bg-pink-500/10 border-pink-500 text-pink-500 shadow-lg shadow-pink-500/10 ring-2 ring-pink-500/20'
                                  : darkMode
                                    ? 'bg-slate-850 border-slate-700 hover:border-pink-500/30 text-slate-100 hover:bg-slate-800'
                                    : 'bg-white border-slate-150 hover:border-pink-500/30 text-slate-800 hover:bg-pink-50/5 shadow-sm'
                          }`}
                        >
                          <span 
                            className={`text-xs leading-snug font-extrabold break-normal hyphens-auto tracking-normal max-w-full ${
                              card.type === 'jpn' ? 'font-sans' : 'font-sans tracking-tight line-clamp-2'
                            }`}
                            translate="no"
                          >
                            {card.text}
                          </span>
                          
                          {/* JPN / IND Tiny Badge */}
                          <div className={`absolute bottom-1 right-1 px-1 rounded-[4px] text-[6.5px] uppercase font-black tracking-widest ${
                            isMatched 
                              ? 'bg-emerald-500/10 text-emerald-500/60'
                              : isSelected
                                ? 'bg-pink-500/10 text-pink-500'
                                : darkMode 
                                  ? 'bg-slate-800 text-slate-500' 
                                  : 'bg-slate-100 text-slate-400'
                          }`}>
                            {card.type}
                          </div>

                          {/* Matching Success Icon Overlay */}
                          {isMatched && (
                            <div className="absolute top-1 left-1.5 text-[8.5px]">
                              ✅
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Audio Clue Help message */}
                  <p className={`text-[9.5px] text-center italic font-medium leading-relaxed px-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    💡 Klik ubin bahasa Jepang, lalu cari ubin artinya dalam bahasa Indonesia untuk memasangkannya!
                  </p>
                </div>
              ) : (
                // Summary State
                <div className="flex-grow p-6 flex flex-col justify-center items-center text-center gap-6">
                  {/* Results Trophy */}
                  <div className="relative">
                    <motion.div 
                      className="w-24 h-24 rounded-full flex items-center justify-center border-4 bg-pink-500/10 border-pink-500/30"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Trophy className="w-12 h-12 text-pink-500" />
                    </motion.div>
                  </div>

                  <div>
                    <h2 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-850'}`}>
                      Kombinasi Sempurna!
                    </h2>
                    <p className={`text-[10px] uppercase font-black tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Hasil Game Pencocokan Kata
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className={`w-full p-5 rounded-3xl border-2 flex flex-col gap-4 max-w-sm ${
                    darkMode ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/50 border-slate-100 shadow-inner'
                  }`}>
                    {/* Time Stat */}
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Waktu Penyelesaian:</span>
                      <span className="font-extrabold text-pink-500 text-sm font-mono">{matchTime} detik</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    {/* Moves Stat */}
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total Langkah:</span>
                      <span className={`font-extrabold text-xs text-slate-800 dark:text-white`}>{matchMoves} kali</span>
                    </div>
                    <div className="h-[1px] bg-slate-500/10 w-full" />
                    {/* Efficiency Score */}
                    <div className="flex justify-between items-center text-xs text-left">
                      <span className={`font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Efisiensi Memori:</span>
                      <span className="font-extrabold text-emerald-500 text-sm">
                        {matchMoves > 0 ? `${Math.round((6 / matchMoves) * 100)}%` : '100%'}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-col gap-2.5 w-full max-w-xs mt-3">
                    <button
                      onClick={startWordMatch}
                      className="w-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider bg-pink-600 border border-pink-500 hover:bg-pink-700 text-white py-4 px-6 rounded-2xl shadow-lg active:scale-[0.98] transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 text-white" />
                      Main Lagi
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        switchView('mode_select');
                      }}
                      className={`w-full font-black text-xs uppercase tracking-wider py-4 px-6 rounded-2xl border transition-all active:scale-[0.98] ${
                        darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' 
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm hover:bg-slate-100'
                      }`}
                    >
                      Kembali ke Menu Utama
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="quiz"
              custom={{ direction: slideDirection, effect: transitionEffect }}
              variants={viewVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            className={`max-w-sm w-full border backdrop-blur-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col min-h-[75vh] transition-colors duration-200 ${
              darkMode 
              ? 'bg-slate-900/90 border-slate-700/50 shadow-slate-950/50' 
              : 'bg-white/80 border-white/40 shadow-slate-200'
            }`}
            translate="no"
          >
          {/* Header Section */}
          <div className={`pt-4 pb-1 px-6 flex flex-col items-center gap-2 relative transition-colors ${
            darkMode ? 'bg-slate-900/40' : 'bg-amber-50/60'
          }`}>
            {/* Back Button */}
            <button 
              onClick={() => {
                playSfx('click');
                if (multiplayerMode) {
                  switchView('duel_setup');
                } else {
                  switchView('mode_select');
                }
                setMultiplayerMode(null);
              }}
              className={`absolute top-8 left-6 w-8 h-8 flex items-center justify-center rounded-full transition-colors shadow-sm border ${
                darkMode 
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-slate-200'
              }`}
              title="Kembali ke Menu Sebelum"
              aria-label="Kembali ke menu pemilihan mode"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Duel Header Overlay */}
            {multiplayerMode && (
              <div className="flex gap-4 mb-2">
                <div className={`px-4 py-2 rounded-2xl border-2 transition-all relative ${multiplayerMode === 'p1' ? 'bg-blue-500 text-white border-blue-400 scale-105 shadow-md' : (darkMode ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60' : 'bg-white text-slate-400 border-slate-100 opacity-60')}`}>
                  <p className="text-[8px] font-black uppercase">Player 1</p>
                  <p className="font-bold">{p1Stats.score}</p>
                  
                  {/* Floating points/particles */}
                  <AnimatePresence>
                    {scorePopups.filter(p => p.type === 'p1').map(p => (
                      <div key={p.id} className="absolute left-1/2 bottom-full mb-1 z-30 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8], y: -50, x: '-50%' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="text-emerald-405 text-emerald-400 font-extrabold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap"
                        >
                          {p.text}
                        </motion.div>
                        {[...Array(5)].map((_, idx) => {
                          const angle = (idx * 360 / 5) * (Math.PI / 180);
                          const distance = 25 + Math.random() * 20;
                          const targetX = Math.cos(angle) * distance;
                          const targetY = -40 + Math.sin(angle) * distance;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 1, scale: 1.2, x: 0, y: 0 }}
                              animate={{ opacity: [1, 0.8, 0], scale: [1.2, 0.5, 0], x: targetX, y: targetY }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className="absolute w-1.5 h-1.5 rounded-full bg-emerald-450 bg-emerald-400"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex items-center text-slate-300 font-black italic">VS</div>
                <div className={`px-4 py-2 rounded-2xl border-2 transition-all relative ${multiplayerMode === 'p2' ? 'bg-rose-500 text-white border-rose-400 scale-105 shadow-md' : (darkMode ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-60' : 'bg-white text-slate-400 border-slate-100 opacity-60')}`}>
                  <p className="text-[8px] font-black uppercase">Player 2</p>
                  <p className="font-bold">{p2Stats.score}</p>
                  
                  {/* Floating points/particles */}
                  <AnimatePresence>
                    {scorePopups.filter(p => p.type === 'p2').map(p => (
                      <div key={p.id} className="absolute left-1/2 bottom-full mb-1 z-30 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8], y: -50, x: '-50%' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="text-rose-400 font-extrabold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap"
                        >
                          {p.text}
                        </motion.div>
                        {[...Array(5)].map((_, idx) => {
                          const angle = (idx * 360 / 5) * (Math.PI / 180);
                          const distance = 25 + Math.random() * 20;
                          const targetX = Math.cos(angle) * distance;
                          const targetY = -40 + Math.sin(angle) * distance;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 1, scale: 1.2, x: 0, y: 0 }}
                              animate={{ opacity: [1, 0.8, 0], scale: [1.2, 0.5, 0], x: targetX, y: targetY }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className="absolute w-1.5 h-1.5 rounded-full bg-rose-400"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Remote Duel Header Overlay */}
            {isRemoteMode && remoteDuel && (
              <div className="flex flex-col items-center gap-3 w-full mb-2">
                <div className="flex gap-4 w-full justify-center">
                  <div className={`flex-1 max-w-[120px] px-3 py-2 rounded-2xl border-2 transition-all shadow-md relative ${
                    darkMode ? 'bg-blue-600 border-blue-500' : 'bg-blue-500 border-blue-400'
                  } text-white`}>
                    <p className="text-[7px] font-black uppercase flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Anda
                    </p>
                    <p className="font-bold text-sm">
                      {user?.uid === remoteDuel.creator?.uid ? (remoteDuel.scores?.creator ?? 0) : (remoteDuel.scores?.opponent ?? 0)} pts
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (user?.uid === remoteDuel.creator?.uid ? (remoteDuel.lives?.creator ?? 5) : (remoteDuel.lives?.opponent ?? 5)) ? 'bg-white' : 'bg-white/20'}`} />
                      ))}
                    </div>

                    {/* Floating points/particles */}
                    <AnimatePresence>
                      {scorePopups.filter(p => p.type === 'remote-self').map(p => (
                        <div key={p.id} className="absolute left-1/2 bottom-full mb-1 z-30 pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                            animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8], y: -50, x: '-50%' }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="text-emerald-400 font-extrabold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap"
                          >
                            {p.text}
                          </motion.div>
                          {[...Array(5)].map((_, idx) => {
                            const angle = (idx * 360 / 5) * (Math.PI / 180);
                            const distance = 25 + Math.random() * 20;
                            const targetX = Math.cos(angle) * distance;
                            const targetY = -40 + Math.sin(angle) * distance;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 1, scale: 1.2, x: 0, y: 0 }}
                                animate={{ opacity: [1, 0.8, 0], scale: [1.2, 0.5, 0], x: targetX, y: targetY }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400"
                              />
                            );
                          })}
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  <div className={`flex items-center font-black italic text-[10px] ${darkMode ? 'text-slate-700' : 'text-slate-300'}`}>VS</div>
                  
                  <div className={`flex-1 max-w-[120px] px-3 py-2 rounded-2xl border-2 transition-all ${remoteDuel.opponent ? 'bg-rose-500 text-white border-rose-400 shadow-md' : (darkMode ? 'bg-slate-800 text-slate-600 border-slate-700' : 'bg-slate-50 text-slate-300 border-slate-100')}`}>
                    <p className="text-[7px] font-black uppercase flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${remoteDuel.opponent ? 'bg-emerald-400' : (darkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                      {remoteDuel.opponent ? (user?.uid === remoteDuel.creator?.uid ? remoteDuel.opponent.name : (remoteDuel.creator?.name || 'Creator')) : "Menunggu..."}
                    </p>
                    <p className="font-bold text-sm">
                      {user?.uid === remoteDuel.creator?.uid ? (remoteDuel.scores?.opponent ?? 0) : (remoteDuel.scores?.creator ?? 0)} pts
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < (user?.uid === remoteDuel.creator?.uid ? (remoteDuel.lives?.opponent ?? 5) : (remoteDuel.lives?.creator ?? 5)) ? 'bg-white' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                {remoteDuel.status === 'pending' && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`p-2 rounded-xl border w-full transition-colors ${
                      darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    <p className={`text-[8px] font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>MENUNGGU TEMAN... BAGIKAN ID: <span className="text-[10px] font-black">{remoteDuel.id}</span></p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Stats Bar */}
            {!multiplayerMode && (
              <div className="flex items-center gap-3">
                {/* Score Pill */}
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg border transition-colors relative ${
                  darkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-900 text-white border-slate-700'
                }`}>
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black tracking-widest uppercase">
                    {score} / {currentVocabList.length}
                  </span>

                  {/* Floating points/particles */}
                  <AnimatePresence>
                    {scorePopups.filter(p => p.type === 'single').map(p => (
                      <div key={p.id} className="absolute left-1/2 bottom-full mb-1 z-30 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 10, x: '-50%' }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1.2, 0.8], y: -50, x: '-50%' }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="text-amber-400 font-extrabold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap"
                        >
                          {p.text}
                        </motion.div>
                        {[...Array(5)].map((_, idx) => {
                          const angle = (idx * 360 / 5) * (Math.PI / 180);
                          const distance = 25 + Math.random() * 20;
                          const targetX = Math.cos(angle) * distance;
                          const targetY = -40 + Math.sin(angle) * distance;
                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 1, scale: 1.2, x: 0, y: 0 }}
                              animate={{ opacity: [1, 0.8, 0], scale: [1.2, 0.5, 0], x: targetX, y: targetY }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className="absolute w-1.5 h-1.5 rounded-full bg-amber-400"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Lives Pill */}
                <div className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full shadow-lg border transition-all ${
                  lives <= 1 
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse' 
                    : darkMode 
                      ? 'bg-slate-800 text-rose-400 border-slate-700'
                      : 'bg-white text-rose-500 border-rose-100'
                }`}>
                  <Heart className={`w-3.5 h-3.5 ${lives > 0 ? 'fill-current' : ''}`} />
                  <span className="text-xs font-black">{lives}</span>
                </div>
              </div>
            )}

            {multiplayerMode && (
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-colors ${
                darkMode ? 'bg-slate-800/40 text-rose-400 border-rose-500/20' : 'bg-white/50 text-rose-500 border-white/60'
              }`}>
                <Heart className={`w-3 h-3 ${ (multiplayerMode === 'p1' ? p1Stats.lives : p2Stats.lives) > 0 ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-black">{multiplayerMode === 'p1' ? p1Stats.lives : p2Stats.lives} Sisa Nyawa</span>
              </div>
            )}

          {/* Level Selection Section */}
          <motion.div 
            key={`bottom-levels-${activeMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-wrap gap-1.5 w-full px-2 justify-center"
          >
            {Object.keys(levelsData)
              .map(Number)
              .map((levelNum, index) => {
                const mastery = getLevelProgress(levelNum);
                const isActive = !isFavoritesMode && currentLevel === levelNum;
                return (
                  <motion.button
                    key={levelNum}
                    initial={{ opacity: 0, scale: 0.75, y: 12 }}
                    animate={isActive ? {
                      opacity: 1,
                      y: 0,
                      scale: [1, 1.05, 1],
                      boxShadow: darkMode
                        ? ["0px 0px 0px rgba(249,115,22,0)", "0px 0px 8px rgba(249,115,22,0.4)", "0px 0px 0px rgba(249,115,22,0)"]
                        : ["0px 0px 0px rgba(249,115,22,0)", "0px 0px 8px rgba(249,115,22,0.3)", "0px 0px 0px rgba(249,115,22,0)"]
                    } : {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      boxShadow: "0px 1px 2px rgba(0,0,0,0.05)"
                    }}
                    transition={isActive ? {
                      opacity: { type: "spring", stiffness: 220, damping: 16, delay: Math.min(index * 0.02, 0.3) },
                      y: { type: "spring", stiffness: 220, damping: 16, delay: Math.min(index * 0.02, 0.3) },
                      scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                      boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                    } : {
                      opacity: { type: "spring", stiffness: 220, damping: 16, delay: Math.min(index * 0.02, 0.3) },
                      y: { type: "spring", stiffness: 220, damping: 16, delay: Math.min(index * 0.02, 0.3) },
                      scale: { duration: 0.15 },
                      boxShadow: { duration: 0.15 }
                    }}
                    whileHover={{ scale: 1.08, y: -2, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => changeLevel(levelNum)}
                    className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shadow-sm border relative overflow-hidden ${
                      isActive 
                        ? 'bg-orange-600 text-white border-orange-400 font-black scale-105' 
                        : darkMode
                          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-orange-50'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1, 0.6], y: [4, -12] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="absolute pointer-events-none text-[6px] select-none text-yellow-300 left-3"
                      >
                        ✨
                      </motion.span>
                    )}
                    <div className="flex items-center gap-1.5 z-10">
                      <motion.span 
                        animate={isActive ? {
                          scale: [1, 1.25, 1],
                          rotate: [0, 10, -10, 0],
                          y: [0, -2, 0]
                        } : { scale: 1, rotate: 0, y: 0 }}
                        transition={isActive ? {
                          repeat: Infinity,
                          duration: 1.5,
                          ease: "easeInOut"
                        } : {}}
                        className="text-[11px] inline-block"
                      >
                        {levelsData[levelNum].icon}
                      </motion.span>
                      <span>Lv.{levelNum}</span>
                    </div>
                    {mastery > 0 && <span className="text-[7px] z-10 opacity-70">({Math.round(mastery)}%)</span>}
                    <div className={`absolute bottom-0 left-0 w-full h-[3px] transition-colors ${darkMode ? 'bg-slate-900' : 'bg-black/5'}`}>
                      <div 
                        className={`h-full ${isActive ? 'bg-white/40' : 'bg-orange-400'}`} 
                        style={{ width: `${mastery}%` }} 
                        />
                    </div>
                  </motion.button>
                );
              })}
            
            {/* Favorites Mode Button */}
            <button
              onClick={startFavoritesQuiz}
              aria-label={isFavoritesMode ? "Keluar dari mode kuis kata favorit" : "Buka mode kuis kata favorit"}
              aria-pressed={isFavoritesMode}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap transition-all flex items-center gap-1 shadow-sm border ${
                isFavoritesMode 
                ? 'bg-amber-600 text-white border-amber-400 font-black scale-105 shadow-amber-500/30' 
                : darkMode
                  ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-amber-700 border-slate-300 hover:bg-amber-50 font-extrabold'
              }`}
            >
              <Star className={`w-3 h-3 ${isFavoritesMode ? 'fill-white' : (darkMode ? 'fill-amber-400' : 'fill-amber-500')}`} />
              Favorit
            </button>

            {/* Sound Toggle (Moved Here) */}
            <button 
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) {
                  sounds.click.play();
                  announce("Suara kuis diaktifkan");
                } else {
                  announce("Suara kuis dinonaktifkan");
                }
              }}
              aria-label={soundEnabled ? "Nonaktifkan suara efek kuis" : "Aktifkan suara efek kuis"}
              aria-pressed={soundEnabled}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-center shadow-sm border ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
              title={soundEnabled ? "Matikan Suara" : "Nyalakan Suara"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-500" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
            </button>
          </motion.div>
        </div>

        {/* Quiz Body */}
        <div id="quiz-container" className="px-6 flex-grow flex flex-col">
          {(!activeQuestion || options.length === 0) ? (
            <div className="flex-grow flex items-center justify-center">
              <Loader message="Menyiapkan Kuis..." />
            </div>
          ) : !quizFinished ? (
            <div className="flex flex-col flex-grow py-2">
              {/* Progress Indicator */}
              <div 
                role="progressbar" 
                aria-valuenow={Math.round(progress)} 
                aria-valuemin={0} 
                aria-valuemax={100} 
                aria-label={`Kemajuan kuis: ${Math.round(progress)} persen`}
                className={`w-full h-1.5 rounded-full overflow-hidden mb-4 transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}
              >
                <motion.div 
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full bg-orange-500"
                />
              </div>

              {/* Animated Question & Answers Container */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${currentLevel}-${currentIndex}`}
                  initial={{ opacity: 0.85, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  transition={{ 
                    duration: 0.05,
                    ease: "easeOut"
                  }}
                  className="flex flex-col flex-grow"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Question Box */}
                  <motion.div 
                    whileHover={{ y: -1 }}
                    className={`rounded-[24px] p-4 text-center border-2 transition-all shadow-xl mb-3 relative overflow-hidden group ${
                      darkMode 
                      ? 'bg-slate-800/60 border-amber-500/30' 
                      : 'bg-white/80 border-amber-200'
                    }`}
                  >
                  {/* Decorative background for question box */}
                  <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[30px] opacity-10 ${themeClasses.bg}`} />
                  
                  {isRemoteMode && remoteDuel?.status === 'ongoing' && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-linear ${
                          duelTimeLeft <= 2 
                            ? 'bg-rose-500 animate-pulse' 
                            : 'bg-orange-400'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, (duelTimeLeft / 5) * 100))}%` }}
                      />
                    </div>
                  )}

                  {/* Question Number Badge with Subtle Animated Progress Ring */}
                  {!(isRemoteMode && remoteDuel) && (
                    <div 
                      className="absolute top-2.5 left-3 flex items-center gap-1.5 select-none z-10"
                      title={`Soal ${currentIndex + 1} dari ${currentVocabList.length}`}
                      aria-label={`Soal nomor ${currentIndex + 1} dari ${currentVocabList.length}`}
                    >
                      <motion.div 
                        key={`ring-bounce-${currentIndex}`}
                        initial={{ scale: 0.88 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative flex items-center justify-center w-7 h-7 rounded-full shadow-xs ${
                          darkMode ? 'bg-slate-900/50' : 'bg-amber-500/5'
                        }`}
                      >
                        <svg className="w-7 h-7 -rotate-90 transform" viewBox="0 0 32 32">
                          {/* Background Track Ring */}
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            strokeWidth="2.5"
                            fill="none"
                            className={darkMode ? "stroke-slate-700/60" : "stroke-amber-200/80"}
                          />
                          {/* Ambient Glow Arc */}
                          <motion.circle
                            cx="16"
                            cy="16"
                            r="12"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            fill="none"
                            className="stroke-amber-400/25 blur-[1px]"
                            strokeDasharray={75.4}
                            initial={false}
                            animate={{ strokeDashoffset: 75.4 - (questionProgressPercent / 100) * 75.4 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                          {/* Dynamic Active Progress Ring */}
                          <motion.circle
                            cx="16"
                            cy="16"
                            r="12"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                            className="stroke-amber-500"
                            strokeDasharray={75.4}
                            initial={false}
                            animate={{ strokeDashoffset: 75.4 - (questionProgressPercent / 100) * 75.4 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                          />
                        </svg>
                        {/* Question Number in Ring Center */}
                        <motion.span 
                          key={`q-idx-${currentIndex}`}
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className={`absolute text-[10px] font-black tracking-tight leading-none ${
                            darkMode ? 'text-amber-400' : 'text-amber-700'
                          }`}
                        >
                          {currentIndex + 1}
                        </motion.span>
                      </motion.div>
                      <span className={`text-[9px] font-bold tracking-tight opacity-75 ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        /{currentVocabList.length}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => activeQuestion && toggleFavorite(activeQuestion)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all hover:scale-110 active:scale-90 ${
                      darkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-amber-100/30 hover:bg-amber-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 transition-all ${isFavorited(activeQuestion) ? 'fill-amber-400 text-amber-500' : (darkMode ? 'text-slate-600' : 'text-slate-200')}`} />
                  </button>
                  
                  {isRemoteMode && remoteDuel && (
                    <div className="mb-2.5 flex items-center justify-between text-[9px] font-black uppercase tracking-wider px-1 border-b border-dashed border-slate-500/20 pb-2 pt-1.5">
                      <div className="flex items-center gap-1.5">
                        {/* Remote Duel Question Progress Ring */}
                        <div className="relative flex items-center justify-center w-6 h-6">
                          <svg className="w-6 h-6 -rotate-90 transform" viewBox="0 0 32 32">
                            <circle
                              cx="16"
                              cy="16"
                              r="12"
                              strokeWidth="2.5"
                              fill="none"
                              className={darkMode ? "stroke-slate-700/60" : "stroke-amber-200/80"}
                            />
                            <motion.circle
                              cx="16"
                              cy="16"
                              r="12"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              fill="none"
                              className="stroke-amber-500"
                              strokeDasharray={75.4}
                              initial={false}
                              animate={{ strokeDashoffset: 75.4 - (questionProgressPercent / 100) * 75.4 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                            />
                          </svg>
                          <span className="absolute text-[8px] font-black text-amber-500">
                            {currentIndex + 1}
                          </span>
                        </div>
                        <span className={isMyTurn ? 'text-emerald-500 animate-pulse font-black' : 'text-slate-500'}>
                          {isMyTurn ? '🟢 GILIRAN ANDA' : '⏳ GILIRAN LAWAN'}
                        </span>
                      </div>
                      <span className={duelTimeLeft <= 2 ? 'text-rose-500 font-black animate-pulse' : 'text-slate-500'}>
                        Waktu: {Math.max(0, duelTimeLeft)}s
                      </span>
                    </div>
                  )}

                  {renderQuestionBody()}
                </motion.div>

                {/* Answers Vertical List */}
                <div 
                  className="flex flex-col gap-1.5 mb-2" 
                  key={`options-${currentIndex}`}
                  role="group" 
                  aria-label="Pilihan jawaban kuis"
                >
                  {options.map((opt, idx) => {
                    const isSelected = selectedInd === opt.ind;
                    const isTargetCorrect = answerLock && opt.ind === activeQuestion?.ind;
                    const isTargetWrong = answerLock && isSelected && opt.ind !== activeQuestion?.ind;

                    return (
                      <RippleButton
                        key={`${opt.ind}-${idx}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={
                          isSelected 
                            ? { opacity: 1, y: 0, scale: [0.96, 1.025, 1] } 
                            : { opacity: 1, y: 0, scale: 1 }
                        }
                        transition={{ duration: 0.22, delay: isSelected ? 0 : idx * 0.02, ease: "easeOut" }}
                        whileHover={!(isRemoteMode && !isMyTurn) ? { x: 3, scale: 1.01 } : {}}
                        whileTap={!(isRemoteMode && !isMyTurn) ? { scale: 0.955 } : {}}
                        rippleColor={
                          isTargetCorrect
                            ? 'rgba(255, 255, 255, 0.5)'
                            : isTargetWrong
                              ? 'rgba(255, 255, 255, 0.45)'
                              : darkMode
                                ? 'rgba(244, 63, 94, 0.3)'
                                : 'rgba(244, 63, 94, 0.2)'
                        }
                        style={{ willChange: 'transform, opacity' }}
                        onClick={() => handleAnswer(opt.ind)}
                        disabled={answerLock || (isRemoteMode && (!isMyTurn || remoteDuel?.status !== 'ongoing'))}
                        aria-label={`Pilihan jawaban ${idx + 1}: ${opt.ind}`}
                        aria-pressed={isSelected}
                        className={`w-full py-2.5 px-5 rounded-[20px] text-sm font-bold transition-all shadow-md border-2 group ${
                          (isRemoteMode && !isMyTurn) ? 'cursor-not-allowed opacity-60' : ''
                        } ${
                          answerLock
                            ? opt.ind === activeQuestion?.ind
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30'
                              : opt.ind === selectedInd
                                ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/30'
                                : darkMode 
                                  ? 'bg-slate-900 border-slate-800 text-slate-500 opacity-50' 
                                  : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50'
                            : darkMode
                              ? 'bg-slate-800 border-slate-700 hover:border-rose-500/50 hover:bg-slate-700 text-slate-100'
                              : 'bg-white border-slate-200 hover:border-rose-400 hover:bg-rose-50/20 text-slate-900 shadow-slate-200/60'
                        }`}
                      >
                        <span translate="no">{opt.ind}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          answerLock && opt.ind === activeQuestion?.ind 
                          ? 'bg-white border-white text-emerald-600' 
                          : answerLock && opt.ind === selectedInd
                            ? 'bg-white border-white text-rose-600'
                            : 'border-transparent group-hover:border-current opacity-20'
                        }`}>
                          {answerLock && opt.ind === activeQuestion?.ind ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          ) : answerLock && opt.ind === selectedInd ? (
                            <div className="w-1.5 h-1.5 bg-current rotate-45" style={{ width: '8px', height: '2px', borderRadius: '1px' }} />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-current" />
                          )}
                        </div>
                      </RippleButton>
                    );
                  })}
                </div>

                {/* Feedback Slot */}
                <div className="h-6 text-center flex items-center justify-center mb-1" role="status" aria-live="polite">
                  <AnimatePresence mode="wait">
                    {feedback.type && (
                      <motion.div
                        key={feedback.message}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
                        className={`text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest ${
                          feedback.type === 'correct' 
                            ? (darkMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-emerald-100 text-emerald-900 border border-emerald-300') 
                            : (darkMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-rose-100 text-rose-900 border border-rose-300')
                        }`}
                      >
                        {feedback.message}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Vertical Spacer removed to trim space */}
                
                {/* Footer Action */}
                {!isRemoteMode && (
                  <div className="pb-1">
                    <button
                      onClick={nextQuestion}
                      disabled={!answerLock || lives === 0}
                      className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        answerLock && lives > 0
                          ? darkMode ? 'bg-slate-100 text-slate-900 shadow-xl scale-105' : 'bg-slate-900 text-white shadow-xl hover:bg-black active:scale-95'
                          : darkMode ? 'bg-slate-800 text-slate-700' : 'bg-slate-100/50 text-slate-300 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      Selanjutnya
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (() => {
            const finalScoreVal = multiplayerMode 
              ? (multiplayerMode === 'p1' ? p1Stats.score : p2Stats.score)
              : score;
            const totalVocabCount = currentVocabList.length || 1;
            const accuracyPct = Math.min(100, Math.round((finalScoreVal / totalVocabCount) * 100));
            const isSuccess = lives > 0;
            const starsCount = accuracyPct >= 90 ? 3 : accuracyPct >= 60 ? 2 : 1;
            const isPerfect = isSuccess && accuracyPct === 100;
            const xpEarned = finalScoreVal * 10 + (isPerfect ? 50 : 0);

            // Rich, motivating achievement celebration for standard solo level completion
            if (!isRemoteMode && !multiplayerMode) {
              return (
                <AchievementCelebration
                  isSuccess={isSuccess}
                  isPerfect={isPerfect}
                  score={finalScoreVal}
                  totalVocabCount={totalVocabCount}
                  accuracyPct={accuracyPct}
                  starsCount={starsCount}
                  xpEarned={xpEarned}
                  currentLevel={currentLevel}
                  levelName={levelsData[currentLevel]?.name}
                  darkMode={darkMode}
                  isFavoritesMode={isFavoritesMode}
                  onNextLevel={currentLevel < 17 ? () => {
                    switchView('quiz', {
                      levelNumber: currentLevel + 1,
                      beforeChange: () => changeLevel(currentLevel + 1),
                    });
                  } : undefined}
                  onRetry={() => changeLevel(currentLevel)}
                  onBackToMenu={() => switchView('mode_select')}
                  onShare={shareScore}
                  playSfx={playSfx}
                />
              );
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 25, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 24 }}
                className="text-center py-6 flex flex-col items-center flex-grow w-full"
              >
                {/* Visual Emblem with Rotating Aura & Particles */}
                <div className="relative mb-5">
                  {/* Celebratory Rotating Aura for Success */}
                  {isSuccess && !isRemoteMode && (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                        style={{ willChange: 'transform' }}
                        className="absolute -inset-6 rounded-full opacity-35 blur-xl bg-[conic-gradient(from_0deg,#f59e0b,#fbbf24,#f43f5e,#a855f7,#3b82f6,#10b981,#f59e0b)]"
                      />
                      {/* Ambient Floating Celebration Sparkles */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        {[...Array(14)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0], 
                              scale: [0, 1.2, 0.4],
                              x: [(Math.random() - 0.5) * 180, (Math.random() - 0.5) * 360],
                              y: [(Math.random() - 0.5) * 180, (Math.random() - 0.5) * 360],
                            }}
                            transition={{ 
                              duration: 1.2 + (i % 3) * 0.4, 
                              repeat: Infinity,
                              delay: (i % 5) * 0.25
                            }}
                            className={`absolute w-2 h-2 rounded-full ${
                              i % 3 === 0 ? 'bg-amber-400 shadow-xs shadow-amber-300' : i % 3 === 1 ? 'bg-rose-400' : 'bg-emerald-400'
                            }`}
                            style={{ left: '50%', top: '50%' }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    style={{ willChange: 'transform' }}
                    className={`absolute inset-0 rounded-full blur-[22px] opacity-25 ${lives === 0 ? 'bg-rose-500' : 'bg-amber-500'}`}
                  />

                  {/* Main Trophy or Heart Emblem Box */}
                  <div className={`w-28 h-28 rounded-[38px] flex items-center justify-center relative shadow-2xl transition-all border-4 ${
                    lives === 0 
                    ? (darkMode ? 'bg-slate-800 border-rose-500 text-rose-500 shadow-rose-500/20' : 'bg-white border-rose-400 text-rose-500 shadow-rose-500/20') 
                    : (darkMode ? 'bg-slate-800 border-amber-500 text-amber-500 shadow-amber-500/25' : 'bg-white border-amber-400 text-amber-500 shadow-amber-500/25')
                  }`}>
                    {lives === 0 ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Heart className="w-14 h-14 fill-current" />
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ rotate: -180, scale: 0 }} 
                        animate={{ rotate: 0, scale: [0, 1.25, 0.95, 1.05, 1] }} 
                        transition={{ type: "spring", stiffness: 350, damping: 20 }}
                      >
                        <Trophy className="w-14 h-14 fill-current drop-shadow-md" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 3 Animated Stars with Staggered Spring Entrance */}
                {!isRemoteMode && !multiplayerMode && (
                  <div className="flex items-center justify-center gap-3 mb-3">
                    {[1, 2, 3].map((starIdx) => {
                      const isEarned = isSuccess && starsCount >= starIdx;
                      return (
                        <motion.div
                          key={starIdx}
                          initial={{ scale: 0, rotate: -40, opacity: 0 }}
                          animate={{ 
                            scale: isEarned ? [0, 1.35, 1] : 1, 
                            rotate: 0, 
                            opacity: 1 
                          }}
                          transition={{ 
                            delay: 0.18 + starIdx * 0.14, 
                            type: "spring", 
                            stiffness: 400, 
                            damping: 18 
                          }}
                          className={`relative p-2 rounded-2xl border-2 transition-all ${
                            isEarned
                              ? 'bg-gradient-to-br from-amber-400/25 via-yellow-400/20 to-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-400/20 text-amber-400'
                              : darkMode 
                                ? 'bg-slate-800/40 border-slate-700/50 text-slate-600' 
                                : 'bg-slate-100 border-slate-200 text-slate-300'
                          }`}
                        >
                          <Star className={`w-6 h-6 ${isEarned ? 'fill-amber-400' : ''}`} />
                          {isEarned && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 0] }}
                              transition={{ delay: 0.35 + starIdx * 0.14, duration: 0.6 }}
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full blur-[0.5px]"
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                
                {/* Motivational Headings & Rank Badge */}
                <div className="space-y-1.5 mb-5 w-full">
                  {isRemoteMode && remoteDuel ? (
                    <h2 className={`text-3xl font-black italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {(remoteDuel.scores?.creator ?? 0) > (remoteDuel.scores?.opponent ?? 0) 
                        ? `${remoteDuel.creator?.uid === user?.uid ? 'ANDA' : (remoteDuel.creator?.name || 'Creator')} MENANG!` 
                        : (remoteDuel.scores?.opponent ?? 0) > (remoteDuel.scores?.creator ?? 0) 
                        ? `${remoteDuel.opponent?.uid === user?.uid ? 'ANDA' : (remoteDuel.opponent?.name || 'Opponent')} MENANG!` 
                        : "HASIL IMBANG!"}
                    </h2>
                  ) : multiplayerMode ? (
                    <h2 className={`text-3xl font-black italic tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                      {multiplayerMode === 'p1' ? "P1 SELESAI!" : "P2 GAME OVER!"}
                    </h2>
                  ) : (
                    <>
                      {/* Rank & Level Badge */}
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isPerfect
                            ? 'bg-gradient-to-r from-amber-400/20 to-yellow-400/20 border border-amber-400/50 text-amber-500'
                            : accuracyPct >= 80
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-500'
                            : isSuccess
                            ? 'bg-blue-500/20 border border-blue-500/40 text-blue-500'
                            : 'bg-rose-500/20 border border-rose-500/40 text-rose-500'
                        }`}>
                          {isPerfect 
                            ? '👑 RANK S • VOCAB MASTER' 
                            : accuracyPct >= 80 
                            ? '🌟 RANK A • EXPERT' 
                            : isSuccess 
                            ? '🎖️ RANK B • PASSED' 
                            : '🌱 CHALLENGER • TETAP SEMANGAT'}
                        </span>
                      </div>

                      <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {!isSuccess 
                          ? "GAME OVER!" 
                          : isPerfect 
                          ? "完璧！ (KANPEKI!)" 
                          : accuracyPct >= 80 
                          ? "よくできました！" 
                          : "合格！ (GOUKAKU!)"}
                      </h2>
                      <p className={`text-xs font-bold max-w-[320px] mx-auto ${
                        isPerfect 
                          ? 'text-amber-500' 
                          : accuracyPct >= 80 
                          ? 'text-emerald-500' 
                          : isSuccess 
                          ? (darkMode ? 'text-slate-300' : 'text-slate-600') 
                          : 'text-rose-500'
                      }`}>
                        {!isSuccess 
                          ? 'Jangan menyerah! Setiap kesalahan adalah tangga menuju penguasaan.' 
                          : isPerfect 
                          ? 'Luar biasa sempurna! Semua kosakata level ini dikuasai tanpa cela!' 
                          : accuracyPct >= 80 
                          ? 'Hebat sekali! Penguasaan kosakata Anda sangat tajam dan lancar!' 
                          : 'Kerja bagus! Kuis tuntas, asah terus hingga raih 3 bintang penuh!'}
                      </p>
                    </>
                  )}
                </div>
                
                {/* Stats Card */}
                <div className={`w-full backdrop-blur-xl p-5 sm:p-6 rounded-[32px] border-2 transition-all relative overflow-hidden mb-5 ${
                  darkMode ? 'bg-slate-800/50 border-slate-700/60' : 'bg-white/80 border-slate-200/80 shadow-xl shadow-slate-200/40'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent blur-2xl" />

                  {isRemoteMode && remoteDuel ? (
                    <div className="flex justify-around items-center relative z-10">
                      <div className="text-center group">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Creator</p>
                        <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{remoteDuel.scores?.creator ?? 0}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 max-w-[80px] truncate">{remoteDuel.creator?.name || 'Creator'}</p>
                      </div>
                      <div className={`w-0.5 h-12 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                      <div className="text-center group">
                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Opponent</p>
                        <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>{remoteDuel.scores?.opponent ?? 0}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 max-w-[80px] truncate">{remoteDuel.opponent?.name || 'Waiting...'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center">
                      <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {isFavoritesMode ? 'HASIL KUIS FAVORIT' : `HASIL LEVEL ${currentLevel}`}
                      </p>

                      <div className="flex items-baseline justify-center gap-2 mb-3">
                        <span className={`text-5xl sm:text-6xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                          {finalScoreVal}
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-black text-emerald-500 leading-none">PTS</span>
                          <span className={`text-xs font-bold ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            / {totalVocabCount} Kosakata
                          </span>
                        </div>
                      </div>

                      {/* Accuracy & Bonus Badges */}
                      <div className="flex items-center gap-2 flex-wrap justify-center">
                        <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border ${
                          accuracyPct >= 80
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                            : accuracyPct >= 60
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{accuracyPct}% Akurasi</span>
                        </span>

                        {isSuccess && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-amber-400/15 border border-amber-400/30 text-amber-500 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 fill-amber-400" />
                            <span>+{xpEarned} XP</span>
                          </span>
                        )}

                        {isPerfect && (
                          <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>100% Sempurna</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="w-full space-y-2.5 mt-auto">
                  {/* Next Level Quick Button (Motivating Next Step) */}
                  {!isFavoritesMode && !multiplayerMode && isSuccess && currentLevel < 17 && (
                    <button
                      onClick={() => {
                        playSfx('click');
                        switchView('quiz', {
                          levelNumber: currentLevel + 1,
                          beforeChange: () => changeLevel(currentLevel + 1),
                        });
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-4 rounded-[26px] shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-emerald-700 text-xs sm:text-sm"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>LANJUT KE LEVEL {currentLevel + 1}</span>
                      <span className="text-[11px] font-bold opacity-80">
                        ({levelsData[currentLevel + 1]?.name.split(' (')[0] || `Lv.${currentLevel + 1}`})
                      </span>
                      <span>➔</span>
                    </button>
                  )}

                  {/* Level 17 Completion Banner */}
                  {!isFavoritesMode && !multiplayerMode && isSuccess && currentLevel === 17 && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-400/40 text-amber-500 font-black text-xs flex items-center justify-center gap-2">
                      <span>👑 SELAMAT! ANDA TELAH MENAMATKAN SEMUA LEVEL (1-17)!</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {multiplayerMode === 'p1' ? (
                      <button
                        onClick={switchPlayer}
                        className="flex-grow bg-blue-600 text-white font-black py-3.5 rounded-[24px] shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-blue-800 text-xs"
                      >
                        GANTIAN PLAYER 2 <SkipForward className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => changeLevel(currentLevel)}
                        className="flex-grow bg-rose-500 text-white font-black py-3.5 rounded-[24px] shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 active:scale-95 border-b-4 border-rose-800 text-xs sm:text-sm"
                      >
                        <RotateCcw className="w-4 h-4" /> ULANGI LEVEL
                      </button>
                    )}

                    {/* Re-trigger Confetti Button */}
                    {isSuccess && (
                      <button
                        onClick={() => {
                          playSfx('win');
                          triggerConfetti(3500);
                        }}
                        className={`px-3.5 py-3.5 rounded-[24px] shadow-md transition-all flex items-center justify-center active:scale-95 border-2 text-amber-500 font-bold ${
                          darkMode ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-amber-50'
                        }`}
                        title="Tembak Confetti Perayaan Lagi"
                        aria-label="Tembak Confetti"
                      >
                        <span className="text-base">🎊</span>
                      </button>
                    )}

                    <button
                      onClick={shareScore}
                      className={`p-3.5 rounded-[24px] shadow-md transition-all flex items-center justify-center active:scale-95 border-2 ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-700'
                      }`}
                      title="Bagikan Skor"
                      aria-label="Bagikan Skor"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      playSfx('click');
                      setIsRemoteMode(false);
                      setRemoteDuel(null);
                      if (multiplayerMode) {
                        switchView('duel_setup');
                      } else {
                        switchView('mode_select');
                      }
                      setMultiplayerMode(null);
                    }}
                    className={`w-full font-black py-3 rounded-[20px] text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 border-2 ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> {multiplayerMode ? "Kembali Ke Persiapan Duel" : "Kembali Ke Pilihan Level"}
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </div>

        {/* Footer Brand */}
        <div className={`p-4 text-center border-t transition-colors ${darkMode ? 'bg-slate-950/60 border-slate-800/40' : 'bg-white/40 border-white/20'}`}>
          <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            MINNA NO NIHONGO VOCABULARY PREP LEVEL 1-17
          </p>
        </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Invitation Dialog with rounded-[48px] to perfectly match the cards masking */}
      <AnimatePresence>
        {showInvitingDialog && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, scale: 0.9, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 z-[100] p-8 flex flex-col items-center justify-center gap-6 transition-colors duration-200 rounded-[48px] ${
              darkMode ? 'bg-slate-950/90' : 'bg-white/95'
            }`}
          >
            <motion.div 
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-2xl transition-colors ${
                darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-100'
              }`}
            >
              <Users className={`w-12 h-12 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
            </motion.div>
            <div className="text-center">
              <h3 className={`text-3xl font-black italic tracking-tighter ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>JOIN PVP DUEL</h3>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Masukkan ID Duel Online Anda</p>
            </div>
            <div className="w-full space-y-4 max-w-[280px]">
              <div className="group relative">
                <input 
                  type="text" 
                  placeholder="ID DUEL" 
                  value={inviteIdInput}
                  onChange={(e) => setInviteIdInput(e.target.value.toUpperCase())}
                  className={`w-full px-6 py-4 rounded-3xl border-2 text-center font-black text-2xl tracking-[0.3em] focus:border-blue-500 outline-none transition-all shadow-inner ${
                    darkMode 
                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-800' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-200'
                  }`}
                />
                <div className="absolute inset-0 rounded-3xl pointer-events-none group-focus-within:ring-4 ring-blue-500/20 transition-all" />
              </div>
              <button 
                onClick={() => joinRemoteDuelHandler(inviteIdInput)}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[32px] shadow-2xl active:scale-95 hover:bg-blue-700 transition-all border-b-4 border-blue-800"
              >
                GABUNG DUEL
              </button>
              <button 
                onClick={() => {
                  setShowInvitingDialog(false);
                  playSfx('click');
                }}
                className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-rose-500 transition-colors"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Screen Transition Curtain */}
      <CinematicCurtain
        isActive={curtainState.isActive}
        phase={curtainState.phase}
        title={curtainState.title}
        subtitle={curtainState.subtitle}
        badgeType={curtainState.badgeType}
        darkMode={darkMode}
      />

      {/* Settings Modal (Volume Individu) */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                playSfx('click');
                setShowSettingsModal(false);
              }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-dialog-title"
              className={`relative w-full max-w-sm rounded-[32px] overflow-hidden border p-6 shadow-2xl flex flex-col gap-4 z-[110] backdrop-blur-2xl ${
                darkMode 
                ? 'bg-slate-900/95 border-slate-800 text-white shadow-slate-950/80' 
                : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/80'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${darkMode ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-700 font-bold'}`}>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <h2 id="settings-dialog-title" className="text-base font-black tracking-tight">Pengaturan Tampilan & Suara</h2>
                    <p className={`text-[9px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Transisi, Aksesibilitas & Audio</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSfx('click');
                    setShowSettingsModal(false);
                  }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-black'
                  }`}
                  aria-label="Tutup jendela pengaturan"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 gap-1" role="tablist" aria-label="Kategori Pengaturan">
                <button
                  role="tab"
                  aria-selected={settingsTab === 'transitions'}
                  onClick={() => {
                    setSettingsTab('transitions');
                    playSfx('click');
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                    settingsTab === 'transitions'
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-violet-700 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Transisi
                </button>
                <button
                  role="tab"
                  aria-selected={settingsTab === 'accessibility'}
                  onClick={() => {
                    setSettingsTab('accessibility');
                    playSfx('click');
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                    settingsTab === 'accessibility'
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-violet-700 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Akses
                </button>
                <button
                  role="tab"
                  aria-selected={settingsTab === 'audio'}
                  onClick={() => {
                    setSettingsTab('audio');
                    playSfx('click');
                  }}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                    settingsTab === 'audio'
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-violet-700 dark:text-violet-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Audio
                </button>
              </div>

              {/* TAB 0: Transisi Layar (Curtain, Slide, Fade) */}
              {settingsTab === 'transitions' && (
                <div className="flex flex-col gap-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Efek Transisi Layar</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                      {transitionEffect === 'curtain' ? '🎭 TIRAI' : transitionEffect === 'slide' ? '🚀 GESER' : '🫧 PUDAR'}
                    </span>
                  </div>

                  {/* 3 Transition Options */}
                  <div className="grid grid-cols-1 gap-2">
                    {/* Option 1: Curtain */}
                    <button
                      onClick={() => {
                        updateTransitionEffect('curtain');
                        playSfx('click');
                        announce("Efek transisi diubah ke Tirai Sinematik");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                        transitionEffect === 'curtain'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : darkMode ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        transitionEffect === 'curtain' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        🎭
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">Tirai Sinematik (Curtain)</span>
                          <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-rose-500 text-white uppercase">REKOMENDASI</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Efek tirai panggung tradisional <em>Noren</em> Jepang dengan lambang emas yang menutup dan membuka secara mulus saat masuk/keluar kuis.
                        </p>
                      </div>
                      {transitionEffect === 'curtain' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                      )}
                    </button>

                    {/* Option 2: Slide */}
                    <button
                      onClick={() => {
                        updateTransitionEffect('slide');
                        playSfx('click');
                        announce("Efek transisi diubah ke Geser Sinematik");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                        transitionEffect === 'slide'
                          ? 'bg-violet-500/10 border-violet-500 ring-2 ring-violet-500/20 shadow-md'
                          : darkMode ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        transitionEffect === 'slide' ? 'bg-violet-500 text-white shadow-md shadow-violet-500/30' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        🚀
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">Geser Dinamis (Slide)</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Efek pergeseran sinematik dengan kurva pergerakan pegas (spring cubic-bezier) dan efek kedalaman 3D yang empuk.
                        </p>
                      </div>
                      {transitionEffect === 'slide' && (
                        <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0 mt-1" />
                      )}
                    </button>

                    {/* Option 3: Fade */}
                    <button
                      onClick={() => {
                        updateTransitionEffect('fade');
                        playSfx('click');
                        announce("Efek transisi diubah ke Pudar Halus");
                      }}
                      className={`p-3 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                        transitionEffect === 'fade'
                          ? 'bg-blue-500/10 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : darkMode ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        transitionEffect === 'fade' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        🫧
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">Pudar Lembut (Fade)</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Transisi transparan minimalis tanpa animasi pergeseran layar.
                        </p>
                      </div>
                      {transitionEffect === 'fade' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-1" />
                      )}
                    </button>
                  </div>

                  {/* Preview Test Button */}
                  <button
                    onClick={() => {
                      playSfx('click');
                      if (transitionEffect === 'curtain') {
                        previewCurtain();
                      } else {
                        playTransitionSwoosh();
                        showToast(`Efek ${transitionEffect.toUpperCase()} aktif! Berpindahlah antara Menu & Kuis untuk melihatnya. ✨`, 'info');
                      }
                    }}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-500/25 active:scale-95 transition-all mt-0.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Uji Efek Transisi Sekarang
                  </button>
                </div>
              )}

              {/* TAB 1: Aksesibilitas */}
              {settingsTab === 'accessibility' && (
                <div className="flex flex-col gap-3.5 text-left">
                  {/* High Contrast Switch */}
                  <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    highContrastMode 
                      ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/30' 
                      : darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-0.5 max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <Contrast className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold">Mode Kontras Tinggi</span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">WCAG AAA</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Menaikkan kontras warna teks dan elemen ke tingkat tertinggi agar nyaman dibaca.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !highContrastMode;
                        setHighContrastMode(nextVal);
                        playSfx('click');
                        announce(nextVal ? "Mode Kontras Tinggi aktif" : "Mode Kontras Tinggi nonaktif");
                      }}
                      aria-pressed={highContrastMode}
                      aria-label="Alihkan Mode Kontras Tinggi"
                      className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                        highContrastMode ? 'bg-amber-500' : (darkMode ? 'bg-slate-800' : 'bg-slate-300')
                      }`}
                    >
                      <motion.div
                        animate={{ x: highContrastMode ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-white w-5 h-5 rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  {/* Text Scaling Control */}
                  <div className={`p-3.5 rounded-2xl border space-y-2 ${
                    darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-bold">Ukuran Huruf / Teks</span>
                      </div>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 capitalize">
                        {textSize === 'normal' ? 'Normal (100%)' : textSize === 'large' ? 'Besar (112%)' : 'Ekstra (125%)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setTextSize('normal');
                          playSfx('click');
                          announce("Ukuran teks disetel ke Normal");
                        }}
                        aria-pressed={textSize === 'normal'}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                          textSize === 'normal'
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => {
                          setTextSize('large');
                          playSfx('click');
                          announce("Ukuran teks disetel ke Besar");
                        }}
                        aria-pressed={textSize === 'large'}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                          textSize === 'large'
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Besar
                      </button>
                      <button
                        onClick={() => {
                          setTextSize('xlarge');
                          playSfx('click');
                          announce("Ukuran teks disetel ke Ekstra Besar");
                        }}
                        aria-pressed={textSize === 'xlarge'}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                          textSize === 'xlarge'
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Ekstra
                      </button>
                    </div>
                  </div>

                  {/* Auto Voice / Screen Reader Assistance Switch */}
                  <div className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    voiceAssistantEnabled 
                      ? 'bg-blue-500/10 border-blue-500/40' 
                      : darkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-0.5 max-w-[75%]">
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold">Bantuan Suara Otomatis</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Membacakan pertanyaan dan kata Jepang secara otomatis saat soal berganti.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const nextVal = !voiceAssistantEnabled;
                        setVoiceAssistantEnabled(nextVal);
                        playSfx('click');
                        announce(nextVal ? "Bantuan Suara Otomatis aktif" : "Bantuan Suara Otomatis nonaktif");
                      }}
                      aria-pressed={voiceAssistantEnabled}
                      aria-label="Alihkan Bantuan Suara Otomatis"
                      className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                        voiceAssistantEnabled ? 'bg-blue-500' : (darkMode ? 'bg-slate-800' : 'bg-slate-300')
                      }`}
                    >
                      <motion.div
                        animate={{ x: voiceAssistantEnabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-white w-5 h-5 rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  {/* Screen Reader Support Badge */}
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-tight">
                      <span className="font-bold block mb-0.5">Dukungan Pembaca Layar Aktif</span>
                      Aplikasi mendukung TalkBack, NVDA, dan VoiceOver dengan ARIA label lengkap, live announcer, dan navigasi keyboard penuh.
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Audio & Volume */}
              {settingsTab === 'audio' && (
                <div className="flex flex-col gap-3.5">
                  {/* Master Sound Switch */}
                  <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                    darkMode ? 'bg-slate-850/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-rose-500" />
                      )}
                      <div className="text-left font-sans">
                        <p className="text-xs font-bold">Suara Global</p>
                        <p className={`text-[9px] ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Aktifkan semua efek audio</p>
                      </div>
                    </div>
                    
                    {/* Switch Button */}
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        if (!soundEnabled) {
                          setTimeout(() => {
                            sounds.click.play();
                          }, 50);
                        } else {
                          playSfx('click');
                        }
                      }}
                      aria-pressed={soundEnabled}
                      aria-label="Alihkan Suara Global"
                      className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
                        soundEnabled ? 'bg-emerald-500' : (darkMode ? 'bg-slate-800' : 'bg-slate-300')
                      }`}
                    >
                      <motion.div
                        animate={{ x: soundEnabled ? 20 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="bg-white w-5 h-5 rounded-full shadow"
                      />
                    </button>
                  </div>



                  {/* Volume sliders list */}
                  <div className={`flex flex-col gap-3 ${!soundEnabled ? 'opacity-30 pointer-events-none select-none' : ''} transition-opacity duration-300`}>
                    
                    {/* 1. Click Sound Slider */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-800'}>Efek Klik Tombol</span>
                        <span className="font-mono text-violet-600 dark:text-violet-400">{Math.round(clickVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={clickVolume}
                          onChange={(e) => setClickVolume(parseFloat(e.target.value))}
                          aria-label="Volume efek klik tombol"
                          className="flex-grow accent-violet-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => sounds.click.play()}
                          className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold hover:scale-105 active:scale-95 transition-all leading-tight ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          aria-label="Uji suara klik tombol"
                        >
                          Tes sfx
                        </button>
                      </div>
                    </div>

                    {/* 2. Correct Answer Sound Slider */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-800'}>Jawaban Benar</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{Math.round(correctVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={correctVolume}
                          onChange={(e) => setCorrectVolume(parseFloat(e.target.value))}
                          aria-label="Volume suara jawaban benar"
                          className="flex-grow accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => sounds.correct.play()}
                          className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold hover:scale-105 active:scale-95 transition-all leading-tight ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          aria-label="Uji suara jawaban benar"
                        >
                          Tes sfx
                        </button>
                      </div>
                    </div>

                    {/* 3. Wrong Answer Sound Slider */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-800'}>Jawaban Salah</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400">{Math.round(wrongVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={wrongVolume}
                          onChange={(e) => setWrongVolume(parseFloat(e.target.value))}
                          aria-label="Volume suara jawaban salah"
                          className="flex-grow accent-rose-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => sounds.wrong.play()}
                          className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold hover:scale-105 active:scale-95 transition-all leading-tight ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          aria-label="Uji suara jawaban salah"
                        >
                          Tes sfx
                        </button>
                      </div>
                    </div>

                    {/* 4. Win/Celebration Sound Slider */}
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-800'}>Suara Perayaan / Menang</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">{Math.round(winVolume * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={winVolume}
                          onChange={(e) => setWinVolume(parseFloat(e.target.value))}
                          aria-label="Volume suara perayaan dan kemenangan"
                          className="flex-grow accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => sounds.win.play()}
                          className={`text-[9px] px-2 py-0.5 rounded-lg border font-bold hover:scale-105 active:scale-95 transition-all leading-tight ${
                            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                          aria-label="Uji suara kemenangan"
                        >
                          Tes sfx
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Footer text */}
              <div className={`text-center text-[9px] font-bold border-t pt-2.5 dark:border-slate-800 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                MinaNoNihongo • Pengaturan Tersimpan Otomatis
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.93 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-[24px] border shadow-2xl backdrop-blur-xl max-w-[340px] w-[90%] pointer-events-auto select-none transition-all duration-200 ${
              darkMode 
                ? 'bg-slate-900/95 border-slate-700/75 shadow-slate-950/60' 
                : 'bg-white/95 border-slate-150/80 shadow-slate-200/60'
            }`}
          >
            {/* Visual Icon Badge */}
            <div className={`p-1.5 rounded-xl ${
              toast.type === 'success'
                ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-500')
                : toast.type === 'info'
                  ? (darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-500')
                  : (darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-500')
            }`}>
              {toast.type === 'success' && <Star className="w-3.5 h-3.5 fill-current" />}
              {toast.type === 'info' && <Layers className="w-3.5 h-3.5" />}
              {toast.type === 'error' && <X className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-grow text-left">
              <p className={`text-[11.5px] font-black leading-snug tracking-tight ${
                darkMode ? 'text-slate-100' : 'text-slate-800'
              }`}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => setToast(null)}
              className={`p-1 rounded-lg transition-colors ${
                darkMode 
                  ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      </div>

      {/* Scrollbar-hide styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
