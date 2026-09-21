import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone,
  ArrowLeft,
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Send, 
  ShieldCheck,
  Smartphone,
  MessageCircle
} from 'lucide-react';

export interface RegisteredUserProfile {
  id?: string;
  name: string;
  age: number;
  contact: string;
  contactType: 'email' | 'phone';
  registeredAt: string;
  verified: boolean;
  xp?: number;
  profileLevel?: number;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onSuccess: (profile: RegisteredUserProfile) => void;
  onClose?: () => void;
  darkMode?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  darkMode = false,
}) => {
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contact, setContact] = useState('');
  
  // OTP States
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showOtpHint, setShowOtpHint] = useState<boolean>(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Sinkronisasi Tombol Kembali HP (Android gesture/back button & browser popstate) dengan Tombol Kembali Aplikasi
  useEffect(() => {
    if (!isOpen || step === 'success') return;

    // Push history state khusus untuk step modal saat ini
    const historyState = { minanihongo_modal: 'registration', step };
    window.history.pushState(historyState, '');

    const handlePopState = () => {
      // Ketika tombol kembali di HP ditekan oleh user
      if (step === 'otp') {
        setStep('form');
        setErrorMessage(null);
        setInfoMessage(null);
      } else if (step === 'form') {
        onClose?.();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, step, onClose]);

  // Fungsi tombol kembali aplikasi (berfungsi sama persis dengan tombol kembali HP)
  const handleGoBack = () => {
    if (step === 'otp') {
      setStep('form');
      setErrorMessage(null);
      setInfoMessage(null);
      if (window.history.state?.step === 'otp') {
        window.history.back();
      }
    } else if (step === 'form') {
      if (window.history.state?.minanihongo_modal === 'registration') {
        window.history.back();
      }
      onClose?.();
    }
  };

  if (!isOpen) return null;

  // Step 1: Submit Form & Generate OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Silakan masukkan nama lengkap atau nama panggilan (minimal 2 huruf).');
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 5 || parsedAge > 100) {
      setErrorMessage('Silakan masukkan usia yang valid (5 - 100 tahun).');
      return;
    }

    const trimmedContact = contact.trim();
    if (contactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedContact)) {
        setErrorMessage('Silakan masukkan alamat Gmail / Email yang valid (contoh: namaanda@gmail.com).');
        return;
      }
    } else {
      const phoneRegex = /^[0-9+]{8,16}$/;
      if (!phoneRegex.test(trimmedContact.replace(/[\s-]/g, ''))) {
        setErrorMessage('Silakan masukkan nomor HP yang valid (contoh: 081234567890 atau +6281234567890).');
        return;
      }
    }

    // Generate 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpDigits(['', '', '', '', '', '']);
    setIsSendingOtp(true);

    try {
      // 1. Dispatch OTP via server / formsubmit API
      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          contact: trimmedContact,
          type: contactType,
          otp: newOtp
        })
      }).catch((err) => console.warn('Server send-otp error:', err));

      // 2. Direct FormSubmit AJAX dispatch as backup for email
      if (contactType === 'email') {
        fetch(`https://formsubmit.co/ajax/${encodeURIComponent(trimmedContact)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `[MinaNihongo] Kode OTP Pendaftaran Anda: ${newOtp}`,
            nama: trimmedName,
            kode_verifikasi_otp: newOtp,
            keterangan: 'Masukkan kode ini di aplikasi MinaNihongo untuk mengaktifkan akun belajar Anda.',
            _captcha: 'false',
            _template: 'box'
          })
        }).catch((err) => console.warn('Backup direct OTP mail error:', err));
      }

      setStep('otp');
      setCountdown(60);
      setInfoMessage(
        contactType === 'email'
          ? `Kode OTP telah dikirim ke ${trimmedContact}. Silakan periksa kotak masuk atau folder Spam.`
          : `Kode OTP 6-digit telah disiapkan untuk nomor HP ${trimmedContact}.`
      );

      // Auto-focus first OTP input after state update
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 300);
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat menyiapkan OTP. Silakan coba lagi.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
      // Pasted multi-digit OTP
      const pastedChars = cleaned.slice(0, 6).split('');
      pastedChars.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pastedChars.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    } else {
      newDigits[index] = cleaned;
      setOtpDigits(newDigits);

      if (cleaned && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join('');
    setErrorMessage(null);

    if (enteredOtp.length !== 6) {
      setErrorMessage('Silakan masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setErrorMessage('Kode OTP tidak sesuai. Silakan periksa kembali kode Anda.');
      return;
    }

    setIsVerifying(true);
    const nowIso = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const profile: RegisteredUserProfile = {
      name: name.trim(),
      age: parseInt(age, 10),
      contact: contact.trim(),
      contactType: contactType,
      registeredAt: nowIso,
      verified: true
    };

    try {
      const ADMIN_EMAIL = 'duta070905@gmail.com';

      // 1. Kirim data pendaftar ke Gmail Pembuat Aplikasi via Server
      fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch((err) => console.warn('Server notify-admin error:', err));

      // 2. Kirim data pendaftar ke FormSubmit AJAX Admin sebagai jaminan terkirim
      fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🎉 Pendaftar Baru MinaNihongo: ${profile.name} (${profile.age} Tahun) [${profile.contactType === 'email' ? 'Email' : 'No. HP'}]`,
          nama_pendaftar: profile.name,
          usia: `${profile.age} Tahun`,
          kontak_pendaftar: profile.contact,
          metode_kontak: profile.contactType === 'email' ? 'Email (Gmail)' : 'Nomor HP',
          status: 'TERVERIFIKASI (OTP Valid)',
          waktu_daftar: profile.registeredAt,
          aplikasi: 'MinaNihongo - Pembelajaran Bahasa Jepang Interaktif',
          _captcha: 'false',
          _template: 'table'
        })
      }).catch((err) => console.warn('Direct admin notification error:', err));

      // 3. Simpan data di local storage
      localStorage.setItem('minanihongo_registered_user', JSON.stringify(profile));
      localStorage.setItem('minanihongo_registered_name', profile.name);

      setStep('success');

      // 4. Delay transition to let user see the success checkmark
      setTimeout(() => {
        onSuccess(profile);
      }, 1500);
    } catch (err) {
      console.warn('Post-registration error:', err);
      // Still proceed on network fail since OTP was valid
      onSuccess(profile);
    } finally {
      setIsVerifying(false);
    }
  };

  // Floating Sakura Petals for Registration screen
  const regPetals = [
    { id: 1, left: '5%', delay: 0, duration: 7.0, size: 18, rotate: 35 },
    { id: 2, left: '18%', delay: 1.8, duration: 7.8, size: 16, rotate: -20 },
    { id: 3, left: '38%', delay: 0.9, duration: 8.5, size: 22, rotate: 55 },
    { id: 4, left: '65%', delay: 2.5, duration: 7.2, size: 15, rotate: -45 },
    { id: 5, left: '82%', delay: 1.2, duration: 8.0, size: 20, rotate: 30 },
    { id: 6, left: '94%', delay: 3.0, duration: 7.5, size: 14, rotate: -35 },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-between select-none overflow-y-auto overflow-x-hidden p-4">
      {/* Background Image: Twilight Sunset Japanese Scenery (Gunung Fuji, Torii, Pagoda, Danau) */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/sunset_fuji_reg.jpg'), url('/login_fuji_bg.jpg')`,
          backgroundColor: '#0b162c',
        }}
      >
        {/* Soft Transparent Overlay for Bright Scenic Visibility */}
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Floating Animated Sakura Petals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {regPetals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: ['0vh', '110vh'],
              x: [0, 20, -15, 25, 0],
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

      {/* Tombol Kembali di Pojok Kiri Atas (Sinkron Tombol HP & Navigasi Kembali) */}
      {step !== 'success' && (
        <button
          type="button"
          id="registration-modal-back-btn"
          onClick={handleGoBack}
          aria-label={step === 'otp' ? 'Kembali ke Form Pendaftaran' : 'Kembali ke Login'}
          title={step === 'otp' ? 'Kembali ke Pengisian Data' : 'Kembali'}
          className="fixed left-4 top-4 sm:left-6 sm:top-6 w-11 h-11 rounded-2xl bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer z-40 active:scale-90 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </button>
      )}

      {/* Main Container Centered Layout */}
      <div className="relative z-20 w-full max-w-[430px] min-h-full flex flex-col justify-between items-center py-6 sm:py-8 my-auto">
        
        {/* Top Header: Logo, Pill Badge, Welcome Headline & Subtitle */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col items-center text-center w-full mb-4"
        >
          {/* Official App Logo Badge with Neon Halo */}
          <div className="relative mb-3 group">
            <div className="absolute -inset-1.5 rounded-[28px] sm:rounded-[32px] bg-gradient-to-tr from-pink-500 via-rose-400 to-indigo-500 opacity-75 blur-md animate-pulse" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] sm:rounded-[28px] p-1 bg-gradient-to-b from-white via-pink-50 to-pink-100 shadow-[0_10px_30px_rgba(244,63,94,0.4)] border-2 border-white/90 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="MinaNihongo Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[20px] sm:rounded-[24px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
          </div>

          {/* Pill Badge: 🌸 PENDAFTARAN AKUN BELAJAR */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-sky-950/40 backdrop-blur-md border border-pink-500/50 shadow-md mb-3">
            <span className="text-sm select-none">🌸</span>
            <span className="text-[11px] sm:text-xs font-black tracking-widest text-pink-300 uppercase">
              PENDAFTARAN AKUN BELAJAR
            </span>
          </div>

          {/* Welcome Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Selamat Datang di <span className="text-[#ff3b88] font-black drop-shadow-[0_0_15px_rgba(255,59,136,0.6)]">MinaNihongo!</span>
          </h2>

          {/* Description Subtitle */}
          <p className="text-xs sm:text-[13px] text-white/95 text-center font-medium max-w-sm leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] px-2">
            Daftar menggunakan akun Gmail / Email atau Nomor HP Anda untuk membuka akses penuh ke seluruh kuis kosakata, kanji, audio percakapan, dan duel multiplayer.
          </p>
        </motion.div>

        {/* Center Transparent Glassmorphism Registration Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full rounded-[32px] p-6 sm:p-7 bg-sky-950/20 sm:bg-sky-950/25 backdrop-blur-md border border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.37),0_0_25px_rgba(56,189,248,0.25)] relative overflow-hidden"
        >
          {/* Japanese Aesthetic Corner Flourish Accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/80 rounded-br-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

          {/* Error / Alert notification */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 mb-4 bg-rose-500/25 backdrop-blur-xs border border-rose-500/60 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2 text-left shadow-lg"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
            {infoMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 mb-4 bg-emerald-500/25 backdrop-blur-xs border border-emerald-500/60 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 text-left shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>{infoMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Registration Form */}
          {step === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              
              {/* Field 1: Nama Lengkap / Nama Panggilan */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Nama Lengkap / Nama Panggilan</span>
                  <span className="text-pink-400 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-cyan-300 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kenji / Budi"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sky-950/30 backdrop-blur-xs border border-cyan-400/50 text-white placeholder-slate-300/70 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-sky-950/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Field 2: Usia (Tahun) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Usia (Tahun)</span>
                  <span className="text-pink-400 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 w-4 h-4 text-cyan-300 pointer-events-none" />
                  <input
                    type="number"
                    required
                    min="5"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Contoh: 19"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sky-950/30 backdrop-blur-xs border border-cyan-400/50 text-white placeholder-slate-300/70 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-sky-950/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Field 3: Daftar Menggunakan (Toggle Tabs) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Daftar Menggunakan</span>
                  <span className="text-pink-400 font-black">*</span>
                </label>
                
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  {/* Tab Email */}
                  <button
                    type="button"
                    onClick={() => {
                      setContactType('email');
                      setContact('');
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      contactType === 'email'
                        ? 'bg-gradient-to-r from-[#ff1b7a] via-[#ff2f8b] to-[#ff479d] text-white shadow-[0_0_20px_rgba(255,46,141,0.55)] border-0'
                        : 'bg-sky-950/35 backdrop-blur-xs border border-cyan-400/40 text-sky-200 hover:text-white hover:bg-sky-900/40'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gmail / Email</span>
                  </button>

                  {/* Tab Nomor HP */}
                  <button
                    type="button"
                    onClick={() => {
                      setContactType('phone');
                      setContact('');
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      contactType === 'phone'
                        ? 'bg-gradient-to-r from-[#ff1b7a] via-[#ff2f8b] to-[#ff479d] text-white shadow-[0_0_20px_rgba(255,46,141,0.55)] border-0'
                        : 'bg-sky-950/35 backdrop-blur-xs border border-cyan-400/40 text-sky-200 hover:text-white hover:bg-sky-900/40'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Nomor HP</span>
                  </button>
                </div>

                {/* Input Kontak (Email atau Nomor HP) */}
                <div className="relative flex items-center">
                  {contactType === 'email' ? (
                    <Mail className="absolute left-4 w-4 h-4 text-cyan-300 pointer-events-none" />
                  ) : (
                    <Phone className="absolute left-4 w-4 h-4 text-cyan-300 pointer-events-none" />
                  )}
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'Contoh: namanda@gmail.com' : 'Contoh: 081234567890'}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-sky-950/30 backdrop-blur-xs border border-cyan-400/50 text-white placeholder-slate-300/70 text-xs sm:text-sm font-semibold focus:outline-none focus:bg-sky-950/50 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30 transition-all shadow-inner"
                  />
                </div>
                
                <p className="text-[11px] text-sky-200/90 font-medium mt-1.5 px-1 drop-shadow-sm">
                  Kode OTP verifikasi pendaftaran akan dikirimkan ke {contactType === 'email' ? 'email' : 'nomor'} ini.
                </p>
              </div>

              {/* Submit Button: Kirim Kode OTP & Lanjutkan */}
              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#ff1b7a] via-[#ff2f8b] to-[#ff479d] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(255,46,141,0.65)] transition-all cursor-pointer mt-5 disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Kode OTP...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 -rotate-45" />
                    <span>Kirim Kode OTP & Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Security Assurance Badge */}
              <div className="flex items-center justify-center gap-2 pt-2 text-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-[11px] text-sky-100 font-medium drop-shadow-sm">
                  Data pendaftaran aman dan langsung terhubung dengan admin aplikasi.
                </span>
              </div>

              {/* Admin Contact Help */}
              <div className="mt-2 pt-2 border-t border-cyan-400/20 flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-sky-200">
                <span className="font-semibold text-sky-300 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  Bantuan Admin:
                </span>
                <a
                  href="https://wa.me/6281935928784?text=Halo%20Admin%20Mina%20no%20Nihongo%2C%20saya%20butuh%20bantuan%20pendaftaran..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-300 hover:text-emerald-200 font-bold underline cursor-pointer"
                >
                  WA: 081935928784
                </a>
                <span className="opacity-40">•</span>
                <a
                  href="mailto:duta070905@gmail.com?subject=Bantuan%20Pendaftaran%20Mina%20no%20Nihongo"
                  className="text-rose-300 hover:text-rose-200 font-bold underline cursor-pointer"
                >
                  duta070905@gmail.com
                </a>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Box */}
          {step === 'otp' && (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center mb-1 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-white">Verifikasi Kode OTP</h3>
                <p className="text-xs text-sky-200/90 leading-relaxed max-w-xs">
                  Masukkan 6 digit kode verifikasi yang disiapkan untuk <span className="text-pink-300 font-bold">{contact}</span>.
                </p>

                {/* 6 Digit Input Fields */}
                <div className="flex items-center justify-center gap-2 my-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={`otp-input-field-${index}`}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-11 h-13 text-center text-lg font-black rounded-2xl border-2 transition-all outline-none ${
                        digit
                          ? 'border-pink-400 bg-pink-500/20 text-pink-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                          : 'border-cyan-400/50 bg-sky-950/35 text-white focus:border-pink-400 focus:ring-2 focus:ring-pink-400/25'
                      }`}
                    />
                  ))}
                </div>

                {/* Quick Auto-fill helper box for seamless testing */}
                <div className="w-full p-3.5 rounded-2xl bg-sky-950/35 backdrop-blur-xs border border-cyan-400/40 text-sky-200 text-xs flex flex-col items-center gap-2 shadow-inner">
                  <p className="font-bold text-white">Kode Verifikasi Pendaftaran Anda:</p>
                  <div className="px-5 py-2 rounded-xl bg-sky-950/60 text-pink-300 font-black text-base tracking-[0.25em] border border-pink-400/40 shadow-xs">
                    {generatedOtp}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(generatedOtp.split(''));
                    }}
                    className="text-[11px] font-extrabold text-pink-300 hover:text-white underline cursor-pointer transition-colors"
                  >
                    Klik di sini untuk otomatis mengisi kode OTP
                  </button>
                </div>
              </div>

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying || otpDigits.some((d) => d === '')}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#ff1b7a] via-[#ff2f8b] to-[#ff479d] hover:brightness-110 active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,46,141,0.65)] transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi & Mulai Belajar</span>
                  </>
                )}
              </button>

              {/* Resend & Back Button */}
              <div className="flex items-center justify-between text-xs pt-2 px-1">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="font-bold text-sky-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => handleSendOtp()}
                  className={`font-bold flex items-center gap-1 transition-colors ${
                    countdown > 0
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-pink-300 hover:text-white cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${countdown === 0 ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Kirim Ulang (${countdown}s)` : 'Kirim Ulang OTP'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success Screen */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-sky-200 leading-relaxed max-w-xs">
                Data pendaftaran Anda telah berhasil diverifikasi. Selamat menikmati seluruh fitur belajar MinaNihongo!
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Decorative Footer */}
        <div className="mt-4 text-center">
          <p
            className="text-[11px] font-bold text-white/90"
            style={{
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            © MinaNihongo • Belajar Bahasa Jepang
          </p>
        </div>

      </div>
    </div>
  );
};
export default RegistrationModal;
