import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Heart,
  Trophy,
  Star,
  BookOpen,
  Layers,
  PenTool,
  Shuffle,
  GraduationCap,
  Flame,
  HelpCircle,
  BarChart3,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap,
} from 'lucide-react';
import { IRODORI_KANJI_LIST, KANJI_TIERS, KANJI_LEVEL_CHUNKS, KanjiVocabItem } from '../data/kanji_data';
import { RippleButton } from './RippleButton';

interface KanjiHubProps {
  darkMode: boolean;
  onBack: () => void;
  speakJapanese: (text: string) => void;
  playSfx: (type: 'click' | 'correct' | 'wrong' | 'win' | 'levelup' | 'streak') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  initialTab?: 'quiz' | 'flashcards' | 'dictionary' | 'practice_write';
  initialTier?: 'all' | 'nyuumon' | 'shokyuu1' | 'shokyuu2';
  initialChunkLevel?: number | null;
  onStartMainQuizWithKanji?: (items: KanjiVocabItem[], title: string) => void;
}

export function KanjiHub({
  darkMode,
  onBack,
  speakJapanese,
  playSfx,
  showToast,
  initialTab = 'dictionary',
  initialTier = 'all',
  initialChunkLevel = null,
  onStartMainQuizWithKanji,
}: KanjiHubProps) {
  // Navigation Tabs: 'dictionary' (Tabel & Audio) | 'quiz' | 'flashcards' | 'practice_write'
  const [activeTab, setActiveTab] = useState<'dictionary' | 'quiz' | 'flashcards' | 'practice_write'>(
    initialTab === 'quiz' ? 'dictionary' : initialTab
  );

  // Selected filter tier
  const [selectedTier, setSelectedTier] = useState<'all' | 'nyuumon' | 'shokyuu1' | 'shokyuu2' | 'favorites'>(initialTier);
  const [selectedChunk, setSelectedChunk] = useState<number | null>(initialChunkLevel);
  const [selectedKanji, setSelectedKanji] = useState<KanjiVocabItem | null>(null);

  // Kanji Favorites State & Persistence
  const [kanjiFavorites, setKanjiFavorites] = useState<KanjiVocabItem[]>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_kanji_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('minanihongo_kanji_favorites', JSON.stringify(kanjiFavorites));
    } catch (e) {
      console.error('Gagal menyimpan favorit kanji:', e);
    }
  }, [kanjiFavorites]);

  const isKanjiFavorite = (item?: KanjiVocabItem | null) => {
    if (!item) return false;
    return kanjiFavorites.some(
      f => f.id === item.id || (f.kanji === item.kanji && f.reading === item.reading)
    );
  };

  const toggleKanjiFavorite = (item?: KanjiVocabItem | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item) return;
    const exists = isKanjiFavorite(item);
    if (exists) {
      setKanjiFavorites(prev =>
        prev.filter(f => !(f.id === item.id || (f.kanji === item.kanji && f.reading === item.reading)))
      );
      playSfx('click');
      if (showToast) showToast(`Kanji "${item.kanji}" dihapus dari favorit`, 'info');
    } else {
      setKanjiFavorites(prev => [...prev, item]);
      playSfx('click');
      if (showToast) showToast(`⭐ Kanji "${item.kanji}" (${item.reading}) disimpan ke favorit!`, 'success');
    }
  };

  // Compute active item pool based on tier and chunk selection
  const activePool = useMemo<KanjiVocabItem[]>(() => {
    if (selectedTier === 'favorites') {
      return kanjiFavorites;
    }
    if (selectedChunk !== null && KANJI_LEVEL_CHUNKS[selectedChunk]) {
      return KANJI_LEVEL_CHUNKS[selectedChunk].items;
    }
    if (selectedTier === 'all') {
      return IRODORI_KANJI_LIST;
    }
    return KANJI_TIERS[selectedTier]?.items || IRODORI_KANJI_LIST;
  }, [selectedTier, selectedChunk, kanjiFavorites]);

  // Quiz Mode Configuration
  const [quizType, setQuizType] = useState<'kanji_to_combo' | 'meaning_to_kanji'>('kanji_to_combo');
  const [quizQuestions, setQuizQuestions] = useState<KanjiVocabItem[]>([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizLives, setQuizLives] = useState(5);
  const [quizAnswerLock, setQuizAnswerLock] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<KanjiVocabItem | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  // Flashcards state
  const [fcIndex, setFcIndex] = useState(0);
  const [fcIsFlipped, setFcIsFlipped] = useState(false);

  // Dictionary Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Practice Canvas state
  const [writingKanji, setWritingKanji] = useState<KanjiVocabItem>(IRODORI_KANJI_LIST[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Start / Restart Quiz
  const initQuiz = () => {
    playSfx('click');
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    const shuffled = [...activePool].sort(() => 0.5 - Math.random());
    const subset = shuffled.slice(0, Math.min(20, shuffled.length));
    setQuizQuestions(subset);
    setQuizCurrentIndex(0);
    setQuizScore(0);
    setQuizStreak(0);
    setQuizLives(5);
    setQuizAnswerLock(false);
    setQuizSelectedOption(null);
    setQuizFinished(false);
  };

  useEffect(() => {
    if (activeTab === 'quiz') {
      initQuiz();
    }
  }, [activeTab, selectedTier, selectedChunk]);

  // Current Quiz item & options
  const currentQuizItem = quizQuestions[quizCurrentIndex] || null;

  const quizOptions = useMemo<KanjiVocabItem[]>(() => {
    if (!currentQuizItem || activePool.length === 0) return [];
    const others = activePool.filter(i => i.id !== currentQuizItem.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [currentQuizItem, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return combined;
  }, [currentQuizItem, activePool]);

  // Handle answer
  const handleAnswer = (option: KanjiVocabItem) => {
    if (quizAnswerLock || !currentQuizItem || quizFinished) return;
    setQuizAnswerLock(true);
    setQuizSelectedOption(option);

    const isCorrect = option.id === currentQuizItem.id;
    if (isCorrect) {
      playSfx('correct');
      setQuizScore(prev => prev + 1);
      setQuizStreak(prev => prev + 1);

      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
      autoNextTimerRef.current = setTimeout(() => {
        handleNextQuestion();
      }, 200);
    } else {
      playSfx('wrong');
      setQuizStreak(0);
      setQuizLives(prev => {
        const nextLives = Math.max(0, prev - 1);
        if (nextLives === 0) {
          setQuizFinished(true);
        }
        return nextLives;
      });
    }
  };

  const handleNextQuestion = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    if (quizCurrentIndex + 1 < quizQuestions.length) {
      setQuizCurrentIndex(prev => prev + 1);
      setQuizAnswerLock(false);
      setQuizSelectedOption(null);
    } else {
      setQuizFinished(true);
      playSfx('win');
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#34d399';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Filtered dictionary
  const filteredDictionary = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return activePool.filter(item => {
      if (!q) return true;
      return (
        item.kanji.toLowerCase().includes(q) ||
        item.reading.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.lesson.toString() === q
      );
    });
  }, [activePool, searchQuery]);

  const handleKanjiCardClick = (item: KanjiVocabItem) => {
    playSfx('click');
    setSelectedKanji(item);
    speakJapanese(item.kanji);
  };

  const getKanjiUnderlineColor = (item: KanjiVocabItem, idx: number) => {
    if (item.tier === 'nyuumon') return 'bg-emerald-400';
    if (item.tier === 'shokyuu1') return idx % 2 === 0 ? 'bg-pink-400' : 'bg-purple-400';
    return 'bg-cyan-400';
  };

  return (
    <motion.div
      key="kanji-hub"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: 0.04 }}
      className={`max-w-[420px] w-full rounded-none sm:rounded-[42px] shadow-2xl relative z-10 overflow-hidden border-0 sm:border transition-colors duration-200 flex flex-col min-h-screen sm:min-h-[85vh] ${
        darkMode
          ? 'bg-[#070e20] sm:border-slate-800 text-white'
          : 'bg-[#0a1226] sm:border-sky-950 text-white'
      }`}
    >
      {/* ======================================================== */}
      {/* 1. HERO HEADER WITH KYOTO TEMPLE & LANTERNS SCENERY */}
      {/* ======================================================== */}
      <div className="relative w-full h-56 sm:h-60 overflow-hidden select-none shrink-0">
        {/* Scenery Background with Traditional Kyoto Pagoda & Lanterns */}
        <img
          src="/kanji_kyoto_bg.jpg"
          alt="Kyoto Traditional Temple and Autumn Dusk"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070e20] via-[#070e20]/40 to-black/50" />

        {/* Floating Top Nav (Back Button & Menu Pill) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              onBack();
            }}
            className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-md hover:bg-slate-900/80"
            title="Kembali ke Beranda"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              onBack();
            }}
            className="px-4 py-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md hover:bg-slate-900/90"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Menu</span>
          </button>
        </div>

        {/* Header Title & Slogan over Scenery */}
        <div className="absolute bottom-3 left-4 right-4 z-20 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl drop-shadow-md">🈁</span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-lg">
              Koleksi Kanji JFT
            </h1>
          </div>
          <p className="text-xs font-bold text-white/90 drop-shadow-sm ml-7">
            580 Kanji Irodori & JLPT N5-N4
          </p>
          <p className="text-[10px] text-white/80 font-medium italic mt-1 ml-7">
            ― 漢字をマスターして、世界を広げましょう！ ―
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BODY CONTENT SECTION */}
      {/* ======================================================== */}
      <div className="px-3.5 -mt-2 relative z-20 flex-grow flex flex-col gap-3 pb-6">
        {/* DUAL TIER SWITCHER CARDS (Nyuumon & Shokyuu) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Nyuumon (入門 A1) */}
          <button
            onClick={() => {
              playSfx('click');
              setSelectedTier(selectedTier === 'nyuumon' ? 'all' : 'nyuumon');
              setSelectedChunk(null);
            }}
            className={`p-3 rounded-[22px] transition-all flex items-center justify-between text-left relative cursor-pointer active:scale-95 shadow-md ${
              selectedTier === 'nyuumon'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 border border-emerald-400/60 shadow-emerald-500/25'
                : 'bg-[#0f1d38]/85 border border-slate-700/60 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none font-serif">
                入
              </span>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">入門 Nyuumon</div>
                <div className="text-[10px] font-medium text-white/80">167 Kanji (A1)</div>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                selectedTier === 'nyuumon' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: Shokyuu (初級 A2) */}
          <button
            onClick={() => {
              playSfx('click');
              setSelectedTier(selectedTier === 'shokyuu1' ? 'shokyuu2' : selectedTier === 'shokyuu2' ? 'all' : 'shokyuu1');
              setSelectedChunk(null);
            }}
            className={`p-3 rounded-[22px] transition-all flex items-center justify-between text-left relative cursor-pointer active:scale-95 shadow-md ${
              selectedTier === 'shokyuu1' || selectedTier === 'shokyuu2'
                ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border border-indigo-400/60 shadow-indigo-500/25'
                : 'bg-[#0f1d38]/85 border border-slate-700/60 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none font-serif">
                初
              </span>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">
                  {selectedTier === 'shokyuu2' ? '初級2 (161)' : '初級1 (252)'}
                </div>
                <div className="text-[10px] font-medium text-white/80">413 Kanji (A2)</div>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                selectedTier === 'shokyuu1' || selectedTier === 'shokyuu2'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* SUB-MODES BAR (Tabel & Audio, Kuis Kanji, Flashcard, Tulis) */}
        <div className="flex items-center justify-between gap-1 px-0.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tab 1: Tabel & Audio (Dictionary) */}
            <button
              onClick={() => {
                playSfx('click');
                setActiveTab('dictionary');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'dictionary'
                  ? 'bg-[#13223f] text-white border border-emerald-400/50 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tabel & Audio</span>
            </button>

            {/* Tab 2: Kuis Kanji */}
            <button
              onClick={() => {
                playSfx('click');
                setActiveTab('quiz');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'quiz'
                  ? 'bg-[#13223f] text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Kuis Kanji</span>
            </button>

            {/* Tab 3: Flashcard */}
            <button
              onClick={() => {
                playSfx('click');
                setActiveTab('flashcards');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'bg-[#13223f] text-rose-300 border border-rose-400/50 shadow-sm shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-rose-400" />
              <span>Flashcard</span>
            </button>

            {/* Tab 4: Tulis */}
            <button
              onClick={() => {
                playSfx('click');
                setActiveTab('practice_write');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'practice_write'
                  ? 'bg-[#13223f] text-sky-300 border border-sky-400/50 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-sky-400" />
              <span>Tulis</span>
            </button>
          </div>

          {/* Badge: Total Kanji */}
          <div className="bg-[#101b33] border border-slate-800 text-slate-400 rounded-full px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shrink-0">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activePool.length} Kanji</span>
          </div>
        </div>

        {/* FILTER CHIPS (Semua, Favorit, Nyuumon, Shokyuu, Level Bertahap) */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pr-6 flex-grow">
            <button
              onClick={() => {
                playSfx('click');
                setSelectedTier('all');
                setSelectedChunk(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                selectedTier === 'all' && selectedChunk === null
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-[#101c36] border border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              Semua (580)
            </button>

            <button
              onClick={() => {
                playSfx('click');
                setSelectedTier('favorites');
                setSelectedChunk(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                selectedTier === 'favorites'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30'
                  : 'bg-[#101c36] border border-slate-700/70 text-amber-400 hover:border-amber-400'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  selectedTier === 'favorites' ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'
                }`}
              />
              <span>Favorit ({kanjiFavorites.length})</span>
            </button>

            <button
              onClick={() => {
                playSfx('click');
                setSelectedTier('nyuumon');
                setSelectedChunk(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedTier === 'nyuumon' && selectedChunk === null
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-[#101c36] border border-slate-700/70 text-slate-300'
              }`}
            >
              入門 (167)
            </button>

            <button
              onClick={() => {
                playSfx('click');
                setSelectedTier('shokyuu1');
                setSelectedChunk(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedTier === 'shokyuu1' && selectedChunk === null
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-[#101c36] border border-slate-700/70 text-slate-300'
              }`}
            >
              初級1 (252)
            </button>

            <button
              onClick={() => {
                playSfx('click');
                setSelectedTier('shokyuu2');
                setSelectedChunk(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedTier === 'shokyuu2' && selectedChunk === null
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-[#101c36] border border-slate-700/70 text-slate-300'
              }`}
            >
              初級2 (161)
            </button>

            {/* Chunks */}
            {Object.keys(KANJI_LEVEL_CHUNKS).slice(0, 10).map(Number).map(chunkNum => {
              const isChunkActive = selectedChunk === chunkNum;
              return (
                <button
                  key={`kanji-filter-chunk-${chunkNum}`}
                  onClick={() => {
                    playSfx('click');
                    setSelectedChunk(chunkNum);
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isChunkActive
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-[#101c36] border border-slate-700/70 text-slate-300'
                  }`}
                >
                  Lv.{chunkNum}
                </button>
              );
            })}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-[#070e20] via-[#070e20]/90 to-transparent pl-3 pointer-events-none text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODE 1: TABEL & AUDIO (GRID OF KANJI CARDS) */}
        {/* ======================================================== */}
        {activeTab === 'dictionary' && (
          <div className="flex flex-col gap-3">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Kanji, bacaan Hiragana, atau arti Indonesia..."
                className="w-full pl-8 pr-3 py-2 rounded-full bg-[#101c36] border border-slate-700/80 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 text-white shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Empty State for Favorites */}
            {selectedTier === 'favorites' && kanjiFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0f1d38]/60 border border-slate-800 my-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2 text-xl">
                  ⭐
                </div>
                <p className="text-xs font-black text-white mb-1">Belum Ada Kanji Favorit</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-[240px] leading-relaxed">
                  Sentuh kartu Kanji lalu tekan ikon bintang ⭐ untuk menandai kanji yang ingin kamu pelajari khusus!
                </p>
              </div>
            ) : (
              /* Grid of 5-Column Kanji Cards */
              <div className="grid grid-cols-5 gap-2 px-0.5 max-h-[380px] overflow-y-auto no-scrollbar">
                {filteredDictionary.map((item, itemIdx) => {
                  const isSelected = selectedKanji?.id === item.id || (selectedKanji?.kanji === item.kanji && selectedKanji?.reading === item.reading);
                  const isFav = isKanjiFavorite(item);
                  const underlineColor = getKanjiUnderlineColor(item, itemIdx);

                  return (
                    <motion.button
                      key={`kanji-card-${item.id || item.kanji}-${itemIdx}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleKanjiCardClick(item)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all relative select-none cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 border-2 border-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.5)]'
                          : 'bg-[#0f1d38]/85 hover:bg-[#15274d] border-emerald-400/20 hover:border-emerald-400/50 shadow-md'
                      }`}
                    >
                      {/* Top-Right Star Indicator */}
                      <div className="absolute top-1.5 right-1.5 pointer-events-none">
                        {isFav ? (
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-xs" />
                        ) : isSelected ? (
                          <Star className="w-3 h-3 text-white/80" />
                        ) : null}
                      </div>

                      {/* Character */}
                      <span className="text-2xl sm:text-3xl font-black text-white leading-none font-serif">
                        {item.kanji}
                      </span>

                      {/* Reading / Meaning snippet */}
                      <span
                        className={`text-[9.5px] font-extrabold leading-none mt-1 truncate max-w-full px-0.5 ${
                          isSelected ? 'text-white' : 'text-emerald-300'
                        }`}
                        translate="no"
                      >
                        {item.reading}
                      </span>

                      {/* Color Dash Underline */}
                      <span
                        className={`w-4 h-0.5 rounded-full mt-1 ${
                          isSelected ? 'bg-white' : underlineColor
                        }`}
                      />
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Bottom Interactive Kanji Detail Card */}
            <div className="mt-1">
              {selectedKanji ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] bg-gradient-to-r from-[#0c1830] via-[#102042] to-[#122347] border border-emerald-400/30 p-3.5 flex items-center justify-between shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        playSfx('click');
                        speakJapanese(selectedKanji.kanji);
                      }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md active:scale-95 transition-transform shrink-0 relative group cursor-pointer"
                      title="Klik untuk mendengarkan lafal"
                    >
                      {selectedKanji.kanji}
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-white/20 rounded-full p-1 text-white">
                        <Volume2 className="w-2.5 h-2.5" />
                      </span>
                    </button>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-emerald-400" translate="no">
                          {selectedKanji.reading}
                        </span>
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Bab {selectedKanji.lesson}
                        </span>
                      </div>
                      <p className="text-[11px] text-white font-bold mt-0.5">
                        {selectedKanji.meaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleKanjiFavorite(selectedKanji)}
                      className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                        isKanjiFavorite(selectedKanji)
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400 shadow-xs'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-400'
                      }`}
                      title={isKanjiFavorite(selectedKanji) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isKanjiFavorite(selectedKanji) ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        setWritingKanji(selectedKanji);
                        setActiveTab('practice_write');
                        playSfx('click');
                      }}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Latihan Tulis"
                    >
                      <PenTool className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-[24px] bg-gradient-to-r from-[#0c1830] via-[#102042] to-[#122347] border border-emerald-500/25 p-3.5 flex items-center justify-between shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                      <Lightbulb className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-[13px] font-bold text-white">
                        Sentuh salah satu kanji di atas
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        untuk mendengarkan lafal, arti & latihan menulis
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative z-10">
                    <div className="w-7 h-7 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: KUIS KANJI INTERAKTIF */}
        {/* ======================================================== */}
        {activeTab === 'quiz' && (
          <div className="flex flex-col items-center justify-between gap-3 p-1">
            {/* Header info bar (Lives, Streak, Score, Type switch) */}
            <div className="w-full flex items-center justify-between gap-2 bg-[#101b33] border border-slate-800 p-2 rounded-2xl">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playSfx('click');
                    setQuizType(quizType === 'kanji_to_combo' ? 'meaning_to_kanji' : 'kanji_to_combo');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-black text-emerald-400 hover:text-white"
                >
                  {quizType === 'kanji_to_combo' ? 'Kanji ➔ Arti' : 'Arti ➔ Kanji'} 🔄
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-black">
                <span className="text-rose-400 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-current" /> {quizLives}
                </span>
                <span className="text-amber-400 flex items-center gap-1">
                  🔥 {quizStreak}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 fill-current" /> {quizScore}
                </span>
              </div>
            </div>

            {/* Quiz Card Content */}
            {!quizFinished && currentQuizItem ? (
              <>
                <div className="w-full flex items-center justify-between text-xs font-extrabold px-1 text-slate-400">
                  <span>Soal {quizCurrentIndex + 1} / {quizQuestions.length}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Bab {currentQuizItem.lesson}
                  </span>
                </div>

                {/* Question Big Box (Widened with no audio button) */}
                <motion.div
                  key={`q-kanji-${quizCurrentIndex}-${currentQuizItem.id}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-[340px] min-h-[110px] py-4 px-6 rounded-3xl flex flex-col items-center justify-center border-2 border-emerald-400/30 bg-[#0f1d38] shadow-2xl relative select-none"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleKanjiFavorite(currentQuizItem);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-xl border transition-all active:scale-90 cursor-pointer ${
                      isKanjiFavorite(currentQuizItem)
                        ? 'bg-amber-400/20 border-amber-400/60 text-amber-400 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-400'
                    }`}
                    title={isKanjiFavorite(currentQuizItem) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isKanjiFavorite(currentQuizItem) ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  {quizType === 'kanji_to_combo' ? (
                    <span
                      className={`font-black text-white leading-none font-serif tracking-wide whitespace-nowrap ${
                        currentQuizItem.kanji.length >= 4
                          ? 'text-3xl sm:text-4xl'
                          : currentQuizItem.kanji.length === 3
                          ? 'text-4xl sm:text-5xl'
                          : currentQuizItem.kanji.length === 2
                          ? 'text-5xl sm:text-6xl'
                          : 'text-6xl'
                      }`}
                    >
                      {currentQuizItem.kanji}
                    </span>
                  ) : (
                    <div className="text-center px-4">
                      <p className="text-xs font-bold text-slate-400">Arti:</p>
                      <p className="text-base font-black text-emerald-400 mt-1">{currentQuizItem.meaning}</p>
                    </div>
                  )}
                </motion.div>

                <p className="text-xs font-bold text-slate-300">
                  {quizType === 'kanji_to_combo'
                    ? 'Pilih cara baca (Hiragana) & arti yang tepat:'
                    : 'Pilih Kanji yang sesuai dengan arti di atas:'}
                </p>

                {/* 4 Choices */}
                <div className="w-full grid grid-cols-2 gap-2.5">
                  {quizOptions.map((opt, idx) => {
                    const isSelected = quizSelectedOption?.id === opt.id;
                    const isCorrectOpt = opt.id === currentQuizItem.id;
                    let btnStyle =
                      'bg-[#0f1d38] border border-slate-700 text-white hover:border-emerald-400/50 shadow-md';

                    if (quizAnswerLock) {
                      if (isCorrectOpt) {
                        btnStyle =
                          'bg-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-500/20';
                      } else if (isSelected) {
                        btnStyle =
                          'bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-500/20';
                      } else {
                        btnStyle = 'opacity-40 pointer-events-none';
                      }
                    }

                    return (
                      <RippleButton
                        key={`kanji-quiz-opt-${opt.id}-${idx}`}
                        disabled={quizAnswerLock}
                        contentClassName="flex flex-col items-center justify-center text-center w-full"
                        whileTap={{ scale: 0.94 }}
                        animate={isSelected ? { scale: [0.94, 1.03, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleAnswer(opt)}
                        className={`py-3 px-2 rounded-2xl border font-black transition-all cursor-pointer ${btnStyle}`}
                      >
                        {quizType === 'kanji_to_combo' ? (
                          <>
                            <span className="text-xs text-emerald-300" translate="no">{opt.reading}</span>
                            <span className="text-[11px] text-white/90 font-bold truncate max-w-full">{opt.meaning}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl font-serif">{opt.kanji}</span>
                            <span className="text-[10px] text-emerald-300" translate="no">{opt.reading}</span>
                          </>
                        )}
                      </RippleButton>
                    );
                  })}
                </div>

                {/* Next Button Feedback */}
                <div className="w-full min-h-[44px] flex items-center justify-between">
                  {quizAnswerLock && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        {quizSelectedOption?.id === currentQuizItem.id ? (
                          <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                            <CheckCircle2 className="w-4 h-4" /> Benar! Lanjut...
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Jawaban: {currentQuizItem.kanji} ({currentQuizItem.reading} - {currentQuizItem.meaning})
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lanjut</span>
                        <span>➔</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              /* Quiz Finished Summary */
              <div className="flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-[#0f1d38]/80 border border-emerald-500/30 my-4 w-full">
                <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 text-3xl shadow-lg">
                  🏆
                </div>
                <h3 className="text-base font-black text-white">Sesi Kuis Selesai!</h3>
                <p className="text-xs text-slate-300 mt-1 mb-4">
                  Skor Anda: <strong className="text-emerald-400 font-mono text-base">{quizScore}</strong> dari {quizQuestions.length} Soal
                </p>
                <button
                  onClick={initQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  Ulangi Kuis
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: FLASHCARDS INTERAKTIF */}
        {/* ======================================================== */}
        {activeTab === 'flashcards' && (
          <div className="flex flex-col items-center gap-3 p-1 w-full max-w-[340px] mx-auto">
            <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Kartu {fcIndex + 1} / {activePool.length}</span>
              <button
                onClick={() => {
                  playSfx('click');
                  setFcIndex(Math.floor(Math.random() * activePool.length));
                  setFcIsFlipped(false);
                }}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" /> Acak
              </button>
            </div>

            {/* Flashcard Card (Compact Size) */}
            {activePool[fcIndex] && (
              <div
                onClick={() => {
                  playSfx('click');
                  setFcIsFlipped(!fcIsFlipped);
                }}
                className="w-full max-w-[320px] h-[180px] sm:h-[200px] rounded-3xl border-2 border-emerald-400/30 bg-[#0f1d38] p-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl relative overflow-hidden select-none hover:border-emerald-400/60 transition-all mx-auto"
              >
                {!fcIsFlipped ? (
                  <div className="flex flex-col items-center justify-center">
                    <span
                      className={`font-black font-serif text-white mb-1.5 tracking-wide whitespace-nowrap ${
                        activePool[fcIndex].kanji.length >= 4
                          ? 'text-3xl sm:text-4xl'
                          : activePool[fcIndex].kanji.length === 3
                          ? 'text-4xl sm:text-5xl'
                          : activePool[fcIndex].kanji.length === 2
                          ? 'text-5xl sm:text-6xl'
                          : 'text-5xl sm:text-6xl'
                      }`}
                    >
                      {activePool[fcIndex].kanji}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      (Ketuk untuk membalik kartu)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-base font-black text-emerald-400 mb-0.5" translate="no">
                      {activePool[fcIndex].reading}
                    </span>
                    <span className="text-sm font-black text-white mb-2.5 max-w-[260px] truncate">
                      {activePool[fcIndex].meaning}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        playSfx('click');
                        speakJapanese(activePool[fcIndex].kanji);
                      }}
                      className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform"
                    >
                      <Volume2 className="w-3 h-3" /> Dengar Lafal
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Prev / Next Controls */}
            <div className="flex items-center justify-between gap-3 w-full max-w-[320px] mx-auto">
              <button
                disabled={fcIndex === 0}
                onClick={() => {
                  playSfx('click');
                  setFcIndex(prev => Math.max(0, prev - 1));
                  setFcIsFlipped(false);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#0f1d38] border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>

              <button
                disabled={fcIndex >= activePool.length - 1}
                onClick={() => {
                  playSfx('click');
                  setFcIndex(prev => Math.min(activePool.length - 1, prev + 1));
                  setFcIsFlipped(false);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
              >
                Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 4: LATIHAN TULIS KANJI (CANVAS) */}
        {/* ======================================================== */}
        {activeTab === 'practice_write' && (
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-400 font-serif" translate="no">
                  {writingKanji.kanji}
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">{writingKanji.meaning}</p>
                  <p className="text-[10px] text-emerald-300 font-semibold" translate="no">
                    {writingKanji.reading}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={e => toggleKanjiFavorite(writingKanji, e)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isKanjiFavorite(writingKanji)
                      ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-amber-400'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isKanjiFavorite(writingKanji) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => speakJapanese(writingKanji.kanji)}
                  className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Container (Rectangular Box) */}
            <div className="relative w-full max-w-[340px] h-[160px] sm:h-[180px] rounded-3xl border-2 border-emerald-400/40 bg-[#0f1d38] overflow-hidden shadow-2xl flex items-center justify-center mx-auto">
              {/* Guidelines Cross */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-dashed border-emerald-500/20"></div>
                <div className="border-b border-dashed border-emerald-500/20"></div>
                <div className="border-r border-dashed border-emerald-500/20"></div>
                <div></div>
              </div>

              {/* Watermark character background (Horizontal, scaled to fit box) */}
              <div
                className={`absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-20 font-black text-white font-serif tracking-wider whitespace-nowrap px-4 ${
                  writingKanji.kanji.length >= 5
                    ? 'text-3xl sm:text-4xl'
                    : writingKanji.kanji.length === 4
                    ? 'text-4xl sm:text-5xl'
                    : writingKanji.kanji.length === 3
                    ? 'text-5xl sm:text-6xl'
                    : writingKanji.kanji.length === 2
                    ? 'text-6xl sm:text-7xl'
                    : 'text-7xl sm:text-8xl'
                }`}
                translate="no"
              >
                {writingKanji.kanji}
              </div>

              <canvas
                ref={canvasRef}
                width={340}
                height={180}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full touch-none cursor-crosshair relative z-10"
              />
            </div>

            {/* Canvas Controls */}
            <div className="flex items-center gap-2 mt-3 w-full max-w-[340px] mx-auto">
              <button
                onClick={clearCanvas}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-slate-700 transition-all active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Hapus
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  const nextIdx = Math.floor(Math.random() * activePool.length);
                  setWritingKanji(activePool[nextIdx]);
                  clearCanvas();
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1 cursor-pointer hover:brightness-110 transition-all active:scale-95"
              >
                <Shuffle className="w-3.5 h-3.5" /> Ganti Kanji
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
