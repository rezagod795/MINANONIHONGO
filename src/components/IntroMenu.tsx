import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Star,
  BookOpen,
  Heart,
  Users,
  Globe,
  User,
  Sun,
  Moon,
  Home,
  Bell,
  Search,
  ChevronRight,
  BarChart3,
  X,
  Sparkles,
  Trophy,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { VocabItem } from '../types';

interface IntroMenuProps {
  slideDirection: number;
  transitionEffect: 'curtain' | 'slide' | 'fade';
  viewVariants: any;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  playSfx: (type: 'correct' | 'wrong' | 'click' | 'win') => void;
  switchView: (viewName: any, options?: any) => void;
  setActiveMode: (mode: 'vocab' | 'letters') => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowNotificationModal: (show: boolean) => void;
  setShowRegistrationModal: (show: boolean) => void;
  startDuelSetup: () => void;
  startFavoritesQuiz: () => void;
  favorites: VocabItem[];
  registeredUser: { name: string; age: string | number; contact: string; verified?: boolean; id?: string } | null;
  isGuest?: boolean;
  user: any;
  levelsData: Record<number, VocabItem[]>;
  currentLevel: number;
  changeLevel: (lvl: number) => void;
  getLevelProgress: (lvl: number) => number;
  visitors: any[];
  announce: (message: string) => void;
  setDictionaryQuery: (q: string) => void;
  view: string;
  setKanjiHubInitialTab?: (tab: 'quiz' | 'flashcards' | 'dictionary' | 'practice_write') => void;
  setInitialKanaScript?: (script: 'hiragana' | 'katakana') => void;
  completed100Levels?: number[];
  celebrateLevel100?: (lvl: number) => void;
}

export const IntroMenu: React.FC<IntroMenuProps> = ({
  slideDirection,
  transitionEffect,
  viewVariants,
  darkMode,
  setDarkMode,
  playSfx,
  switchView,
  setActiveMode,
  setShowSettingsModal,
  setShowNotificationModal,
  setShowRegistrationModal,
  startDuelSetup,
  startFavoritesQuiz,
  favorites,
  registeredUser,
  isGuest = false,
  user,
  levelsData,
  currentLevel,
  changeLevel,
  getLevelProgress,
  visitors,
  announce,
  setDictionaryQuery,
  view,
  setKanjiHubInitialTab,
  setInitialKanaScript,
  completed100Levels = [],
  celebrateLevel100,
}) => {
  const userIsGuest = Boolean(
    isGuest ||
    !registeredUser ||
    registeredUser.verified === false ||
    registeredUser.name === 'Tamu' ||
    registeredUser.id?.startsWith('guest_') ||
    user?.isAnonymous ||
    user?.uid?.startsWith('guest_')
  );

  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [showHurufModal, setShowHurufModal] = useState(false);
  const [activeKanaTab, setActiveKanaTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [showKanjiModal, setShowKanjiModal] = useState(false);
  const [showVocabModal, setShowVocabModal] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedMail, setCopiedMail] = useState(false);

  const handleCopyContact = (text: string, type: 'wa' | 'mail') => {
    navigator.clipboard.writeText(text);
    if (type === 'wa') {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
      announce('Nomor WhatsApp admin berhasil disalin!');
    } else {
      setCopiedMail(true);
      setTimeout(() => setCopiedMail(false), 2000);
      announce('Alamat Gmail admin berhasil disalin!');
    }
    playSfx('click');
  };

  const handleHomeSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playSfx('click');
    if (homeSearchQuery.trim()) {
      setDictionaryQuery(homeSearchQuery.trim());
    }
    switchView('dictionary');
  };

  return (
    <motion.div
      key="intro"
      custom={{ direction: slideDirection, effect: transitionEffect }}
      variants={viewVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      className={`w-full rounded-none sm:rounded-[42px] shadow-none sm:shadow-2xl relative z-10 overflow-hidden border-0 sm:border transition-colors duration-200 flex flex-col items-center pb-20 ${
        darkMode
          ? 'bg-[#0b1426] sm:border-slate-800 sm:shadow-slate-950/80'
          : 'bg-[#f0f6fc] sm:border-sky-200/70 sm:shadow-slate-300/80'
      }`}
    >
      {/* ======================================================== */}
      {/* 1. TOP SCENERY SECTION (Mount Fuji, Lake, Torii, Pagoda) */}
      {/* ======================================================== */}
      <div className="relative w-full h-[290px] sm:h-[320px] overflow-hidden flex flex-col justify-between select-none shrink-0 pt-3 sm:pt-4">
        {/* Background Image */}
        <img
          src="/menu_fuji_daytime.jpg"
          alt="Gunung Fuji dan Danau Jepang"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/40 via-transparent to-sky-950/55 pointer-events-none" />

        {/* Header Action Buttons */}
        <div className="relative z-10 w-full flex items-center justify-between px-4 sm:px-6 pt-1 sm:pt-2">
          {/* Left: Home Button */}
          <button
            onClick={() => {
              playSfx('click');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-10 h-10 rounded-full bg-[#1b437c]/65 hover:bg-[#1b437c]/85 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/25 active:scale-95 transition-all cursor-pointer"
            title="Beranda"
          >
            <Home className="w-5 h-5 text-white" />
          </button>

          {/* Right: Settings & Notification Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playSfx('click');
                setShowSettingsModal(true);
              }}
              className="w-10 h-10 rounded-full bg-[#1b437c]/65 hover:bg-[#1b437c]/85 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/25 active:scale-95 transition-all cursor-pointer"
              title="Pengaturan"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => {
                playSfx('click');
                setShowNotificationModal(true);
              }}
              className="w-10 h-10 rounded-full bg-[#1b437c]/65 hover:bg-[#1b437c]/85 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/25 relative active:scale-95 transition-all cursor-pointer"
              title="Pemberitahuan"
            >
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            </button>
          </div>
        </div>

        {/* Title & Japanese Phrases */}
        <div className="relative z-10 text-center px-4 mt-2 mb-auto">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            みなのにほんご
          </h1>
          <p className="text-sm sm:text-base font-bold text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] mt-0.5">
            Belajar Bahasa Jepang
          </p>
          <p className="text-xs font-semibold text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)] mt-1 tracking-wide">
            ― 一緒にがんばりましょう！ ―
          </p>
          <p className="text-[11px] font-medium text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.75)]">
            Ayo belajar bersama!
          </p>
        </div>

        {/* Floating Theme Pill at bottom right of scenery */}
        <div className="relative z-10 w-full flex justify-end px-5 pb-5">
          <button
            onClick={() => {
              const nextDark = !darkMode;
              setDarkMode(nextDark);
              playSfx('click');
              announce(nextDark ? 'Mode Gelap aktif' : 'Mode Terang aktif');
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#0a1b38]/85 hover:bg-[#0a1b38] backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/20 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-200" />}
            <span>Tema: {darkMode ? 'Terang' : 'Malam'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BODY CONTENT CARDS */}
      {/* ======================================================== */}
      <div className="w-full px-4 -mt-4 relative z-20 space-y-2.5 pb-1">
        {/* CARD 1: 3 KATEGORI UTAMA (HURUF, KANJI, KOSAKATA) */}
        <div className="w-full rounded-[26px] bg-white dark:bg-slate-900 p-3.5 shadow-xl border border-sky-100/90 dark:border-slate-800">
          <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
            {/* 1. Huruf (Hiragana & Katakana) */}
            <button
              onClick={() => {
                playSfx('click');
                if (userIsGuest) {
                  playSfx('wrong');
                  announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka kuis huruf.');
                  setShowRegistrationModal(true);
                  return;
                }
                setActiveMode('letters');
                setShowHurufModal(true);
              }}
              className="flex flex-col items-center justify-center p-1 active:scale-95 transition-transform group cursor-pointer relative"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff3366] via-[#ec4899] to-[#3b82f6] text-white flex items-center justify-center font-black text-lg shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform font-serif tracking-tighter">
                  あア
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs" title="Terkunci untuk Mode Tamu">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white mt-2">
                HURUF
              </span>
            </button>

            {/* 2. Kanji */}
            <button
              onClick={() => {
                playSfx('click');
                if (userIsGuest) {
                  playSfx('wrong');
                  announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka kuis kanji.');
                  setShowRegistrationModal(true);
                  return;
                }
                setShowKanjiModal(true);
              }}
              className="flex flex-col items-center justify-center p-1 active:scale-95 transition-transform group cursor-pointer relative"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform font-serif">
                  漢
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs" title="Terkunci untuk Mode Tamu">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white mt-2">
                KANJI
              </span>
            </button>

            {/* 3. Kosakata */}
            <button
              onClick={() => {
                playSfx('click');
                if (userIsGuest) {
                  playSfx('wrong');
                  announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka kuis kosakata.');
                  setShowRegistrationModal(true);
                  return;
                }
                setActiveMode('vocab');
                setShowVocabModal(true);
              }}
              className="flex flex-col items-center justify-center p-1 active:scale-95 transition-transform group cursor-pointer relative"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Sun className="w-6 h-6 stroke-[2.2]" />
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs" title="Terkunci untuk Mode Tamu">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className="text-xs font-black text-slate-800 dark:text-white mt-2">
                KOSAKATA
              </span>
            </button>
          </div>
        </div>

        {/* CARD 2: KAMUS BAHASA JEPANG (Dictionary Banner with Search - Compact) */}
        <div className="w-full rounded-[22px] overflow-hidden relative shadow-md border border-sky-200/80 dark:border-slate-800 p-3 sm:p-3.5 bg-gradient-to-br from-[#e0f0fe] via-[#edf6ff] to-[#f4f9ff] dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800">
          {/* Japanese Scenery Artwork on the right side */}
          <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none overflow-hidden">
            <img
              src="/dict_banner_bg.jpg"
              alt="Kyoto Street and Fuji"
              loading="eager"
              decoding="async"
              className="w-full h-full object-cover object-left opacity-60 dark:opacity-30"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#e0f0fe] via-[#e0f0fe]/85 to-transparent dark:from-slate-900 dark:via-slate-900/85 to-transparent" />
          </div>

          <div className="relative z-10 text-left">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold">
                <BookOpen className="w-3 h-3" />
                <span>Kamus</span>
              </span>
              {userIsGuest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9.5px] font-black border border-emerald-500/30">
                  <Check className="w-2.5 h-2.5" />
                  <span>Akses Tamu Terbuka</span>
                </span>
              )}
              <h2 className="text-sm sm:text-base font-black text-[#0f2757] dark:text-white">
                Kamus Bahasa Jepang
              </h2>
            </div>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium mb-2">
              Cari arti kata Jepang dengan mudah
            </p>

            <form onSubmit={handleHomeSearch} className="flex items-center gap-1.5">
              <div className="relative flex-grow">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={homeSearchQuery}
                  onChange={(e) => setHomeSearchQuery(e.target.value)}
                  placeholder="Masukkan kata Jepang..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400 shadow-xs text-slate-800 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs shrink-0 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3 h-3" />
                <span>Cari</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>

        {/* CARD 3: KAMUS TERAKHIR DIBUKA */}
        <div
          onClick={() => {
            playSfx('click');
            switchView('dictionary');
          }}
          className="w-full rounded-[24px] bg-white dark:bg-slate-900 border border-sky-100/90 dark:border-slate-800 p-3.5 sm:p-4 flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer relative overflow-hidden group"
        >
          {/* Seigaiha waves subtle background watermark */}
          <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-5 dark:opacity-10 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Kamus Terakhir Dibuka
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Lihat kata yang pernah kamu cari
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform relative z-10" />
        </div>

        {/* CARD 4: 2x2 ACTION CARDS */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Peringkat */}
          <div
            onClick={() => {
              playSfx('click');
              if (userIsGuest) {
                playSfx('wrong');
                announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka peringkat.');
                setShowRegistrationModal(true);
                return;
              }
              switchView('leaderboard');
            }}
            className="rounded-[22px] bg-white dark:bg-slate-900 border border-sky-100/90 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group relative"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/25 group-hover:scale-105 transition-transform">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                  Peringkat
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                  Lihat progres & pencapaian
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
          </div>

          {/* Duet (1v1) */}
          <div
            onClick={() => {
              playSfx('click');
              if (userIsGuest) {
                playSfx('wrong');
                announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka duel 1v1.');
                setShowRegistrationModal(true);
                return;
              }
              startDuelSetup();
            }}
            className="rounded-[22px] bg-white dark:bg-slate-900 border border-sky-100/90 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group relative"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/25 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                  Duet (1v1)
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                  Belajar bersama teman
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
          </div>

          {/* Kuis Favorit */}
          <div
            onClick={() => {
              playSfx('click');
              if (userIsGuest) {
                playSfx('wrong');
                announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka kuis favorit.');
                setShowRegistrationModal(true);
                return;
              }
              startFavoritesQuiz();
            }}
            className="rounded-[22px] bg-white dark:bg-slate-900 border border-sky-100/90 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group relative"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/25 group-hover:scale-105 transition-transform">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                  Kuis Favorit ({favorites.length})
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                  Soal yang disimpan
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
          </div>

          {/* Dunia (Online) */}
          <div
            onClick={() => {
              playSfx('click');
              if (userIsGuest) {
                playSfx('wrong');
                announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka fitur online.');
                setShowRegistrationModal(true);
                return;
              }
              startDuelSetup();
            }}
            className="rounded-[22px] bg-white dark:bg-slate-900 border border-sky-100/90 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer group relative"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/25 group-hover:scale-105 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                {userIsGuest && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/50 flex items-center justify-center shadow-xs">
                    <Lock className="w-2 h-2" />
                  </span>
                )}
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white truncate">
                  Dunia (Online)
                </h4>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                  Belajar dengan pengguna lain
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
          </div>
        </div>

        {/* USER REGISTRATION / ACCOUNT STATUS CARD */}
        {registeredUser && !userIsGuest ? (
          <div
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
              darkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-white border-sky-100 text-slate-700 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                {registeredUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm">{registeredUser.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black">
                    TERDAFTAR
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold">
                  {registeredUser.age} Tahun • {registeredUser.contact}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="text-[10px] text-rose-500 hover:text-rose-600 font-extrabold underline cursor-pointer p-1"
            >
              Ubah
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setShowRegistrationModal(true);
            }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all group active:scale-98 cursor-pointer ${
              darkMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs text-base shrink-0">
                🔒
              </div>
              <div>
                <div className="font-black text-[11px] flex items-center gap-1.5">
                  <span className="text-amber-600 dark:text-amber-400">Mode Tamu: Akses Hanya Kamus</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <p className="text-[10px] opacity-85 font-medium">
                  Daftar akun gratis untuk membuka Kuis, Huruf, Kanji, dan Duel
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#ff2a7a] to-[#ff3b88] text-white font-black text-[10px] shadow-sm shrink-0">
              Daftar →
            </span>
          </button>
        )}

        {/* KONTAK ADMIN ACCORDION CARD */}
        <div
          className={`w-full rounded-2xl border transition-all overflow-hidden ${
            darkMode
              ? 'bg-slate-850/80 border-slate-700/80 text-slate-200 shadow-slate-950/40'
              : 'bg-white border-sky-100/90 text-slate-700 shadow-sm shadow-sky-100/60'
          }`}
        >
          {/* Header Button (Toggle) */}
          <button
            type="button"
            onClick={() => {
              playSfx('click');
              setShowContactDetails(prev => !prev);
            }}
            className={`w-full p-3.5 flex items-center justify-between text-left cursor-pointer transition-colors ${
              darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="text-left min-w-0">
                <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span>Kontak Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {showContactDetails ? 'Ketuk untuk menutup kontak' : 'Ketuk untuk melihat WhatsApp & Gmail'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black border border-emerald-500/20">
                AKTIF
              </span>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${
                  showContactDetails
                    ? 'rotate-180 bg-emerald-500/20 text-emerald-500'
                    : darkMode
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </button>

          {/* Collapsible Contact Rows */}
          <AnimatePresence>
            {showContactDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="px-3.5 pb-3.5 pt-0 flex flex-col gap-2 overflow-hidden border-t border-slate-100 dark:border-slate-800/60 mt-1"
              >
                {/* Contact Row 1: WhatsApp */}
                <div
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border mt-2 transition-colors ${
                    darkMode
                      ? 'bg-slate-900/70 border-slate-700/70 text-slate-200'
                      : 'bg-emerald-50/50 border-emerald-100/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-bold block leading-none">
                        WhatsApp Admin
                      </span>
                      <span className="font-extrabold text-xs sm:text-sm tracking-wide text-slate-800 dark:text-slate-100 select-all">
                        081935928784
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyContact('081935928784', 'wa')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        copiedWa
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title="Salin nomor WhatsApp"
                    >
                      {copiedWa ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWa ? 'Tersalin' : 'Salin'}</span>
                    </button>

                    <a
                      href="https://wa.me/6281935928784?text=Halo%20Admin%20Mina%20no%20Nihongo%2C%20saya%20ingin%20bertanya..."
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playSfx('click')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-[10px] flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Contact Row 2: Gmail */}
                <div
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-colors ${
                    darkMode
                      ? 'bg-slate-900/70 border-slate-700/70 text-slate-200'
                      : 'bg-rose-50/40 border-rose-100/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-[9.5px] text-rose-500 dark:text-rose-400 font-bold block leading-none">
                        Gmail Admin
                      </span>
                      <span className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-slate-100 truncate block max-w-[130px] sm:max-w-none select-all">
                        duta070905@gmail.com
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyContact('duta070905@gmail.com', 'mail')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                        copiedMail
                          ? 'bg-rose-500 text-white border-rose-500'
                          : darkMode
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                      title="Salin alamat Gmail"
                    >
                      {copiedMail ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedMail ? 'Tersalin' : 'Salin'}</span>
                    </button>

                    <a
                      href="mailto:duta070905@gmail.com?subject=Tanya%20Admin%20Mina%20no%20Nihongo"
                      onClick={() => playSfx('click')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[10px] flex items-center gap-1 transition-all shadow-xs"
                    >
                      <span>Email</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Admin Visitor Log */}
        {user?.email === 'duta070905@gmail.com' && (
          <button
            onClick={() => switchView('visitors')}
            className={`w-full font-bold py-2.5 rounded-[18px] shadow-sm border transition-all flex items-center justify-center gap-2 active:scale-95 text-xs ${
              darkMode
                ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-purple-500" />
            Log Pengunjung ({visitors.length})
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. BOTTOM NAVIGATION BAR (Beranda, Kosakata, Kuis, Profil) */}
      {/* ======================================================== */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40 px-3 pb-3 pt-1">
        <div
          className={`w-full rounded-[28px] py-2 px-5 shadow-2xl border flex items-center justify-around transition-colors ${
            darkMode
              ? 'bg-[#06142a]/95 border-sky-500/30 shadow-slate-950/80 text-slate-400'
              : 'bg-white/95 border-sky-200/80 shadow-slate-300/80 text-slate-600'
          }`}
        >
          {/* Tab 1: Beranda */}
          <button
            onClick={() => {
              playSfx('click');
              switchView('intro');
            }}
            className={`flex flex-col items-center gap-1 relative py-1 px-3 transition-colors cursor-pointer ${
              view === 'intro'
                ? 'text-[#ff3b88] dark:text-[#ff3b88] font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Beranda</span>
            {view === 'intro' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 w-8 h-1 rounded-full bg-[#ff3b88]"
              />
            )}
          </button>

          {/* Tab 2: Kosakata */}
          <button
            onClick={() => {
              playSfx('click');
              switchView('dictionary');
            }}
            className={`flex flex-col items-center gap-1 relative py-1 px-3 transition-colors cursor-pointer ${
              view === 'dictionary'
                ? 'text-[#ff3b88] dark:text-[#ff3b88] font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-bold">Kosakata</span>
            {view === 'dictionary' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 w-8 h-1 rounded-full bg-[#ff3b88]"
              />
            )}
          </button>

          {/* Tab 3: Kuis */}
          <button
            onClick={() => {
              playSfx('click');
              if (userIsGuest) {
                playSfx('wrong');
                announce('Mode Tamu hanya dapat membuka kamus. Silakan daftar untuk membuka kuis.');
                setShowRegistrationModal(true);
                return;
              }
              setShowVocabModal(true);
            }}
            className={`flex flex-col items-center gap-1 relative py-1 px-3 transition-colors cursor-pointer ${
              view === 'quiz'
                ? 'text-[#ff3b88] dark:text-[#ff3b88] font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Trophy className="w-5 h-5" />
              {userIsGuest && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 text-amber-300 border border-amber-400/50 flex items-center justify-center">
                  <Lock className="w-2 h-2" />
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Kuis</span>
            {view === 'quiz' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 w-8 h-1 rounded-full bg-[#ff3b88]"
              />
            )}
          </button>

          {/* Tab 4: Profil */}
          <button
            onClick={() => {
              playSfx('click');
              switchView('profile');
            }}
            className={`flex flex-col items-center gap-1 relative py-1 px-3 transition-colors cursor-pointer ${
              view === 'profile'
                ? 'text-[#ff3b88] dark:text-[#ff3b88] font-black'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profil</span>
            {view === 'profile' && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -bottom-1 w-8 h-1 rounded-full bg-[#ff3b88]"
              />
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MODALS CONSOLIDATED FROM GAMBAR 1 */}
      {/* ======================================================== */}

      {/* MODAL 1: PILIHAN HURUF KANA (HIRAGANA & KATAKANA) */}
      <AnimatePresence>
        {showHurufModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`w-full max-w-sm rounded-[32px] p-5 shadow-2xl border my-auto sm:my-0 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    Karakter Dasar Jepang
                  </span>
                  <h3 className="text-base font-black mt-1">Belajar Huruf Kana</h3>
                </div>
                <button
                  onClick={() => {
                    playSfx('click');
                    setShowHurufModal(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector: Hiragana vs Katakana */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mt-3.5 gap-1">
                <button
                  onClick={() => {
                    playSfx('click');
                    setActiveKanaTab('hiragana');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeKanaTab === 'hiragana'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-serif font-black">あ</span>
                  <span>Hiragana</span>
                </button>
                <button
                  onClick={() => {
                    playSfx('click');
                    setActiveKanaTab('katakana');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeKanaTab === 'katakana'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-sky-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-serif font-black">ア</span>
                  <span>Katakana</span>
                </button>
              </div>

              {/* 2 Big Action Cards for Selected Script (Membaca & Menulis) */}
              <div className="grid grid-cols-2 gap-3 mt-3.5">
                {/* Pilihan 1: Membaca Kana */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setInitialKanaScript) setInitialKanaScript(activeKanaTab);
                    switchView('kana_reading');
                    setShowHurufModal(false);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 group active:scale-95 cursor-pointer ${
                    activeKanaTab === 'hiragana'
                      ? darkMode
                        ? 'bg-slate-800/80 border-slate-700 hover:border-rose-500'
                        : 'bg-rose-50/60 border-rose-100 hover:border-rose-400'
                      : darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500'
                      : 'bg-blue-50/60 border-blue-100 hover:border-blue-400'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform ${
                      activeKanaTab === 'hiragana'
                        ? 'bg-gradient-to-tr from-rose-500 to-pink-500 shadow-rose-500/25'
                        : 'bg-gradient-to-tr from-blue-600 to-sky-500 shadow-blue-500/25'
                    }`}
                  >
                    📖
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <h4 className="font-black text-xs">Membaca</h4>
                      <span
                        className={`text-[8px] px-1 py-0.2 rounded font-extrabold ${
                          activeKanaTab === 'hiragana'
                            ? 'bg-rose-500/10 text-rose-500'
                            : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {activeKanaTab === 'hiragana' ? 'Hiragana' : 'Katakana'}
                      </span>
                    </div>
                    <p
                      className={`text-[9px] font-medium mt-1 leading-tight ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Tabel 46 huruf, audio lafal, & kuis baca
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black px-3 py-1 rounded-full mt-1 ${
                      activeKanaTab === 'hiragana'
                        ? 'text-rose-500 bg-rose-500/10'
                        : 'text-blue-500 bg-blue-500/10'
                    }`}
                  >
                    Mulai Baca ➔
                  </span>
                </button>

                {/* Pilihan 2: Menulis Stroke */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setInitialKanaScript) setInitialKanaScript(activeKanaTab);
                    switchView('kana_writing');
                    setShowHurufModal(false);
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 group active:scale-95 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-emerald-500'
                      : 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                    ✍️
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <h4 className="font-black text-xs">Menulis</h4>
                      <span className="text-[8px] px-1 py-0.2 rounded font-extrabold bg-emerald-500/10 text-emerald-600">
                        Stroke
                      </span>
                    </div>
                    <p
                      className={`text-[9px] font-medium mt-1 leading-tight ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Kanvas interaktif & urutan goresan
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full mt-1">
                    Mulai Tulis ➔
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FITUR KANJI HUB (580 Kanji JFT) */}
      <AnimatePresence>
        {showKanjiModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-12 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`w-full max-w-sm rounded-[32px] p-6 shadow-2xl border my-auto sm:my-0 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    580 Kanji JFT
                  </span>
                  <h3 className="text-base font-black mt-1">Fitur Kanji Hub</h3>
                </div>
                <button
                  onClick={() => {
                    playSfx('click');
                    setShowKanjiModal(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mt-4">
                {/* 1. Kuis Kanji */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setKanjiHubInitialTab) setKanjiHubInitialTab('quiz');
                    switchView('kanji_hub');
                    setShowKanjiModal(false);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 group active:scale-95 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-purple-500'
                      : 'bg-purple-50/60 border-purple-100 hover:border-purple-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-purple-600/25">
                    🎯
                  </div>
                  <div>
                    <h4 className="font-black text-xs">Kuis Kanji</h4>
                    <p
                      className={`text-[8px] mt-0.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Pilihan Ganda & skor live
                    </p>
                  </div>
                  <span className="text-[8px] font-black text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    Mulai Kuis ➔
                  </span>
                </button>

                {/* 2. Flashcard 3D */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setKanjiHubInitialTab) setKanjiHubInitialTab('flashcards');
                    switchView('kanji_hub');
                    setShowKanjiModal(false);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 group active:scale-95 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-amber-500'
                      : 'bg-amber-50/60 border-amber-100 hover:border-amber-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-amber-500/25">
                    🗂️
                  </div>
                  <div>
                    <h4 className="font-black text-xs">Flashcard 3D</h4>
                    <p
                      className={`text-[8px] mt-0.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Kartu bolak-balik & audio
                    </p>
                  </div>
                  <span className="text-[8px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Buka Kartu ➔
                  </span>
                </button>

                {/* 3. Kamus 580 */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setKanjiHubInitialTab) setKanjiHubInitialTab('dictionary');
                    switchView('kanji_hub');
                    setShowKanjiModal(false);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 group active:scale-95 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500'
                      : 'bg-blue-50/60 border-blue-100 hover:border-blue-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-600/25">
                    📖
                  </div>
                  <div>
                    <h4 className="font-black text-xs">Kamus 580</h4>
                    <p
                      className={`text-[8px] mt-0.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Daftar lengkap & furigana
                    </p>
                  </div>
                  <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Cari Kanji ➔
                  </span>
                </button>

                {/* 4. Papan Tulis Kanji */}
                <button
                  onClick={() => {
                    playSfx('click');
                    if (setKanjiHubInitialTab) setKanjiHubInitialTab('practice_write');
                    switchView('kanji_hub');
                    setShowKanjiModal(false);
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-1.5 group active:scale-95 cursor-pointer ${
                    darkMode
                      ? 'bg-slate-800/80 border-slate-700 hover:border-emerald-500'
                      : 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-400'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-600/25">
                    ✍️
                  </div>
                  <div>
                    <h4 className="font-black text-xs">Papan Tulis</h4>
                    <p
                      className={`text-[8px] mt-0.5 ${
                        darkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Latihan coret stroke kanji
                    </p>
                  </div>
                  <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Tulis Kanji ➔
                  </span>
                </button>
              </div>

              <button
                onClick={() => {
                  playSfx('click');
                  if (setKanjiHubInitialTab) setKanjiHubInitialTab('quiz');
                  switchView('kanji_hub');
                  setShowKanjiModal(false);
                }}
                className="w-full mt-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-600/20 active:scale-95 transition-all text-center cursor-pointer"
              >
                Buka Kanji Hub Lengkap ➔
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PILIH LEVEL KOSAKATA (1-17) */}
      <AnimatePresence>
        {showVocabModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-10 p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`w-full max-w-sm max-h-[85vh] rounded-[32px] p-5 shadow-2xl border flex flex-col my-auto sm:my-0 ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-slate-100 text-slate-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    Mina no Nihongo
                  </span>
                  <h3 className="text-base font-black mt-1">Level Kosakata (1-17)</h3>
                </div>
                <button
                  onClick={() => {
                    playSfx('click');
                    setShowVocabModal(false);
                  }}
                  className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto pt-3 pb-1 space-y-3 no-scrollbar flex-1">
                {/* Milestone Banner */}
                {completed100Levels.length > 0 && (
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2 shadow-xs ${
                      darkMode
                        ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/30 to-amber-950/40 border-amber-500/40'
                        : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/70 border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl select-none">🏆</span>
                      <div>
                        <p
                          className={`text-[11px] font-black leading-tight ${
                            darkMode ? 'text-amber-300' : 'text-amber-900'
                          }`}
                        >
                          {completed100Levels.length} Level 100% Sempurna!
                        </p>
                        <p
                          className={`text-[9px] font-semibold ${
                            darkMode ? 'text-amber-200/70' : 'text-amber-700'
                          }`}
                        >
                          Pencapaian luar biasa tanpa kesalahan 👑
                        </p>
                      </div>
                    </div>
                    {celebrateLevel100 && (
                      <button
                        onClick={() => {
                          playSfx('click');
                          celebrateLevel100(completed100Levels[0]);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 text-slate-900 text-[10px] font-black shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <span>Rayakan</span>
                        <span>🎊</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Continue Button */}
                <button
                  onClick={() => {
                    playSfx('click');
                    switchView('quiz', {
                      levelNumber: currentLevel,
                      beforeChange: () => changeLevel(currentLevel),
                    });
                    setShowVocabModal(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-between active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{levelsData[currentLevel]?.icon || '📖'}</span>
                    <div className="text-left">
                      <span className="text-[8px] font-extrabold uppercase tracking-wide opacity-80 block leading-none">
                        Lanjutkan Belajar
                      </span>
                      <span className="text-[12px] font-black leading-tight">
                        Level {currentLevel} • {levelsData[currentLevel]?.name || 'Kosakata'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black bg-black/15 px-2 py-0.5 rounded-lg">
                    Mulai ➔
                  </span>
                </button>

                {/* Grid 4 Kolom Level (1-17) */}
                <div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    Pilih Level (1-17)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(levelsData)
                      .map(Number)
                      .filter((levelNum) => levelNum <= 17)
                      .map((levelNum) => {
                        const mastery = Math.round(getLevelProgress(levelNum));
                        const isMastered = mastery >= 100;
                        const isActive = currentLevel === levelNum;
                        return (
                          <button
                            key={`modal-level-grid-btn-${levelNum}`}
                            onClick={() => {
                              playSfx('click');
                              switchView('quiz', {
                                levelNumber: levelNum,
                                beforeChange: () => changeLevel(levelNum),
                              });
                              setShowVocabModal(false);
                            }}
                            className={`h-[58px] rounded-2xl flex flex-col items-center justify-center gap-0.5 relative overflow-hidden border-2 transition-all shadow-xs cursor-pointer active:scale-95 ${
                              isActive
                                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-md shadow-amber-500/25'
                                : isMastered
                                ? darkMode
                                  ? 'bg-slate-800/90 border-amber-400/80 text-slate-200'
                                  : 'bg-amber-50/90 border-amber-400 text-slate-800'
                                : darkMode
                                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {isMastered && (
                              <span className="absolute -top-0.5 -right-0.5 text-[11px]">👑</span>
                            )}
                            <div className="flex items-center gap-1 z-10">
                              <span className="text-[13px]">{levelsData[levelNum]?.icon || '📖'}</span>
                              <div className="flex flex-col items-start leading-none">
                                <span className="text-[7px] opacity-70 font-black uppercase">Lv</span>
                                <span
                                  className={`text-[12px] font-black ${
                                    isMastered && !isActive
                                      ? 'text-amber-500 dark:text-amber-300'
                                      : ''
                                  }`}
                                >
                                  {levelNum}
                                </span>
                              </div>
                            </div>
                            {mastery > 0 && (
                              <span
                                className={`text-[7.5px] font-black ${
                                  isActive
                                    ? 'text-slate-950/90'
                                    : isMastered
                                    ? 'text-amber-400'
                                    : 'text-emerald-500'
                                }`}
                              >
                                {isMastered ? '⭐ 100%' : `${mastery}%`}
                              </span>
                            )}
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-black/10">
                              <div
                                className={`h-full ${
                                  isActive
                                    ? 'bg-slate-900/40'
                                    : isMastered
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-400'
                                }`}
                                style={{ width: `${Math.min(100, mastery)}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
