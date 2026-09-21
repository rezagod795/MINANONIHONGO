import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Trash2, CircleDot, Volume2, CheckCircle2, Sparkles, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DrawingCanvasProps {
  darkMode: boolean;
  word: string;
  onSpeak: () => void;
  onCorrect?: () => void;
  playSfx?: (type: 'click' | 'correct' | 'wrong' | 'levelup' | 'streak') => void;
  autoAdvance?: boolean;
}

export function DrawingCanvas({
  darkMode,
  word,
  onSpeak,
  onCorrect,
  playSfx,
  autoAdvance = true,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSuccessRef = useRef(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [brushColor, setBrushColor] = useState('#f43f5e'); // Rose pink default
  const [brushWidth, setBrushWidth] = useState(7);
  const [showGuide, setShowGuide] = useState(true);

  // Validation states
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incomplete' | 'wrong'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [localAutoAdvance, setLocalAutoAdvance] = useState(autoAdvance);

  // Clear canvas utility
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setStatus('idle');
    setFeedbackMsg(null);
    setAccuracy(null);
    isSuccessRef.current = false;
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }
  }, []);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 280;
    canvas.height = 280;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushWidth;
    contextRef.current = context;

    clearCanvas();
  }, []);

  // Whenever word changes: automatically clear the canvas & reset all states
  useEffect(() => {
    clearCanvas();
  }, [word, clearCanvas]);

  // Update brush color
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
    }
  }, [brushColor]);

  // Update brush width
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushWidth;
    }
  }, [brushWidth]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
    };
  }, []);

  // Precompute target character template & tolerance zone for fast evaluation
  const targetInfo = useMemo(() => {
    if (!word) return null;

    const width = 280;
    const height = 280;
    const font = 'bold 130px "IPAGothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif';

    // 1. Core target glyph
    const targetCanvas = document.createElement('canvas');
    targetCanvas.width = width;
    targetCanvas.height = height;
    const tCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
    if (!tCtx) return null;

    tCtx.font = font;
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillStyle = '#000000';
    tCtx.fillText(word, width / 2, height / 2);

    const targetData = tCtx.getImageData(0, 0, width, height).data;

    // Sample core points
    const corePoints: { x: number; y: number }[] = [];
    const sampleStep = 4;
    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const idx = (y * width + x) * 4;
        if (targetData[idx + 3] > 60) {
          corePoints.push({ x, y });
        }
      }
    }

    // 2. Tolerance zone with generous 42px dilation
    const tolCanvas = document.createElement('canvas');
    tolCanvas.width = width;
    tolCanvas.height = height;
    const tolCtx = tolCanvas.getContext('2d', { willReadFrequently: true });
    if (!tolCtx) return null;

    tolCtx.font = font;
    tolCtx.textAlign = 'center';
    tolCtx.textBaseline = 'middle';
    tolCtx.lineWidth = 42;
    tolCtx.lineCap = 'round';
    tolCtx.lineJoin = 'round';
    tolCtx.strokeStyle = '#000000';
    tolCtx.fillStyle = '#000000';
    tolCtx.strokeText(word, width / 2, height / 2);
    tolCtx.fillText(word, width / 2, height / 2);

    const tolData = tolCtx.getImageData(0, 0, width, height).data;

    return {
      corePoints,
      tolData,
      width,
      height,
    };
  }, [word]);

  // Evaluate user drawing against target template
  const evaluateDrawing = useCallback((isManualCheck = false) => {
    if (!targetInfo || !canvasRef.current || !contextRef.current) return null;
    const { corePoints, tolData, width, height } = targetInfo;

    if (corePoints.length === 0) return null;

    const userImg = contextRef.current.getImageData(0, 0, width, height);
    const userData = userImg.data;

    let userPixels = 0;
    let onTargetPixels = 0;

    for (let i = 0; i < userData.length; i += 4) {
      if (userData[i + 3] > 30) {
        userPixels++;
        if (tolData[i + 3] > 30) {
          onTargetPixels++;
        }
      }
    }

    // Minimum stroke volume check
    if (userPixels < 220) {
      if (isManualCheck) {
        setStatus('incomplete');
        setFeedbackMsg('Coretan belum cukup. Tuliskan hurufnya!');
      }
      return null;
    }

    const onTargetRatio = onTargetPixels / userPixels;

    // Coverage calculation: what percentage of corePoints are near user strokes?
    let coveredCount = 0;
    const searchRadius = 16;

    for (let i = 0; i < corePoints.length; i++) {
      const pt = corePoints[i];
      let isCovered = false;
      const minX = Math.max(0, pt.x - searchRadius);
      const maxX = Math.min(width - 1, pt.x + searchRadius);
      const minY = Math.max(0, pt.y - searchRadius);
      const maxY = Math.min(height - 1, pt.y + searchRadius);

      for (let y = minY; y <= maxY && !isCovered; y += 3) {
        for (let x = minX; x <= maxX && !isCovered; x += 3) {
          const idx = (y * width + x) * 4;
          if (userData[idx + 3] > 30) {
            isCovered = true;
          }
        }
      }
      if (isCovered) coveredCount++;
    }

    const coverage = coveredCount / corePoints.length;
    const score = Math.min(100, Math.round((coverage * 0.65 + onTargetRatio * 0.35) * 100));

    // Forgiving and natural thresholds for touchscreen drawing:
    // Coverage >= 50% and on-target ratio >= 56%
    const isCorrect = coverage >= 0.50 && onTargetRatio >= 0.56;

    return {
      isCorrect,
      coverage,
      onTargetRatio,
      score,
    };
  }, [targetInfo]);

  // Trigger success state and auto-advance
  const triggerSuccess = useCallback((score: number) => {
    if (isSuccessRef.current) return;
    isSuccessRef.current = true;

    setStatus('correct');
    setAccuracy(score);
    setFeedbackMsg('Benar! Bagus Sekali! 🎉');
    playSfx?.('correct');

    if (localAutoAdvance) {
      // Auto-advance after brief visual celebration:
      setTimeout(() => {
        clearCanvas();
        onCorrect?.();
      }, 750);
    } else {
      setTimeout(() => {
        isSuccessRef.current = false;
      }, 1200);
    }
  }, [clearCanvas, localAutoAdvance, onCorrect, playSfx]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isSuccessRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);

    // Cancel pending evaluation while drawing
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current || !contextRef.current || isSuccessRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);

    // Automatic evaluation after a short pause (750ms) to allow multi-stroke characters
    if (onCorrect && !isSuccessRef.current) {
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
      checkTimerRef.current = setTimeout(() => {
        const res = evaluateDrawing(false);
        if (res && res.isCorrect) {
          triggerSuccess(res.score);
        }
      }, 750);
    }
  };

  // Manual check button handler
  const handleManualCheck = () => {
    playSfx?.('click');
    const res = evaluateDrawing(true);
    if (!res) return;

    if (res.isCorrect) {
      triggerSuccess(res.score);
    } else if (res.coverage < 0.48) {
      setStatus('incomplete');
      setAccuracy(res.score);
      setFeedbackMsg(`Goresan belum lengkap (${res.score}%). Lengkapi pola hurufnya!`);
    } else {
      setStatus('wrong');
      setAccuracy(res.score);
      setFeedbackMsg(`Bentuk kurang pas (${res.score}%). Coba ikuti garis panduan!`);
      playSfx?.('wrong');
    }
  };

  const colors = [
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Matcha', value: '#10b981' },
    { name: 'Ink', value: darkMode ? '#ffffff' : '#1e293b' },
  ];

  const widths = [
    { label: 'Halus', value: 4 },
    { label: 'Medium', value: 7 },
    { label: 'Tebal', value: 12 },
  ];

  return (
    <div className="flex flex-col items-center gap-3.5 w-full">
      {/* Target prompt word & Audio */}
      <div className={`p-3 rounded-2xl w-full border text-center transition-colors shadow-xs relative ${
        darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
      }`}>
        <p className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Target Goresan Huruf:</p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            {word}
          </h3>
          <button
            onClick={() => {
              playSfx?.('click');
              onSpeak();
            }}
            className={`p-1.5 rounded-full ${
              darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-rose-100 text-rose-500 hover:bg-rose-200'
            } transition-colors active:scale-90`}
            title="Dengarkan Lafal"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main interactive Canvas Container */}
      <div className="relative w-[280px] h-[280px]">
        {/* Japanese Genkouyoushi dotted guidelines background */}
        <div className={`absolute inset-0 pointer-events-none rounded-3xl overflow-hidden border-2 transition-all flex items-center justify-center ${
          status === 'correct'
            ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/30'
            : status === 'wrong'
            ? 'border-rose-500/80 shadow-lg shadow-rose-500/15'
            : darkMode
            ? 'border-slate-700 bg-slate-900/60'
            : 'border-slate-300/80 bg-white/70'
        }`}>
          {/* horizontal dashed line */}
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-slate-400/30" />
          {/* vertical dashed line */}
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-slate-400/30" />
          {/* outer subtle frame */}
          <div className="absolute inset-2 border border-slate-400/15 rounded-2xl" />
        </div>

        {/* Tracing outline of target word (Guide Layer) */}
        {showGuide && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
            <span
              className={`text-[130px] font-bold select-none opacity-20 pointer-events-none leading-none ${
                darkMode ? 'text-white' : 'text-slate-900'
              }`}
              style={{
                fontFamily: '"IPAGothic", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif',
              }}
            >
              {word}
            </span>
          </div>
        )}

        {/* Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-[280px] h-[280px] absolute inset-0 z-10 cursor-crosshair touch-none rounded-3xl"
        />

        {/* Success Overlay Animation */}
        <AnimatePresence>
          {status === 'correct' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute top-3 inset-x-3 z-20 py-2 px-3 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 border border-emerald-400/50 backdrop-blur-md"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Benar! Lanjut ke huruf berikutnya...</span>
              {accuracy && <span className="text-[10px] bg-emerald-700/50 px-1.5 py-0.5 rounded font-mono">{accuracy}%</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback Message Bar */}
      {feedbackMsg && status !== 'correct' && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full py-1.5 px-3 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-1.5 border ${
            status === 'incomplete'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{feedbackMsg}</span>
        </motion.div>
      )}

      {/* Canvas Toolbars & Customization */}
      <div className="w-full flex flex-col gap-2.5">
        {/* Colors & Brush Width in Compact Row */}
        <div className="flex items-center justify-between px-1">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Warna:</span>
            <div className="flex gap-1.5">
              {colors.map((c, cIdx) => (
                <button
                  key={`canvas-brush-color-${c.value}-${cIdx}`}
                  onClick={() => setBrushColor(c.value)}
                  style={{ backgroundColor: c.value === '#ffffff' ? '#e2e8f0' : c.value }}
                  className={`w-5 h-5 rounded-full border-2 transition-all active:scale-90 flex items-center justify-center ${
                    brushColor === c.value
                      ? 'border-indigo-500 scale-110 shadow-sm'
                      : 'border-transparent'
                  }`}
                  title={c.name}
                >
                  {brushColor === c.value && (
                    <span className={`w-1 h-1 rounded-full ${c.value === '#ffffff' ? 'bg-slate-800' : 'bg-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Widths */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Kuas:</span>
            <div className="flex gap-1">
              {widths.map((w, wIdx) => (
                <button
                  key={`canvas-brush-width-${w.value}-${wIdx}`}
                  onClick={() => setBrushWidth(w.value)}
                  className={`font-black text-[8.5px] px-2 py-0.5 rounded-full border transition-all active:scale-95 ${
                    brushWidth === w.value
                      ? 'bg-rose-500 text-white border-rose-500'
                      : darkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-500/10">
          {/* Toggle Guide */}
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`py-2 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all ${
              showGuide
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/20'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title="Tampilkan / Sembunyikan Pola Bayangan"
          >
            <CircleDot className="w-3 h-3 shrink-0" />
            <span>{showGuide ? 'Pola Aktif' : 'Pola'}</span>
          </button>

          {/* Check / Periksa Button */}
          <button
            onClick={handleManualCheck}
            disabled={!hasDrawn}
            className={`py-2 px-2 rounded-xl border font-black text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all shadow-xs ${
              hasDrawn
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/20'
                : 'opacity-40 border-slate-300 bg-slate-100 text-slate-400 pointer-events-none'
            }`}
            title="Periksa ketepatan goresan huruf"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Periksa</span>
          </button>

          {/* Clear Canvas */}
          <button
            onClick={clearCanvas}
            className="py-2 px-2 rounded-xl border border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/15 font-bold text-[11px] flex items-center justify-center gap-1 active:scale-95 transition-all"
            title="Hapus coretan saat ini"
          >
            <Trash2 className="w-3 h-3 shrink-0" />
            <span>Hapus</span>
          </button>
        </div>

        {/* Auto Advance Toggle Indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[9px] text-slate-400">
            <Zap className={`w-3 h-3 ${localAutoAdvance ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
            <span>Otomatis lanjut & hapus coretan saat benar</span>
          </div>

          <button
            onClick={() => {
              playSfx?.('click');
              setLocalAutoAdvance(!localAutoAdvance);
            }}
            className={`text-[9px] font-black px-2 py-0.5 rounded-full border transition-all ${
              localAutoAdvance
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                : darkMode
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
          >
            {localAutoAdvance ? '⚡ Auto: ON' : 'Auto: OFF'}
          </button>
        </div>
      </div>
    </div>
  );
}
