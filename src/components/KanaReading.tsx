import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  Star,
  Zap,
  BarChart3,
  ChevronRight,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HIRAGANA_DATA, KATAKANA_DATA, KanaChar } from '../data/kana_data';
import { RippleButton } from './RippleButton';

interface KanaReadingProps {
  darkMode: boolean;
  onBack: () => void;
  onSwitchToWriting: () => void;
  speakJapanese: (text: string) => void;
  playSfx: (type: 'click' | 'correct' | 'wrong' | 'levelup' | 'streak') => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialScriptType?: 'hiragana' | 'katakana';
}

export function KanaReading({
  darkMode,
  onBack,
  onSwitchToWriting,
  speakJapanese,
  playSfx,
  showToast,
  initialScriptType = 'hiragana',
}: KanaReadingProps) {
  const [scriptType, setScriptType] = useState<'hiragana' | 'katakana'>(initialScriptType);

  useEffect(() => {
    if (initialScriptType) {
      setScriptType(initialScriptType);
    }
  }, [initialScriptType]);

  const [activeRow, setActiveRow] = useState<string>('all');
  const [selectedChar, setSelectedChar] = useState<KanaChar | null>(null);
  const [mode, setMode] = useState<'chart' | 'quiz'>('chart');
  const [quizOnlyFavorites, setQuizOnlyFavorites] = useState<boolean>(false);

  // Kana Favorites state with LocalStorage persistence
  const [favoriteKana, setFavoriteKana] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('minanihongo_kana_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('minanihongo_kana_favorites', JSON.stringify(favoriteKana));
    } catch (e) {
      console.error('Failed to save kana favorites', e);
    }
  }, [favoriteKana]);

  const isKanaFavorited = (char: KanaChar | string | null | undefined): boolean => {
    if (!char) return false;
    const c = typeof char === 'string' ? char : char.char;
    const fullKey = typeof char === 'string' ? char : `${char.type}:${char.char}`;
    return favoriteKana.includes(fullKey) || favoriteKana.includes(c);
  };

  const toggleKanaFavorite = (char: KanaChar) => {
    playSfx('click');
    const key = `${char.type}:${char.char}`;
    const isFav = isKanaFavorited(char);

    setFavoriteKana(prev => {
      if (isFav) {
        return prev.filter(k => k !== key && k !== char.char);
      } else {
        return [...prev, key];
      }
    });

    if (showToast) {
      if (!isFav) {
        showToast(`⭐ Huruf "${char.char}" (${char.romaji}) disimpan ke favorit!`, 'success');
      } else {
        showToast(`Huruf "${char.char}" dihapus dari favorit`, 'info');
      }
    }
  };

  // Shuffled index generator for random questions
  function createShuffledIndices(length: number): number[] {
    const arr = Array.from({ length }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Quiz state
  const quizPoolRef = useRef<number[]>([]);
  const [quizIndex, setQuizIndex] = useState(() => {
    const pool = createShuffledIndices(HIRAGANA_DATA.length);
    const initialIdx = pool.pop() ?? 0;
    quizPoolRef.current = pool;
    return initialIdx;
  });
  const [questionCount, setQuestionCount] = useState(1);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  const currentDataset = scriptType === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA;
  const scriptFavorites = currentDataset.filter(c => isKanaFavorited(c));

  const filteredChars =
    activeRow === 'favorites'
      ? scriptFavorites
      : activeRow === 'all'
      ? currentDataset
      : currentDataset.filter(c => c.row === activeRow);

  const rows = [
    { id: 'all', label: 'Semua' },
    { id: 'favorites', label: `⭐ Favorit (${scriptFavorites.length})` },
    { id: 'a', label: 'A (あ)' },
    { id: 'ka', label: 'Ka (か)' },
    { id: 'sa', label: 'Sa (さ)' },
    { id: 'ta', label: 'Ta (た)' },
    { id: 'na', label: 'Na (な)' },
    { id: 'ha', label: 'Ha (は)' },
    { id: 'ma', label: 'Ma (ま)' },
    { id: 'ya', label: 'Ya (や)' },
    { id: 'ra', label: 'Ra (ら)' },
    { id: 'wa', label: 'Wa (わ)' },
    { id: 'dakuon', label: 'Dakuon (が)' },
  ];

  // The active question pool for quiz (either favorites or all)
  const activeQuizPoolData =
    quizOnlyFavorites && scriptFavorites.length > 0 ? scriptFavorites : currentDataset;

  const getNextRandomCharIndex = (datasetLength: number, currentIdx: number): number => {
    if (datasetLength <= 1) return 0;
    if (quizPoolRef.current.length === 0) {
      quizPoolRef.current = createShuffledIndices(datasetLength);
    }
    let next = quizPoolRef.current.pop() ?? 0;
    if (next === currentIdx && datasetLength > 1) {
      if (quizPoolRef.current.length === 0) {
        quizPoolRef.current = createShuffledIndices(datasetLength);
      }
      const alt = quizPoolRef.current.pop() ?? 0;
      quizPoolRef.current.push(next);
      next = alt;
    }
    return next;
  };

  // Generate 4 options for quiz
  const currentQuizChar =
    activeQuizPoolData[quizIndex % activeQuizPoolData.length] || currentDataset[0];
  const [quizOptions, setQuizOptions] = useState<string[]>(() =>
    generateOptions(currentQuizChar, currentDataset)
  );

  function generateOptions(target: KanaChar, dataset: KanaChar[]): string[] {
    const wrongRomajis = Array.from(
      new Set(
        dataset
          .filter(c => c.romaji !== target.romaji)
          .map(c => c.romaji)
      )
    )
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    return [target.romaji, ...wrongRomajis].sort(() => 0.5 - Math.random());
  }

  const handleCharClick = (char: KanaChar) => {
    playSfx('click');
    setSelectedChar(char);
    speakJapanese(char.char);
  };

  const advanceQuiz = (targetIdx?: number) => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    const poolData =
      quizOnlyFavorites && scriptFavorites.length > 0 ? scriptFavorites : currentDataset;

    const nextIdx =
      targetIdx !== undefined
        ? targetIdx
        : getNextRandomCharIndex(poolData.length, quizIndex);
    const nextChar = poolData[nextIdx % poolData.length] || currentDataset[0];
    setQuizIndex(nextIdx);
    setQuestionCount(prev => prev + 1);
    setQuizOptions(generateOptions(nextChar, currentDataset));
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const switchQuizMode = (onlyFavorites: boolean) => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    setQuizOnlyFavorites(onlyFavorites);
    const poolData =
      onlyFavorites && scriptFavorites.length > 0 ? scriptFavorites : currentDataset;
    quizPoolRef.current = createShuffledIndices(poolData.length);
    const nextIdx = quizPoolRef.current.pop() ?? 0;
    const nextChar = poolData[nextIdx % poolData.length] || currentDataset[0];
    setQuizIndex(nextIdx);
    setQuizOptions(generateOptions(nextChar, currentDataset));
    setQuizAnswered(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleQuizAnswer = (option: string) => {
    if (quizAnswered) return;
    setQuizAnswered(true);
    setSelectedAnswer(option);

    if (option === currentQuizChar.romaji) {
      playSfx('correct');
      setIsCorrect(true);
      setQuizScore(prev => prev + 1);
      setQuizStreak(prev => prev + 1);

      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
      autoNextTimerRef.current = setTimeout(() => {
        advanceQuiz();
      }, 180);
    } else {
      playSfx('wrong');
      setIsCorrect(false);
      setQuizStreak(0);
    }
  };

  const handleNextQuiz = () => {
    playSfx('click');
    advanceQuiz();
  };

  const getRowUnderlineColor = (item: KanaChar, idx: number) => {
    if (item.row === 'a') return 'bg-sky-400';
    if (item.row === 'ka') return idx % 2 === 0 ? 'bg-pink-400' : 'bg-purple-400';
    if (item.row === 'sa') return idx % 2 === 0 ? 'bg-cyan-400' : 'bg-purple-400';
    if (item.row === 'ta') return 'bg-sky-400';
    if (item.row === 'na') return 'bg-pink-400';
    if (item.row === 'ha') return 'bg-purple-400';
    if (item.row === 'ma') return 'bg-cyan-400';
    if (item.row === 'ya') return 'bg-amber-400';
    if (item.row === 'ra') return 'bg-emerald-400';
    if (item.row === 'wa') return 'bg-teal-400';
    return 'bg-blue-400';
  };

  return (
    <motion.div
      key="kana-reading"
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
      {/* 1. HERO HEADER WITH SUNSET SCENERY (Consolidated Authentic) */}
      {/* ======================================================== */}
      <div className="relative w-full h-56 sm:h-60 overflow-hidden select-none shrink-0">
        {/* Scenery Background with Mount Fuji & Sunset/Twilight Overlay */}
        <img
          src="/sunset_fuji_reg.jpg"
          alt="Mount Fuji Twilight"
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
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Menu</span>
          </button>
        </div>

        {/* Header Title & Slogan over Scenery */}
        <div className="absolute bottom-3 left-4 right-4 z-20 text-left">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-sky-300 drop-shadow-md" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-lg">
              Membaca Huruf Jepang
            </h1>
          </div>
          <p className="text-xs font-bold text-white/90 drop-shadow-sm ml-8">
            Hiragana & Katakana
          </p>
          <p className="text-[10px] text-white/80 font-medium italic mt-1 ml-8">
            ― 一歩ずつ、上手になりましょう！ ―
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BODY CONTENT SECTION */}
      {/* ======================================================== */}
      <div className="px-3.5 -mt-2 relative z-20 flex-grow flex flex-col gap-3 pb-6">
        {/* HIRAGANA & KATAKANA DUAL CARDS (Matching Reference Image) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Hiragana */}
          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              setScriptType('hiragana');
              setSelectedChar(null);
            }}
            className={`p-3 rounded-[22px] transition-all flex items-center justify-between text-left relative cursor-pointer active:scale-95 shadow-md ${
              scriptType === 'hiragana'
                ? 'bg-gradient-to-r from-[#ff2d60] via-[#ff3b77] to-[#f43f5e] border border-rose-400/60 shadow-rose-500/25'
                : 'bg-[#0f1d38]/85 border border-slate-700/60 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none font-serif">
                あ
              </span>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">Hiragana</div>
                <div className="text-[10px] font-medium text-white/80">ひらがな</div>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                scriptType === 'hiragana' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card 2: Katakana */}
          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              setScriptType('katakana');
              setSelectedChar(null);
            }}
            className={`p-3 rounded-[22px] transition-all flex items-center justify-between text-left relative cursor-pointer active:scale-95 shadow-md ${
              scriptType === 'katakana'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 border border-sky-400/60 shadow-blue-500/25'
                : 'bg-[#0f1d38]/85 border border-slate-700/60 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none font-serif">
                ア
              </span>
              <div>
                <div className="text-xs sm:text-sm font-black text-white">Katakana</div>
                <div className="text-[10px] font-medium text-white/80">カタカナ</div>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                scriptType === 'katakana' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* SUB-MODES BAR (Tabel & Audio, Kuis Membaca, Total Huruf) */}
        <div className="flex items-center justify-between gap-1 px-0.5">
          <div className="flex items-center gap-2">
            {/* Tab 1: Tabel & Audio */}
            <button
              onClick={() => {
                playSfx('click');
                if (autoNextTimerRef.current) {
                  clearTimeout(autoNextTimerRef.current);
                  autoNextTimerRef.current = null;
                }
                setMode('chart');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'chart'
                  ? 'bg-[#13223f] text-white border border-sky-400/50 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              <span>Tabel & Audio</span>
            </button>

            {/* Tab 2: Kuis Membaca */}
            <button
              onClick={() => {
                playSfx('click');
                if (autoNextTimerRef.current) {
                  clearTimeout(autoNextTimerRef.current);
                  autoNextTimerRef.current = null;
                }
                setMode('quiz');
                const poolData =
                  quizOnlyFavorites && scriptFavorites.length > 0
                    ? scriptFavorites
                    : currentDataset;
                if (!quizAnswered && quizScore === 0) {
                  quizPoolRef.current = createShuffledIndices(poolData.length);
                  const nextIdx = quizPoolRef.current.pop() ?? 0;
                  setQuizIndex(nextIdx);
                  const nextChar = poolData[nextIdx % poolData.length] || currentDataset[0];
                  setQuizOptions(generateOptions(nextChar, currentDataset));
                } else {
                  const currChar = poolData[quizIndex % poolData.length] || currentDataset[0];
                  setQuizOptions(generateOptions(currChar, currentDataset));
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                mode === 'quiz'
                  ? 'bg-[#13223f] text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Kuis Membaca</span>
            </button>
          </div>

          {/* Badge: Total Huruf */}
          <div className="bg-[#101b33] border border-slate-800 text-slate-400 rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shrink-0">
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>{filteredChars.length} Huruf</span>
          </div>
        </div>

        {/* MODE 1: TABEL & AUDIO VIEW */}
        {mode === 'chart' ? (
          <div className="flex flex-col gap-3">
            {/* ROW FILTER CHIPS BAR (Horizontal Scrollable with Right Arrow) */}
            <div className="relative flex items-center">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 pr-6 flex-grow">
                {rows.map((r, rIdx) => {
                  const isAll = r.id === 'all';
                  const isActive = activeRow === r.id;
                  return (
                    <button
                      key={`kana-filter-row-${r.id}-${rIdx}`}
                      onClick={() => {
                        playSfx('click');
                        setActiveRow(r.id);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                        isActive
                          ? isAll
                            ? 'bg-gradient-to-r from-[#ff2d55] to-[#f43f5e] text-white shadow-md shadow-rose-500/30'
                            : 'bg-amber-400/20 border border-amber-400 text-amber-300 shadow-xs'
                          : 'bg-[#101c36] border border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-500'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-[#070e20] via-[#070e20]/90 to-transparent pl-3 pointer-events-none text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 5-COLUMN GRID OF KANA CARDS */}
            {activeRow === 'favorites' && filteredChars.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0f1d38]/60 border border-slate-800 my-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-2 text-xl">
                  ⭐
                </div>
                <p className="text-xs font-black text-white mb-1">Belum Ada Huruf Favorit</p>
                <p className="text-[11px] font-semibold text-slate-400 max-w-[240px] leading-relaxed">
                  Sentuh salah satu huruf di bawah lalu tekan ikon bintang ⭐ untuk menyimpan ke daftar favorit Anda!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 px-0.5">
                {filteredChars.map((item, itemIdx) => {
                  const isSelected = selectedChar?.char === item.char;
                  const isFav = isKanaFavorited(item);
                  const underlineColor = getRowUnderlineColor(item, itemIdx);

                  return (
                    <motion.button
                      key={`kana-char-${item.type}-${item.char}-${itemIdx}`}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleCharClick(item)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all relative select-none cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#ff2d75] via-[#a855f7] to-[#3b82f6] border-2 border-pink-300 shadow-[0_0_18px_rgba(255,45,117,0.5)]'
                          : 'bg-[#0f1d38]/85 hover:bg-[#15274d] border-sky-400/20 hover:border-sky-400/50 shadow-md'
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
                        {item.char}
                      </span>

                      {/* Romaji */}
                      <span
                        className={`text-[11px] font-extrabold leading-none mt-1 ${
                          isSelected ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {item.romaji}
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

            {/* BOTTOM INTERACTIVE BANNER / DETAIL CARD */}
            <div className="mt-1">
              {selectedChar ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[24px] bg-gradient-to-r from-[#0c1830] via-[#102042] to-[#122347] border border-sky-400/30 p-3.5 flex items-center justify-between shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        playSfx('click');
                        speakJapanese(selectedChar.char);
                      }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-black text-2xl shadow-md active:scale-95 transition-transform shrink-0 relative group cursor-pointer"
                      title="Klik untuk mendengarkan lafal"
                    >
                      {selectedChar.char}
                      <span className="absolute -bottom-1 -right-1 bg-slate-900 border border-white/20 rounded-full p-1 text-white">
                        <Volume2 className="w-2.5 h-2.5" />
                      </span>
                    </button>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white">
                          {selectedChar.romaji}
                        </span>
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {selectedChar.strokeCount || 2} Coretan
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                        Contoh: <strong className="text-rose-400">{selectedChar.example}</strong> ({selectedChar.meaning})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleKanaFavorite(selectedChar)}
                      className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                        isKanaFavorited(selectedChar)
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400 shadow-xs'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-400'
                      }`}
                      title={isKanaFavorited(selectedChar) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isKanaFavorited(selectedChar) ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        playSfx('click');
                        speakJapanese(selectedChar.char);
                      }}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Putar Suara"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-[24px] bg-gradient-to-r from-[#0c1830] via-[#102042] to-[#122347] border border-sky-500/25 p-3.5 flex items-center justify-between shadow-lg relative overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
                      <Lightbulb className="w-5 h-5 fill-slate-950" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs sm:text-[13px] font-bold text-white">
                        Sentuh salah satu huruf di atas
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        untuk mendengarkan lafal & melihat contoh kata
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
        ) : (
          /* MODE 2: KUIS MEMBACA HURUF */
          <div className="flex flex-col items-center justify-between gap-3 p-2">
            {/* Quiz Source Filter */}
            <div className="w-full flex items-center justify-between gap-2 bg-[#101b33] border border-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => switchQuizMode(false)}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all text-center cursor-pointer ${
                  !quizOnlyFavorites
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua Huruf ({currentDataset.length})
              </button>
              <button
                onClick={() => switchQuizMode(true)}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  quizOnlyFavorites
                    ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    quizOnlyFavorites ? 'fill-slate-950 text-slate-950' : 'fill-amber-400 text-amber-400'
                  }`}
                />
                <span>Huruf Favorit ({scriptFavorites.length})</span>
              </button>
            </div>

            {/* If Quiz Only Favorites is active and no favorites exist */}
            {quizOnlyFavorites && scriptFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0f1d38]/60 border border-slate-800 my-4 w-full">
                <div className="w-14 h-14 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 text-2xl shadow-inner">
                  ⭐
                </div>
                <h3 className="text-sm font-black text-white mb-1.5">Belum Ada Huruf Favorit</h3>
                <p className="text-xs font-medium text-slate-400 max-w-[260px] leading-relaxed mb-4">
                  Tandai huruf sulit atau penting dengan ikon bintang ⭐ pada tabel untuk latihan kuis di sini!
                </p>
                <button
                  onClick={() => switchQuizMode(false)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-black shadow-md hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all cursor-pointer"
                >
                  Mulai Kuis Semua Huruf
                </button>
              </div>
            ) : (
              <>
                <div className="w-full flex items-center justify-between text-xs font-extrabold px-1 text-slate-400">
                  <span>
                    Skor: <strong className="text-rose-400 font-mono text-sm">{quizScore}</strong>
                  </span>
                  <span>
                    Streak: <strong className="text-amber-400 font-mono text-sm">🔥 {quizStreak}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-black ${
                        quizOnlyFavorites
                          ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {quizOnlyFavorites ? '⭐ Favorit' : '🎲 Acak'}
                    </span>
                    <span>Soal ke {questionCount}</span>
                  </div>
                </div>

                {/* Question Display Card */}
                <motion.div
                  key={`q-${quizIndex}-${currentQuizChar.char}`}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.06, ease: 'easeOut' }}
                  className="w-40 h-40 rounded-3xl flex flex-col items-center justify-center border-2 border-sky-400/30 bg-[#0f1d38] shadow-2xl relative select-none"
                >
                  {/* Audio Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      playSfx('click');
                      speakJapanese(currentQuizChar.char);
                    }}
                    className="absolute top-2.5 left-2.5 p-2 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-rose-400 transition-all active:scale-90 cursor-pointer"
                    title="Dengarkan Lafal"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleKanaFavorite(currentQuizChar);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-xl border transition-all active:scale-90 cursor-pointer ${
                      isKanaFavorited(currentQuizChar)
                        ? 'bg-amber-400/20 border-amber-400/60 text-amber-400 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-amber-400'
                    }`}
                    title={isKanaFavorited(currentQuizChar) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isKanaFavorited(currentQuizChar) ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>

                  <span className="text-6xl font-black text-white leading-none font-serif">
                    {currentQuizChar.char}
                  </span>

                  {isKanaFavorited(currentQuizChar) && (
                    <span className="text-[9px] font-black text-amber-400 mt-2 flex items-center gap-0.5 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                      ⭐ Favorit
                    </span>
                  )}
                </motion.div>

                <p className="text-xs font-bold text-slate-300">
                  Bagaimana cara membaca huruf ini dalam Romaji?
                </p>

                {/* 4 Choices */}
                <div className="w-full grid grid-cols-2 gap-2.5">
                  {quizOptions.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrectOpt = opt === currentQuizChar.romaji;
                    let btnStyle =
                      'bg-[#0f1d38] border border-slate-700 text-white hover:border-sky-400/50 shadow-md';

                    if (quizAnswered) {
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
                        key={`kana-quiz-opt-${opt}-${idx}`}
                        disabled={quizAnswered}
                        contentClassName="flex items-center justify-center text-center w-full"
                        whileTap={{ scale: 0.94 }}
                        animate={isSelected ? { scale: [0.94, 1.03, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        rippleColor={
                          quizAnswered && isCorrectOpt
                            ? 'rgba(255, 255, 255, 0.45)'
                            : 'rgba(244, 63, 94, 0.25)'
                        }
                        onClick={() => handleQuizAnswer(opt)}
                        className={`py-3.5 px-4 rounded-2xl border font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </RippleButton>
                    );
                  })}
                </div>

                {/* Feedback and Next */}
                <div className="w-full min-h-[44px] flex items-center justify-center">
                  {quizAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1.5 animate-pulse">
                            <CheckCircle2 className="w-4 h-4" /> Benar! Lanjut...
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Jawaban: {currentQuizChar.romaji}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleNextQuiz}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Lanjut</span>
                        <span>➔</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
