import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface FlightLoadingProps {
  onComplete: () => void;
  darkMode?: boolean;
}

export const FlightLoading: React.FC<FlightLoadingProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    // Durasi loading yang halus dan pas (sekitar 3.8 detik)
    const duration = 3800; 

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Kelopak sakura berjatuhan dengan posisi acak & animasi melayang halus
  const petals = [
    { id: 1, left: '8%', delay: 0, duration: 6, size: 18, rotate: 45 },
    { id: 2, left: '22%', delay: 1.2, duration: 7.5, size: 14, rotate: -25 },
    { id: 3, left: '38%', delay: 0.5, duration: 6.8, size: 20, rotate: 70 },
    { id: 4, left: '55%', delay: 2.1, duration: 8.2, size: 16, rotate: -60 },
    { id: 5, left: '72%', delay: 0.8, duration: 7, size: 22, rotate: 35 },
    { id: 6, left: '88%', delay: 1.7, duration: 6.5, size: 15, rotate: -40 },
    { id: 7, left: '94%', delay: 2.8, duration: 7.8, size: 17, rotate: 80 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden"
    >
      {/* Background Image: Gunung Fuji, Danau, Pagoda, Sakura, Lampion & Meja Tradisional */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
        style={{
          backgroundImage: `url('/fuji_loading_bg.jpg')`,
          backgroundColor: '#3b82f6',
        }}
      >
        {/* Soft Vignette Overlay for Crisp Readability */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Floating Animated Sakura Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, 25, -20, 30, 0],
              opacity: [0, 0.9, 0.85, 0],
              rotate: [0, petal.rotate, petal.rotate * 2, petal.rotate * 3],
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size,
            }}
            className="absolute"
          >
            {/* Sakura Petal Shape */}
            <svg viewBox="0 0 30 30" fill="none" className="w-full h-full drop-shadow-sm">
              <path
                d="M15 2 C8 7, 3 15, 6 22 C9 28, 15 28, 18 24 C21 28, 27 27, 27 20 C27 13, 20 5, 15 2 Z"
                fill="#fbcfe8"
                fillOpacity="0.85"
                stroke="#f472b6"
                strokeWidth="0.8"
              />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Main Content Centered Layout */}
      <div className="relative z-20 w-full max-w-[480px] h-full flex flex-col justify-between items-center py-4 sm:py-6">
        
        {/* Top Spacer */}
        <div className="w-full h-2 sm:h-6" />

        {/* Center Card & Branding Area */}
        <motion.div
          initial={{ y: -20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="flex flex-col items-center text-center w-full px-4 -mt-4 sm:-mt-8"
        >
          {/* Official App Logo Icon with Sakura Glowing Frame */}
          <div className="relative mb-3 sm:mb-4 group">
            {/* Outer Subtle Ambient Glow */}
            <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-tr from-pink-400 via-rose-300 to-sky-300 opacity-60 blur-md animate-pulse" />
            
            {/* Inner Squircle Frame */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[26px] sm:rounded-[30px] p-1 bg-gradient-to-b from-white via-pink-50 to-pink-100 shadow-[0_12px_32px_rgba(0,0,0,0.22)] border-2 border-pink-200/90 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="MinaNihongo Japanese Learning"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[22px] sm:rounded-[26px]"
                onError={(e) => {
                  // Fallback ke logo.jpg jika logo.png tidak ditemukan
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
          </div>

          {/* Large Japanese Hiragana Title "にほんご" */}
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-1 select-none"
            style={{
              color: '#15315b',
              textShadow: '0 0 16px rgba(255, 255, 255, 0.95), 0 2px 6px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(255, 255, 255, 0.7)',
              fontFamily: "'Hiragino Kaku Gothic Pro', 'Noto Sans JP', 'Yu Gothic', sans-serif"
            }}
          >
            にほんご
          </h1>

          {/* Subtitle "Belajar Bahasa Jepang" */}
          <h2 
            className="text-xl sm:text-2xl md:text-[26px] font-black tracking-normal mb-1.5"
            style={{
              color: '#15315b',
              textShadow: '0 0 12px rgba(255, 255, 255, 0.95), 0 2px 4px rgba(255, 255, 255, 0.8)',
            }}
          >
            Belajar Bahasa Jepang
          </h2>

          {/* Inspiring Japanese Motto */}
          <p 
            className="text-xs sm:text-sm font-bold tracking-wider"
            style={{
              color: '#15315b',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 1px 3px rgba(255, 255, 255, 0.8)',
            }}
          >
            — 夢に向かって、いっしょにがんばろう —
          </p>
        </motion.div>

        {/* Bottom Loading Progress & Flying Jet Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full flex flex-col items-center px-4 mb-2 sm:mb-4"
        >
          {/* Progress Bar Capsule with Flying Airplane */}
          <div className="w-full max-w-[320px] sm:max-w-[400px] relative mb-3">
            
            {/* Capsule Outer Track */}
            <div className="w-full h-5 sm:h-6 rounded-full bg-white/35 backdrop-blur-md border border-white/80 shadow-[0_6px_20px_rgba(0,0,0,0.25)] p-0.5 relative overflow-visible flex items-center">
              
              {/* Vibrant Gradient Progress Fill (Pink to Cyan) */}
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ff5da2] via-[#ff488e] to-[#38bdf8] transition-all duration-75 relative shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                style={{ width: `${Math.max(4, progress)}%` }}
              >
                {/* Light shimmer inside progress bar */}
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              </div>

              {/* White Jet Airplane Flying at the Progress Tip */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex items-center z-30"
                style={{ 
                  left: `calc(${Math.min(94, Math.max(3, progress))}% - 14px)`,
                }}
              >
                {/* Airplane Icon & Vapor Trail */}
                <div className="relative flex items-center">
                  {/* Subtle Jet Stream Trail */}
                  <div className="w-5 h-1 bg-gradient-to-r from-transparent to-white/80 rounded-full blur-[0.5px] -mr-1" />

                  {/* Sleek White Airliner SVG */}
                  <svg 
                    viewBox="0 0 64 64" 
                    fill="none" 
                    className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_3px_8px_rgba(0,0,0,0.4)] transform -rotate-[14deg]"
                  >
                    {/* Fuselage (Badan Pesawat Putih) */}
                    <path
                      d="M60 28 C58 25, 48 24, 38 25 L24 10 L18 10 L24 26 L12 27 L6 21 L1 21 L4 29 L1 37 L6 37 L12 31 L24 32 L18 48 L24 48 L38 33 C48 34, 58 33, 60 30 C61 29, 61 29, 60 28 Z"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    {/* Cockpit & Cabin Windows in Sky Blue */}
                    <path
                      d="M52 27 C50 26, 44 26.5, 40 27"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    {/* Jet Engine Pod under Wing */}
                    <rect x="25" y="24" width="7" height="3" rx="1.5" fill="#38bdf8" />
                    <rect x="25" y="31" width="7" height="3" rx="1.5" fill="#38bdf8" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* Loading Texts */}
          <div className="flex flex-col items-center text-center space-y-0.5 select-none">
            <p 
              className="text-sm sm:text-base font-extrabold text-white tracking-wide"
              style={{
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 0, 0, 0.6)',
              }}
            >
              Memuat aplikasi...
            </p>
            
            <p 
              className="text-xs sm:text-sm font-semibold text-white/95"
              style={{
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              Mohon tunggu sebentar
            </p>

            {/* Decorative Sakura Divider (— 🌸 —) */}
            <div className="flex items-center justify-center gap-2 pt-1 text-white/90">
              <span className="w-8 sm:w-12 h-[1.5px] bg-white/70 rounded-full drop-shadow-sm" />
              <span className="text-sm drop-shadow-md">🌸</span>
              <span className="w-8 sm:w-12 h-[1.5px] bg-white/70 rounded-full drop-shadow-sm" />
            </div>
          </div>

          {/* Skip Button for Instant Navigation */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onComplete}
              className="text-[11px] font-bold text-white/75 hover:text-white transition-colors underline cursor-pointer py-1 px-3 rounded-full hover:bg-black/20"
              style={{
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
              }}
            >
              Lewati (Skip)
            </button>
          </div>

        </motion.div>

      </div>
    </motion.div>
  );
};

