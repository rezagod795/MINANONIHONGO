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
  HelpCircle
} from 'lucide-react';
import { IRODORI_KANJI_LIST, KANJI_TIERS, KANJI_LEVEL_CHUNKS, KanjiVocabItem } from '../data/kanji_data';

interface KanjiHubProps {
  darkMode: boolean;
  onBack: () => void;
  speakJapanese: (text: string) => void;
  playSfx: (type: 'click' | 'correct' | 'wrong' | 'win') => void;
  showToast?: (msg: string, type?: 'success' | 'info') => void;
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
  initialTab = 'quiz',
  initialTier = 'all',
  initialChunkLevel = null,
  onStartMainQuizWithKanji
}: KanjiHubProps) {
  // Navigation Tabs: 'quiz' | 'flashcards' | 'dictionary' | 'practice_write'
  const [activeTab, setActiveTab] = useState<'quiz' | 'flashcards' | 'dictionary' | 'practice_write'>(initialTab);

  // Selected filter tier
  const [selectedTier, setSelectedTier] = useState<'all' | 'nyuumon' | 'shokyuu1' | 'shokyuu2' | 'favorites'>(initialTier);
  const [selectedChunk, setSelectedChunk] = useState<number | null>(initialChunkLevel);

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
      console.error("Gagal menyimpan favorit kanji:", e);
    }
  }, [kanjiFavorites]);

  const isKanjiFavorite = (item?: KanjiVocabItem | null) => {
    if (!item) return false;
    return kanjiFavorites.some(f => f.id === item.id || (f.kanji === item.kanji && f.reading === item.reading));
  };

  const toggleKanjiFavorite = (item?: KanjiVocabItem | null, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item) return;
    const exists = isKanjiFavorite(item);
    if (exists) {
      setKanjiFavorites(prev => prev.filter(f => !(f.id === item.id || (f.kanji === item.kanji && f.reading === item.reading))));
      playSfx('click');
      if (showToast) showToast(`Dihapus dari Favorit Kanji: ${item.kanji}`, 'info');
    } else {
      setKanjiFavorites(prev => [...prev, item]);
      playSfx('correct');
      if (showToast) showToast(`⭐ Ditambahkan ke Favorit Kanji: ${item.kanji} (${item.reading})`, 'success');
    }
  };

  // Quiz Mode Configuration
  const [quizType, setQuizType] = useState<'kanji_to_combo' | 'meaning_to_kanji'>('kanji_to_combo');
  const [quizQuestions, setQuizQuestions] = useState<KanjiVocabItem[]>([]);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLives, setQuizLives] = useState(5);
  const [quizCombo, setQuizCombo] = useState(0);
  const [quizAnswerLock, setQuizAnswerLock] = useState(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<KanjiVocabItem | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Flashcards state
  const [fcIndex, setFcIndex] = useState(0);
  const [fcIsFlipped, setFcIsFlipped] = useState(false);

  // Dictionary Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Practice Canvas state
  const [writingKanji, setWritingKanji] = useState<KanjiVocabItem>(IRODORI_KANJI_LIST[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#e11d48');
  const [brushSize, setBrushSize] = useState(8);

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

  // Start / Restart Quiz
  const initQuiz = () => {
    playSfx('click');
    const shuffled = [...activePool].sort(() => 0.5 - Math.random());
    const subset = shuffled.slice(0, Math.min(20, shuffled.length));
    setQuizQuestions(subset);
    setQuizCurrentIndex(0);
    setQuizScore(0);
    setQuizLives(5);
    setQuizCombo(0);
    setQuizAnswerLock(false);
    setQuizSelectedOption(null);
    setQuizFinished(false);
    setQuizFeedback(null);
  };

  useEffect(() => {
    initQuiz();
    setFcIndex(0);
    setFcIsFlipped(false);
  }, [selectedTier, selectedChunk]);

  // Current Quiz Question and Options
  const currentQuizItem = quizQuestions[quizCurrentIndex] || null;

  const currentOptions = useMemo<KanjiVocabItem[]>(() => {
    if (!currentQuizItem) return [];

    // Pick 3 unique decoys from activePool or entire list
    const candidateList = activePool.length >= 6 ? activePool : IRODORI_KANJI_LIST;
    const decoys: KanjiVocabItem[] = [];
    const seen = new Set<string>([`${currentQuizItem.kanji}|${currentQuizItem.reading}`]);

    const shuffledCandidates = [...candidateList].sort(() => 0.5 - Math.random());
    for (const item of shuffledCandidates) {
      const key = `${item.kanji}|${item.reading}`;
      if (!seen.has(key) && item.kanji.trim() !== '') {
        seen.add(key);
        decoys.push(item);
        if (decoys.length >= 3) break;
      }
    }

    const allOpts = [currentQuizItem, ...decoys];
    return allOpts.sort(() => 0.5 - Math.random());
  }, [currentQuizItem, activePool]);

  // Handle option click
  const handleAnswer = (option: KanjiVocabItem) => {
    if (quizAnswerLock || !currentQuizItem) return;
    setQuizAnswerLock(true);
    setQuizSelectedOption(option);

    const isCorrect = option.kanji === currentQuizItem.kanji && option.reading === currentQuizItem.reading;

    if (isCorrect) {
      playSfx('correct');
      setQuizScore(prev => prev + 1);
      setQuizCombo(prev => prev + 1);
      setQuizFeedback({
        isCorrect: true,
        text: `Benar! 🎉 ${currentQuizItem.kanji}【${currentQuizItem.reading}】 = ${currentQuizItem.meaning}`
      });
    } else {
      playSfx('wrong');
      setQuizCombo(0);
      setQuizLives(prev => Math.max(0, prev - 1));
      setQuizFeedback({
        isCorrect: false,
        text: `Kurang tepat! Jawaban benar: ${currentQuizItem.kanji}【${currentQuizItem.reading}】 = ${currentQuizItem.meaning}`
      });
    }

    setTimeout(() => {
      if (quizLives <= 1 && !isCorrect) {
        setQuizFinished(true);
        playSfx('wrong');
      } else if (quizCurrentIndex + 1 < quizQuestions.length) {
        setQuizCurrentIndex(prev => prev + 1);
        setQuizAnswerLock(false);
        setQuizSelectedOption(null);
        setQuizFeedback(null);
      } else {
        setQuizFinished(true);
        playSfx('win');
      }
    }, 1400);
  };

  // Canvas functions
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
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

  return (
    <div
      id="kanji-hub-container"
      className={`max-w-[520px] w-full rounded-[36px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-2xl transition-colors duration-200 flex flex-col min-h-[82vh] ${
        darkMode ? 'bg-slate-900/95 border-slate-700/80 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className={`p-4 pb-3 border-b flex items-center justify-between ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2.5">
          <button
            id="kanji-back-btn"
            onClick={() => {
              playSfx('click');
              onBack();
            }}
            className={`p-2 rounded-2xl border transition-colors ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Kembali ke Pilihan Mode"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🈁</span>
              <h2 className="text-base font-black tracking-tight leading-tight">
                Kuis Kanji Irodori
              </h2>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/30">
                580 Kata
              </span>
            </div>
            <p className={`text-[10px] font-medium leading-none mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mastery Kanji: Nyuumon (入门), Shokyuu 1 (初级1), Shokyuu 2 (初级2)
            </p>
          </div>
        </div>

        {/* Start in Main Quiz Button */}
        {onStartMainQuizWithKanji && (
          <button
            onClick={() => {
              playSfx('click');
              const tierName = selectedTier === 'nyuumon' ? '入門 (167 Kanji)' : selectedTier === 'shokyuu1' ? '初級1 (252 Kanji)' : selectedTier === 'shokyuu2' ? '初級2 (161 Kanji)' : 'Semua 580 Kanji';
              onStartMainQuizWithKanji(activePool, `Kuis Kanji: ${tierName}`);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-[10px] shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
            title="Mainkan dengan engine kuis utama (Timer, combo, nyawa & celebration)"
          >
            <Flame className="w-3 h-3" />
            <span>Kuis Utama</span>
          </button>
        )}
      </div>

      {/* Tier Selector Tabs */}
      <div className={`px-4 pt-2.5 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b ${darkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'}`}>
        <button
          id="tier-btn-all"
          onClick={() => {
            playSfx('click');
            setSelectedTier('all');
            setSelectedChunk(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black tracking-tight whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedTier === 'all' && selectedChunk === null
              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25 scale-[1.02]'
              : darkMode
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>🌟</span>
          <span>Semua (580)</span>
        </button>

        <button
          id="tier-btn-nyuumon"
          onClick={() => {
            playSfx('click');
            setSelectedTier('nyuumon');
            setSelectedChunk(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black tracking-tight whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedTier === 'nyuumon' && selectedChunk === null
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25 scale-[1.02]'
              : darkMode
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>🌱</span>
          <span>入門 Nyuumon (167)</span>
        </button>

        <button
          id="tier-btn-shokyuu1"
          onClick={() => {
            playSfx('click');
            setSelectedTier('shokyuu1');
            setSelectedChunk(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black tracking-tight whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedTier === 'shokyuu1' && selectedChunk === null
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 scale-[1.02]'
              : darkMode
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>⚡</span>
          <span>初級1 (252)</span>
        </button>

        <button
          id="tier-btn-shokyuu2"
          onClick={() => {
            playSfx('click');
            setSelectedTier('shokyuu2');
            setSelectedChunk(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black tracking-tight whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedTier === 'shokyuu2' && selectedChunk === null
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25 scale-[1.02]'
              : darkMode
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <span>👑</span>
          <span>初級2 (161)</span>
        </button>

        <button
          id="tier-btn-favorites"
          onClick={() => {
            playSfx('click');
            setSelectedTier('favorites');
            setSelectedChunk(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black tracking-tight whitespace-nowrap transition-all flex items-center gap-1 ${
            selectedTier === 'favorites' && selectedChunk === null
              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 scale-[1.02]'
              : darkMode
                ? 'bg-slate-800/80 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
                : 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Star className={`w-3 h-3 ${selectedTier === 'favorites' ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
          <span>Favorit ({kanjiFavorites.length})</span>
        </button>
      </div>

      {/* Mode Sub-tabs: Kuis | Flashcards | Kamus | Tulis */}
      <div className={`px-4 py-2 flex items-center justify-around border-b ${darkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-100 bg-slate-50/40'}`}>
        <button
          id="mode-tab-quiz"
          onClick={() => {
            playSfx('click');
            setActiveTab('quiz');
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'quiz'
              ? 'bg-rose-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Kuis</span>
        </button>

        <button
          id="mode-tab-flashcards"
          onClick={() => {
            playSfx('click');
            setActiveTab('flashcards');
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'flashcards'
              ? 'bg-rose-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flashcard</span>
        </button>

        <button
          id="mode-tab-dictionary"
          onClick={() => {
            playSfx('click');
            setActiveTab('dictionary');
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'dictionary'
              ? 'bg-rose-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kamus 580</span>
        </button>

        <button
          id="mode-tab-write"
          onClick={() => {
            playSfx('click');
            setActiveTab('practice_write');
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'practice_write'
              ? 'bg-rose-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Tulis</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 flex flex-col overflow-y-auto no-scrollbar">
        {activeTab === 'quiz' && (
          <div className="flex flex-col flex-1">
            {/* Quiz Type Selector & Stats */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  id="quiz-type-combo"
                  onClick={() => {
                    playSfx('click');
                    setQuizType('kanji_to_combo');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    quizType === 'kanji_to_combo'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Kanji ➔ Cara Baca & Arti
                </button>
                <button
                  id="quiz-type-reverse"
                  onClick={() => {
                    playSfx('click');
                    setQuizType('meaning_to_kanji');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    quizType === 'meaning_to_kanji'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Arti ➔ Kanji
                </button>
              </div>

              {/* Lives & Score */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-rose-500 font-black text-xs">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{quizLives}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500 font-black text-xs">
                  <Trophy className="w-3.5 h-3.5 fill-current" />
                  <span>{quizScore}</span>
                </div>
              </div>
            </div>

            {/* Quiz Card */}
            {activePool.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Star className="w-8 h-8 fill-amber-400" />
                </div>
                <h3 className="text-base font-black">Belum Ada Kanji Favorit</h3>
                <p className={`text-xs mt-1.5 mb-4 max-w-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tekan ikon bintang <Star className="w-3.5 h-3.5 inline text-amber-500 fill-amber-400" /> pada soal kuis, flashcard, atau kamus untuk menandai kanji yang ingin kamu pelajari secara khusus!
                </p>
                <button
                  onClick={() => {
                    playSfx('click');
                    setSelectedTier('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-xs hover:brightness-110 active:scale-95 transition-all"
                >
                  Jelajahi Semua Kanji
                </button>
              </div>
            ) : !quizFinished && currentQuizItem ? (
              <div className="flex-1 flex flex-col justify-between">
                {/* Question Box */}
                <div className={`p-4 sm:p-5 rounded-3xl border text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] shadow-sm ${
                  darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-gradient-to-b from-rose-50/40 to-white border-rose-100'
                }`}>
                  {/* Top Bar with Question Counter & Action Buttons */}
                  <div className="w-full flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                      Soal {quizCurrentIndex + 1} / {quizQuestions.length} • Bab {currentQuizItem.lesson}
                    </span>

                    <button
                      id="quiz-favorite-btn"
                      onClick={(e) => toggleKanjiFavorite(currentQuizItem, e)}
                      className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                        isKanjiFavorite(currentQuizItem)
                          ? 'bg-amber-500/15 border-amber-400 text-amber-500 shadow-xs scale-105'
                          : darkMode ? 'bg-slate-700/80 border-slate-600 text-slate-400 hover:text-amber-400' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 shadow-xs'
                      }`}
                      title={isKanjiFavorite(currentQuizItem) ? "Hapus dari Favorit Kanji" : "Simpan ke Favorit Kanji"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isKanjiFavorite(currentQuizItem) ? 'fill-amber-400 text-amber-500' : ''}`} />
                      <span className="text-[9px] font-black">{isKanjiFavorite(currentQuizItem) ? 'Favorit' : ''}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-center my-1">
                    <h1 className="text-4xl font-black tracking-tight" translate="no">
                      {quizType === 'meaning_to_kanji' ? currentQuizItem.meaning : currentQuizItem.kanji}
                    </h1>
                  </div>

                  {/* Subtitle hint */}
                  <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {quizType === 'kanji_to_combo'
                      ? 'Pilihlah cara baca dan arti yang tepat:'
                      : 'Pilihlah Kanji yang sesuai dengan arti di atas:'}
                  </p>
                </div>

                {/* Feedback Banner */}
                {quizFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`my-2 p-2.5 rounded-2xl text-xs font-black text-center ${
                      quizFeedback.isCorrect
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {quizFeedback.text}
                  </motion.div>
                )}

                {/* 4 Options */}
                <div className="grid grid-cols-2 gap-2.5 mt-3">
                  {currentOptions.map((opt, idx) => {
                    const isSelected = quizSelectedOption?.kanji === opt.kanji && quizSelectedOption?.reading === opt.reading;
                    const isTargetCorrect = opt.kanji === currentQuizItem.kanji && opt.reading === currentQuizItem.reading;

                    let btnClass = darkMode
                      ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-rose-500 hover:bg-slate-700/80'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-rose-50/40';

                    if (quizAnswerLock) {
                      if (isTargetCorrect) {
                        btnClass = 'bg-emerald-500 border-emerald-400 text-white font-black scale-[1.02] shadow-sm';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-500 border-rose-400 text-white font-black animate-shake';
                      } else {
                        btnClass = 'opacity-40 pointer-events-none border-transparent';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizAnswerLock}
                        onClick={() => handleAnswer(opt)}
                        className={`p-3 rounded-2xl border-2 font-bold text-xs transition-all text-center flex flex-col items-center justify-center min-h-[66px] shadow-xs active:scale-95 leading-tight ${btnClass}`}
                      >
                        {quizType === 'kanji_to_combo' ? (
                          <>
                            <span className="text-[14px] font-black tracking-wide" translate="no">{opt.reading}</span>
                            <span className={`text-[11px] font-semibold mt-0.5 line-clamp-1 ${
                              quizAnswerLock && (isTargetCorrect || isSelected)
                                ? 'text-white/90'
                                : darkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              ({opt.meaning})
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-base font-black tracking-wide" translate="no">{opt.kanji}</span>
                            <span className={`text-[11px] font-semibold mt-0.5 line-clamp-1 ${
                              quizAnswerLock && (isTargetCorrect || isSelected)
                                ? 'text-white/90'
                                : darkMode ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              ({opt.reading})
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Quiz Finished Card */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-lg mb-3"
                >
                  🏆
                </motion.div>
                <h3 className="text-xl font-black">Kuis Selesai!</h3>
                <p className={`text-xs mt-1 mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Skor Anda: <span className="text-rose-500 font-black text-sm">{quizScore}</span> dari {quizQuestions.length} soal
                </p>

                <div className="flex gap-2 w-full max-w-xs">
                  <button
                    onClick={initQuiz}
                    className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Kuis</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {activeTab === 'flashcards' && (
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="flex items-center justify-between text-xs font-bold px-1 mb-2">
              <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                Kartu {fcIndex + 1} dari {activePool.length}
              </span>
              <button
                onClick={() => {
                  playSfx('click');
                  setFcIndex(Math.floor(Math.random() * activePool.length));
                  setFcIsFlipped(false);
                }}
                className="text-rose-500 flex items-center gap-1 hover:underline text-[11px]"
              >
                <Shuffle className="w-3 h-3" />
                <span>Acak</span>
              </button>
            </div>

            {/* Flip Card */}
            {activePool[fcIndex] && (
              <div
                onClick={() => {
                  playSfx('click');
                  setFcIsFlipped(!fcIsFlipped);
                }}
                className={`w-full min-h-[220px] rounded-3xl border-2 p-6 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all shadow-md relative overflow-hidden ${
                  darkMode
                    ? 'bg-slate-800/80 border-slate-700 hover:border-rose-500/60'
                    : 'bg-white border-slate-200 hover:border-rose-300'
                }`}
              >
                <span className="absolute top-3 left-3 text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                  Bab {activePool[fcIndex].lesson}
                </span>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-slate-400">
                    {fcIsFlipped ? 'Sisi Belakang' : 'Klik untuk Membalik'}
                  </span>
                  <button
                    onClick={(e) => toggleKanjiFavorite(activePool[fcIndex], e)}
                    className={`p-1 rounded-lg border transition-all z-20 ${
                      isKanjiFavorite(activePool[fcIndex])
                        ? 'bg-amber-500/15 border-amber-400 text-amber-500'
                        : darkMode ? 'bg-slate-700/80 border-slate-600 text-slate-400 hover:text-amber-400' : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                    }`}
                    title={isKanjiFavorite(activePool[fcIndex]) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                  >
                    <Star className={`w-3.5 h-3.5 ${isKanjiFavorite(activePool[fcIndex]) ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!fcIsFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center"
                    >
                      <h1 className="text-5xl font-black text-rose-500 mb-2" translate="no">
                        {activePool[fcIndex].kanji}
                      </h1>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Sentuh kartu untuk melihat cara baca & arti
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center"
                    >
                      <p className="text-lg font-black text-rose-500 mb-0.5" translate="no">
                        {activePool[fcIndex].reading}
                      </p>
                      <h3 className="text-2xl font-black mb-1">
                        {activePool[fcIndex].meaning}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(activePool[fcIndex].kanji);
                        }}
                        className="mt-2 px-3 py-1.5 rounded-full bg-rose-500/15 text-rose-500 font-bold text-xs flex items-center gap-1.5 hover:bg-rose-500/25"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Dengarkan Lafal</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Flashcard Controls */}
            <div className="flex items-center justify-between gap-3 mt-4">
              <button
                disabled={fcIndex === 0}
                onClick={() => {
                  playSfx('click');
                  setFcIndex(prev => Math.max(0, prev - 1));
                  setFcIsFlipped(false);
                }}
                className={`flex-1 py-2.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1 ${
                  fcIndex === 0
                    ? 'opacity-40 cursor-not-allowed border-transparent'
                    : darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                disabled={fcIndex >= activePool.length - 1}
                onClick={() => {
                  playSfx('click');
                  setFcIndex(prev => Math.min(activePool.length - 1, prev + 1));
                  setFcIsFlipped(false);
                }}
                className={`flex-1 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm ${
                  fcIndex >= activePool.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110'
                }`}
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dictionary Tab (Search all 580 Kanji) */}
        {activeTab === 'dictionary' && (
          <div className="flex-1 flex flex-col">
            <div className="relative mb-3">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                id="kanji-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Kanji, Hiragana, arti Indonesia, atau nomor bab..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  darkMode ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <p className={`text-[10px] font-bold mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Menampilkan {filteredDictionary.length} dari {activePool.length} Kanji
            </p>

            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-2 max-h-[360px]">
              {filteredDictionary.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs transition-colors ${
                    darkMode ? 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600' : 'bg-white border-slate-200/80 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 w-6 text-right">
                      #{item.id}
                    </span>
                    <button
                      onClick={() => speakJapanese(item.kanji)}
                      className="text-xl font-black text-rose-500 hover:scale-110 transition-transform"
                      title="Klik untuk dengar"
                      translate="no"
                    >
                      {item.kanji}
                    </button>
                    <div>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400" translate="no">
                        {item.reading}
                      </p>
                      <p className="text-xs font-bold leading-tight">
                        {item.meaning}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      Bab {item.lesson}
                    </span>
                    <button
                      onClick={(e) => toggleKanjiFavorite(item, e)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isKanjiFavorite(item)
                          ? 'bg-amber-500/15 border-amber-400 text-amber-500'
                          : darkMode ? 'bg-slate-700 border-slate-600 text-slate-400 hover:text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                      title={isKanjiFavorite(item) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                    >
                      <Star className={`w-3.5 h-3.5 ${isKanjiFavorite(item) ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => speakJapanese(item.kanji)}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        darkMode ? 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Dengarkan Pengucapan"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setWritingKanji(item);
                        setActiveTab('practice_write');
                        playSfx('click');
                      }}
                      className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                      title="Latihan Tulis Kanji Ini"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Writing Tab (Canvas) */}
        {activeTab === 'practice_write' && (
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-rose-500" translate="no">{writingKanji.kanji}</span>
                <div>
                  <p className="text-xs font-bold">{writingKanji.meaning}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold" translate="no">{writingKanji.reading}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => toggleKanjiFavorite(writingKanji, e)}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    isKanjiFavorite(writingKanji)
                      ? 'bg-amber-500/15 border-amber-400 text-amber-500'
                      : darkMode ? 'bg-slate-700 border-slate-600 text-slate-400 hover:text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-amber-500'
                  }`}
                  title={isKanjiFavorite(writingKanji) ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                >
                  <Star className={`w-4 h-4 ${isKanjiFavorite(writingKanji) ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => speakJapanese(writingKanji.kanji)}
                  className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                  title="Dengar Lafal"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawing Canvas Container */}
            <div className="relative w-full max-w-[280px] aspect-square rounded-3xl border-2 border-rose-300 dark:border-slate-700 overflow-hidden shadow-inner bg-white dark:bg-slate-800 flex items-center justify-center">
              {/* Guidelines Cross Grid */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2">
                <div className="border-r border-b border-dashed border-rose-200 dark:border-slate-700"></div>
                <div className="border-b border-dashed border-rose-200 dark:border-slate-700"></div>
                <div className="border-r border-dashed border-rose-200 dark:border-slate-700"></div>
                <div></div>
              </div>

              {/* Watermark character background for tracing */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none opacity-20 dark:opacity-15 font-black text-9xl text-slate-400" translate="no">
                {writingKanji.kanji}
              </div>

              <canvas
                ref={canvasRef}
                width={280}
                height={280}
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

            {/* Controls */}
            <div className="flex items-center gap-2 mt-3 w-full max-w-[280px]">
              <button
                onClick={clearCanvas}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  const nextIdx = Math.floor(Math.random() * activePool.length);
                  setWritingKanji(activePool[nextIdx]);
                  clearCanvas();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:brightness-110 transition-colors flex items-center justify-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Ganti Kanji</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 29 Chunk Levels Explorer at Bottom for Quick Selection */}
      <div className={`p-3 border-t ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/60'}`}>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className={`text-[9px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Level Bertahap (20 Kanji per Level):
          </span>
          <span className="text-[8px] font-bold text-rose-500">
            29 Level Total
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {Object.keys(KANJI_LEVEL_CHUNKS).map(Number).map(chunkNum => {
            const chunk = KANJI_LEVEL_CHUNKS[chunkNum];
            const isChunkActive = selectedChunk === chunkNum;
            return (
              <button
                key={chunkNum}
                onClick={() => {
                  playSfx('click');
                  setSelectedChunk(chunkNum);
                }}
                className={`px-2 py-1 rounded-xl text-[9px] font-black whitespace-nowrap transition-all flex items-center gap-0.5 border ${
                  isChunkActive
                    ? 'bg-rose-500 text-white border-rose-400 shadow-xs scale-105'
                    : darkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                }`}
              >
                <span>{chunk.icon}</span>
                <span>Lv.{chunkNum}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
