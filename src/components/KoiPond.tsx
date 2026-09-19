import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  opacity: number;
}

export function KoiPond() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [jumpStep, setJumpStep] = useState<number>(0); // 0: underwater/swimming, 1: mid-air, 2: splashback
  const [jumpDirection, setJumpDirection] = useState<'left-to-right' | 'right-to-left'>('left-to-right');

  // Interactive ripple creation on click
  const handlePondClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    addRipple(x, y);
    spawn3DSplash(x, y, 9);
  };

  const addRipple = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  const spawn3DSplash = (x: number, y: number, count = 10) => {
    const newParticles: Particle[] = [];
    const colors = [
      '#e0f2fe', // sky-100
      '#7dd3fc', // sky-300
      '#38bdf8', // sky-400
      '#0ea5e9', // sky-500
      '#f43f5e', // rose-500 (cherry blossom petal tone)
      '#fb7185', // rose-400
    ];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const speed = 1.0 + Math.random() * 3.0; // Explosion velocity
      newParticles.push({
        id: Date.now() + Math.random() + i,
        x,
        y,
        vx: Math.cos(angle) * speed * 0.7,
        vy: Math.sin(angle) * speed * 0.4 - 3.5, // Strong upward lift (gravitational arc)
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2.5 + Math.random() * 3.5,
        opacity: 0.9 + Math.random() * 0.1
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // 3D physics updates for splashing bubbles & droplets
  useEffect(() => {
    if (particles.length === 0) return;
    
    const interval = setInterval(() => {
      setParticles((prev) => 
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.22, // strong gravity pulling back down to water
            size: Math.max(0.2, p.size - 0.05), // shrink in flight
            opacity: Math.max(0, p.opacity - 0.015) // fade out
          }))
          .filter((p) => p.opacity > 0 && p.y < 120 && p.x > -10 && p.x < 110)
      );
    }, 32);

    return () => clearInterval(interval);
  }, [particles]);

  // Periodic automatic high-altitude leaps (Every 6.8 seconds)
  useEffect(() => {
    const triggerLeap = () => {
      const dir = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
      setJumpDirection(dir);
      
      const startX = dir === 'left-to-right' ? 18 : 82;
      const startY = 70;
      
      // Phase 1: Heavy takeoff splash
      setTimeout(() => {
        setJumpStep(1); // launch into mid-air
        addRipple(startX, startY);
        spawn3DSplash(startX, startY, 7);
      }, 300);

      const endX = dir === 'left-to-right' ? 82 : 18;
      const endY = 75;
      
      // Phase 2: Spectacular water entry splash
      setTimeout(() => {
        setJumpStep(2); // impact back down
        addRipple(endX, endY);
        spawn3DSplash(endX, endY, 18); // rich splashback particles
        
        setTimeout(() => {
          setJumpStep(0); // return to gentle underwater swim
        }, 800);
      }, 1450);
    };

    const interval = setInterval(triggerLeap, 6800);
    const initialTimeout = setTimeout(triggerLeap, 1500); // quick first splash preview

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="w-full [perspective:1000px]">
      {/* Perspective Tilted Basin Frame */}
      <div 
        className="relative w-full h-[180px] rounded-[32px] overflow-hidden cursor-pointer bg-gradient-to-b from-[#021512] via-[#052324] to-[#041a21] border-2 border-emerald-500/20 shadow-[inset_0_5px_15px_rgba(0,0,0,0.8),_0_12px_24px_rgba(0,0,0,0.4)] group overflow-y-visible select-none"
        onClick={handlePondClick}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic Water Caustics Shimmer */}
        <div className="absolute inset-0 bg-radial-[circle_at_50%_30%] from-cyan-400/8 via-transparent to-transparent pointer-events-none z-10 mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(45deg,transparent_20%,rgba(255,255,255,0.25)_50%,transparent_80%)] bg-[length:320px_320px] animate-[shimmer_8s_infinite_linear] pointer-events-none z-10" />

        {/* 3D Deep Rocky Bottom bed (Simulated depth shadow overlay) */}
        <div className="absolute inset-x-2 bottom-2 top-8 rounded-[24px] bg-[#020b0c] border border-stone-900/45 saturate-[0.8] opacity-80 pointer-events-none blur-[0.4px]">
          {/* Seamless stone pebble garden vectors */}
          <div className="absolute inset-0 flex flex-wrap gap-2.5 p-3.5 opacity-35">
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className="bg-stone-800 rounded-full shadow-inner border border-stone-700/20"
                style={{
                  width: `${20 + (i % 3) * 12}px`,
                  height: `${14 + (i % 2) * 10}px`,
                  transform: `rotate(${(i * 25) % 360}deg) translateY(${i % 2 === 0 ? 3 : -3}px)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* --- DEEP LAYER: SYNCHRONIZED SWIMMING FISH SHADOWS (ON LAKE BED) --- */}
        {jumpStep !== 1 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            {/* Fish A (White/Red) Shadow */}
            <motion.div
              animate={{
                x: [0, 85, 145, 205, 230, 145, 55, 0],
                y: [32, 54, 27, 68, 50, 84, 65, 32], // offset down & slightly right
                rotate: [0, 24, -14, 42, 115, 185, 225, 360],
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-12 h-6 pointer-events-none opacity-45 blur-[4px] mix-blend-multiply"
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <KoiFishSVG colorPrimary="#000000" colorSecondary="#000000" scale={0.7} isShadow />
            </motion.div>

            {/* Fish B (Gold) Shadow */}
            <motion.div
              animate={{
                x: [240, 145, 65, -5, 85, 195, 245, 240],
                y: [88, 38, 92, 48, 22, 58, 108, 88], // offset down & slightly right
                rotate: [180, 153, 225, 285, 375, 405, 335, 180],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
                delay: 1.8,
              }}
              className="absolute w-12 h-6 pointer-events-none opacity-40 blur-[4.5px] mix-blend-multiply"
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <KoiFishSVG colorPrimary="#000000" colorSecondary="#000000" scale={0.65} isShadow />
            </motion.div>
          </div>
        )}

        {/* --- MID LAYER: UNDERWATER GENTLE SWIMMING NISHIKIGOI --- */}
        {jumpStep !== 1 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
            {/* Fish A: Crimson-White Kohaku Koi */}
            <motion.div
              animate={{
                x: [0, 85, 145, 205, 230, 145, 55, 0],
                y: [22, 44, 17, 58, 40, 74, 55, 22],
                rotate: [0, 24, -14, 42, 115, 185, 225, 360],
              }}
              transition={{
                duration: 17,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute w-12 h-6 pointer-events-none"
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <KoiFishSVG colorPrimary="#f43f5e" colorSecondary="#fef2f2" scale={0.7} type="kohaku" />
            </motion.div>

            {/* Fish B: Sunlit Metallic Yellow Yamabuki Ogon Koi */}
            <motion.div
              animate={{
                x: [240, 145, 65, -5, 85, 195, 245, 240],
                y: [78, 28, 82, 38, 12, 48, 98, 78],
                rotate: [180, 153, 225, 285, 375, 405, 335, 180],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
                delay: 1.8,
              }}
              className="absolute w-12 h-6 pointer-events-none"
              style={{ originX: 0.5, originY: 0.5 }}
            >
              <KoiFishSVG colorPrimary="#fbbf24" colorSecondary="#d97706" scale={0.65} type="yamabuki" />
            </motion.div>
          </div>
        )}

        {/* --- MID-AIR LAYER: LEAPING KOI SHADOWS & FLIGHT (THE 3D JUMP) --- */}
        <AnimatePresence>
          {jumpStep === 1 && (
            <>
              {/* Leaping Shadow (Remains on lake level, expands/fades as fish goes high) */}
              <motion.div
                initial={{
                  left: jumpDirection === 'left-to-right' ? '18%' : '82%',
                  top: '70%',
                  opacity: 0.45,
                  scale: 0.85,
                  filter: 'blur(3px)',
                }}
                animate={{
                  left: jumpDirection === 'left-to-right' ? '82%' : '18%',
                  top: ['70%', '52%', '75%'], // moves under light angle
                  opacity: [0.45, 0.15, 0.52], // weakens as altitude increases
                  scale: [0.85, 0.45, 1.05], // gets bigger but fainter at peak
                  filter: ['blur(3px)', 'blur(7px)', 'blur(2px)'],
                }}
                transition={{
                  duration: 1.15,
                  ease: 'easeInOut',
                }}
                className="absolute w-14 h-7 pointer-events-none z-10"
                style={{
                  translateX: '-50%',
                  translateY: '-50%',
                }}
              >
                <div className="w-full h-full scale-[0.9] opacity-75">
                  <KoiFishSVG colorPrimary="#000000" colorSecondary="#000000" scale={1.0} isShadow />
                </div>
              </motion.div>

              {/* Dynamic 3D Leaping Nishikigoi (High Z-depth, heavy 3D flips) */}
              <motion.div
                initial={{
                  left: jumpDirection === 'left-to-right' ? '18%' : '82%',
                  top: '70%',
                  scale: 0.75,
                  rotateX: -20,
                  rotateY: jumpDirection === 'left-to-right' ? 0 : 180,
                  rotateZ: jumpDirection === 'left-to-right' ? -35 : -145,
                }}
                animate={{
                  left: jumpDirection === 'left-to-right' ? '82%' : '18%',
                  top: ['70%', '12%', '75%'], // Arc trajectory
                  scale: [0.75, 1.45, 0.9], // Heavy 3D pop scaling
                  rotateZ: jumpDirection === 'left-to-right' 
                    ? [-35, 15, 80] 
                    : [-145, -195, -260], // parabolic angular roll
                  rotateX: [-20, 55, 10], // pitches downwards in 3D mid-flight
                }}
                transition={{
                  duration: 1.15,
                  ease: 'easeInOut',
                }}
                className="absolute w-14 h-7 pointer-events-none z-30"
                style={{
                  translateX: '-50%',
                  translateY: '-50%',
                  transformStyle: 'preserve-3d',
                }}
              >
                <KoiFishSVG colorPrimary="#f43f5e" colorSecondary="#fef2f2" scale={1.15} type="showa" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- SURFACE LAYER: RIPPLES, LILY PADS, FLOWERS --- */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Lily pads (Tilted perspective scaling) */}
          <motion.div 
            animate={{ y: [0, -2.5, 0], rotate: [0, 1.2, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-5 left-[24%] w-8 h-7 rounded-full bg-emerald-800/75 border border-emerald-600/30 flex items-center justify-center opacity-90 select-none shadow-[2px_4px_6px_rgba(0,0,0,0.5)]"
            style={{ 
              clipPath: 'polygon(0% 0%, 82% 0%, 78% 46%, 100% 50%, 82% 100%, 0% 100%)',
              transform: 'rotateX(8deg)' 
            }}
          >
            {/* Sakura cherry petal drifting on pad */}
            <div className="absolute top-1 right-2 w-1.5 h-2.5 bg-rose-300 rounded-full rotate-45 opacity-80" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 2.2, 0], rotate: [0, -1.8, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute bottom-6 right-[26%] w-10 h-8.5 rounded-full bg-emerald-700/75 border border-emerald-600/40 opacity-90 select-none shadow-[2px_5px_7px_rgba(0,0,0,0.5)]"
            style={{ 
              clipPath: 'polygon(0% 15%, 100% 0%, 88% 68%, 100% 82%, 78% 100%, 0% 100%)',
              transform: 'rotateX(8deg)'
            }}
          >
            {/* White-pink Water Lily Lotus Flower */}
            <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
              <span className="text-[10px] animate-pulse">🌸</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -1.5, 0], rotate: [0, 1, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
            className="absolute top-9 right-[18%] w-5.5 h-5 rounded-full bg-emerald-900/65 border border-emerald-800/20 opacity-80 select-none shadow-[1px_2px_4px_rgba(0,0,0,0.4)]"
            style={{ transform: 'rotateX(8deg)' }}
          />

          {/* RIPPLES (Rendered with 3D elliptical ratio matching perspective) */}
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ scaleX: 0, scaleY: 0, opacity: 0.95 }}
              animate={{ scaleX: 9, scaleY: 4.5, opacity: 0 }} // Squashed height creates 3D ellipse perspective
              transition={{ duration: 1.6, ease: 'easeOut' }}
              className="absolute w-5 h-5 border-2 border-cyan-300/50 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }}
            />
          ))}

          {/* PARTICLES (Water splash bubbles throwing into 3D space) */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full pointer-events-none shadow-md"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                transform: 'translate(-50%, -50%)',
                boxShadow: `0 2px 4px ${p.color}aa`
              }}
            />
          ))}
        </div>

        {/* OVERLAY: TRADITIONAL FLOATING HUD BANNER */}
        <div className="absolute top-2 inset-x-0 text-center select-none pointer-events-none z-30">
          <p className="text-[9.5px] font-black tracking-[0.25em] uppercase text-emerald-300/60 group-hover:text-cyan-300/80 transition-colors drop-shadow-sm">
            🎋 Kolam Koi Tradisional 3D 🎋
          </p>
          <p className="text-[7.5px] font-bold text-emerald-500/40 group-hover:text-cyan-400/50 transition-colors">
            Sentuh atau klik air untuk memberi makan dan melihat ikan melompat
          </p>
        </div>
      </div>
    </div>
  );
}

interface KoiFishProps {
  colorPrimary: string;
  colorSecondary: string;
  scale?: number;
  isShadow?: boolean;
  type?: 'kohaku' | 'yamabuki' | 'showa';
}

// Custom 3D Shaded SVG Koi Nishikigoi Fish model
function KoiFishSVG({ 
  colorPrimary = '#ef4444', 
  colorSecondary = '#ffffff', 
  scale = 1,
  isShadow = false,
  type = 'kohaku'
}: KoiFishProps) {
  
  // Shadow renders a solid flat dark silhouette
  if (isShadow) {
    return (
      <svg viewBox="0 0 60 28" className="w-full h-full" style={{ scale }}>
        <path
          d="M6 14 C1 10, 0 11, 2 14 C0 17, 1 18, 6 14"
          fill="#000000"
        />
        <path
          d="M12 14 C18 9, 36 9, 44 14 C36 19, 18 19, 12 14 Z"
          fill="#000000"
        />
        <path
          d="M30 9 C27 4, 25 5, 28 9"
          fill="#000000"
        />
        <path
          d="M30 19 C27 24, 25 23, 28 19"
          fill="#000000"
        />
      </svg>
    );
  }

  // Dynamic gradients to render realistic 3D volumetric shadows and specular wet look on Nishikigoi bodies
  const uniqueGradId = `swim-body-grad-${type}`;
  const uniqueSheenId = `swim-sheen-grad-${type}`;

  return (
    <motion.svg
      viewBox="0 0 60 28"
      className="w-full h-full"
      style={{ scale }}
      animate={{
        scaleY: [1, 0.94, 1.04, 1], // fluid swimming contraction
      }}
      transition={{
        duration: 0.38,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <defs>
        {/* Volumetric 3D Cylinder Gradients */}
        <linearGradient id={uniqueGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={type === 'yamabuki' ? '#f59e0b' : '#ffffff'} />
          <stop offset="35%" stopColor={type === 'yamabuki' ? '#fbbf24' : '#ffffff'} />
          <stop offset="70%" stopColor={type === 'yamabuki' ? '#b45309' : '#e2e8f0'} />
          <stop offset="100%" stopColor={type === 'yamabuki' ? '#78350f' : '#cbd5e1'} />
        </linearGradient>

        {/* Specular Spine Wet Hilite Sheen */}
        <linearGradient id={uniqueSheenId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.75)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </linearGradient>
      </defs>

      {/* Tail Fin with organic wiggle wave animation */}
      <motion.path
        d="M6 14 C1 9, -1 10, 1 14 C-1 18, 1 19, 6 14"
        fill={colorPrimary}
        animate={{
          rotateY: [15, -15, 15],
          skewX: [6, -6, 6],
        }}
        transition={{
          duration: 0.3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ originX: 0.3, originY: 0.5 }}
      />

      {/* Volumetric Main Fish Body with 3D Gradient */}
      <path
        d="M12 14 C18 8, 36 8, 44 14 C36 20, 18 20, 12 14 Z"
        fill={`url(#${uniqueGradId})`}
      />

      {/* Kohaku / Showa Ink & Vermilion Patterns (Symmetrical Spotting) */}
      {type === 'kohaku' && (
        <>
          <path
            d="M18 12 C21 10, 25 10.5, 28 12.5 C24 13.8, 20 13.5, 18 12 Z"
            fill={colorPrimary}
          />
          <path
            d="M32 12.5 C35 10.5, 38 11.5, 41 13.5 C37 14.8, 34 14, 32 12.5 Z"
            fill={colorPrimary}
          />
        </>
      )}

      {type === 'showa' && (
        <>
          {/* Crimson Red Markings */}
          <path
            d="M16 11.5 C20 9.5, 24 10.2, 27 12 C23 13.5, 19 13.2, 16 11.5 Z"
            fill={colorPrimary} // Crimson Spot
          />
          <path
            d="M33 13 C36 10.8, 39 12, 41 14 C36 15, 33 14.3, 33 13 Z"
            fill={colorPrimary} // Crimson Spot
          />
          {/* Black Ink (Sumi) Patterns for traditional Showa elegance */}
          <path
            d="M21 13 C23 12, 25 12.5, 27 13.5 C24 14.5, 22 14, 21 13 Z"
            fill="#090d16"
          />
          <path
            d="M30 11.5 C31 10.5, 33 11, 35 12 C33 12.5, 31 12, 30 11.5 Z"
            fill="#090d16"
          />
        </>
      )}

      {/* Specification: Wet 3D Reflection Spine Highlight Overlay */}
      <path
        d="M16 12.5 C20 10.2, 32 10.2, 40 12.5 C32 11.5, 20 11.5, 16 12.5 Z"
        fill={`url(#${uniqueSheenId})`}
        className="mix-blend-overlay"
      />

      {/* Pectoral Fin Left (Gentle realistic beats) */}
      <motion.path
        d="M30 8.5 C26.5 3, 23.5 4, 27.5 8.5"
        fill={type === 'yamabuki' ? '#fbbf24' : '#ffffff'}
        fillOpacity={0.8}
        stroke={colorPrimary}
        strokeWidth={0.5}
        animate={{ rotate: [6, -11, 6] }}
        transition={{ duration: 0.58, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: 0.9, originY: 1 }}
      />

      {/* Pectoral Fin Right (Gentle realistic beats) */}
      <motion.path
        d="M30 19.5 C26.5 25, 23.5 24, 27.5 19.5"
        fill={type === 'yamabuki' ? '#fbbf24' : '#ffffff'}
        fillOpacity={0.8}
        stroke={colorPrimary}
        strokeWidth={0.5}
        animate={{ rotate: [-6, 11, -6] }}
        transition={{ duration: 0.58, repeat: Infinity, ease: 'easeInOut', delay: 0.08 }}
        style={{ originX: 0.9, originY: 0 }}
      />

      {/* Dynamic cute whiskers (barbels) */}
      <path d="M43.5 11 C46 9.5, 47 10, 45 11.5" stroke="#fca5a5" strokeWidth={0.5} fill="none" />
      <path d="M43.5 17 C46 18.5, 47 18, 45 16.5" stroke="#fca5a5" strokeWidth={0.5} fill="none" />

      {/* Ink-colored glossy eyes */}
      <circle cx={41} cy={11.5} r={1.2} fill="#0d1527" />
      <circle cx={41} cy={16.5} r={1.2} fill="#0d1527" />
      <circle cx={41.3} cy={11.2} r={0.4} fill="#ffffff" />
      <circle cx={41.3} cy={16.2} r={0.4} fill="#ffffff" />
    </motion.svg>
  );
}
