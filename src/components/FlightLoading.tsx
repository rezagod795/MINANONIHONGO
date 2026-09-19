import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Sparkles } from 'lucide-react';

interface FlightLoadingProps {
  onComplete: () => void;
  darkMode?: boolean;
}

export const FlightLoading: React.FC<FlightLoadingProps> = ({ onComplete, darkMode = false }) => {
  const [progress, setProgress] = useState<number>(0);
  const [flightPhase, setFlightPhase] = useState<string>('Mempersiapkan penerbangan...');

  useEffect(() => {
    const startTime = Date.now();
    // Diperlambat dari 3.8s menjadi 6.5s agar animasi lebih santai, terbaca, dan dinikmati
    const duration = 6500; 

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress < 20) {
        setFlightPhase('Lepas landas dari Indonesia 🇮🇩...');
      } else if (currentProgress < 45) {
        setFlightPhase('Terbang melintasi awan dan langit cerah 🌤️...');
      } else if (currentProgress < 75) {
        setFlightPhase('Melintasi awan di atas kemegahan Gunung Fuji 🗻...');
      } else if (currentProgress < 95) {
        setFlightPhase('Mendekati pendaratan di Jepang 🇯🇵...');
      } else {
        setFlightPhase('Selamat datang di みなのにほんご! ✨');
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 40);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Posisi pesawat di sepanjang kurva busur parabola yang melintasi Gunung Fuji (Full Portrait)
  // x: dari 50 ke 330 (di dalam SVG portrait 380 x 460)
  // y: lepas landas dari Y=330 (Indonesia) -> melengkung tinggi ke Y=85 (di atas Gunung Fuji & awan) -> turun ke Y=330 (Jepang)
  const norm = progress / 100;
  // Parabolic trajectory: peak at norm = 0.5
  const planeX = 50 + norm * 280;
  const planeY = 330 - Math.sin(norm * Math.PI) * 245;
  // Slope angle in degrees
  const angle = (Math.cos(norm * Math.PI) * -42);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-hidden ${
        darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-[#faf8f5] text-slate-800'
      }`}
      style={{
        // Notebook ruled paper / grid subtle sketch background
        backgroundImage: darkMode
          ? 'radial-gradient(#1e293b 1.2px, transparent 1.2px), linear-gradient(to bottom, transparent 31px, rgba(51,65,85,0.25) 32px)'
          : 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px), linear-gradient(to bottom, transparent 31px, rgba(226,232,240,0.7) 32px)',
        backgroundSize: '16px 16px, 100% 32px',
      }}
    >
      {/* Notebook Binder Rings Header Sketch */}
      <div className="absolute top-3 sm:top-5 inset-x-0 flex justify-center items-center gap-2.5 sm:gap-3.5 opacity-60 pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-2 sm:w-2.5 h-6 sm:h-7 rounded-full border-2 ${
              darkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-400 bg-slate-200'
            } shadow-inner transform -rotate-12`} />
          </div>
        ))}
      </div>

      {/* Main Full Portrait Container */}
      <div className="relative w-full h-full max-w-[480px] flex flex-col justify-between items-center py-4 sm:py-6 pt-7 sm:pt-9">
        
        {/* Sketch Title Badge */}
        <motion.div 
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center w-full shrink-0 mb-1"
        >
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span className="text-lg sm:text-xl animate-bounce">✈️</span>
            <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-rose-500 font-mono">
              Loading Adventure
            </span>
            <span className="text-lg sm:text-xl">🗾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-tight drop-shadow-xs">
            みなのにほんご
          </h1>
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
            Belajar Bahasa Jepang
          </p>
        </motion.div>

        {/* Hand-Drawn Sketch Stage (Full Portrait Canvas) */}
        <div className={`w-full flex-1 my-2 sm:my-3 min-h-[340px] max-h-[64vh] rounded-[28px] sm:rounded-[36px] p-2 sm:p-3 border-2 border-dashed relative shadow-2xl backdrop-blur-md overflow-hidden flex items-center justify-center ${
          darkMode 
            ? 'bg-slate-900/85 border-slate-700 shadow-slate-950/90' 
            : 'bg-white/95 border-slate-300 shadow-amber-900/10'
        }`}>
          
          <svg viewBox="0 0 380 460" className="w-full h-full max-h-full object-contain overflow-visible">
            <defs>
              {/* Pencil sketch filter for organic hand-drawn strokes */}
              <filter id="sketch-filter" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
              </filter>

              {/* Linear gradient for Mt Fuji snow cap */}
              <linearGradient id="fuji-snow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.8" />
              </linearGradient>

              {/* Mountain body gradient */}
              <linearGradient id="fuji-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={darkMode ? '#334155' : '#64748b'} />
                <stop offset="100%" stopColor={darkMode ? '#1e293b' : '#cbd5e1'} />
              </linearGradient>

              {/* Colorful Cloud Gradients (Pastel Sky Palette) */}
              <linearGradient id="cloud-grad-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={darkMode ? '#38bdf8' : '#e0f2fe'} stopOpacity={darkMode ? '0.35' : '0.9'} />
                <stop offset="50%" stopColor={darkMode ? '#818cf8' : '#bae6fd'} stopOpacity={darkMode ? '0.3' : '0.8'} />
                <stop offset="100%" stopColor={darkMode ? '#c084fc' : '#fbcfe8'} stopOpacity={darkMode ? '0.25' : '0.75'} />
              </linearGradient>

              <linearGradient id="cloud-grad-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={darkMode ? '#fb7185' : '#fef08a'} stopOpacity={darkMode ? '0.3' : '0.85'} />
                <stop offset="100%" stopColor={darkMode ? '#f472b6' : '#fed7aa'} stopOpacity={darkMode ? '0.25' : '0.75'} />
              </linearGradient>

              <linearGradient id="sun-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              <linearGradient id="moon-glow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#fde047" />
              </linearGradient>
            </defs>

            {/* --- CELESTIAL BODY: MATAHARI (Mode Terang) / BULAN SABIT (Mode Gelap) --- */}
            {!darkMode ? (
              /* Matahari Sketsa dengan pancaran sinar pensil hangat di langit tinggi */
              <g id="matahari-sketsa" transform="translate(72, 60)" filter="url(#sketch-filter)">
                {/* Sun Glow Outer Ring */}
                <circle cx="0" cy="0" r="22" fill="#fef08a" opacity="0.45" />
                {/* Sun Core Disc */}
                <circle cx="0" cy="0" r="16" fill="url(#sun-glow)" stroke="#d97706" strokeWidth="1.8" />
                {/* Hand-drawn Sun Rays (Pancaran Sinar Pensil) */}
                <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
                  <line x1="0" y1="-21" x2="0" y2="-29" />
                  <line x1="0" y1="21" x2="0" y2="29" />
                  <line x1="-21" y1="0" x2="-29" y2="0" />
                  <line x1="21" y1="0" x2="29" y2="0" />
                  <line x1="-15" y1="-15" x2="-21" y2="-21" />
                  <line x1="15" y1="-15" x2="21" y2="-21" />
                  <line x1="-15" y1="15" x2="-21" y2="21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                </g>
                {/* Friendly warm smile sketch */}
                <path d="M -6 -2 Q 0 -6, 6 -2" fill="none" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
              </g>
            ) : (
              /* Bulan Sabit Sketsa dengan bintang-bintang di langit malam */
              <g id="bulan-sketsa" transform="translate(72, 60)" filter="url(#sketch-filter)">
                {/* Moon Glow Aura */}
                <circle cx="0" cy="0" r="22" fill="#fde047" opacity="0.18" />
                {/* Crescent Moon Hand-Drawn Silhouette */}
                <path
                  d="M 8 -15 C 17 -9, 17 9, 8 15 C 2 17, -7 14, -10 7 C -13 1, -12 -7, -7 -12 C -2 -16, 3 -17, 8 -15 Z"
                  fill="url(#moon-glow)"
                  stroke="#eab308"
                  strokeWidth="1.8"
                />
                {/* Little twinkling night stars */}
                <g fill="#fef08a" opacity="0.85">
                  {/* Star 1 */}
                  <polygon points="24,-10 26,-4 32,-4 27,0 29,6 24,2 19,6 21,0 16,-4 22,-4" transform="scale(0.65)" />
                  {/* Star 2 */}
                  <polygon points="-30,20 -28,24 -23,24 -27,28 -25,33 -30,29 -35,33 -33,28 -37,24 -32,24" transform="scale(0.65)" />
                  {/* Star 3 */}
                  <circle cx="34" cy="18" r="1.5" fill="#fef08a" opacity="0.7" />
                </g>
              </g>
            )}

            {/* --- WARNA-WARNI AWAN (Hand-Drawn Sketched Colored Clouds) --- */}
            <g id="colored-clouds" filter="url(#sketch-filter)">
              {/* Awan Kiri Atas (dekat matahari/bulan) */}
              <g transform="translate(0, 0)">
                <path 
                  d="M 45 78 Q 62 60, 84 72 Q 104 62, 122 76 Q 132 90, 114 102 L 52 102 Q 34 92, 45 78 Z" 
                  fill="url(#cloud-grad-1)" 
                  stroke={darkMode ? '#38bdf8' : '#7dd3fc'} 
                  strokeWidth="1.6" 
                />
                <path d="M 65 85 Q 77 76, 92 83" fill="none" stroke={darkMode ? '#7dd3fc' : '#bae6fd'} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 88 88 Q 98 79, 108 86" fill="none" stroke={darkMode ? '#7dd3fc' : '#bae6fd'} strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Awan Kanan Atas */}
              <g transform="translate(0, 0)">
                <path 
                  d="M 235 68 Q 256 50, 280 62 Q 302 52, 322 66 Q 332 82, 314 96 L 242 96 Q 224 84, 235 68 Z" 
                  fill="url(#cloud-grad-2)" 
                  stroke={darkMode ? '#f472b6' : '#f9a8d4'} 
                  strokeWidth="1.6" 
                />
                <path d="M 255 76 Q 268 67, 285 75" fill="none" stroke={darkMode ? '#f472b6' : '#fbcfe8'} strokeWidth="1.2" strokeLinecap="round" />
                <path d="M 282 78 Q 294 70, 306 80" fill="none" stroke={darkMode ? '#f472b6' : '#fbcfe8'} strokeWidth="1" strokeLinecap="round" />
              </g>

              {/* Awan Tengah Melayang di Lereng Gunung Fuji */}
              <g opacity={darkMode ? 0.75 : 0.9}>
                <path 
                  d="M 95 190 Q 112 174, 132 186 Q 148 178, 162 192 Q 170 206, 154 218 L 102 218 Q 86 206, 95 190 Z" 
                  fill={darkMode ? 'rgba(56, 189, 248, 0.2)' : 'rgba(254, 240, 138, 0.75)'} 
                  stroke={darkMode ? '#0ea5e9' : '#fde047'} 
                  strokeWidth="1.4" 
                  strokeDasharray="4 2"
                />
                <path 
                  d="M 220 198 Q 236 182, 256 194 Q 272 186, 285 200 Q 292 214, 276 226 L 226 226 Q 212 214, 220 198 Z" 
                  fill={darkMode ? 'rgba(244, 114, 182, 0.2)' : 'rgba(251, 207, 232, 0.75)'} 
                  stroke={darkMode ? '#f472b6' : '#f472b6'} 
                  strokeWidth="1.4" 
                  strokeDasharray="4 2"
                />
              </g>
            </g>

            {/* --- GUNUNG FUJI (Tall Majestic Mountain Silhouette) --- */}
            <g id="gunung-fuji">
              {/* Mountain Outer Silhouette with tall graceful slopes in portrait */}
              <path
                d="M 50 365 C 105 350, 142 225, 175 152 C 183 140, 197 140, 205 152 C 238 225, 275 350, 330 365 Z"
                fill="url(#fuji-body)"
                stroke={darkMode ? '#94a3b8' : '#475569'}
                strokeWidth="2.8"
                strokeLinejoin="round"
                filter="url(#sketch-filter)"
              />

              {/* Mt Fuji Snow Cap with jagged snow boundary as in sketch */}
              <path
                d="M 158 190 C 166 196, 174 188, 182 200 C 190 190, 198 202, 206 192 C 214 200, 222 194, 226 190 L 205 152 C 197 140, 183 140, 175 152 Z"
                fill="url(#fuji-snow)"
                stroke={darkMode ? '#cbd5e1' : '#64748b'}
                strokeWidth="2"
                filter="url(#sketch-filter)"
              />

              {/* Hand-drawn sketch pointer arrow to Mt Fuji */}
              <g opacity={0.8}>
                <path
                  d="M 260 175 Q 278 170, 296 164"
                  fill="none"
                  stroke={darkMode ? '#94a3b8' : '#64748b'}
                  strokeWidth="1.6"
                  strokeDasharray="3 2"
                />
                <polygon
                  points="296,160 304,164 297,168"
                  fill={darkMode ? '#94a3b8' : '#64748b'}
                />
                <text
                  x="308"
                  y="168"
                  fontSize="11"
                  fontFamily="cursive, sans-serif"
                  fontWeight="bold"
                  fill={darkMode ? '#cbd5e1' : '#475569'}
                >
                  Gunung Fuji 🗻
                </text>
              </g>
            </g>

            {/* --- BENDERA INDONESIA (Kiri Bawah) --- */}
            <g id="bendera-indonesia" transform="translate(18, 305)">
              {/* Flag Pole */}
              <line x1="6" y1="0" x2="6" y2="58" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="6" cy="0" r="3" fill="#eab308" />

              {/* Waving Flag Outline */}
              <g filter="url(#sketch-filter)">
                {/* Red Top Half */}
                <path
                  d="M 7 2 Q 22 6, 37 2 Q 47 0, 52 4 L 52 16 Q 37 12, 22 16 Q 14 18, 7 14 Z"
                  fill="#ef4444"
                  stroke={darkMode ? '#f87171' : '#b91c1c'}
                  strokeWidth="1.4"
                />
                {/* White Bottom Half */}
                <path
                  d="M 7 14 Q 14 18, 22 16 Q 37 12, 52 16 L 52 28 Q 47 24, 37 26 Q 22 30, 7 26 Z"
                  fill="#ffffff"
                  stroke={darkMode ? '#cbd5e1' : '#94a3b8'}
                  strokeWidth="1.4"
                />
              </g>

              {/* Handwritten Sketch Label */}
              <text
                x="29"
                y="46"
                textAnchor="middle"
                fontSize="10"
                fontFamily="cursive, sans-serif"
                fontWeight="bold"
                fill={darkMode ? '#94a3b8' : '#64748b'}
              >
                Indonesia 🇮🇩
              </text>
            </g>

            {/* --- BENDERA JEPANG (Kanan Bawah) --- */}
            <g id="bendera-jepang" transform="translate(304, 305)">
              {/* Flag Pole */}
              <line x1="6" y1="0" x2="6" y2="58" stroke={darkMode ? '#64748b' : '#475569'} strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="6" cy="0" r="3" fill="#eab308" />

              {/* Waving Flag Outline */}
              <g filter="url(#sketch-filter)">
                <path
                  d="M 7 2 Q 22 6, 37 2 Q 47 0, 52 4 L 52 28 Q 47 24, 37 26 Q 22 30, 7 26 Z"
                  fill="#ffffff"
                  stroke={darkMode ? '#cbd5e1' : '#94a3b8'}
                  strokeWidth="1.6"
                />
                {/* Red Sun in center */}
                <circle cx="29" cy="15" r="7.5" fill="#dc2626" />
              </g>

              {/* Handwritten Sketch Label */}
              <text
                x="29"
                y="46"
                textAnchor="middle"
                fontSize="10"
                fontFamily="cursive, sans-serif"
                fontWeight="bold"
                fill={darkMode ? '#94a3b8' : '#64748b'}
              >
                Jepang 🇯🇵
              </text>
            </g>

            {/* --- PESAWAT TERBANG ANIMASI SKETSA (Mengikuti jalur penerbangan) --- */}
            <g 
              transform={`translate(${planeX}, ${planeY}) rotate(${angle})`}
              className="transition-transform duration-75 ease-out"
            >
              {/* Kepulan Asap Sketsa di Belakang Pesawat (Compact Cartoon Smoke Puffs) */}
              <g id="kepulan-asap-ekor" filter="url(#sketch-filter)">
                {/* Puff 1 - tepat di belakang nozzle ekor */}
                <circle cx="-26" cy="0" r="4.5" fill={darkMode ? '#e2e8f0' : '#ffffff'} stroke={darkMode ? '#94a3b8' : '#cbd5e1'} strokeWidth="1.3" opacity="0.95" />
                {/* Puff 2 - membesar sedikit ke atas */}
                <circle cx="-35" cy="-2.5" r="6" fill={darkMode ? '#cbd5e1' : '#f8fafc'} stroke={darkMode ? '#94a3b8' : '#cbd5e1'} strokeWidth="1.2" opacity="0.8" />
                {/* Puff 3 - membesar ke bawah dan memudar halus */}
                <circle cx="-43" cy="3" r="7.5" fill={darkMode ? '#94a3b8' : '#f1f5f9'} stroke={darkMode ? '#64748b' : '#cbd5e1'} strokeWidth="1" opacity="0.5" />
              </g>

              {/* Small propeller / jet trail wind streaks */}
              <line x1="-24" y1="-2" x2="-38" y2="-2" stroke={darkMode ? '#cbd5e1' : '#94a3b8'} strokeWidth="1.6" strokeDasharray="3 2" opacity="0.8" />
              <line x1="-22" y1="3" x2="-34" y2="3" stroke={darkMode ? '#cbd5e1' : '#94a3b8'} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.65" />

              {/* Sketched Airplane Icon Body */}
              <g filter="url(#sketch-filter)">
                {/* Plane Fuselage & Wings Outline */}
                <path
                  d="M 20 0 L 7 -5 L -4 -18 L -10 -17 L -4 -4 L -18 -4 L -23 -11 L -28 -10 L -24 0 L -28 10 L -23 11 L -18 4 L -4 4 L -10 17 L -4 18 L 7 5 Z"
                  fill={darkMode ? '#38bdf8' : '#0284c7'}
                  stroke={darkMode ? '#ffffff' : '#0369a1'}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                {/* Cockpit Window */}
                <circle cx="10" cy="0" r="2" fill="#ffffff" />
              </g>
            </g>
          </svg>

          {/* Sketchy Bottom Legend */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center items-center pointer-events-none">
            <span className={`text-[10px] sm:text-[11px] font-bold font-mono tracking-widest px-3 py-0.5 rounded-full ${
              darkMode ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100/90 text-slate-600'
            }`}>
              BELAJAR BAHASA JEPANG
            </span>
          </div>
        </div>

        {/* Progress Bar & Phase Status */}
        <div className="w-full shrink-0 space-y-2 px-1">
          <div className="flex justify-between items-center text-xs font-bold font-mono">
            <span className="text-rose-500 flex items-center gap-1.5 truncate max-w-[80%]">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="truncate">{flightPhase}</span>
            </span>
            <span className="text-slate-400 shrink-0 font-mono">{progress}%</span>
          </div>

          {/* Styled Striped Progress Bar */}
          <div className={`w-full h-3.5 rounded-full p-0.5 overflow-hidden border shadow-inner ${
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
          }`}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-100 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated Light Shimmer Effect */}
              <div className="absolute inset-0 bg-white/25 -skew-x-12 animate-pulse" />
            </motion.div>
          </div>

          {/* Quick Skip button for instant entrance if wanted */}
          <div className="flex justify-center pt-1.5">
            <button
              onClick={onComplete}
              className={`text-xs font-bold py-1 px-3 rounded-lg underline transition-colors ${
                darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lewati Intro (Skip)
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
