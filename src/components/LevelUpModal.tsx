import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Star, ArrowRight, Zap, Award, Crown } from 'lucide-react';
import { ProfileLevelInfo } from '../lib/levelSystem';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  levelInfo: ProfileLevelInfo;
  xpEarned: number;
  darkMode?: boolean;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  levelInfo,
  xpEarned,
  darkMode = true,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`w-full max-w-sm rounded-[32px] border-2 shadow-[0_0_50px_rgba(255,59,136,0.35)] p-6 text-center relative overflow-hidden flex flex-col items-center ${
            darkMode
              ? 'bg-[#08152e] border-[#ff3b88]/60 text-white'
              : 'bg-white border-pink-400 text-slate-900 shadow-xl'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff3b88]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Level Badge Shield Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 450, damping: 20 }}
            className="relative mb-4 z-10"
          >
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-[#ff3b88] via-pink-500 to-amber-400 p-[3px] shadow-2xl shadow-[#ff3b88]/50 flex items-center justify-center">
              <div className="w-full h-full rounded-[29px] bg-[#0c1e40] flex flex-col items-center justify-center relative overflow-hidden">
                <Crown className="w-10 h-10 text-amber-400 fill-amber-400/30 drop-shadow-md animate-bounce" />
                <span className="text-[10px] font-black text-pink-400 tracking-wider uppercase mt-0.5">
                  Lv.{newLevel}
                </span>
                <span className="absolute bottom-1 right-2 text-[8.5px] font-black opacity-80 px-1 py-0.2 rounded bg-black/40 text-amber-300">
                  {levelInfo.kanjiTitle}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Header Title */}
          <div className="space-y-1 mb-4 z-10">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-pink-400/40 bg-pink-500/10 text-pink-400 inline-block">
              🎉 LEVEL UP PROFIL!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              Level {newLevel} Tercapai!
            </h2>
            <p className="text-xs font-bold text-amber-400">
              Gelar Baru: <strong className="text-white underline decoration-pink-500 font-extrabold">{levelInfo.title} ({levelInfo.kanjiTitle})</strong>
            </p>
          </div>

          {/* Level Progression Row */}
          <div className="w-full bg-[#0d234d] border border-cyan-500/25 rounded-2xl p-3.5 mb-4 z-10 space-y-2.5 text-left">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Peningkatan Level:</span>
              <div className="flex items-center gap-1.5 font-black">
                <span className="text-slate-400">Lv.{oldLevel}</span>
                <span className="text-pink-400">➔</span>
                <span className="text-emerald-400 text-sm">Lv.{newLevel}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">XP Bertambah:</span>
              <span className="text-amber-400 font-black flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                +{xpEarned} XP
              </span>
            </div>

            {/* Total XP & Progress to next level */}
            <div className="pt-2 border-t border-slate-700/50">
              <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                <span>Progress ke Lv.{newLevel + 1}:</span>
                <span className="text-cyan-300 font-mono">{levelInfo.currentLevelXp} / {levelInfo.requiredXpForNext} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-cyan-500/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#ff3b88] to-pink-600 hover:from-[#e02d75] hover:to-pink-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 border-b-4 border-pink-800 transition-all cursor-pointer z-10"
          >
            <span>HEBAT! LANJUTKAN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
