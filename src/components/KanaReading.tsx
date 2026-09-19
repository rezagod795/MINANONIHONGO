import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowLeft, BookOpen, Layers, Star } from 'lucide-react';
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
}

export function KanaReading({
  darkMode,
  onBack,
  onSwitchToWriting,
  speakJapanese,
  playSfx,
  showToast,
}: KanaReadingProps) {
  const [scriptType, setScriptType] = useState<'hiragana' | 'katakana'>('hiragana');
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

  const filteredChars = activeRow === 'favorites'
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
  const activeQuizPoolData = (quizOnlyFavorites && scriptFavorites.length > 0)
    ? scriptFavorites
    : currentDataset;

  // Helper to get next random index from pool without immediate repeating
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
  const currentQuizChar = activeQuizPoolData[quizIndex % activeQuizPoolData.length] || currentDataset[0];
  const [quizOptions, setQuizOptions] = useState<string[]>(() => generateOptions(currentQuizChar, currentDataset));

  function generateOptions(target: KanaChar, dataset: KanaChar[]): string[] {
    const wrongOptions = dataset
      .filter(c => c.romaji !== target.romaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(c => c.romaji);
    return [target.romaji, ...wrongOptions].sort(() => 0.5 - Math.random());
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
    const poolData = (quizOnlyFavorites && scriptFavorites.length > 0)
      ? scriptFavorites
      : currentDataset;

    const nextIdx = targetIdx !== undefined 
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
    const poolData = (onlyFavorites && scriptFavorites.length > 0)
      ? scriptFavorites
      : currentDataset;
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

      // Otomatis lanjut ke soal berikutnya jika jawaban benar
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
      autoNextTimerRef.current = setTimeout(() => {
        advanceQuiz();
      }, 150);
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

  return (
    <motion.div
      key="kana-reading"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: 0.04 }}
      className={`max-w-[420px] w-full rounded-[40px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-md transition-colors duration-200 flex flex-col min-h-[78vh] ${
        darkMode ? 'bg-slate-900/95 border-slate-700/60 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-500/10">
        <button
          onClick={() => {
            playSfx('click');
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current);
              autoNextTimerRef.current = null;
            }
            onBack();
          }}
          className={`p-2 rounded-2xl border transition-all active:scale-90 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
          }`}
          title="Kembali ke Pilihan Mode"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black tracking-tight flex items-center justify-center gap-1.5">
            <span>📖</span>
            <span>Membaca Huruf Jepang</span>
          </h2>
          <p className={`text-[9px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Hiragana & Katakana
          </p>
        </div>

        {/* Switch to Menulis button */}
        <button
          onClick={() => {
            playSfx('click');
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current);
              autoNextTimerRef.current = null;
            }
            onSwitchToWriting();
          }}
          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-90 ${
            darkMode ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs'
          }`}
          title="Beralih ke Menu Menulis"
        >
          <span>✍️ Menulis</span>
        </button>
      </div>

      {/* Script Switcher (Hiragana vs Katakana) & View Toggle (Tabel vs Kuis) */}
      <div className="p-3 pb-2 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              setScriptType('hiragana');
              setSelectedChar(null);
              const favs = HIRAGANA_DATA.filter(c => isKanaFavorited(c));
              const poolData = (quizOnlyFavorites && favs.length > 0) ? favs : HIRAGANA_DATA;
              quizPoolRef.current = createShuffledIndices(poolData.length);
              const nextIdx = quizPoolRef.current.pop() ?? 0;
              setQuizIndex(nextIdx);
              const targetChar = poolData[nextIdx % poolData.length] || HIRAGANA_DATA[0];
              setQuizOptions(generateOptions(targetChar, HIRAGANA_DATA));
              setQuizAnswered(false);
              setSelectedAnswer(null);
              setIsCorrect(null);
              setQuestionCount(1);
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
              scriptType === 'hiragana'
                ? 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-500/20'
                : darkMode
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span>あ</span>
            <span>Hiragana (ひらがな)</span>
          </button>

          <button
            onClick={() => {
              playSfx('click');
              if (autoNextTimerRef.current) {
                clearTimeout(autoNextTimerRef.current);
                autoNextTimerRef.current = null;
              }
              setScriptType('katakana');
              setSelectedChar(null);
              const favs = KATAKANA_DATA.filter(c => isKanaFavorited(c));
              const poolData = (quizOnlyFavorites && favs.length > 0) ? favs : KATAKANA_DATA;
              quizPoolRef.current = createShuffledIndices(poolData.length);
              const nextIdx = quizPoolRef.current.pop() ?? 0;
              setQuizIndex(nextIdx);
              const targetChar = poolData[nextIdx % poolData.length] || KATAKANA_DATA[0];
              setQuizOptions(generateOptions(targetChar, KATAKANA_DATA));
              setQuizAnswered(false);
              setSelectedAnswer(null);
              setIsCorrect(null);
              setQuestionCount(1);
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
              scriptType === 'katakana'
                ? 'bg-sky-500 text-white border-sky-400 shadow-sm shadow-sky-500/20'
                : darkMode
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span>ア</span>
            <span>Katakana (カタカナ)</span>
          </button>
        </div>

        {/* Sub-mode: Tabel vs Kuis Baca */}
        <div className="flex items-center justify-between px-1">
          <div className="flex gap-1.5 bg-slate-500/10 p-0.5 rounded-xl">
            <button
              onClick={() => {
                playSfx('click');
                if (autoNextTimerRef.current) {
                  clearTimeout(autoNextTimerRef.current);
                  autoNextTimerRef.current = null;
                }
                setMode('chart');
              }}
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                mode === 'chart'
                  ? darkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Tabel & Audio
            </button>
            <button
              onClick={() => {
                playSfx('click');
                if (autoNextTimerRef.current) {
                  clearTimeout(autoNextTimerRef.current);
                  autoNextTimerRef.current = null;
                }
                setMode('quiz');
                const poolData = (quizOnlyFavorites && scriptFavorites.length > 0)
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
              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                mode === 'quiz'
                  ? darkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              ⚡ Kuis Membaca
            </button>
          </div>

          <span className={`text-[9px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredChars.length} Huruf
          </span>
        </div>
      </div>

      {mode === 'chart' ? (
        <div className="flex-grow flex flex-col overflow-hidden px-3 pb-4">
          {/* Row Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2.5">
            {rows.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  playSfx('click');
                  setActiveRow(r.id);
                }}
                className={`px-2.5 py-1 rounded-full text-[9px] font-black whitespace-nowrap transition-all border flex items-center gap-1 ${
                  activeRow === r.id
                    ? darkMode
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-amber-100 border-amber-300 text-amber-800'
                    : darkMode
                      ? 'bg-slate-800/50 border-slate-700/60 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Character Grid or Empty State for Favorites */}
          {activeRow === 'favorites' && filteredChars.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 mb-2.5 text-xl">
                ⭐
              </div>
              <p className="text-xs font-black mb-1">Belum Ada Huruf Favorit</p>
              <p className={`text-[10px] font-semibold max-w-[240px] leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Pilih huruf di tabel lalu tekan ikon bintang ⭐ pada kartu detail, atau tandai langsung saat kuis membaca!
              </p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto max-h-[300px] pr-1 grid grid-cols-5 gap-1.5 no-scrollbar content-start">
              {filteredChars.map((item) => {
                const isSelected = selectedChar?.char === item.char;
                const isFav = isKanaFavorited(item);
                return (
                  <motion.button
                    key={`${item.type}-${item.char}`}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleCharClick(item)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 border transition-all relative select-none ${
                      isSelected
                        ? 'bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-500/30'
                        : darkMode
                          ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:border-slate-500'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-rose-300 shadow-xs'
                    }`}
                  >
                    {/* Star indicator if favorited */}
                    {isFav && (
                      <div className="absolute top-1 right-1 pointer-events-none">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                      </div>
                    )}
                    <span className="text-xl font-black leading-none">{item.char}</span>
                    <span className={`text-[8.5px] font-bold mt-0.5 ${
                      isSelected ? 'text-white/90' : darkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {item.romaji}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Detail Card below grid */}
          <div className={`mt-3 p-3 rounded-2xl border transition-all ${
            darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-rose-50/50 border-rose-100'
          }`}>
            {selectedChar ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-sm relative">
                    {selectedChar.char}
                    {isKanaFavorited(selectedChar) && (
                      <div className="absolute -top-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm tracking-tight">{selectedChar.romaji}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        darkMode ? 'bg-slate-700 text-slate-300' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {selectedChar.strokeCount || 2} Coretan
                      </span>
                    </div>
                    <p className={`text-[10px] font-semibold mt-0.5 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Contoh: <span className="font-bold text-rose-500">{selectedChar.example}</span> ({selectedChar.meaning})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Favorite Toggle Button */}
                  <button
                    onClick={() => toggleKanaFavorite(selectedChar)}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                      isKanaFavorited(selectedChar)
                        ? 'bg-amber-400/20 border-amber-400 text-amber-500 shadow-xs'
                        : darkMode
                          ? 'bg-slate-700/80 border-slate-600 text-slate-400 hover:text-amber-400'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500 shadow-xs'
                    }`}
                    title={isKanaFavorited(selectedChar) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    aria-label="Favorit"
                  >
                    <Star className={`w-4 h-4 ${isKanaFavorited(selectedChar) ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>

                  {/* Audio Play Button */}
                  <button
                    onClick={() => {
                      playSfx('click');
                      speakJapanese(selectedChar.char);
                    }}
                    className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-sm active:scale-95 transition-all"
                    title="Putar Suara"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className={`text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  👆 Sentuh salah satu huruf di atas untuk mendengarkan lafal & melihat contoh kata
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Kuis Membaca Huruf */
        <div className="flex-grow flex flex-col p-4 items-center justify-between gap-3">
          {/* Quiz Source Filter: Semua vs Favorit */}
          <div className="w-full flex items-center justify-between gap-2 bg-slate-500/10 p-1 rounded-2xl">
            <button
              onClick={() => switchQuizMode(false)}
              className={`flex-1 py-1 px-2.5 rounded-xl text-[10px] font-black transition-all text-center ${
                !quizOnlyFavorites
                  ? darkMode ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Semua Huruf ({currentDataset.length})
            </button>
            <button
              onClick={() => switchQuizMode(true)}
              className={`flex-1 py-1 px-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                quizOnlyFavorites
                  ? 'bg-amber-400 text-slate-900 shadow-xs'
                  : 'text-amber-500 hover:text-amber-400'
              }`}
            >
              <Star className={`w-3 h-3 ${quizOnlyFavorites ? 'fill-slate-900 text-slate-900' : 'fill-amber-400 text-amber-500'}`} />
              <span>Huruf Favorit ({scriptFavorites.length})</span>
            </button>
          </div>

          {/* If Quiz Only Favorites is active and no favorites exist */}
          {quizOnlyFavorites && scriptFavorites.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-14 h-14 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500 mb-3 text-2xl shadow-inner">
                ⭐
              </div>
              <h3 className="text-sm font-black mb-1.5">Belum Ada Huruf Favorit</h3>
              <p className={`text-[11px] font-medium max-w-[260px] leading-relaxed mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Tandai huruf sulit atau penting dengan ikon bintang ⭐ pada kartu kuis untuk latihan terfokus di sini!
              </p>
              <button
                onClick={() => switchQuizMode(false)}
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black shadow-md hover:bg-rose-600 active:scale-95 transition-all"
              >
                Mulai Kuis Semua Huruf
              </button>
            </div>
          ) : (
            <>
              <div className="w-full flex items-center justify-between text-[10px] font-extrabold px-1 text-slate-400">
                <span>Skor: <strong className="text-rose-500 font-mono text-xs">{quizScore}</strong></span>
                <span>Streak: <strong className="text-amber-500 font-mono text-xs">🔥 {quizStreak}</strong></span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                    quizOnlyFavorites
                      ? 'bg-amber-400/20 text-amber-500 border border-amber-400/40'
                      : darkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {quizOnlyFavorites ? '⭐ Favorit' : '🎲 Acak'}
                  </span>
                  <span>Soal ke {questionCount}</span>
                </div>
              </div>

              {/* Question Display Card with Favorite Button and Audio Button */}
              <motion.div
                key={`q-${quizIndex}-${currentQuizChar.char}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.06, ease: "easeOut" }}
                className={`w-36 h-36 rounded-3xl flex flex-col items-center justify-center border-2 shadow-xl relative select-none ${
                  darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                {/* Voice / Audio pronunciation button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSfx('click');
                    speakJapanese(currentQuizChar.char);
                  }}
                  className={`absolute top-2 left-2 p-2 rounded-xl border transition-all active:scale-90 ${
                    darkMode
                      ? 'bg-slate-700/60 border-slate-600/70 text-slate-400 hover:text-rose-400'
                      : 'bg-slate-100/90 border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Dengarkan Lafal"
                  aria-label="Putar Suara"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Favorite Star Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKanaFavorite(currentQuizChar);
                  }}
                  className={`absolute top-2 right-2 p-2 rounded-xl border transition-all active:scale-90 ${
                    isKanaFavorited(currentQuizChar)
                      ? 'bg-amber-400/20 border-amber-400/60 text-amber-500 shadow-sm'
                      : darkMode
                        ? 'bg-slate-700/60 border-slate-600/70 text-slate-400 hover:text-amber-400'
                        : 'bg-slate-100/90 border-slate-200 text-slate-400 hover:text-amber-500'
                  }`}
                  title={isKanaFavorited(currentQuizChar) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                  aria-label="Tandai Huruf Favorit"
                >
                  <motion.div
                    key={isKanaFavorited(currentQuizChar) ? 'fav' : 'unfav'}
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 15 }}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isKanaFavorited(currentQuizChar)
                          ? 'fill-amber-400 text-amber-500'
                          : ''
                      }`}
                    />
                  </motion.div>
                </button>

                <span className="text-5xl font-black text-rose-500 leading-none">
                  {currentQuizChar.char}
                </span>

                {isKanaFavorited(currentQuizChar) && (
                  <span className="text-[8px] font-black text-amber-500 mt-1.5 flex items-center gap-0.5 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                    ⭐ Favorit
                  </span>
                )}
              </motion.div>

              <p className={`text-[11px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Bagaimana cara membaca huruf ini dalam Romaji?
              </p>

              {/* 4 Choices */}
              <div className="w-full grid grid-cols-2 gap-2.5">
                {quizOptions.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrectOpt = opt === currentQuizChar.romaji;
                  let btnStyle = darkMode
                    ? 'bg-slate-800/60 border-slate-700 text-white hover:border-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-rose-300 shadow-xs';

                  if (quizAnswered) {
                    if (isCorrectOpt) {
                      btnStyle = 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/20';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-500/20';
                    } else {
                      btnStyle = 'opacity-40 pointer-events-none';
                    }
                  }

                  return (
                    <RippleButton
                      key={opt}
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
                      className={`py-3.5 px-4 rounded-2xl border-2 font-black text-sm uppercase tracking-wider transition-all ${btnStyle}`}
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
                        <span className="text-emerald-500 flex items-center gap-1.5 animate-pulse">
                          <CheckCircle2 className="w-4 h-4" /> Benar! Otomatis lanjut...
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Jawaban: {currentQuizChar.romaji}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleNextQuiz}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
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
    </motion.div>
  );
}
