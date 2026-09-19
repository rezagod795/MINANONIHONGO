import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Volume2, Sparkles, BookOpen, Flame, Award, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { HIRAGANA_DATA, KATAKANA_DATA, KanaChar } from '../data/kana_data';
import { DrawingCanvas } from './DrawingCanvas';

interface KanaWritingProps {
  darkMode: boolean;
  onBack: () => void;
  onSwitchToReading: () => void;
  speakJapanese: (text: string) => void;
  playSfx: (type: 'click' | 'correct' | 'wrong' | 'levelup' | 'streak') => void;
}

export function KanaWriting({
  darkMode,
  onBack,
  onSwitchToReading,
  speakJapanese,
  playSfx,
}: KanaWritingProps) {
  const [scriptType, setScriptType] = useState<'hiragana' | 'katakana'>('hiragana');
  const [charIndex, setCharIndex] = useState(0);
  const [activeRow, setActiveRow] = useState<string>('all');
  const [successCount, setSuccessCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentDataset = scriptType === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA;
  const filteredChars = activeRow === 'all'
    ? currentDataset
    : currentDataset.filter(c => c.row === activeRow);

  const safeIndex = Math.min(charIndex, filteredChars.length - 1);
  const currentChar = filteredChars[safeIndex] || currentDataset[0];

  const rows = [
    { id: 'all', label: 'Semua' },
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

  const handleNext = () => {
    if (safeIndex < filteredChars.length - 1) {
      playSfx('click');
      const nextIndex = safeIndex + 1;
      setCharIndex(nextIndex);
      speakJapanese(filteredChars[nextIndex].char);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      playSfx('click');
      const prevIndex = safeIndex - 1;
      setCharIndex(prevIndex);
      speakJapanese(filteredChars[prevIndex].char);
    }
  };

  // Called automatically when user writes the character correctly
  const handleCorrectDrawing = () => {
    setSuccessCount(prev => prev + 1);
    setStreak(prev => prev + 1);

    if (safeIndex < filteredChars.length - 1) {
      const nextIndex = safeIndex + 1;
      setCharIndex(nextIndex);
      // Speak the next character
      setTimeout(() => {
        speakJapanese(filteredChars[nextIndex].char);
      }, 100);
    } else {
      // Finished all characters in current category
      playSfx('levelup');
      setIsCompleted(true);
      try {
        confetti({
          particleCount: 75,
          spread: 90,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#fbbf24', '#ec4899'],
        });
      } catch (_) {}
    }
  };

  return (
    <motion.div
      key="kana-writing"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0 } }}
      transition={{ duration: 0.04 }}
      className={`max-w-[420px] w-full rounded-[40px] shadow-2xl relative z-10 overflow-hidden border backdrop-blur-md transition-colors duration-200 flex flex-col min-h-[78vh] ${
        darkMode ? 'bg-slate-900/95 border-slate-700/60 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-500/10">
        <button
          onClick={() => {
            playSfx('click');
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
            <span>✍️</span>
            <span>Papan Menulis Kana</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className={`text-[8.5px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Latih Goresan Huruf
            </span>
            {streak > 1 && (
              <span className="text-[8.5px] font-black text-amber-500 flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                <Flame className="w-2.5 h-2.5 fill-amber-500" />
                {streak}x
              </span>
            )}
          </div>
        </div>

        {/* Switch to Membaca button */}
        <button
          onClick={() => {
            playSfx('click');
            onSwitchToReading();
          }}
          className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1 transition-all active:scale-90 ${
            darkMode ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
          }`}
          title="Beralih ke Menu Membaca"
        >
          <BookOpen className="w-3 h-3" />
          <span>Membaca</span>
        </button>
      </div>

      {/* Script switcher */}
      <div className="p-3 pb-1.5 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              playSfx('click');
              setScriptType('hiragana');
              setCharIndex(0);
              setIsCompleted(false);
            }}
            className={`py-2 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
              scriptType === 'hiragana'
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/20'
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
              setScriptType('katakana');
              setCharIndex(0);
              setIsCompleted(false);
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

        {/* Filter Bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {rows.map(r => (
            <button
              key={r.id}
              onClick={() => {
                playSfx('click');
                setActiveRow(r.id);
                setCharIndex(0);
                setIsCompleted(false);
              }}
              className={`px-2.5 py-1 rounded-full text-[9px] font-black whitespace-nowrap transition-all border ${
                activeRow === r.id
                  ? darkMode
                    ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300'
                    : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : darkMode
                  ? 'bg-slate-800/50 border-slate-700/60 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Drawing Area */}
      <div className="flex-grow flex flex-col px-4 pb-4 items-center justify-between gap-2.5">
        {/* Character Navigation Header */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl font-black leading-none text-emerald-500">
              {currentChar.char}
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wider uppercase text-rose-500">
                  {currentChar.romaji}
                </span>
                <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold ${
                  darkMode ? 'bg-slate-800 text-slate-300' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {currentChar.strokeCount || 2} Goresan
                </span>
              </div>
              <p className={`text-[9px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {currentChar.example}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={safeIndex === 0}
              onClick={handlePrev}
              className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
                safeIndex === 0 ? 'opacity-30 pointer-events-none' : ''
              } ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Huruf Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-black px-1.5 text-slate-400">
              {safeIndex + 1}/{filteredChars.length}
            </span>
            <button
              disabled={safeIndex === filteredChars.length - 1}
              onClick={handleNext}
              className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
                safeIndex === filteredChars.length - 1 ? 'opacity-30 pointer-events-none' : ''
              } ${
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="Huruf Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Completion Celebration View (when reaching the end of list) */}
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className={`w-full p-6 rounded-[32px] border-2 text-center flex flex-col items-center gap-3 my-auto relative overflow-hidden shadow-xl ${
              darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-emerald-50/80 border-emerald-200'
            }`}
          >
            {/* Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full opacity-30 blur-lg bg-[conic-gradient(from_0deg,#10b981,#3b82f6,#f59e0b,#10b981)]"
              />
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/30 relative z-10 border-2 border-white/30">
                🎉
              </div>
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 mb-1.5">
                KATEGORI DITUNTASKAN!
              </div>
              <h3 className="text-lg font-black tracking-tight">Luar Biasa! Selesai!</h3>
              <p className={`text-xs mt-1 max-w-[260px] mx-auto font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Semua <strong className="text-emerald-500 font-black">{filteredChars.length} huruf</strong> pada kategori ini berhasil ditulis dengan mulus!
              </p>
            </div>

            <div className="flex gap-2 mt-2 w-full">
              <button
                onClick={() => {
                  playSfx('click');
                  setCharIndex(0);
                  setIsCompleted(false);
                }}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/25 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Ulangi Kategori
              </button>
              <button
                onClick={() => {
                  playSfx('click');
                  onSwitchToReading();
                }}
                className={`flex-1 py-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                  darkMode ? 'bg-slate-700/80 border-slate-600 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Kuis Membaca
              </button>
            </div>
          </motion.div>
        ) : (
          /* Interactive Drawing Canvas */
          <DrawingCanvas
            darkMode={darkMode}
            word={currentChar.char}
            onSpeak={() => speakJapanese(currentChar.char)}
            onCorrect={handleCorrectDrawing}
            playSfx={playSfx}
            autoAdvance={true}
          />
        )}
      </div>
    </motion.div>
  );
}
