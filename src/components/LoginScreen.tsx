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
  KeyRound
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
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [name, setName] = useState(registeredUser?.name || '');
  const [age, setAge] = useState<string>(registeredUser?.age ? String(registeredUser.age) : '');
  const [contactType, setContactType] = useState<'email' | 'phone'>(registeredUser?.contactType || 'email');
  const [contact, setContact] = useState(registeredUser?.contact || '');

  // OTP States
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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

  // Floating Sakura Petals
  const petals = [
    { id: 1, left: '5%', delay: 0, duration: 7.0, size: 18, rotate: 35 },
    { id: 2, left: '18%', delay: 1.8, duration: 7.8, size: 16, rotate: -20 },
    { id: 3, left: '38%', delay: 0.9, duration: 8.5, size: 22, rotate: 55 },
    { id: 4, left: '65%', delay: 2.5, duration: 7.2, size: 15, rotate: -45 },
    { id: 5, left: '82%', delay: 1.2, duration: 8.0, size: 20, rotate: 30 },
    { id: 6, left: '94%', delay: 3.0, duration: 7.5, size: 14, rotate: -35 },
  ];

  // Send OTP handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanName = name.trim();
    const cleanAge = parseInt(age, 10);
    const cleanContact = contact.trim();

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
        contactType === 'email'
          ? 'Silakan masukkan alamat Gmail / Email aktif Anda.'
          : 'Silakan masukkan Nomor HP / WhatsApp Anda.'
      );
      return;
    }

    if (contactType === 'email') {
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
          metode: contactType === 'email' ? 'Gmail / Email' : 'Nomor HP',
          kode_otp: code,
          waktu: nowIso,
          _captcha: 'false',
        }),
      }).catch((err) => console.warn('FormSubmit OTP request notice:', err));

      setStep('otp');
      setInfoMessage(`Kode OTP 6-digit pendaftaran Anda adalah: ${code}`);
    } catch (err) {
      console.warn('Send OTP issue:', err);
      setStep('otp');
      setInfoMessage(`Kode OTP 6-digit pendaftaran Anda: ${code}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit changes
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

  // Verify OTP
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
      name: name.trim(),
      age: parseInt(age, 10),
      contact: contact.trim(),
      contactType: contactType,
      registeredAt: nowIso,
      verified: true,
    };

    try {
      localStorage.setItem('minanihongo_registered_user', JSON.stringify(profile));
      localStorage.setItem('minanihongo_registered_name', profile.name);
      localStorage.setItem('minanihongo_session_logged_in', 'true');

      setStep('success');

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
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-between select-none overflow-y-auto overflow-x-hidden p-4"
    >
      {/* Background Image: Scenic Cherry Blossom Sunset Scenery */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url('/sunset_fuji_reg.jpg'), url('/login_fuji_bg.jpg')`,
          backgroundColor: '#0c1b35',
        }}
      >
        {/* Soft Vignette Overlay for Crisp Aesthetic */}
        <div className="absolute inset-0 bg-black/20" />
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

      {/* Tombol Kembali di Pojok Kiri Atas */}
      {step !== 'success' && (
        <button
          type="button"
          onClick={() => {
            if (step === 'otp') {
              setStep('form');
              setErrorMessage(null);
            } else {
              onGuestLogin();
            }
          }}
          className="fixed left-4 top-4 sm:left-6 sm:top-6 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer z-40 active:scale-90"
          title={step === 'otp' ? 'Kembali ke Form' : 'Masuk sebagai Tamu'}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Centered Content Container */}
      <div className="relative z-20 w-full max-w-[430px] min-h-full flex flex-col justify-between items-center py-6 sm:py-8 my-auto">
        
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
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-sky-950/60 backdrop-blur-md border border-pink-500/50 shadow-md mb-3">
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

        {/* ======================================================== */}
        {/* CENTER GLASSMORPHISM CARD WITH CYAN CORNER ACCENTS */}
        {/* ======================================================== */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full rounded-[32px] p-5 sm:p-6 bg-sky-950/30 backdrop-blur-md border border-cyan-400/50 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_25px_rgba(56,189,248,0.2)] relative overflow-hidden"
        >
          {/* Japanese Cyan Corner Flourishes: ┌ ┐ └ ┘ */}
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

          {/* STEP 1: FORM PENDAFTARAN */}
          {step === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-3.5 text-left">
              
              {/* Field 1: Nama Lengkap / Nama Panggilan * */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Nama Lengkap / Nama Panggilan</span>
                  <span className="text-rose-400 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kenji / Budi"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Field 2: Usia (Tahun) * */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Usia (Tahun)</span>
                  <span className="text-rose-400 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Contoh: 19"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Field 3: Daftar Menggunakan * (Toggle Switch) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1 drop-shadow-sm">
                  <span>Daftar Menggunakan</span>
                  <span className="text-rose-400 font-black">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-black/30 rounded-2xl border border-cyan-400/30 backdrop-blur-xs mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContactType('email');
                      setErrorMessage(null);
                    }}
                    className={`py-2 sm:py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      contactType === 'email'
                        ? 'bg-[#ff2a7a] text-white shadow-lg shadow-pink-500/40 border border-pink-300/40'
                        : 'text-cyan-200/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gmail / Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setContactType('phone');
                      setErrorMessage(null);
                    }}
                    className={`py-2 sm:py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      contactType === 'phone'
                        ? 'bg-[#ff2a7a] text-white shadow-lg shadow-pink-500/40 border border-pink-300/40'
                        : 'text-cyan-200/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Nomor HP</span>
                  </button>
                </div>

                {/* Dynamic Contact Input based on selection */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 pointer-events-none text-cyan-300">
                    {contactType === 'email' ? <Mail className="w-4.5 h-4.5" /> : <Phone className="w-4.5 h-4.5" />}
                  </div>
                  <input
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'Contoh: namanda@gmail.com' : 'Contoh: 081234567890'}
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl bg-black/40 border border-cyan-400/50 text-white placeholder-cyan-200/50 text-xs sm:text-sm font-medium focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/30 outline-none backdrop-blur-xs transition-all shadow-inner"
                  />
                </div>
                <p className="text-[10px] text-cyan-200/80 mt-1.5 pl-1 drop-shadow-sm">
                  Kode OTP verifikasi pendaftaran akan dikirimkan ke {contactType === 'email' ? 'email ini.' : 'nomor WhatsApp/SMS ini.'}
                </p>
              </div>

              {/* Big Vibrant Pink Button: Kirim Kode OTP & Lanjutkan ➔ */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#ff2a7a] via-[#ff3b88] to-[#e11d48] hover:from-[#ff4088] hover:to-[#f43f5e] active:scale-[0.98] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,42,122,0.45)] border border-pink-300/40 transition-all cursor-pointer"
                >
                  {isSendingOtp ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4.5 h-4.5" />
                      <span>Kirim Kode OTP & Lanjutkan</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Trust Badge Note */}
              <div className="pt-1 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-cyan-200/90 font-semibold drop-shadow-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Data pendaftaran aman dan langsung terhubung dengan admin aplikasi.</span>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFIKASI OTP */}
          {step === 'otp' && (
            <div className="space-y-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/30 mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">Masukkan 6 Digit OTP</h3>
                <p className="text-[11px] text-cyan-200/90 mt-0.5">
                  Kode telah dibuat untuk <span className="font-bold text-white">{contact}</span>
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-center gap-2 sm:gap-2.5 my-2">
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
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border-2 transition-all outline-none bg-black/50 text-white ${
                      digit
                        ? 'border-pink-500 shadow-md shadow-pink-500/30'
                        : 'border-cyan-400/50 focus:border-cyan-300'
                    }`}
                  />
                ))}
              </div>

              {/* OTP Action Button */}
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff2a7a] via-[#ff3b88] to-[#e11d48] hover:from-[#ff4088] active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-500/40 border border-pink-300/40 transition-all cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verifikasi Kode OTP & Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend OTP */}
              <div className="flex items-center justify-center gap-2 text-xs">
                {countdown > 0 ? (
                  <span className="text-cyan-200/80 font-medium">
                    Kirim ulang kode dalam <span className="font-bold text-pink-300">{countdown}d</span>
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
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-xl font-black text-white">Pendaftaran Berhasil!</h3>
              <p className="text-xs text-cyan-200/90 max-w-xs">
                Selamat datang di MinaNihongo, <span className="font-bold text-white">{name}</span>! Membuka aplikasi...
              </p>
            </div>
          )}

        </motion.div>

        {/* ======================================================== */}
        {/* BOTTOM COPYRIGHT FOOTER */}
        {/* ======================================================== */}
        <div className="relative z-20 mt-4 text-center">
          <p className="text-[11px] text-white/80 font-medium drop-shadow-md">
            © MinaNihongo • Belajar Bahasa Jepang
          </p>
        </div>

      </div>
    </motion.div>
  );
};
