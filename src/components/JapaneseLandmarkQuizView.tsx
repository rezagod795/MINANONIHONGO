import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  RotateCcw, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  Star, 
  Trophy, 
  Heart, 
  Check, 
  X, 
  ChevronRight, 
  Info, 
  MapPin, 
  Sparkles,
  ArrowRight,
  HeartCrack,
  Home,
  AlertCircle
} from 'lucide-react';
import { VocabItem } from '../types';
import { JAPAN_LANDMARKS, getLandmarkForLevel, JapanLandmark } from '../data/japanLandmarks';

interface JapaneseLandmarkQuizViewProps {
  currentLevel: number;
  isFavoritesMode: boolean;
  changeLevel: (level: number) => void;
  startFavoritesQuiz: () => void;
  score: number;
  lives: number;
  activeQuestion: VocabItem | null;
  currentIndex: number;
  currentVocabList: VocabItem[];
  options: { ind: string }[];
  selectedInd: string | null;
  answerLock: boolean;
  handleAnswer: (ind: string) => void;
  nextQuestion: () => void;
  speakJapanese: (text: string) => void;
  isFavorited: (item: VocabItem) => boolean;
  toggleFavorite: (item: VocabItem) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  switchView: (viewName: any) => void;
  feedback: { type: 'correct' | 'wrong' | null; message: string };
  levelsData: Record<number, any>;
  getLevelProgress: (level: number) => number;
  playSfx: (sound: 'click' | 'correct' | 'wrong' | 'levelup' | 'win') => void;
  renderQuestionBody?: () => React.ReactNode;
  isRemoteMode?: boolean;
  remoteDuel?: any;
  isMyTurn?: boolean;
  duelTimeLeft?: number;
}

const OPTION_BADGES = [
  { letter: 'A', bg: 'from-blue-600 to-indigo-600 text-white' },
  { letter: 'B', bg: 'from-emerald-500 to-teal-600 text-white' },
  { letter: 'C', bg: 'from-cyan-500 to-sky-600 text-white' },
  { letter: 'D', bg: 'from-amber-500 to-orange-600 text-white' },
];

export const JapaneseLandmarkQuizView: React.FC<JapaneseLandmarkQuizViewProps> = ({
  currentLevel,
  isFavoritesMode,
  changeLevel,
  startFavoritesQuiz,
  score,
  lives,
  activeQuestion,
  currentIndex,
  currentVocabList,
  options,
  selectedInd,
  answerLock,
  handleAnswer,
  nextQuestion,
  speakJapanese,
  isFavorited,
  toggleFavorite,
  soundEnabled,
  setSoundEnabled,
  switchView,
  feedback,
  levelsData,
  getLevelProgress,
  playSfx,
  renderQuestionBody,
  isRemoteMode,
  remoteDuel,
  isMyTurn,
  duelTimeLeft
}) => {
  const MAX_HINTS = 3;
  const [showHintModal, setShowHintModal] = useState(false);
  const [showLandmarkModal, setShowLandmarkModal] = useState(false);
  const [activeHintTab, setActiveHintTab] = useState<'clue' | 'landmark'>('clue');
  const [hintsRemaining, setHintsRemaining] = useState<number>(MAX_HINTS);
  const [hintUsedIndices, setHintUsedIndices] = useState<number[]>([]);
  const [hintToast, setHintToast] = useState<string | null>(null);

  // Reset hints when level changes, mode changes, or on question 0 (new quiz)
  useEffect(() => {
    setHintsRemaining(MAX_HINTS);
    setHintUsedIndices([]);
  }, [currentLevel, isFavoritesMode]);

  useEffect(() => {
    if (currentIndex === 0) {
      setHintsRemaining(MAX_HINTS);
      setHintUsedIndices([]);
    }
  }, [currentIndex]);

  const currentLandmark: JapanLandmark = getLandmarkForLevel(currentLevel, isFavoritesMode);
  const totalQuestions = currentVocabList.length || 1;
  const progressPercent = Math.min(100, Math.round(((currentIndex + 1) / totalQuestions) * 100));

  const isHintUsedForCurrentQuestion = hintUsedIndices.includes(currentIndex);

  const handleOpenHint = () => {
    // If hint is already unlocked for the current question, allow viewing without consuming extra quota
    if (isHintUsedForCurrentQuestion) {
      playSfx('click');
      setShowHintModal(true);
      return;
    }

    // If quota is exhausted
    if (hintsRemaining <= 0) {
      playSfx('wrong');
      setHintToast('Petunjuk kuis sudah habis (maksimal 3 kali per kuis)');
      setTimeout(() => setHintToast(null), 2800);
      return;
    }

    // Consume 1 hint use from 3 available
    playSfx('click');
    setHintsRemaining(prev => Math.max(0, prev - 1));
    setHintUsedIndices(prev => [...prev, currentIndex]);
    setShowHintModal(true);
  };

  const handleRetry = () => {
    playSfx('click');
    setHintsRemaining(MAX_HINTS);
    setHintUsedIndices([]);
    if (isFavoritesMode) {
      startFavoritesQuiz();
    } else {
      changeLevel(currentLevel);
    }
  };

  // Keyboard shortcut to advance to next question or retry on game over
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lives <= 0) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRetry();
        }
        return;
      }
      if (showHintModal || showLandmarkModal || !answerLock) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        playSfx('click');
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lives, answerLock, showHintModal, showLandmarkModal, nextQuestion, handleRetry, playSfx]);

  // Helper for generating romaji or pronunciation hints
  const getRomajiHint = (item: VocabItem | null) => {
    if (!item) return '';
    if (item.reading) return item.reading;
    return item.jpn.replace(/<[^>]*>/g, '');
  };

  const isSpecialQuestion = Boolean(
    activeQuestion?.jpn && (
      activeQuestion.jpn.includes("【RAMBU") ||
      activeQuestion.jpn.includes("【標識") ||
      activeQuestion.jpn.includes("【標示") ||
      activeQuestion.jpn.includes("【EKSPRESI") ||
      activeQuestion.jpn.includes("【会話") ||
      activeQuestion.jpn.includes("【CHOKAI") ||
      activeQuestion.jpn.includes("【聴解") ||
      activeQuestion.jpn.includes("【DOKAI") ||
      activeQuestion.jpn.includes("【読解")
    )
  );

  const specialQuestionTypeTitle = isSpecialQuestion
    ? activeQuestion?.jpn.includes("【RAMBU") || activeQuestion?.jpn.includes("【標識") || activeQuestion?.jpn.includes("【標示")
      ? "かんばん・標識"
      : activeQuestion?.jpn.includes("【EKSPRESI") || activeQuestion?.jpn.includes("【会話")
      ? "会話・表現"
      : activeQuestion?.jpn.includes("【CHOKAI") || activeQuestion?.jpn.includes("【聴解")
      ? "聴解リスニング"
      : "読解問題"
    : "";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden text-slate-100 font-sans pb-10">
      {/* Background: Japanese Landmark with Clear Scenic Atmosphere (Hardware accelerated, no blur) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <img
          key={currentLandmark.imageUrl}
          src={currentLandmark.imageUrl}
          alt=""
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center transform-gpu will-change-transform"
        />
        {/* Crisp Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/30 to-slate-950/85" />

        {/* Subtle Decorative Sakura Petal Accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-pink-400/15 via-pink-400/5 to-transparent pointer-events-none blur-xl" />
        <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#040814] to-transparent pointer-events-none" />
      </div>

      {/* Main Container constrained to mobile phone/tablet width */}
      <div className="relative z-10 w-full max-w-md px-3 sm:px-4 pt-3 flex flex-col flex-grow">
        
        {/* 1. TOP HEADER BAR */}
        <header className="w-full flex items-center justify-between mb-3 pt-1">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              switchView('intro');
            }}
            className="w-11 h-11 rounded-full bg-[#0d1c3e] hover:bg-[#152e69] active:scale-95 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-md transition-transform cursor-pointer touch-manipulation"
            title="Kembali ke Menu Utama"
            aria-label="Kembali ke menu"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Center App Logo & Title */}
          <div className="flex items-center gap-2.5">
            {/* Mt. Fuji + Torii Logo Badge */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-sky-400 via-indigo-600 to-rose-600 p-[1.5px] shadow-[0_0_15px_rgba(244,63,94,0.4)] relative flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-[#0b142c] rounded-[10px] flex flex-col items-center justify-center p-0.5 relative overflow-hidden">
                <span className="text-sm select-none leading-none">⛩️</span>
                <span className="text-[7.5px] font-black text-rose-300 tracking-tighter uppercase leading-none mt-0.5">日本語</span>
              </div>
            </div>

            {/* Titles and Theme Pill */}
            <div className="flex flex-col text-left">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                Kuis Kosakata Bahasa Jepang
              </h1>
              <p className="text-[10px] text-sky-200/80 font-semibold tracking-wider">
                日本語の語彙クイズ
              </p>

              {/* Theme / Landmark Pill */}
              <button
                type="button"
                onClick={() => setShowLandmarkModal(true)}
                className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#122452] hover:bg-[#1a3475] active:scale-95 border border-cyan-500/40 text-[9.5px] font-bold text-cyan-200 shadow-sm transition-transform cursor-pointer touch-manipulation group"
                title="Lihat info wisata Jepang level ini"
              >
                <span className="text-pink-400">🖼️</span>
                <span>Tema: {currentLandmark.themePill}</span>
                <span className="opacity-60 text-[8px] group-hover:opacity-100 transition-opacity">({currentLandmark.city.split(',')[0]})</span>
              </button>
            </div>
          </div>

          {/* Right Menu Pill */}
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              switchView('intro');
            }}
            className="px-3.5 py-2 rounded-full bg-[#0d1c3e] hover:bg-[#16306e] active:scale-95 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform cursor-pointer touch-manipulation"
            title="Buka Menu"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span>Menu</span>
          </button>
        </header>

        {/* 2. STATS & LEVEL BAR */}
        <section className="w-full rounded-[22px] bg-[#0b1736] border border-cyan-500/40 shadow-lg px-3.5 py-2.5 mb-3">
          {/* Trophy Score, Hearts, Level Indicator, and Sound Toggle */}
          <div className="flex items-center justify-between gap-2">
            {/* Score Pill */}
            <div className="flex-1 py-1.5 px-3 rounded-full bg-[#0f224e] border border-cyan-500/30 flex items-center justify-center gap-1.5 shadow-inner">
              <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="text-xs font-black tracking-wide text-amber-300">
                {score} / {totalQuestions}
              </span>
            </div>

            {/* Lives Pill */}
            <div className="py-1.5 px-3.5 rounded-full bg-[#0f224e] border border-pink-500/30 flex items-center justify-center gap-1.5 shadow-inner">
              <Heart className={`w-3.5 h-3.5 ${lives > 0 ? 'text-pink-500 fill-pink-500' : 'text-slate-500'}`} />
              <span className="text-xs font-black text-pink-400">
                {lives}
              </span>
            </div>

            {/* Level Quick Info Pill (Click to choose level / explore landmarks) */}
            <button
              type="button"
              onClick={() => setShowLandmarkModal(true)}
              className="flex-1 py-1.5 px-3 rounded-full bg-[#0f224e] hover:bg-[#173477] active:scale-95 border border-amber-500/40 flex items-center justify-center gap-1 text-amber-300 text-xs font-extrabold shadow-inner transition-transform cursor-pointer touch-manipulation"
              title="Pilih Level & Info Wisata Jepang"
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{isFavoritesMode ? 'Favorit' : `Lv.${currentLevel}`}</span>
              <ChevronRight className="w-3 h-3 text-amber-400/70" />
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(prev => !prev);
                playSfx('click');
              }}
              className={`w-9 h-8 rounded-full text-xs font-bold flex items-center justify-center active:scale-90 transition-transform border flex-shrink-0 cursor-pointer touch-manipulation ${
                soundEnabled
                  ? 'bg-[#0f224e] hover:bg-[#162c66] text-cyan-300 border-cyan-500/30'
                  : 'bg-[#0f224e] hover:bg-[#162c66] text-rose-400 border-rose-500/30'
              }`}
              title={soundEnabled ? 'Matikan Suara Efek' : 'Nyalakan Suara Efek'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              )}
            </button>
          </div>
        </section>

        {/* 3. QUESTION CARD (Card Pertanyaan dengan Banner Pemandangan Jepang Jernih & Terang) */}
        <section className="w-full rounded-[24px] bg-[#0c1836] border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.18)] overflow-hidden mb-3 relative flex flex-col">
          {/* Scenic Landmark Banner Window (Jelas & Terang) */}
          <div className="relative w-full h-44 sm:h-48 overflow-hidden flex flex-col justify-between p-3">
            {/* Landmark Image Background (High clarity, vivid colors, hardware accelerated) */}
            <img
              src={currentLandmark.imageUrl}
              alt={currentLandmark.name}
              loading="eager"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover object-center transform-gpu"
            />
            {/* Soft Scenic Vignette for Crisp Contrast without obscuring the photo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-slate-950/70 pointer-events-none" />

            {/* Top Indicator Row */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {/* Question Number Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0a1532]/95 border border-cyan-400/40 text-[10px] font-black text-cyan-200 shadow-md">
                <span className="text-cyan-400 font-bold">({currentIndex + 1})</span>
                <span className="opacity-70">/ {totalQuestions}</span>
              </div>

              {/* Landmark Name Tag Badge */}
              <div className="px-2.5 py-1 rounded-full bg-[#0a1532]/95 border border-cyan-400/30 text-[9.5px] font-bold text-amber-300 shadow-md flex items-center gap-1 max-w-[190px] truncate">
                <span>📍</span>
                <span className="truncate">{currentLandmark.name}</span>
              </div>

              {/* Favorite Star Button */}
              <button
                type="button"
                onClick={() => activeQuestion && toggleFavorite(activeQuestion)}
                className="w-8 h-8 rounded-full bg-[#0a1532]/95 hover:bg-[#12234e] active:scale-90 border border-cyan-400/40 flex items-center justify-center shadow-md transition-transform cursor-pointer touch-manipulation"
                title={activeQuestion && isFavorited(activeQuestion) ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    activeQuestion && isFavorited(activeQuestion)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            </div>

            {/* Center Japanese Word Container (High contrast container for 100% instant readability) */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow py-1">
              {activeQuestion ? (
                <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-[#0a1738]/95 border border-cyan-400/50 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center gap-3">
                  <motion.h2
                    key={`question-text-${currentIndex}-${activeQuestion.jpn}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                    className="text-3xl sm:text-4xl font-black text-white tracking-wide text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    translate="no"
                  >
                    <span dangerouslySetInnerHTML={{ __html: isSpecialQuestion ? specialQuestionTypeTitle : activeQuestion.jpn }} />
                  </motion.h2>

                  {/* Pronounce Button */}
                  <button
                    type="button"
                    onClick={() => speakJapanese(activeQuestion.jpn)}
                    className="p-1.5 sm:p-2 rounded-full bg-cyan-500/25 hover:bg-cyan-500/40 active:scale-90 text-cyan-300 border border-cyan-400/40 shadow-md transition-transform cursor-pointer touch-manipulation"
                    title="Dengarkan Pengucapan Audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-sm font-bold text-slate-300 animate-pulse">Memuat kata...</div>
              )}
            </div>

            {/* Subtle Progress Bar along bottom of scenic banner */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#081534]">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all duration-200 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Secondary Context (ONLY rendered for special dialogue, signboard, listening, or reading questions) */}
          {isSpecialQuestion && renderQuestionBody && (
            <div className="px-3 py-2 bg-[#0b1736] border-t border-cyan-500/20 text-xs">
              {renderQuestionBody()}
            </div>
          )}
        </section>

        {/* 4. MULTIPLE CHOICE OPTIONS (A, B, C, D) - Ultra Fast & Zero Delay */}
        <section className="w-full flex flex-col gap-2 mb-2" role="group" aria-label="Pilihan Jawaban Kuis">
          {options.map((opt, idx) => {
            const isSelected = selectedInd === opt.ind;
            const isTargetCorrect = answerLock && opt.ind === activeQuestion?.ind;
            const isTargetWrong = answerLock && isSelected && opt.ind !== activeQuestion?.ind;
            const badge = OPTION_BADGES[idx % OPTION_BADGES.length];

            return (
              <button
                type="button"
                key={`opt-${currentIndex}-${opt.ind}-${idx}`}
                disabled={answerLock}
                onClick={() => handleAnswer(opt.ind)}
                className={`w-full py-2.5 px-3.5 sm:px-4 rounded-[20px] transition-transform duration-75 active:scale-[0.985] flex items-center justify-between shadow-md border-2 relative overflow-hidden select-none cursor-pointer touch-manipulation ${
                  answerLock
                    ? isTargetCorrect
                      ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.5)]'
                      : isTargetWrong
                        ? 'bg-rose-950/90 border-rose-400 text-rose-100 shadow-[0_0_16px_rgba(244,63,94,0.5)]'
                        : 'bg-[#09142e]/70 border-cyan-900/40 text-slate-400 opacity-60'
                    : isSelected
                      ? 'bg-[#122858] border-cyan-400 text-white shadow-[0_0_14px_rgba(34,211,238,0.4)]'
                      : 'bg-[#0a1738] hover:bg-[#112454] border-cyan-400/40 hover:border-cyan-300 text-slate-100'
                }`}
              >
                {/* Left Badge: A, B, C, D */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full bg-gradient-to-tr ${badge.bg} font-black text-xs flex items-center justify-center shadow-md flex-shrink-0`}
                  >
                    {badge.letter}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-left tracking-wide leading-snug">
                    {opt.ind}
                  </span>
                </div>

                {/* Right Indicator: Radio Circle or Result Icon */}
                <div className="flex-shrink-0 ml-2">
                  {answerLock && isTargetCorrect ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : answerLock && isTargetWrong ? (
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                          : 'border-cyan-400/50'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </section>

        {/* Feedback / Wrong Answer Banner with Next Question Button */}
        <div className="w-full min-h-[44px] flex items-center justify-center mb-2">
          <AnimatePresence mode="wait">
            {answerLock && feedback.type === 'wrong' ? (
              <motion.div
                key="wrong-answer-card"
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="w-full rounded-2xl bg-gradient-to-r from-rose-950/95 via-[#1a0e28]/95 to-[#0e183a]/95 border-2 border-rose-500/50 p-2.5 sm:p-3 shadow-[0_4px_22px_rgba(244,63,94,0.35)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-rose-500/25 border border-rose-400/60 flex items-center justify-center flex-shrink-0 text-rose-300">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-rose-300">
                      Jawaban Kurang Tepat
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      Benar: <span className="text-emerald-300 font-extrabold">"{activeQuestion?.ind}"</span>
                    </span>
                  </div>
                </div>

                {/* Tombol Selanjutnya saat salah */}
                <button
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    nextQuestion();
                  }}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_18px_rgba(244,63,94,0.55)] border border-rose-300/40 cursor-pointer touch-manipulation transition-transform flex-shrink-0"
                  title="Lanjut ke Soal Berikutnya"
                >
                  <span>Selanjutnya</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </motion.div>
            ) : feedback.type === 'correct' ? (
              <motion.div
                key={`feedback-correct-${feedback.message}`}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border bg-emerald-900/90 text-emerald-200 border-emerald-400 shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{feedback.message}</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 5. BOTTOM ACTION BAR */}
        <footer className="w-full flex items-center justify-between gap-2.5 mt-auto pt-1">
          {/* Ulangi (Reset) Button */}
          <button
            type="button"
            onClick={handleRetry}
            className="w-20 py-2.5 rounded-2xl bg-[#0c1836] hover:bg-[#142654] active:scale-95 border border-cyan-500/30 text-cyan-200 font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md transition-transform cursor-pointer touch-manipulation"
            title="Ulangi Level Ini dari Awal"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px]">Ulangi</span>
          </button>

          {/* Selanjutnya (Next Question) Button */}
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              nextQuestion();
            }}
            disabled={!answerLock}
            className={`flex-1 py-3.5 px-5 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform ${
              answerLock
                ? feedback.type === 'wrong'
                  ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-95 text-white shadow-[0_0_25px_rgba(244,63,94,0.55)] ring-2 ring-rose-400/60 cursor-pointer touch-manipulation'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 hover:from-blue-500 hover:via-indigo-500 hover:to-fuchsia-500 active:scale-95 text-white shadow-[0_0_25px_rgba(99,102,241,0.55)] cursor-pointer touch-manipulation'
                : 'bg-[#0e1d44]/70 border border-cyan-500/20 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Hint Button (Limit 3x per quiz) */}
          <button
            type="button"
            onClick={handleOpenHint}
            className={`w-20 py-2.5 rounded-2xl active:scale-95 border font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-md transition-all cursor-pointer touch-manipulation relative ${
              hintsRemaining > 0 || isHintUsedForCurrentQuestion
                ? 'bg-[#0c1836] hover:bg-[#142654] border-amber-400/40 text-amber-200'
                : 'bg-[#091228] border-slate-700/60 text-slate-500 opacity-60'
            }`}
            title={
              isHintUsedForCurrentQuestion
                ? 'Buka Petunjuk (Sudah Terbuka untuk Soal Ini)'
                : hintsRemaining > 0
                ? `Buka Petunjuk (Sisa ${hintsRemaining}/3)`
                : 'Petunjuk Habis (Maksimal 3 kali per kuis)'
            }
          >
            {/* Hint Badge Count */}
            <span
              className={`absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black border shadow-xs ${
                isHintUsedForCurrentQuestion
                  ? 'bg-emerald-500 border-emerald-300 text-white'
                  : hintsRemaining > 0
                  ? 'bg-amber-400 border-amber-200 text-slate-950'
                  : 'bg-slate-700 border-slate-600 text-slate-400'
              }`}
            >
              {isHintUsedForCurrentQuestion ? '✓' : `${hintsRemaining}/3`}
            </span>

            <Lightbulb
              className={`w-4 h-4 ${
                isHintUsedForCurrentQuestion
                  ? 'text-emerald-400 fill-emerald-400/20'
                  : hintsRemaining > 0
                  ? 'text-amber-400 fill-amber-400/30'
                  : 'text-slate-500'
              }`}
            />
            <span className="text-[10px]">
              {isHintUsedForCurrentQuestion ? 'Hint (Aktif)' : `Hint (${hintsRemaining})`}
            </span>
          </button>
        </footer>
      </div>

      {/* Floating Hint Toast Notification */}
      <AnimatePresence>
        {hintToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="w-full bg-rose-950/95 border border-rose-500 text-rose-100 text-xs font-bold py-2.5 px-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-center justify-center gap-2 text-center"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{hintToast}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. HINT & LANDMARK TRIVIA MODAL */}
      <AnimatePresence>
        {showHintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-sm rounded-[28px] bg-[#0c1836] border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] p-5 text-left relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Petunjuk Kuis</h3>
                    <p className="text-[10px] text-cyan-300">Level {currentLevel} • {currentLandmark.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHintModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3-Hint Limit Quota Tracker Banner */}
              <div className="flex items-center justify-between bg-[#08132e] border border-cyan-500/25 rounded-2xl px-3 py-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <span className="font-bold text-[11px]">Kuota Petunjuk:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((slot) => {
                    const isAvailable = slot <= hintsRemaining;
                    return (
                      <div
                        key={`hint-slot-${slot}`}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
                          isAvailable
                            ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}
                        title={isAvailable ? 'Petunjuk Tersedia' : 'Petunjuk Sudah Digunakan'}
                      >
                        {slot}
                      </div>
                    );
                  })}
                  <span className="text-[11px] font-black text-amber-400 ml-1">
                    {hintsRemaining}/3 Sisa
                  </span>
                </div>
              </div>

              {/* Tabs inside Hint */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveHintTab('clue')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeHintTab === 'clue'
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                      : 'bg-[#08132e] text-cyan-200 border-cyan-500/20'
                  }`}
                >
                  💡 Bantuan Kata
                </button>
                <button
                  onClick={() => setActiveHintTab('landmark')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    activeHintTab === 'landmark'
                      ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                      : 'bg-[#08132e] text-cyan-200 border-cyan-500/20'
                  }`}
                >
                  ⛩️ Wisata Jepang
                </button>
              </div>

              {activeHintTab === 'clue' ? (
                <div className="flex flex-col gap-3 py-1">
                  <div className="p-3 rounded-2xl bg-[#091535] border border-cyan-500/30">
                    <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider block mb-1">
                      Cara Baca / Romaji
                    </span>
                    <p className="text-base font-bold text-white tracking-wide">
                      {getRomajiHint(activeQuestion)}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#091535] border border-cyan-500/30">
                    <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider block mb-1">
                      Petunjuk Huruf Pertama Arti
                    </span>
                    <p className="text-sm font-semibold text-amber-300">
                      Awalan huruf: <span className="font-black text-lg text-white ml-1">{activeQuestion?.ind.charAt(0).toUpperCase()}...</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (activeQuestion) speakJapanese(activeQuestion.jpn);
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Dengarkan Pelafalan</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-1">
                  <div className="rounded-2xl overflow-hidden border border-cyan-500/30 relative h-28">
                    <img
                      src={currentLandmark.imageUrl}
                      alt={currentLandmark.name}
                      className="w-full h-full object-cover filter brightness-[0.8]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08132e] via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-black text-white">{currentLandmark.name}</p>
                      <p className="text-[9.5px] text-cyan-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-pink-400" />
                        {currentLandmark.city}, {currentLandmark.prefecture}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed bg-[#091535] p-3 rounded-2xl border border-cyan-500/20">
                    {currentLandmark.funFact}
                  </p>
                </div>
              )}

              {/* Informative Footnote */}
              <p className="text-[10px] text-center text-slate-400 mt-3 font-semibold">
                ℹ️ Hint dibatasi maksimal 3 kali penggunaan per sesi kuis.
              </p>

              <button
                onClick={() => setShowHintModal(false)}
                className="w-full mt-2.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Tutup Petunjuk
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. ALL 17 JAPANESE LANDMARKS EXPLORER MODAL */}
      <AnimatePresence>
        {showLandmarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md max-h-[85vh] rounded-[30px] bg-[#0c1836] border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.4)] p-4 sm:p-5 flex flex-col text-left relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Tempat Wisata & Kota di Jepang
                    </h3>
                    <p className="text-[10px] text-cyan-300">
                      17 Level dengan pemandangan ikonik khas Negeri Sakura
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowLandmarkModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list of 17 landmarks */}
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-grow">
                {Object.values(JAPAN_LANDMARKS).map((landmark) => {
                  const isCurrent = (landmark.level === 'favorit' && isFavoritesMode) || (!isFavoritesMode && landmark.level === currentLevel);

                  return (
                    <motion.div
                      key={`landmark-card-${landmark.level}`}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        playSfx('click');
                        if (landmark.level === 'favorit') {
                          startFavoritesQuiz();
                        } else {
                          changeLevel(Number(landmark.level));
                        }
                        setShowLandmarkModal(false);
                      }}
                      className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden ${
                        isCurrent
                          ? 'bg-[#142858] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-[#091533]/80 hover:bg-[#10224c] border-cyan-500/20'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative border border-cyan-400/30">
                        <img
                          src={landmark.imageUrl}
                          alt={landmark.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 text-[8px] font-black text-cyan-300">
                          {landmark.level === 'favorit' ? '⭐ Fav' : `Lv.${landmark.level}`}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-grow min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-white truncate">
                            {landmark.name}
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold flex-shrink-0">
                            {landmark.themePill}
                          </span>
                        </div>
                        <p className="text-[10px] text-pink-300 font-semibold truncate">
                          {landmark.japaneseName}
                        </p>
                        <p className="text-[9px] text-slate-300 line-clamp-1 mt-0.5">
                          {landmark.city} • {landmark.category}
                        </p>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowLandmarkModal(false)}
                className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 text-white font-black text-xs shadow-lg transition-transform active:scale-95 flex-shrink-0"
              >
                Pilih & Lanjutkan Kuis
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. TAMPILAN COBA LAGI (GAME OVER SAAT KEHABISAN NYAWA) */}
      <AnimatePresence>
        {lives <= 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.16 }}
              className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#1c0c28] via-[#101535] to-[#090e24] border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.45)] p-5 sm:p-6 flex flex-col text-center relative overflow-hidden"
            >
              {/* Soft ambient background glow */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

              {/* Broken Heart Icon with gentle pulse */}
              <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 border-2 border-rose-400/50 flex items-center justify-center mb-3.5 shadow-[0_0_24px_rgba(244,63,94,0.4)]">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <HeartCrack className="w-10 h-10 text-rose-400 stroke-[2.2]" />
                </motion.div>
              </div>

              {/* Japanese Game Over Pill */}
              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10.5px] font-black uppercase tracking-wider mb-2 self-center">
                <span>ゲームオーバー • GAME OVER</span>
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight mb-1.5">
                Nyawa Habis!
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Kamu telah menggunakan seluruh kesempatan di level ini. Kegagalan adalah guru terbaik, jangan menyerah!
              </p>

              {/* Score & Target Stats Card */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-900/70 border border-white/10 mb-4 text-left">
                <div className="px-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Skor Diperoleh</span>
                  <p className="text-lg font-black text-white">
                    <span className="text-amber-400">{score}</span> / {totalQuestions} Soal
                  </p>
                </div>
                <div className="px-2 border-l border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target Level</span>
                  <p className="text-lg font-black text-cyan-300 truncate">
                    {isFavoritesMode ? 'Koleksi Favorit' : `Level ${currentLevel}`}
                  </p>
                </div>
              </div>

              {/* Last question review if activeQuestion */}
              {activeQuestion && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-slate-200 mb-4 text-left flex items-start gap-2">
                  <span className="text-rose-400 font-bold text-sm leading-none">ℹ️</span>
                  <div className="min-w-0">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Soal Terakhir:</div>
                    <div className="font-bold text-white truncate">
                      {activeQuestion.jpn.replace(/<[^>]*>/g, '')} <span className="text-slate-400 font-normal">({activeQuestion.romaji || ''})</span>
                    </div>
                    <div className="text-emerald-300 font-bold text-xs">
                      Arti: "{activeQuestion.ind}"
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* Tombol Coba Lagi Utama */}
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.55)] border border-rose-400/40 cursor-pointer touch-manipulation transition-transform"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>Coba Lagi</span>
                </button>

                {/* Sub Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      setShowLandmarkModal(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-98 text-slate-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Kosakata</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSfx('click');
                      switchView('intro');
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-98 text-slate-200 border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation transition-all"
                  >
                    <Home className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Menu Utama</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
