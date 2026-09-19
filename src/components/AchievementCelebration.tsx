import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  Sparkles,
  Zap,
  CheckCircle2,
  Share2,
  RotateCcw,
  Play,
  Flame,
  Award,
  Crown,
  BookOpen,
  ArrowRight,
  PartyPopper,
  Volume2
} from 'lucide-react';

// Web Audio synthesizer for an epic arcade-style victory fanfare
export const playVictoryFanfare = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Fanfare melodic sequence (Bright brass and chime frequencies)
    const melody = [
      { f: 523.25, time: 0.00, dur: 0.12, type: 'triangle' as OscillatorType }, // C5
      { f: 659.25, time: 0.12, dur: 0.12, type: 'triangle' as OscillatorType }, // E5
      { f: 783.99, time: 0.24, dur: 0.14, type: 'triangle' as OscillatorType }, // G5
      { f: 1046.50, time: 0.38, dur: 0.35, type: 'sine' as OscillatorType },     // C6
      { f: 1318.51, time: 0.48, dur: 0.45, type: 'sine' as OscillatorType },     // E6
      { f: 1567.98, time: 0.60, dur: 0.75, type: 'sine' as OscillatorType },     // G6 (High chime)
    ];

    melody.forEach(({ f, time, dur, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, ctx.currentTime + time);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });
  } catch (_) {}
};

// Intense multi-stage celebratory confetti engine
export const triggerSuperchargedConfetti = (duration = 4500) => {
  try {
    // 1. Device Haptics if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([100, 50, 120, 50, 220, 80, 320]);
      } catch (_) {}
    }

    const end = Date.now() + duration;
    const vibrantColors = [
      '#f43f5e', // rose
      '#ec4899', // pink
      '#8b5cf6', // violet
      '#3b82f6', // blue
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#fbbf24', // yellow
      '#ffffff', // white
    ];
    const goldStars = ['#ffd700', '#ffb703', '#fb8500', '#fff3b0', '#ffffff'];

    // Stage 1: Central Supernova Blast
    confetti({
      particleCount: 110,
      spread: 140,
      origin: { x: 0.5, y: 0.45 },
      colors: vibrantColors,
      startVelocity: 45,
      ticks: 280,
      gravity: 0.75,
      scalar: 1.2,
    });

    // Stage 2: Immediate Golden Star Shower
    confetti({
      particleCount: 60,
      spread: 160,
      origin: { x: 0.5, y: 0.4 },
      colors: goldStars,
      shapes: ['star'],
      startVelocity: 38,
      ticks: 250,
      scalar: 1.5,
    });

    // Stage 3: Alternating Dual Side Cannons + Sky Firework Bursts
    let lastBurstTime = 0;
    (function frame() {
      const now = Date.now();

      // Left Cannon
      confetti({
        particleCount: 8,
        angle: 55,
        spread: 60,
        origin: { x: 0.02, y: 0.82 },
        colors: vibrantColors,
        startVelocity: 52,
        gravity: 0.85,
        scalar: 1.1,
      });

      // Right Cannon
      confetti({
        particleCount: 8,
        angle: 125,
        spread: 60,
        origin: { x: 0.98, y: 0.82 },
        colors: vibrantColors,
        startVelocity: 52,
        gravity: 0.85,
        scalar: 1.1,
      });

      // Randomized Sky Firework bursts every ~260ms
      if (now - lastBurstTime > 260) {
        lastBurstTime = now;
        const rx = 0.15 + Math.random() * 0.7;
        const ry = 0.1 + Math.random() * 0.35;
        confetti({
          particleCount: 30,
          spread: 90,
          origin: { x: rx, y: ry },
          colors: Math.random() > 0.4 ? goldStars : vibrantColors,
          shapes: Math.random() > 0.5 ? ['star', 'circle'] : ['circle'],
          startVelocity: 28,
          ticks: 200,
          scalar: 1.25,
        });
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.warn("Confetti trigger warning:", e);
  }
};

export interface AchievementCelebrationProps {
  isSuccess: boolean;
  isPerfect: boolean;
  score: number;
  totalVocabCount: number;
  accuracyPct: number;
  starsCount: number;
  xpEarned: number;
  currentLevel: number;
  levelName?: string;
  darkMode: boolean;
  isFavoritesMode?: boolean;
  multiplayerMode?: 'p1' | 'p2' | null;
  onNextLevel?: () => void;
  onRetry: () => void;
  onBackToMenu: () => void;
  onShare: () => void;
  playSfx: (sound: any) => void;
}

// Motivational Japanese Proverbs & Encouragement based on performance
const MOTIVATIONAL_QUOTES = {
  perfect: [
    {
      kanji: "完璧！名人は人をそしらず",
      romaji: "Kanpeki! Meijin wa hito o soshirazu",
      id: "Sempurna tanpa cela! Penguasaan sejati lahir dari dedikasi yang konsisten."
    },
    {
      kanji: "百発百中！見事な成果！",
      romaji: "Hyappatsuhyakuchuu! Migoto na seika!",
      id: "Tepat sasaran 100%! Seluruh kosakata level ini kamu kuasai seperti penutur asli!"
    }
  ],
  high: [
    {
      kanji: "継続は力なり",
      romaji: "Keizoku wa chikara nari",
      id: "Ketekunan adalah kekuatan! Hasil luar biasa, sedikit lagi menuju 100% sempurna!"
    },
    {
      kanji: "日進月歩、着実な前進！",
      romaji: "Nisshingeppo, chakujitsu na zenshin!",
      id: "Kemajuan pesat tiada henti! Kemampuan bahasa Jepangmu makin tajam!"
    }
  ],
  pass: [
    {
      kanji: "千里の道も一歩から",
      romaji: "Senri no michi mo ippo kara",
      id: "Perjalanan seribu mil dimulai dari satu langkah. Kamu berhasil lulus level ini!"
    },
    {
      kanji: "合格おめでとう！",
      romaji: "Goukaku omedetou!",
      id: "Selamat telah lulus! Asah kembali untuk meraih bintang 3 dan skor tertinggi!"
    }
  ],
  fail: [
    {
      kanji: "七転び八起き",
      romaji: "Nana korobi ya oki",
      id: "Tujuh kali jatuh, delapan kali bangkit! Setiap kesalahan adalah guru terbaik."
    },
    {
      kanji: "失敗は成功のもと",
      romaji: "Shippai wa seikou no moto",
      id: "Kegagalan adalah pangkal kesuksesan. Coba ulangi sekali lagi, kamu pasti bisa!"
    }
  ]
};

export const AchievementCelebration: React.FC<AchievementCelebrationProps> = ({
  isSuccess,
  isPerfect,
  score,
  totalVocabCount,
  accuracyPct,
  starsCount,
  xpEarned,
  currentLevel,
  levelName = '',
  darkMode,
  isFavoritesMode = false,
  multiplayerMode = null,
  onNextLevel,
  onRetry,
  onBackToMenu,
  onShare,
  playSfx,
}) => {
  // Animated counting numbers for score and accuracy
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [showRibbon, setShowRibbon] = useState(false);

  // Quote picker
  const quoteCategory = !isSuccess ? 'fail' : isPerfect ? 'perfect' : accuracyPct >= 80 ? 'high' : 'pass';
  const quote = MOTIVATIONAL_QUOTES[quoteCategory][0];

  useEffect(() => {
    // Trigger intense celebration and fanfare on mount if success
    if (isSuccess) {
      playVictoryFanfare();
      triggerSuperchargedConfetti(4200);
      const ribbonTimer = setTimeout(() => setShowRibbon(true), 400);
      return () => clearTimeout(ribbonTimer);
    }
  }, [isSuccess]);

  // Counting animation for numbers
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s counting ease

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(ease * score));
      setAnimatedAccuracy(Math.round(ease * accuracyPct));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [score, accuracyPct]);

  // Rank badge styling
  const getRankBadge = () => {
    if (isPerfect) {
      return {
        label: '👑 RANK S • VOCAB MASTER',
        kanji: '完璧',
        bg: 'from-amber-500 via-yellow-400 to-amber-600',
        text: 'text-amber-400',
        border: 'border-amber-400/60',
        glow: 'shadow-amber-500/30',
      };
    }
    if (accuracyPct >= 80) {
      return {
        label: '🌟 RANK A • JOUZU SCHOLAR',
        kanji: '上手',
        bg: 'from-emerald-500 via-teal-400 to-emerald-600',
        text: 'text-emerald-400',
        border: 'border-emerald-400/60',
        glow: 'shadow-emerald-500/30',
      };
    }
    if (isSuccess) {
      return {
        label: '🎖️ RANK B • GOUKAKU PASSED',
        kanji: '合格',
        bg: 'from-blue-500 via-indigo-400 to-blue-600',
        text: 'text-blue-400',
        border: 'border-blue-400/60',
        glow: 'shadow-blue-500/30',
      };
    }
    return {
      label: '🌱 CHALLENGER • GAMBATTE',
      kanji: '奮闘',
      bg: 'from-rose-500 via-pink-400 to-rose-600',
      text: 'text-rose-400',
      border: 'border-rose-400/60',
      glow: 'shadow-rose-500/30',
    };
  };

  const rank = getRankBadge();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="text-center py-4 flex flex-col items-center flex-grow w-full relative select-none"
    >
      {/* Radiant Sunburst Rays Animation behind the trophy */}
      {isSuccess && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-72 h-72 pointer-events-none z-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            style={{ willChange: 'transform' }}
            className="w-full h-full opacity-20 dark:opacity-30 flex items-center justify-center"
          >
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-72 bg-gradient-to-t from-transparent via-amber-400 to-transparent"
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}
          </motion.div>
        </div>
      )}

      {/* Main Emblem / Trophy with Rotating Auras */}
      <div className="relative mb-4 z-10">
        {isSuccess && (
          <>
            {/* Outer Conic Aura */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              style={{ willChange: 'transform' }}
              className="absolute -inset-5 rounded-full opacity-40 blur-xl bg-[conic-gradient(from_0deg,#f59e0b,#fbbf24,#f43f5e,#8b5cf6,#3b82f6,#10b981,#f59e0b)]"
            />
            {/* Sparkle Emitter */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.3, 0.2],
                    x: [(Math.random() - 0.5) * 160, (Math.random() - 0.5) * 280],
                    y: [(Math.random() - 0.5) * 160, (Math.random() - 0.5) * 280],
                  }}
                  transition={{
                    duration: 1.4 + (i % 3) * 0.3,
                    repeat: Infinity,
                    delay: (i % 4) * 0.2,
                  }}
                  className={`absolute w-2 h-2 rounded-full ${
                    i % 2 === 0 ? 'bg-amber-300 shadow-sm shadow-amber-300' : 'bg-pink-400'
                  }`}
                  style={{ left: '50%', top: '50%' }}
                />
              ))}
            </div>
          </>
        )}

        {/* Trophy / Emblem Box */}
        <motion.div
          initial={{ scale: 0.6, rotate: -15 }}
          animate={{ scale: [0.6, 1.15, 0.98, 1.05, 1], rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20 }}
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-[36px] flex items-center justify-center relative shadow-2xl transition-all border-4 ${
            !isSuccess
              ? darkMode
                ? 'bg-slate-800 border-rose-500 text-rose-500 shadow-rose-500/25'
                : 'bg-white border-rose-400 text-rose-500 shadow-rose-500/25'
              : darkMode
              ? 'bg-slate-800 border-amber-400 text-amber-400 shadow-amber-500/30'
              : 'bg-white border-amber-400 text-amber-500 shadow-amber-500/30'
          }`}
        >
          {!isSuccess ? (
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <RotateCcw className="w-12 h-12" />
            </motion.div>
          ) : isPerfect ? (
            <Crown className="w-14 h-14 fill-current drop-shadow-lg" />
          ) : (
            <Trophy className="w-14 h-14 fill-current drop-shadow-lg" />
          )}

          {/* Japanese character watermark badge on trophy */}
          <span className="absolute bottom-1 right-2 text-[10px] font-black uppercase tracking-widest opacity-80 px-1.5 py-0.5 rounded-md bg-black/20 text-white">
            {rank.kanji}
          </span>
        </motion.div>
      </div>

      {/* 3 Animated Stars with Staggered Landing */}
      {!isFavoritesMode && !multiplayerMode && (
        <div className="flex items-center justify-center gap-3 mb-2.5 z-10">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = isSuccess && starsCount >= starIdx;
            return (
              <motion.div
                key={starIdx}
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{
                  scale: isEarned ? [0, 1.35, 1] : 1,
                  rotate: 0,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.15 + starIdx * 0.15,
                  type: 'spring',
                  stiffness: 420,
                  damping: 18,
                }}
                className={`relative p-2.5 rounded-2xl border-2 transition-all ${
                  isEarned
                    ? 'bg-gradient-to-br from-amber-400/30 via-yellow-400/20 to-amber-500/10 border-amber-400 shadow-lg shadow-amber-400/25 text-amber-400'
                    : darkMode
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                    : 'bg-slate-100 border-slate-200 text-slate-300'
                }`}
              >
                <Star className={`w-6 h-6 ${isEarned ? 'fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}`} />
                {isEarned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.4, 0] }}
                    transition={{ delay: 0.35 + starIdx * 0.15, duration: 0.6 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full blur-[0.5px]"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rank Pill & Motivational Headline */}
      <div className="space-y-1 mb-3.5 w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2"
        >
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-sm ${rank.border} ${rank.text} ${
              darkMode ? 'bg-slate-800/80' : 'bg-white'
            }`}
          >
            {rank.label}
          </span>
        </motion.div>

        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          {!isSuccess
            ? 'TETAP SEMANGAT!'
            : isPerfect
            ? '完璧！(KANPEKI!)'
            : accuracyPct >= 80
            ? 'よくできました！'
            : '合格！(GOUKAKU!)'}
        </h2>
      </div>

      {/* Motivational Kotowaza (Japanese Proverb) Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`w-full max-w-sm rounded-2xl p-3 border mb-3.5 backdrop-blur-md text-left relative overflow-hidden ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-amber-50/70 border-amber-200/70'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-xl">🌸</span>
          <div className="flex-1">
            <p className={`text-xs font-black tracking-wide ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              {quote.kanji}
            </p>
            <p className={`text-[10px] font-semibold italic opacity-80 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              "{quote.romaji}"
            </p>
            <p className={`text-[11px] font-bold mt-1 leading-snug ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {quote.id}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Breakdown Card with Animated Counters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className={`w-full max-w-sm p-4 rounded-[28px] border-2 relative overflow-hidden mb-4 ${
          darkMode ? 'bg-slate-800/60 border-slate-700/70' : 'bg-white/90 border-slate-200 shadow-xl shadow-slate-200/40'
        }`}
      >
        <div className="flex items-baseline justify-between mb-3 px-1">
          <div className="text-left">
            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isFavoritesMode ? 'Koleksi Favorit' : `Level ${currentLevel}`}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-4xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                {animatedScore}
              </span>
              <span className="text-sm font-bold text-slate-400">/ {totalVocabCount} Benar</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Akurasi
            </span>
            <div className="text-3xl font-black text-emerald-500">
              {animatedAccuracy}%
            </div>
          </div>
        </div>

        {/* Progress Bar with Shimmer Highlight */}
        <div className={`w-full h-2 rounded-full overflow-hidden relative ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} mb-3`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracyPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full relative overflow-hidden ${
              accuracyPct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
            }`}
          >
            {/* Shimmer light sweep */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2"
            />
          </motion.div>
        </div>

        {/* XP Boost & Streak Rewards */}
        <div className="flex items-center justify-between gap-2 text-xs font-bold pt-1 border-t border-slate-500/10">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>+{xpEarned} EXP Diperoleh</span>
          </div>
          {isPerfect && (
            <div className="flex items-center gap-1 text-rose-500">
              <Sparkles className="w-3.5 h-3.5 fill-rose-400" />
              <span>Perfect Bonus!</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-2.5 mt-auto z-10">
        {/* Next Level Primary Button */}
        {!isFavoritesMode && !multiplayerMode && isSuccess && onNextLevel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSfx('click');
              onNextLevel();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black py-4 px-6 rounded-[26px] shadow-xl hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 border-b-4 border-emerald-700 text-xs sm:text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>LANJUT KE LEVEL {currentLevel + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        )}

        {/* Secondary Buttons Row */}
        <div className="flex items-center gap-2">
          {/* Retry Button */}
          <button
            onClick={() => {
              playSfx('click');
              onRetry();
            }}
            className={`flex-1 font-black py-3.5 px-4 rounded-[22px] border-2 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 ${
              !isSuccess
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-lg shadow-rose-500/20'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi</span>
          </button>

          {/* Interactive Re-trigger Confetti Fireworks Button */}
          {isSuccess && (
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                playSfx('win');
                playVictoryFanfare();
                triggerSuperchargedConfetti(4500);
              }}
              className={`p-3.5 rounded-[22px] border-2 shadow-md transition-all flex items-center justify-center text-amber-500 font-bold ${
                darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-amber-50'
              }`}
              title="Rayakan Lagi dengan Kembang Api!"
              aria-label="Rayakan Lagi dengan Kembang Api"
            >
              <span className="text-base">🎊</span>
            </motion.button>
          )}

          {/* Share Score Button */}
          <button
            onClick={onShare}
            className={`p-3.5 rounded-[22px] border-2 shadow-md transition-all flex items-center justify-center active:scale-95 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Bagikan Skor"
            aria-label="Bagikan Skor"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Back to Menu */}
          <button
            onClick={() => {
              playSfx('click');
              onBackToMenu();
            }}
            className={`flex-1 font-black py-3.5 px-4 rounded-[22px] border-2 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Menu Utama</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
