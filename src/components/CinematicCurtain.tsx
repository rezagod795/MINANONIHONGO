import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Trophy, Compass, Flame, CheckCircle2 } from 'lucide-react';

export interface CinematicCurtainProps {
  isActive: boolean;
  phase: 'idle' | 'closing' | 'closed' | 'opening';
  title?: string;
  subtitle?: string;
  badgeType?: 'quiz' | 'menu' | 'kana' | 'game' | 'general';
  darkMode?: boolean;
}

export const CinematicCurtain: React.FC<CinematicCurtainProps> = ({
  isActive,
  phase,
  title = 'クイズ開始',
  subtitle = 'Mina no Nihongo',
  badgeType = 'quiz',
  darkMode = true,
}) => {
  if (!isActive && phase === 'idle') return null;

  const isClosedOrClosing = phase === 'closing' || phase === 'closed';

  // Badge icon based on destination
  const renderBadgeIcon = () => {
    switch (badgeType) {
      case 'quiz':
        return <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />;
      case 'kana':
        return <BookOpen className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" />;
      case 'game':
        return <Flame className="w-8 h-8 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" />;
      case 'menu':
        return <Compass className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />;
      default:
        return <Sparkles className="w-8 h-8 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {/* LEFT CURTAIN PANEL (Tirai Sisi Kiri) */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{
          x: isClosedOrClosing ? '0%' : '-100%',
        }}
        transition={{
          duration: isClosedOrClosing ? 0.28 : 0.32,
          ease: isClosedOrClosing ? [0.22, 1, 0.36, 1] : [0.7, 0, 0.84, 0],
        }}
        style={{ willChange: 'transform' }}
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 shadow-[10px_0_30px_rgba(0,0,0,0.8)] border-r border-amber-500/40 flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle Japanese Traditional Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-500/15 to-transparent pointer-events-none" />

        {/* Top Japanese Noren Trim (Tirai Atas) */}
        <div className="relative p-4 flex items-center gap-2 opacity-60">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-xs shadow-amber-300" />
          <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-amber-300">
            日本語 • NIPPON
          </span>
        </div>

        {/* Floating Ambient Sakura/Light Embers */}
        <div className="relative p-4 flex items-end justify-start opacity-30">
          <span className="text-2xl font-serif select-none text-amber-200/40">桜</span>
        </div>
      </motion.div>

      {/* RIGHT CURTAIN PANEL (Tirai Sisi Kanan) */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{
          x: isClosedOrClosing ? '0%' : '100%',
        }}
        transition={{
          duration: isClosedOrClosing ? 0.28 : 0.32,
          ease: isClosedOrClosing ? [0.22, 1, 0.36, 1] : [0.7, 0, 0.84, 0],
        }}
        style={{ willChange: 'transform' }}
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-slate-950 via-slate-900 to-indigo-950 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] border-l border-amber-500/40 flex flex-col justify-between items-end overflow-hidden"
      >
        {/* Subtle Japanese Traditional Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-amber-500/15 to-transparent pointer-events-none" />

        {/* Top Japanese Noren Trim */}
        <div className="relative p-4 flex items-center gap-2 opacity-60">
          <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-amber-300">
            道 • MASTERY
          </span>
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-xs shadow-amber-300" />
        </div>

        {/* Kanji Accent */}
        <div className="relative p-4 flex items-end justify-end opacity-30">
          <span className="text-2xl font-serif select-none text-amber-200/40">雅</span>
        </div>
      </motion.div>

      {/* CENTER VERTICAL SEAM LIGHT SLIT */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: isClosedOrClosing ? 1 : 0,
          scaleY: isClosedOrClosing ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="absolute inset-y-0 w-1 bg-gradient-to-b from-transparent via-amber-400 to-transparent blur-[1px] z-10 pointer-events-none"
      />

      {/* CENTER EMBLEM & BADGE (Muncul saat tirai menutup di tengah) */}
      <AnimatePresence>
        {isClosedOrClosing && (
          <motion.div
            key="center-badge"
            initial={{ scale: 0.7, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 24,
              delay: 0.08,
            }}
            className="relative z-20 flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Rotating Ambient Sun Aura */}
            <div className="relative mb-3 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute w-28 h-28 rounded-full opacity-35 blur-xl bg-[conic-gradient(from_0deg,#f59e0b,#fbbf24,#f43f5e,#a855f7,#3b82f6,#f59e0b)]"
              />
              <div className="w-20 h-20 rounded-[28px] bg-slate-900/90 border-2 border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.4)] flex items-center justify-center backdrop-blur-xl relative z-10">
                {renderBadgeIcon()}
              </div>
            </div>

            {/* Kanji Title */}
            <motion.h2
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider drop-shadow-md font-serif"
            >
              {title}
            </motion.h2>

            {/* Subtitle / Category Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="flex items-center gap-2 mt-1.5"
            >
              <span className="w-4 h-px bg-amber-400/50" />
              <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-300/90 font-mono">
                {subtitle}
              </p>
              <span className="w-4 h-px bg-amber-400/50" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
