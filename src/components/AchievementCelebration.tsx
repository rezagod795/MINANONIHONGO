import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Star,
  Zap,
  CheckCircle2,
  Share2,
  RotateCcw,
  Play,
  Award,
  Crown,
  ArrowRight,
  Sparkles,
  Percent,
} from 'lucide-react';
import { calculateProfileLevel } from '../lib/levelSystem';

// Web Audio synthesizer for an elegant victory chime
export const playVictoryFanfare = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Pleasant melodic sequence
    const melody = [
      { f: 523.25, time: 0.00, dur: 0.12, type: 'triangle' as OscillatorType }, // C5
      { f: 659.25, time: 0.12, dur: 0.12, type: 'triangle' as OscillatorType }, // E5
      { f: 783.99, time: 0.24, dur: 0.14, type: 'triangle' as OscillatorType }, // G5
      { f: 1046.50, time: 0.38, dur: 0.40, type: 'sine' as OscillatorType },     // C6
    ];

    melody.forEach(({ f, time, dur, type }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(f, ctx.currentTime + time);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });
  } catch (_) {}
};

// No-op placeholder to maintain backward compatibility without any confetti sparks
export const triggerSuperchargedConfetti = (_duration = 0) => {
  // Percikan confetti dihapus sesuai permintaan user
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
  userTotalXp?: number;
}

// Motivational Japanese Proverbs & Encouragement based on performance
const MOTIVATIONAL_QUOTES = {
  perfect: [
    {
      kanji: "完璧！名人は人をそしらず",
      romaji: "Kanpeki! Meijin wa hito o soshirazu",
      id: "Sempurna 100%! Seluruh kosakata level ini berhasil kamu kuasai tanpa kesalahan."
    },
    {
      kanji: "百発百中！見事な成果！",
      romaji: "Hyappatsuhyakuchuu! Migoto na seika!",
      id: "Tepat sasaran 100%! Penguasaan kosakata yang sangat mengagumkan!"
    }
  ],
  high: [
    {
      kanji: "継続は力なり",
      romaji: "Keizoku wa chikara nari",
      id: "Ketekunan adalah kekuatan! Hasil sangat baik, sedikit lagi menuju 100% sempurna!"
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
      id: "Selamat telah menyelesaikan kuis! Ulangi lagi untuk meningkatkan persentase nilai."
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
  userTotalXp,
}) => {
  // Animated counting numbers for score and accuracy
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  // Profile Level Info calculation
  const totalXpVal = userTotalXp ?? (typeof window !== 'undefined' ? parseInt(localStorage.getItem('minanihongo_user_xp') || '0', 10) : 0);
  const profileInfo = calculateProfileLevel(totalXpVal);

  // Quote picker
  const quoteCategory = !isSuccess ? 'fail' : isPerfect ? 'perfect' : accuracyPct >= 80 ? 'high' : 'pass';
  const quote = MOTIVATIONAL_QUOTES[quoteCategory][0];

  useEffect(() => {
    if (isSuccess) {
      playVictoryFanfare();
    }
  }, [isSuccess]);

  // Counting animation for numbers
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900; // 0.9s smooth counting ease

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
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
        label: '👑 RANK S • SEMPURNA',
        kanji: '完璧',
        bg: 'from-amber-500 via-yellow-400 to-amber-600',
        text: 'text-amber-500 dark:text-amber-400',
        border: 'border-amber-400/60',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
      };
    }
    if (accuracyPct >= 80) {
      return {
        label: '🌟 RANK A • SANGAT BAIK',
        kanji: '上手',
        bg: 'from-emerald-500 via-teal-400 to-emerald-600',
        text: 'text-emerald-500 dark:text-emerald-400',
        border: 'border-emerald-400/60',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      };
    }
    if (isSuccess) {
      return {
        label: '🎖️ RANK B • LULUS',
        kanji: '合格',
        bg: 'from-blue-500 via-indigo-400 to-blue-600',
        text: 'text-sky-500 dark:text-sky-400',
        border: 'border-sky-400/60',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
      };
    }
    return {
      label: '🌱 BELUM LULUS • SEMANGAT',
      kanji: '奮闘',
      bg: 'from-rose-500 via-pink-400 to-rose-600',
      text: 'text-rose-500 dark:text-rose-400',
      border: 'border-rose-400/60',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    };
  };

  const rank = getRankBadge();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="text-center py-3 flex flex-col items-center flex-grow w-full relative select-none"
    >
      {/* Trophy / Emblem Box */}
      <div className="relative mb-3 z-10">
        <motion.div
          initial={{ scale: 0.8, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[30px] flex items-center justify-center relative shadow-xl transition-all border-4 ${
            !isSuccess
              ? darkMode
                ? 'bg-slate-800 border-rose-500 text-rose-500 shadow-rose-500/20'
                : 'bg-white border-rose-400 text-rose-500 shadow-rose-500/20'
              : darkMode
              ? 'bg-[#06142a] border-[#ff3b88] text-[#ff3b88] shadow-[#ff3b88]/25'
              : 'bg-white border-[#ff3b88] text-[#ff3b88] shadow-[#ff3b88]/25'
          }`}
        >
          {!isSuccess ? (
            <RotateCcw className="w-10 h-10" />
          ) : isPerfect ? (
            <Crown className="w-11 h-11 fill-[#ff3b88] drop-shadow-md text-[#ff3b88]" />
          ) : (
            <Trophy className="w-11 h-11 fill-[#ff3b88] drop-shadow-md text-[#ff3b88]" />
          )}

          {/* Japanese character badge watermark */}
          <span className="absolute bottom-1 right-2 text-[9px] font-black uppercase tracking-widest opacity-90 px-1.5 py-0.5 rounded-md bg-black/25 text-white">
            {rank.kanji}
          </span>
        </motion.div>
      </div>

      {/* 3 Animated Stars */}
      {!isFavoritesMode && !multiplayerMode && (
        <div className="flex items-center justify-center gap-2.5 mb-2.5 z-10">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = isSuccess && starsCount >= starIdx;
            return (
              <motion.div
                key={`celeb-star-${starIdx}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: isEarned ? 1 : 0.9,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.1 + starIdx * 0.1,
                  type: 'spring',
                  stiffness: 420,
                  damping: 20,
                }}
                className={`relative p-2 rounded-2xl border-2 transition-all ${
                  isEarned
                    ? 'bg-amber-400/20 border-amber-400 shadow-md shadow-amber-400/20 text-amber-400'
                    : darkMode
                    ? 'bg-slate-800/40 border-slate-700/50 text-slate-600'
                    : 'bg-slate-100 border-slate-200 text-slate-300'
                }`}
              >
                <Star className={`w-5 h-5 ${isEarned ? 'fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]' : ''}`} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Main Congratulatory Heading ("Selamat!") */}
      <div className="space-y-1 mb-3 w-full z-10">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border shadow-xs ${rank.border} ${rank.text} ${rank.badgeBg}`}
          >
            {rank.label}
          </span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {!isSuccess ? 'TETAP SEMANGAT!' : 'SELAMAT! 🎉'}
        </h2>

        <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {!isSuccess
            ? 'がんばって！ (Coba ulangi lagi untuk mencapai kelulusan)'
            : isPerfect
            ? 'おめでとうございます！ Semua soal dijawab dengan sempurna!'
            : 'おめでとうございます！ Kamu berhasil menyelesaikan kuis!'}
        </p>
      </div>

      {/* Prominent Presentase (Persentase) Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`w-full max-w-sm p-4 rounded-[26px] border-2 relative overflow-hidden mb-3 ${
          darkMode
            ? 'bg-[#0a1b33]/90 border-sky-500/30 shadow-xl shadow-black/40'
            : 'bg-white/95 border-sky-200 shadow-xl shadow-sky-100/60'
        }`}
      >
        {/* Presentase Header & Main Big Value */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff3b88]">
              {isFavoritesMode ? 'Koleksi Favorit' : `Level ${currentLevel}`}
            </span>
            <div className="text-xs font-bold text-slate-400 mt-0.5">
              Jawaban Benar: <strong className="text-emerald-500 font-black">{animatedScore}</strong> / {totalVocabCount}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Presentase Nilai
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight ${
                accuracyPct >= 80 ? 'text-emerald-500' : accuracyPct >= 60 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {animatedAccuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className={`w-full h-3 rounded-full overflow-hidden relative ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} mb-3`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${accuracyPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              accuracyPct >= 80
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : accuracyPct >= 60
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-pink-500'
            }`}
          />
        </div>

        {/* Presentase & XP Gain Score Pill Badge */}
        <div className="flex items-center justify-between gap-2 text-xs font-bold pt-2 border-t border-slate-500/15">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Zap className="w-4 h-4 fill-amber-400 animate-pulse" />
            <span className="font-black">+{xpEarned} EXP</span>
          </div>

          <div className="flex items-center gap-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
              accuracyPct >= 80
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : accuracyPct >= 60
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
            }`}>
              Presentase: {accuracyPct}%
            </span>
          </div>
        </div>

        {/* Profile Level Progress Bar in Celebration Screen */}
        <div className="mt-2.5 pt-2 border-t border-slate-500/10 text-left">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className={`flex items-center gap-1 ${darkMode ? 'text-pink-300' : 'text-pink-600'}`}>
              <Crown className="w-3.5 h-3.5" />
              Level Profil: Lv.{profileInfo.level} ({profileInfo.title})
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {profileInfo.currentLevelXp} / {profileInfo.requiredXpForNext} XP
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-900 border border-pink-500/20' : 'bg-slate-200'}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(6, profileInfo.progressPercent)}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Motivational Kotowaza (Japanese Proverb) Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`w-full max-w-sm rounded-2xl p-3 border mb-3 text-left relative overflow-hidden ${
          darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-amber-50/70 border-amber-200/70'
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg">🌸</span>
          <div className="flex-1">
            <p className={`text-xs font-black tracking-wide ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              {quote.kanji}
            </p>
            <p className={`text-[10px] font-semibold italic opacity-80 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              "{quote.romaji}"
            </p>
            <p className={`text-[11px] font-bold mt-0.5 leading-snug ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              {quote.id}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-2 mt-auto z-10">
        {/* Next Level Button */}
        {!isFavoritesMode && !multiplayerMode && isSuccess && onNextLevel && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playSfx('click');
              onNextLevel();
            }}
            className="w-full bg-[#ff3b88] hover:bg-[#e02d75] text-white font-black py-3.5 px-5 rounded-[22px] shadow-lg shadow-[#ff3b88]/30 transition-all flex items-center justify-center gap-2 border-b-4 border-[#b81d5b] text-xs sm:text-sm cursor-pointer"
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
            className={`flex-1 font-black py-3 px-3.5 rounded-[20px] border-2 transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95 cursor-pointer ${
              !isSuccess
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-md shadow-rose-500/20'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Kuis</span>
          </button>

          {/* Share Score Button */}
          <button
            onClick={onShare}
            className={`p-3 rounded-[20px] border-2 shadow-sm transition-all flex items-center justify-center active:scale-95 cursor-pointer ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Bagikan Hasil"
            aria-label="Bagikan Hasil"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Back to Menu */}
          <button
            onClick={() => {
              playSfx('click');
              onBackToMenu();
            }}
            className={`flex-1 font-black py-3 px-3.5 rounded-[20px] border-2 transition-all flex items-center justify-center gap-1.5 text-xs active:scale-95 cursor-pointer ${
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
