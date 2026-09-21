import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Settings,
  Pencil,
  BookOpen,
  CheckCircle2,
  Star,
  Flame,
  User,
  Languages,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  Home,
  Trophy,
  Sparkles,
  X,
  Check,
  Phone,
  Mail,
  ExternalLink,
  Camera,
  Zap,
  Crown
} from 'lucide-react';
import { RegisteredUserProfile } from './RegistrationModal';
import { VocabItem } from '../types';
import { calculateProfileLevel, LEVEL_TIERS, ProfileLevelInfo } from '../lib/levelSystem';

interface ProfileViewProps {
  user: any;
  registeredUser: RegisteredUserProfile | null;
  onUpdateProfile: (updated: Partial<RegisteredUserProfile>) => void;
  onLogout: () => void;
  onBackToHome: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  onNavigateTab: (tab: 'home' | 'vocab' | 'quiz' | 'profile') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  playSfx: (type: 'correct' | 'wrong' | 'click' | 'win') => void;
  favorites: VocabItem[];
  levelsData: Record<number, VocabItem[]>;
  getLevelProgress: (lvl: number) => number;
  userXp?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  registeredUser,
  onUpdateProfile,
  onLogout,
  onBackToHome,
  onOpenSettings,
  onOpenNotifications,
  onNavigateTab,
  darkMode,
  setDarkMode,
  playSfx,
  favorites,
  levelsData,
  getLevelProgress,
  userXp,
}) => {
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLevelTiersModal, setShowLevelTiersModal] = useState(false);

  // Editable profile state
  const [nameInput, setNameInput] = useState(registeredUser?.name || user?.displayName || 'duta robi');
  const [bioInput, setBioInput] = useState(() => {
    return localStorage.getItem('minanihongo_user_bio') || 'Belajar Bahasa Jepang menuju masa depan yang lebih baik 🇯🇵';
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem('minanihongo_user_avatar') || '/anime_profile_avatar.jpg';
  });
  const [userId] = useState(() => {
    if (registeredUser?.id) return registeredUser.id.replace('usr_', '');
    const saved = localStorage.getItem('minanihongo_user_display_id');
    if (saved) return saved;
    const newId = '123456';
    localStorage.setItem('minanihongo_user_display_id', newId);
    return newId;
  });

  // Calculate dynamic stats
  const totalLearnedVocab = Object.keys(levelsData).reduce((sum, lvl) => {
    const p = getLevelProgress(Number(lvl));
    const count = (levelsData[Number(lvl)] || []).length;
    return sum + (p > 0 ? Math.round((p / 100) * count) : 0);
  }, 0);
  
  const displayVocabCount = totalLearnedVocab > 0 ? totalLearnedVocab : 12;

  const completedQuizzesCount = Object.keys(levelsData).filter((lvl) => {
    return getLevelProgress(Number(lvl)) >= 100;
  }).length;

  const streakDays = (() => {
    try {
      const saved = localStorage.getItem('minanihongo_streak_days');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  })();

  // XP & Profile Level Calculation
  const userTotalXp = (() => {
    if (typeof userXp === 'number') return userXp;
    if (typeof registeredUser?.xp === 'number') return registeredUser.xp;
    try {
      const saved = localStorage.getItem('minanihongo_user_xp');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return Math.max(0, totalLearnedVocab * 10);
  })();

  const profileLevelInfo = calculateProfileLevel(userTotalXp);
  const currentLevel = profileLevelInfo.level;
  const currentXP = profileLevelInfo.currentLevelXp;
  const maxXP = profileLevelInfo.requiredXpForNext;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    localStorage.setItem('minanihongo_user_bio', bioInput);
    localStorage.setItem('minanihongo_user_avatar', avatarUrl);
    onUpdateProfile({
      name: nameInput.trim(),
    });

    setShowEditModal(false);
    playSfx('win');
  };

  const presetAvatars = [
    '/anime_profile_avatar.jpg',
    '/logo.png',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="w-full min-h-screen pb-24 bg-[#051124] text-white select-none flex flex-col items-center">
      <div className="w-full max-w-[430px] flex flex-col items-center relative">
        
        {/* ======================================================== */}
        {/* 1. SCENIC TOKYO SUNSET HEADER */}
        {/* ======================================================== */}
        <div className="relative w-full h-[270px] sm:h-[290px] overflow-hidden rounded-b-[36px] shadow-2xl flex flex-col justify-between p-4">
          {/* Header Background Image: Tokyo Skytree, sunset, river, lantern, sakura */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/tokyo_profile_header.jpg'), url('https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1200&auto=format&fit=crop')`,
              backgroundColor: '#0a1936',
            }}
          >
            {/* Gradient Overlay for Bottom Smooth Blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#051124]" />
          </div>

          {/* Top Bar: Back & Settings Buttons */}
          <div className="relative z-10 w-full flex items-center justify-between pt-1 sm:pt-2">
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onBackToHome();
              }}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
              title="Kembali ke Beranda"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onOpenSettings();
              }}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 cursor-pointer"
              title="Pengaturan"
              aria-label="Buka Pengaturan"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Identity & Avatar Area */}
          <div className="relative z-10 flex items-center gap-3.5 pb-2 px-1">
            {/* Avatar Circle with Neon Ring and Edit Pencil Button */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-white shadow-[0_0_20px_rgba(56,189,248,0.6)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-white/80">
                  <img
                    src={avatarUrl}
                    alt="Foto Profil"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>
              </div>

              {/* Edit Pencil Button on Bottom-Right */}
              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setShowEditModal(true);
                }}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#132c57] hover:bg-[#1a3d78] border-2 border-white text-cyan-300 flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                title="Ubah Profil"
                aria-label="Ubah Profil"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Name, Japanese Motto & ID Badge */}
            <div className="flex flex-col items-start min-w-0 flex-grow pr-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate w-full drop-shadow-md">
                {registeredUser?.name || user?.displayName || nameInput || 'duta robi'}
              </h2>
              <p className="text-[11px] sm:text-xs text-sky-100 font-medium leading-snug mt-0.5 line-clamp-2 drop-shadow-sm">
                {bioInput}
              </p>
              
              {/* ID Badge Pill */}
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0a1e3f]/80 backdrop-blur-md border border-cyan-400/40 text-[10px] font-bold text-sky-200 shadow-sm">
                <User className="w-3 h-3 text-cyan-400" />
                <span>ID: {userId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. BODY CONTENT CARDS */}
        {/* ======================================================== */}
        <div className="w-full px-4 space-y-3.5 mt-2">

          {/* CARD 1: LEVEL & XP PROGRESS CARD */}
          <div
            onClick={() => {
              playSfx('click');
              setShowLevelTiersModal(true);
            }}
            className="w-full rounded-[24px] p-3.5 sm:p-4 bg-[#0c2247]/90 hover:bg-[#0f2a58] transition-all cursor-pointer backdrop-blur-md border border-sky-500/25 shadow-[0_8px_25px_rgba(0,0,0,0.4)] flex items-center gap-3.5 group"
            title="Klik untuk melihat Daftar Level Profil"
          >
            {/* Sakura Shield Level Badge */}
            <div className="relative shrink-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#ff3b88] to-[#db2777] p-[1.5px] shadow-lg shadow-pink-500/30 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#ff3b88] to-[#be185d] flex flex-col items-center justify-center">
                  <span className="text-sm select-none">🌸</span>
                  <span className="text-[9px] font-black text-white tracking-tighter leading-none mt-0.5">
                    Lv.{currentLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Level Info & Progress Bar */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-white font-black text-sm truncate">Level {currentLevel}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 font-bold truncate">
                    {profileLevelInfo.title}
                  </span>
                </div>
                <span className="text-sky-300 font-mono text-[11px] shrink-0">{currentXP} / {maxXP} XP</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-950/60 p-0.5 border border-sky-500/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 via-cyan-400 to-sky-400 transition-all duration-500"
                  style={{ width: `${Math.max(6, profileLevelInfo.progressPercent)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[9px] text-sky-200/70 font-semibold">
                <span>Total: {userTotalXp} XP</span>
                <span className="text-cyan-300 font-bold">Lihat Peringkat Level ➔</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-sky-400/60 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          {/* CARD 2: 4-COLUMN STATS BAR */}
          <div className="w-full rounded-[24px] bg-[#0c2247]/90 backdrop-blur-md border border-sky-500/25 shadow-lg p-3 sm:p-4">
            <div className="grid grid-cols-4 divide-x divide-sky-500/20 text-center">
              
              {/* Stat 1: Kosakata Dipelajari */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-1">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-base sm:text-lg font-black text-white leading-tight">
                  {displayVocabCount}
                </span>
                <span className="text-[9px] text-sky-200/75 font-medium leading-tight mt-0.5">
                  Kosakata Dipelajari
                </span>
              </div>

              {/* Stat 2: Kuis Selesai */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-base sm:text-lg font-black text-white leading-tight">
                  {completedQuizzesCount}
                </span>
                <span className="text-[9px] text-sky-200/75 font-medium leading-tight mt-0.5">
                  Kuis Selesai
                </span>
              </div>

              {/* Stat 3: Favorit */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-base sm:text-lg font-black text-white leading-tight">
                  {favorites.length}
                </span>
                <span className="text-[9px] text-sky-200/75 font-medium leading-tight mt-0.5">
                  Favorit
                </span>
              </div>

              {/* Stat 4: Hari Berturut-turut */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-base sm:text-lg font-black text-white leading-tight">
                  {streakDays}
                </span>
                <span className="text-[9px] text-sky-200/75 font-medium leading-tight mt-0.5">
                  Hari Berturut-turut
                </span>
              </div>

            </div>
          </div>

          {/* CARD 3: MENU SETTINGS LIST */}
          <div className="w-full rounded-[24px] bg-[#0c2247]/90 backdrop-blur-md border border-sky-500/25 shadow-lg overflow-hidden divide-y divide-sky-500/15">
            
            {/* 1. Informasi Profil */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setShowEditModal(true);
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white">Informasi Profil</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Ubah foto, nama, dan data akun</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 shrink-0" />
            </button>

            {/* 2. Bahasa & Tampilan */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setShowThemeModal(true);
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-500/30">
                  <Languages className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white">Bahasa & Tampilan</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Pengaturan bahasa, tema, dan lainnya</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 shrink-0" />
            </button>

            {/* 3. Notifikasi */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onOpenNotifications();
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <Bell className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white">Notifikasi</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Kelola pemberitahuan</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 shrink-0" />
            </button>

            {/* 4. Keamanan */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setShowSecurityModal(true);
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white">Keamanan</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Ubah kata sandi dan keamanan akun</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 shrink-0" />
            </button>

            {/* 5. Bantuan & FAQ */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                setShowFaqModal(true);
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-sky-500/10 active:bg-sky-500/20 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center shrink-0 border border-pink-500/30">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white">Bantuan & FAQ</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Panduan penggunaan aplikasi</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 shrink-0" />
            </button>

            {/* 6. Keluar */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
                  onLogout();
                }
              }}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between hover:bg-rose-500/15 active:bg-rose-500/25 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-700/40 text-slate-300 group-hover:bg-rose-500/20 group-hover:text-rose-300 flex items-center justify-center shrink-0 border border-slate-600/30 transition-colors">
                  <LogOut className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-rose-200 transition-colors">Keluar</h4>
                  <p className="text-[10px] text-sky-200/70 font-medium truncate">Keluar dari akun</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400/60 group-hover:text-rose-300 shrink-0 transition-colors" />
            </button>

          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. BOTTOM NAVIGATION BAR (DOCK) */}
        {/* ======================================================== */}
        <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-[430px] bg-[#06142a]/95 backdrop-blur-xl border-t border-sky-500/20 px-4 py-2 flex items-center justify-around pointer-events-auto shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
            
            {/* Tab 1: Beranda */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onNavigateTab('home');
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer py-1 px-3 active:scale-95"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Beranda</span>
            </button>

            {/* Tab 2: Kosakata */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onNavigateTab('vocab');
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer py-1 px-3 active:scale-95"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-bold">Kosakata</span>
            </button>

            {/* Tab 3: Kuis */}
            <button
              type="button"
              onClick={() => {
                playSfx('click');
                onNavigateTab('quiz');
              }}
              className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer py-1 px-3 active:scale-95"
            >
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-bold">Kuis</span>
            </button>

            {/* Tab 4: Profil (Active) */}
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-[#ff3b88] transition-all cursor-pointer py-1 px-3 relative"
            >
              <User className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,59,136,0.6)]" />
              <span className="text-[10px] font-black tracking-wide">Profil</span>
              <div className="w-8 h-1 rounded-full bg-[#ff3b88] shadow-[0_0_8px_rgba(255,59,136,0.8)] mt-0.5" />
            </button>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. MODALS (EDIT PROFIL, FAQ, KEAMANAN, BAHASA) */}
      {/* ======================================================== */}
      
      {/* MODAL 1: EDIT INFORMASI PROFIL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="w-full max-w-sm rounded-[28px] bg-[#0c2247] border border-sky-400/40 p-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white">Ubah Data Profil</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar Selector */}
              <div className="mt-4">
                <label className="block text-[11px] font-bold text-sky-200 mb-2">Pilih Foto Profil Avatar:</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {presetAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 transition-transform active:scale-95 ${
                        avatarUrl === av ? 'border-[#ff3b88] scale-110 shadow-lg shadow-pink-500/40' : 'border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-sky-200 mb-1">Nama Lengkap / Panggilan:</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-sky-500/30 text-white text-xs font-bold focus:border-cyan-400 outline-none"
                    placeholder="Nama Anda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-200 mb-1">Status / Bio:</label>
                  <textarea
                    rows={2}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-sky-500/30 text-white text-xs font-medium focus:border-cyan-400 outline-none resize-none"
                    placeholder="Tuliskan motivasi belajar..."
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: BANTUAN & FAQ */}
      <AnimatePresence>
        {showFaqModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm rounded-[28px] bg-[#0c2247] border border-sky-400/40 p-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-pink-400" />
                  <h3 className="text-base font-black text-white">Bantuan & FAQ</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-sky-100 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <h4 className="font-bold text-white mb-1">❓ Bagaimana cara memulai belajar?</h4>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed">
                    Pilih modul di Beranda mulai dari Huruf Kana (Hiragana & Katakana), Kanji 580, atau Kosakata Level 1-17.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <h4 className="font-bold text-white mb-1">🔊 Suara audio tidak terdengar?</h4>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed">
                    Pastikan volume perangkat Anda aktif dan fitur text-to-speech di browser Anda diaktifkan.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <h4 className="font-bold text-white mb-1">💬 Kontak Bantuan Admin</h4>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed mb-2">
                    WhatsApp: 081935928784<br />
                    Email: duta070905@gmail.com
                  </p>
                  <a
                    href="https://wa.me/6281935928784"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px]"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Chat WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: KEAMANAN AKUN */}
      <AnimatePresence>
        {showSecurityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm rounded-[28px] bg-[#0c2247] border border-sky-400/40 p-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Keamanan Akun</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecurityModal(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">Status Verifikasi</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-[9px]">
                      TERVERIFIKASI
                    </span>
                  </div>
                  <p className="text-[11px] text-sky-200/80">
                    Akun Anda telah diverifikasi melalui OTP terdaftar.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <span className="font-bold text-white block mb-1">Kontak Terhubung</span>
                  <p className="text-[11px] text-sky-200/80">
                    {registeredUser?.contact || 'duta070905@gmail.com'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert('Sistem keamanan akun telah aktif dan terlindungi.');
                    setShowSecurityModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: BAHASA & TAMPILAN */}
      <AnimatePresence>
        {showThemeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm rounded-[28px] bg-[#0c2247] border border-sky-400/40 p-5 shadow-2xl text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-black text-white">Bahasa & Tampilan</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <div>
                    <h4 className="font-bold text-white text-xs">Mode Gelap / Terang</h4>
                    <p className="text-[10px] text-sky-200/70">Sesuaikan tema aplikasi</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDarkMode(!darkMode);
                      playSfx('click');
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                      darkMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white'
                    }`}
                  >
                    {darkMode ? 'Mode Gelap 🌙' : 'Mode Terang ☀️'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-sky-500/20">
                  <h4 className="font-bold text-white text-xs mb-1">Bahasa Aplikasi</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button className="py-2 rounded-lg bg-blue-600 text-white font-bold text-xs">
                      🇮🇩 Indonesia
                    </button>
                    <button className="py-2 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs opacity-60">
                      🇯🇵 日本語
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs transition-colors"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. LEVEL TIERS ROADMAP MODAL */}
      <AnimatePresence>
        {showLevelTiersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-[28px] bg-[#091a38] border border-cyan-500/30 p-5 text-white shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-sky-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">Peringkat Level Profil</h3>
                    <p className="text-[10px] text-sky-200/70">Mainkan kuis untuk menambah XP dan naik level!</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLevelTiersModal(false)}
                  className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Status Box */}
              <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-blue-950/40 border border-pink-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-pink-300 font-bold block">Status Saat Ini:</span>
                  <span className="text-sm font-black text-white">Level {currentLevel} • {profileLevelInfo.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 font-mono">Total {userTotalXp} XP</span>
                  <span className="text-[9px] text-slate-300 block">{profileLevelInfo.currentLevelXp}/{profileLevelInfo.requiredXpForNext} XP ke Lv.{currentLevel + 1}</span>
                </div>
              </div>

              {/* Tiers List */}
              <div className="mt-3 space-y-2 overflow-y-auto flex-grow pr-1 custom-scrollbar">
                {LEVEL_TIERS.map((tier) => {
                  const isCurrent = tier.level === currentLevel;
                  const isUnlocked = currentLevel >= tier.level;

                  return (
                    <div
                      key={`tier-lvl-${tier.level}`}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-pink-900/30 border-pink-500 shadow-md ring-1 ring-pink-500/40'
                          : isUnlocked
                          ? 'bg-slate-900/60 border-emerald-500/30 opacity-90'
                          : 'bg-slate-900/30 border-slate-700/40 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            isCurrent
                              ? 'bg-pink-500 text-white'
                              : isUnlocked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tier.level}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white truncate">{tier.title}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300 font-mono">
                              {tier.kanji}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            +{tier.req} XP target
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-pink-500/30 text-pink-300 text-[9px] font-black border border-pink-400/40">
                            Aktif 🔥
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                            Tercapai ✓
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 font-bold">
                            Terkunci 🔒
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Tip */}
              <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
                💡 Tips: Selesaikan setiap kuis kosakata & dapatkan skor sempurna untuk bonus XP ekstra!
              </p>

              <button
                type="button"
                onClick={() => setShowLevelTiersModal(false)}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
