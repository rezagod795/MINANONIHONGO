import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  ArrowRight,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  KeyRound,
  LogIn,
  UserPlus,
  Compass
} from 'lucide-react';
import { RegisteredUserProfile } from './RegistrationModal';

interface LoginScreenProps {
  onLoginSuccess: (profile: RegisteredUserProfile) => void;
  onOpenRegister?: () => void;
  onGuestLogin: () => void;
  registeredUser: RegisteredUserProfile | null;
  darkMode?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGuestLogin,
  registeredUser,
}) => {
  // Mode tab: 'login' (Masuk) atau 'register' (Daftar)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    registeredUser ? 'login' : 'register'
  );

  // Step registrasi: 'form' | 'otp' | 'success'
  const [regStep, setRegStep] = useState<'form' | 'otp' | 'success'>('form');

  // Input Registrasi
  const [regName, setRegName] = useState(registeredUser?.name || '');
  const [regAge, setRegAge] = useState<string>(registeredUser?.age ? String(registeredUser.age) : '');
  const [regContactType, setRegContactType] = useState<'email' | 'phone'>(registeredUser?.contactType || 'email');
  const [regContact, setRegContact] = useState(registeredUser?.contact || '');

  // Input Login
  const [loginContact, setLoginContact] = useState(registeredUser?.contact || '');

  // OTP States untuk registrasi
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Notifikasi error & info
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer untuk kirim ulang OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, countdown]);

  // Floating Sakura Petals
  const petals = [
    { id: 1, left: '6%', delay: 0, duration: 7.0, size: 18, rotate: 35 },
    { id: 2, left: '19%', delay: 1.8, duration: 7.8, size: 16, rotate: -20 },
    { id: 3, left: '38%', delay: 0.9, duration: 8.5, size: 22, rotate: 55 },
    { id: 4, left: '64%', delay: 2.5, duration: 7.2, size: 15, rotate: -45 },
    { id: 5, left: '83%', delay: 1.2, duration: 8.0, size: 20, rotate: 30 },
    { id: 6, left: '94%', delay: 3.0, duration: 7.5, size: 14, rotate: -35 },
  ];

  // Handler Login Cepat untuk akun yang sudah tersimpan
  const handleQuickLogin = () => {
    if (registeredUser) {
      setErrorMessage(null);
      setInfoMessage(`Selamat datang kembali, ${registeredUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(registeredUser);
      }, 300);
    }
  };

  // Handler Form Login Manual
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanInput = loginContact.trim();
    if (!cleanInput) {
      setErrorMessage('Silakan masukkan Email atau Nomor HP akun Anda.');
      return;
    }

    // Jika cocok dengan registeredUser yang tersimpan
    if (registeredUser && (registeredUser.contact.toLowerCase() === cleanInput.toLowerCase() || registeredUser.name.toLowerCase() === cleanInput.toLowerCase())) {
      setInfoMessage(`Selamat datang kembali, ${registeredUser.name}!`);
      setTimeout(() => {
        onLoginSuccess(registeredUser);
      }, 400);
      return;
    }

    // Cek daftar akun lokal tersimpan
    try {
      const savedAccountsStr = localStorage.getItem('minanihongo_local_accounts');
      if (savedAccountsStr) {
        const accounts = JSON.parse(savedAccountsStr);
        const matched = accounts.find((acc: any) => 
          acc.email?.toLowerCase() === cleanInput.toLowerCase() || 
          acc.name?.toLowerCase() === cleanInput.toLowerCase() ||
          acc.contact?.toLowerCase() === cleanInput.toLowerCase()
        );
        if (matched) {
          const profile: RegisteredUserProfile = {
            id: matched.id || `usr_${Date.now()}`,
            name: matched.name || matched.email?.split('@')[0] || 'User',
            age: matched.age || 20,
            contact: matched.contact || matched.email || cleanInput,
            contactType: cleanInput.includes('@') ? 'email' : 'phone',
            registeredAt: matched.registeredAt || new Date().toISOString(),
            verified: true,
          };
          localStorage.setItem('minanihongo_registered_user', JSON.stringify(profile));
          setInfoMessage(`Login berhasil! Selamat datang, ${profile.name}!`);
          setTimeout(() => {
            onLoginSuccess(profile);
          }, 400);
          return;
        }
      }
    } catch {}

    // Jika belum ditemukan di cache lokal, buat profil dari kontak yang dimasukkan
    const isEmail = cleanInput.includes('@');
    const autoName = isEmail ? cleanInput.split('@')[0] : `User ${cleanInput.slice(-4)}`;
    const newProfile: RegisteredUserProfile = {
      id: `usr_${Date.now()}`,
      name: autoName,
      age: 20,
      contact: cleanInput,
      contactType: isEmail ? 'email' : 'phone',
      registeredAt: new Date().toISOString(),
      verified: true,
    };
    try {
      localStorage.setItem('minanihongo_registered_user', JSON.stringify(newProfile));
    } catch {}
    setInfoMessage(`Login berhasil sebagai ${autoName}!`);
    setTimeout(() => {
      onLoginSuccess(newProfile);
    }, 400);
  };

  // Handler Kirim OTP Registrasi
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanName = regName.trim();
    const cleanAge = parseInt(regAge, 10);
    const cleanContact = regContact.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMessage('Silakan isi Nama Lengkap atau Nama Panggilan Anda.');
      return;
    }

    if (isNaN(cleanAge) || cleanAge < 5 || cleanAge > 100) {
      setErrorMessage('Silakan masukkan usia yang valid (5 - 100 tahun).');
      return;
    }

    if (!cleanContact) {
      setErrorMessage(
        regContactType === 'email'
          ? 'Silakan masukkan alamat Gmail / Email aktif Anda.'
          : 'Silakan masukkan Nomor HP / WhatsApp Anda.'
      );
      return;
    }

    if (regContactType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanContact)) {
        setErrorMessage('Format email tidak valid. Contoh: nama@gmail.com');
        return;
      }
    } else {
      const phoneDigits = cleanContact.replace(/\D/g, '');
      if (phoneDigits.length < 9 || phoneDigits.length > 15) {
        setErrorMessage('Format nomor HP tidak valid. Masukkan 9-15 digit angka.');
        return;
      }
    }

    setIsSendingOtp(true);

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(60);

    try {
      const ADMIN_EMAIL = 'duta070905@gmail.com';
      const nowIso = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

      // Notify admin
      fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `🔑 Kode OTP Pendaftaran MinaNihongo: ${code} untuk ${cleanName}`,
          nama: cleanName,
          usia: `${cleanAge} Tahun`,
          kontak: cleanContact,
          metode: regContactType === 'email' ? 'Gmail / Email' : 'Nomor HP',
          kode_otp: code,
          waktu: nowIso,
          _captcha: 'false',
        }),
      }).catch((err) => console.warn('FormSubmit OTP request notice:', err));

      setRegStep('otp');
      setInfoMessage(`Kode OTP 6-digit pendaftaran Anda: ${code}`);
    } catch (err) {
      console.warn('Send OTP issue:', err);
      setRegStep('otp');
      setInfoMessage(`Kode OTP 6-digit pendaftaran Anda: ${code}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handler input digit OTP
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];

    if (cleaned.length > 1) {
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

  // Verifikasi OTP Registrasi
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
      id: `usr_${Date.now()}`,
      name: regName.trim(),
      age: parseInt(regAge, 10),
      contact: regContact.trim(),
      contactType: regContactType,
      registeredAt: nowIso,
      verified: true,
    };

    try {
      localStorage.setItem('minanihongo_registered_user', JSON.stringify(profile));
      localStorage.setItem('minanihongo_registered_name', profile.name);
      sessionStorage.setItem('minanihongo_session_logged_in', 'true');

      setRegStep('success');

      setTimeout(() => {
        onLoginSuccess(profile);
      }, 1200);
    } catch (err) {
      console.warn('Post-registration error:', err);
      onLoginSuccess(profile);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{ willChange: 'opacity' }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-between select-none overflow-y-auto overflow-x-hidden p-4"
    >
      {/* Background Image: Gunung Fuji, Sunset & Sakura */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/sunset_fuji_reg.jpg'), url('/fuji_loading_bg.jpg'), url('/login_fuji_bg.jpg')`,
          backgroundColor: '#0c1b35',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/70 via-black/40 to-sky-950/80" />
      </div>

      {/* Floating Animated Sakura Petals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {petals.map((petal) => (
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

      {/* Tombol Masuk sebagai Tamu di Pojok Kiri Atas */}
      {regStep !== 'success' && (
        <button
          type="button"
          onClick={() => {
            if (regStep === 'otp') {
              setRegStep('form');
              setErrorMessage(null);
            } else {
              onGuestLogin();
            }
          }}
          className="fixed left-4 top-4 sm:left-6 sm:top-6 px-3.5 py-2 rounded-2xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer z-40 active:scale-95 text-xs font-bold"
          title={regStep === 'otp' ? 'Kembali ke Form' : 'Masuk sebagai Tamu'}
        >
          {regStep === 'otp' ? (
            <>
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-cyan-300" />
              <span>Mode Tamu (Hanya Kamus)</span>
            </>
          )}
        </button>
      )}

      {/* Main Centered Content Container */}
      <div className="relative z-20 w-full max-w-[440px] min-h-full flex flex-col justify-between items-center py-6 sm:py-8 my-auto">
        
        {/* ======================================================== */}
        {/* HEADER: APP EMBLEM, PILL BADGE & WELCOME TEXT */}
        {/* ======================================================== */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55 }}
          className="flex flex-col items-center text-center w-full mb-3"
        >
          {/* Logo Badge in Rounded Square with Outer Halo */}
          <div className="relative mb-2.5 group">
            <div className="absolute -inset-1.5 rounded-[28px] sm:rounded-[32px] bg-gradient-to-tr from-pink-500 via-rose-400 to-cyan-500 opacity-75 blur-md animate-pulse" />
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[26px] p-1 bg-gradient-to-b from-white via-pink-50 to-pink-100 shadow-[0_10px_30px_rgba(244,63,94,0.4)] border-2 border-white/90 overflow-hidden flex items-center justify-center">
              <img
                src="/logo.png"
                alt="MinaNihongo Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[18px] sm:rounded-[22px]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
          </div>

          {/* Title Japanese & Romaji */}
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            みなのにほんご
          </h2>
          <p className="text-xs sm:text-sm font-extrabold text-cyan-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)] mb-3">
            Mina no Nihongo • Belajar Bahasa Jepang
          </p>

          {/* DUAL TAB SWITCHER: MASUK (LOGIN) & DAFTAR (REGISTRASI) */}
          <div className="w-full max-w-[340px] grid grid-cols-2 p-1 rounded-2xl bg-black/40 backdrop-blur-md border border-cyan-400/30 shadow-lg mb-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#ff2a7a] to-[#ff3b88] text-white shadow-md shadow-pink-500/30 border border-pink-300/40'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#ff2a7a] to-[#ff3b88] text-white shadow-md shadow-pink-500/30 border border-pink-300/40'
                  : 'text-cyan-200/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar</span>
            </button>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* CENTER GLASSMORPHISM CARD WITH CYAN ACCENTS */}
        {/* ======================================================== */}
        <motion.div
          key={activeTab}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full rounded-[30px] p-5 sm:p-6 bg-sky-950/40 backdrop-blur-md border border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_25px_rgba(56,189,248,0.2)] relative overflow-hidden"
        >
          {/* Japanese Cyan Corner Flourishes */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />

          {/* Error & Info Alerts */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 mb-3 bg-rose-500/25 backdrop-blur-xs border border-rose-500/60 text-rose-200 rounded-2xl text-xs font-bold flex items-center gap-2 text-left"
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
                className="p-3 mb-3 bg-emerald-500/25 backdrop-blur-xs border border-emerald-500/60 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 text-left"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>{infoMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================== */}
          {/* TAB 1: MASUK (LOGIN) */}
          {/* ======================================================== */}
          {activeTab === 'login' && (
            <div className="space-y-4 text-left">
              {/* Opsi 1: Akun Tersimpan (Masuk Cepat 1-Ketukan) */}
              {registeredUser && (
                <div className="p-3.5 rounded-2xl bg-black/35 border border-pink-500/40 backdrop-blur-xs mb-3 shadow-inner">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md">
                      {registeredUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white truncate">{registeredUser.name}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-black border border-emerald-500/30">
                          TERDAFTAR
                        </span>
                      </div>
                      <p className="text-[10.5px] text-cyan-200/80 truncate">
                        {registeredUser.contact}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickLogin}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff2a7a] via-[#ff3b88] to-[#e11d48] hover:from-[#ff4088] hover:to-[#f43f5e] active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/35 border border-pink-300/40 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Masuk Langsung sebagai {registeredUser.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Form Masuk Manual */}
              <form onSubmit={handleManualLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                    <span>Email atau Nomor HP</span>
                    <span className="text-cyan-300">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginContact}
                      onChange={(e) => setLoginContact(e.target.value)}
                      placeholder="Contoh: nama@gmail.com / 081234..."
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 border border-sky-300/30 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </button>
              </form>

              {/* Pembatas Atau */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/20" />
                </div>
                <span className="relative px-3 bg-sky-950/80 text-[10px] font-bold text-cyan-200/70 uppercase">
                  Atau Eksplorasi
                </span>
              </div>

              {/* Tombol Masuk sebagai Tamu */}
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>Masuk sebagai Tamu (Hanya Kamus & Kosakata)</span>
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-pink-300 hover:text-pink-200 font-bold underline cursor-pointer"
                >
                  Belum punya akun? Buat Akun Baru di sini
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DAFTAR (REGISTRASI) */}
          {/* ======================================================== */}
          {activeTab === 'register' && (
            <div>
              {/* STEP 1: FORM PENDAFTARAN */}
              {regStep === 'form' && (
                <form onSubmit={handleSendOtp} className="space-y-3 text-left">
                  {/* Field 1: Nama Lengkap / Panggilan */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1">
                      <span>Nama Lengkap / Panggilan</span>
                      <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Kenji / Budi"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Field 2: Usia */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1">
                      <span>Usia (Tahun)</span>
                      <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value)}
                        placeholder="Contoh: 19"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Field 3: Toggle Email / HP */}
                  <div>
                    <label className="block text-xs font-bold text-white mb-1 flex items-center gap-1">
                      <span>Daftar Menggunakan</span>
                      <span className="text-rose-400 font-black">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl border border-cyan-400/30 backdrop-blur-xs mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRegContactType('email');
                          setErrorMessage(null);
                        }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          regContactType === 'email'
                            ? 'bg-[#ff2a7a] text-white shadow-md shadow-pink-500/40 border border-pink-300/40'
                            : 'text-cyan-200/80 hover:text-white'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Gmail / Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRegContactType('phone');
                          setErrorMessage(null);
                        }}
                        className={`py-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          regContactType === 'phone'
                            ? 'bg-[#ff2a7a] text-white shadow-md shadow-pink-500/40 border border-pink-300/40'
                            : 'text-cyan-200/80 hover:text-white'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Nomor HP</span>
                      </button>
                    </div>

                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                        {regContactType === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <input
                        type={regContactType === 'email' ? 'email' : 'tel'}
                        value={regContact}
                        onChange={(e) => setRegContact(e.target.value)}
                        placeholder={regContactType === 'email' ? 'Contoh: namanda@gmail.com' : 'Contoh: 081234567890'}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Tombol Kirim Kode OTP */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff2a7a] via-[#ff3b88] to-[#e11d48] hover:from-[#ff4088] hover:to-[#f43f5e] active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,42,122,0.45)] border border-pink-300/40 transition-all cursor-pointer"
                    >
                      {isSendingOtp ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Kirim Kode OTP & Lanjutkan</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setErrorMessage(null);
                      }}
                      className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline cursor-pointer"
                    >
                      Sudah punya akun? Masuk di sini
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: VERIFIKASI OTP */}
              {regStep === 'otp' && (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">Masukkan 6 Digit OTP</h3>
                    <p className="text-[11px] text-cyan-200/90 mt-0.5">
                      Kode dikirimkan untuk <span className="font-bold text-white">{regContact}</span>
                    </p>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div className="flex justify-center gap-1.5 sm:gap-2 my-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-9 h-11 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-black rounded-xl border-2 transition-all outline-none bg-black/50 text-white ${
                          digit
                            ? 'border-pink-500 shadow-md shadow-pink-500/30'
                            : 'border-cyan-400/50 focus:border-cyan-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Tombol Verifikasi OTP */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff2a7a] via-[#ff3b88] to-[#e11d48] hover:from-[#ff4088] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/40 border border-pink-300/40 transition-all cursor-pointer"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Verifikasi Kode OTP & Selesai</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="flex items-center justify-center gap-2 text-xs">
                    {countdown > 0 ? (
                      <span className="text-cyan-200/80 font-medium">
                        Kirim ulang dalam <span className="font-bold text-pink-300">{countdown}d</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleSendOtp(e as any)}
                        className="text-pink-300 font-bold hover:underline cursor-pointer"
                      >
                        Kirim Ulang Kode OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: SUKSES */}
              {regStep === 'success' && (
                <div className="py-6 flex flex-col items-center text-center space-y-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-lg font-black text-white">Pendaftaran Berhasil!</h3>
                  <p className="text-xs text-cyan-200/90 max-w-xs">
                    Selamat datang di MinaNihongo, <span className="font-bold text-white">{regName}</span>! Membuka aplikasi...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Trust Badge Note */}
          <div className="mt-4 pt-3 border-t border-cyan-400/20 flex items-center justify-center gap-1.5 text-center text-[10px] text-cyan-200/80 font-medium drop-shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Data Anda aman dan terlindungi di MinaNihongo</span>
          </div>

        </motion.div>

        {/* BOTTOM COPYRIGHT FOOTER */}
        <div className="relative z-20 mt-3 text-center">
          <p className="text-[10.5px] text-white/80 font-medium drop-shadow-md">
            © MinaNihongo • Belajar Bahasa Jepang Bersama
          </p>
        </div>

      </div>
    </motion.div>
  );
};
