import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// In-Memory Cache to prevent duplicate GCP TTS API calls for identical words
const ttsCache = new Map<string, Buffer>();

// File-backed persistent storage for registered user accounts
const ACCOUNTS_FILE = path.join(process.cwd(), 'registered_accounts.json');

function getRegisteredAccounts(): any[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Could not read accounts file:", e);
  }
  return [];
}

function saveRegisteredAccount(newAccount: any) {
  try {
    const accounts = getRegisteredAccounts();
    const cleanContact = (newAccount.contact || '').trim().toLowerCase();
    const existingIndex = accounts.findIndex(
      (a: any) => (a.contact || '').trim().toLowerCase() === cleanContact
    );
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...newAccount };
    } else {
      accounts.push(newAccount);
    }
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.warn("Could not save account to file:", e);
    return false;
  }
}

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Route: Health check & Cloud Run probes
  app.get(['/api/health', '/healthz', '/_health'], (req: Request, res: Response) => {
    res.json({ status: 'ok', server: 'full-stack' });
  });

  // API Route: Kirim OTP ke Pengguna (Email / FormSubmit)
  app.post('/api/send-otp', async (req: Request, res: Response) => {
    try {
      const { name, contact, type, otp } = req.body;
      if (!name || !contact || !otp) {
        return res.status(400).json({ error: "Data pendaftaran tidak lengkap" });
      }

      // Kirim email OTP jika kontak adalah email
      if (type === 'email' && contact.includes('@')) {
        try {
          await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contact)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              _subject: `[MinaNihongo] Kode Verifikasi OTP Anda: ${otp}`,
              nama_pendaftar: name,
              kode_otp: otp,
              pesan: `Halo ${name},\n\nTerima kasih telah mendaftar di Aplikasi Pembelajaran Bahasa Jepang MinaNihongo.\n\nKode Verifikasi OTP Anda adalah: ${otp}\n\nMasukkan kode ini di aplikasi untuk mengaktifkan akun Anda. Kode ini berlaku selama 10 menit.`,
              _captcha: 'false',
              _template: 'box'
            })
          });
        } catch (mailErr) {
          console.warn("Direct user OTP mail dispatch warning:", mailErr);
        }
      }

      return res.json({ success: true, message: `Kode OTP berhasil disiapkan untuk ${contact}` });
    } catch (err: any) {
      console.error("Error in /api/send-otp:", err);
      return res.status(500).json({ error: "Gagal mengirim OTP", details: err.message });
    }
  });

  // API Route: Kirim Data Pendaftar Baru ke Gmail Admin (duta070905@gmail.com)
  app.post('/api/notify-admin', async (req: Request, res: Response) => {
    try {
      const { name, age, contact, type, contactType, registeredAt, verified } = req.body;
      const ADMIN_EMAIL = 'duta070905@gmail.com';
      const contactMethod = (contactType === 'phone' || type === 'phone') ? 'Nomor HP' : 'Email (Gmail)';

      // Kirim notifikasi data pendaftar ke Gmail Admin
      try {
        await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `🎉 Pendaftar Baru MinaNihongo: ${name} (${age} Thn) [${contactMethod}]`,
            nama: name,
            usia: `${age} Tahun`,
            kontak: contact,
            tipe_kontak: contactMethod,
            status_verifikasi: verified ? 'TERVERIFIKASI (OTP Valid)' : 'Pending',
            waktu_pendaftaran: registeredAt || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
            aplikasi: 'MinaNihongo - Aplikasi Belajar Bahasa Jepang',
            _captcha: 'false',
            _template: 'table'
          })
        });
      } catch (adminMailErr) {
        console.warn("Admin notification mail dispatch warning:", adminMailErr);
      }

      return res.json({ success: true, message: "Data pendaftar berhasil dikirim ke Admin." });
    } catch (err: any) {
      console.error("Error in /api/notify-admin:", err);
      return res.status(500).json({ error: "Gagal mengirim notifikasi admin", details: err.message });
    }
  });

  // API Route: Registrasi Akun Resmi (Menyimpan data pendaftar & kirim notifikasi)
  app.post('/api/accounts/register', async (req: Request, res: Response) => {
    try {
      const { name, age, contact, contactType, id, registeredAt, verified } = req.body;
      if (!name || !contact) {
        return res.status(400).json({ success: false, error: "Nama dan Kontak wajib diisi." });
      }

      const accountData = {
        id: id || `usr_${Date.now()}`,
        name: String(name).trim(),
        age: parseInt(String(age), 10) || 20,
        contact: String(contact).trim(),
        contactType: contactType === 'phone' ? 'phone' : 'email',
        registeredAt: registeredAt || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
        verified: !!verified
      };

      saveRegisteredAccount(accountData);

      // Trigger admin notification email
      const ADMIN_EMAIL = 'duta070905@gmail.com';
      fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `🎉 Pendaftar Baru MinaNihongo: ${accountData.name} (${accountData.age} Thn) [${accountData.contactType === 'phone' ? 'No. HP' : 'Email'}]`,
          nama: accountData.name,
          usia: `${accountData.age} Tahun`,
          kontak: accountData.contact,
          tipe_kontak: accountData.contactType === 'phone' ? 'Nomor HP' : 'Email (Gmail)',
          status_verifikasi: 'TERVERIFIKASI (OTP Valid)',
          waktu_pendaftaran: accountData.registeredAt,
          aplikasi: 'MinaNihongo - Aplikasi Belajar Bahasa Jepang',
          _captcha: 'false',
          _template: 'table'
        })
      }).catch((e) => console.warn('FormSubmit auto notify error:', e));

      return res.json({ success: true, account: accountData });
    } catch (err: any) {
      console.error("Error in /api/accounts/register:", err);
      return res.status(500).json({ success: false, error: "Gagal menyimpan akun", details: err.message });
    }
  });

  // API Route: Verifikasi Akun Terdaftar (Cek apakah kontak sudah pernah didaftarkan)
  app.get('/api/accounts/check', (req: Request, res: Response) => {
    try {
      const contactQuery = String(req.query.contact || '').trim().toLowerCase();
      if (!contactQuery) {
        return res.status(400).json({ registered: false, error: "Parameter contact diperlukan" });
      }

      const accounts = getRegisteredAccounts();
      const matched = accounts.find((acc: any) => {
        const accContact = (acc.contact || '').trim().toLowerCase();
        const accName = (acc.name || '').trim().toLowerCase();
        return accContact === contactQuery || accName === contactQuery;
      });

      if (matched) {
        return res.json({
          registered: true,
          account: {
            id: matched.id,
            name: matched.name,
            age: matched.age,
            contact: matched.contact,
            contactType: matched.contactType,
            registeredAt: matched.registeredAt,
            verified: matched.verified
          }
        });
      }

      return res.json({ registered: false, message: "Akun belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu." });
    } catch (err: any) {
      console.error("Error in /api/accounts/check:", err);
      return res.status(500).json({ registered: false, error: "Gagal mengecek akun" });
    }
  });

  // API Route: Google Cloud Text-to-Speech proxy
  app.get('/api/tts', async (req: Request, res: Response) => {
    const text = req.query.text;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Missing required 'text' query parameter" });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: "Text parameter cannot be empty" });
    }

    // Try in-memory cache first
    if (ttsCache.has(trimmedText)) {
      const cachedBuffer = ttsCache.get(trimmedText)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(cachedBuffer);
    }

    // Retrieve API key. Prefer GCP_API_KEY, fallback to GEMINI_API_KEY.
    const apiKey = process.env.GCP_API_KEY || process.env.GEMINI_API_KEY;
    let audioBuffer: Buffer | null = null;

    // 1. If a well-formed Google Cloud API key is present (starts with AIza and has appropriate length), try GCP Text-to-Speech
    if (apiKey && apiKey.startsWith('AIza') && apiKey.length >= 35) {
      try {
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
        
        const payload = {
          input: { text: trimmedText },
          voice: {
            languageCode: 'ja-JP',
            name: 'ja-JP-Neural2-F' // Premium Neural2 female voice
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.95,
            pitch: 0.0
          }
        };

        const apiResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json() as { audioContent?: string };
          if (data.audioContent) {
            audioBuffer = Buffer.from(data.audioContent, 'base64');
          }
        } else {
          console.warn(`GCP Cloud TTS unavailable (status ${apiResponse.status}), switching to high-fidelity TTS fallback.`);
        }
      } catch (err: any) {
        console.warn("GCP Cloud TTS request failed, switching to fallback:", err.message);
      }
    }

    // 2. If GCP Cloud TTS did not return audio (e.g. invalid/restricted/absent API key), seamlessly use Google TTS audio stream
    if (!audioBuffer) {
      try {
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmedText)}&tl=ja&client=tw-ob`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (fallbackRes.ok) {
          const arrayBuffer = await fallbackRes.arrayBuffer();
          audioBuffer = Buffer.from(arrayBuffer);
        } else {
          console.warn(`Google TTS fallback responded with status ${fallbackRes.status}`);
        }
      } catch (err: any) {
        console.warn("TTS stream fallback fetch error:", err.message);
      }
    }

    if (audioBuffer && audioBuffer.length > 0) {
      // Save to memory cache for fast replay
      ttsCache.set(trimmedText, audioBuffer);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(audioBuffer);
    }

    // If both server TTS methods were unavailable, return 503 so client's speech synthesis fallback plays
    return res.status(503).json({
      error: "TTS Service Unavailable",
      message: "Server TTS stream currently unreachable, use client speech synthesis."
    });
  });

  // Determine whether running in production mode
  const isCompiledBundle = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
  const hasDist = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || isCompiledBundle || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    // Dynamic import of Vite ensures vite is never loaded in production containers
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as Express middleware.");
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist'))
      ? path.join(process.cwd(), 'dist')
      : path.join(__dirname, '..', 'dist');

    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`Serving static production assets from ${distPath}.`);
  }

  const DEFAULT_PORT = 3000;
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;

  // 1. Always bind to port 3000 (Required for AI Studio dev container nginx proxy)
  const defaultServer = app.listen(DEFAULT_PORT, '0.0.0.0', () => {
    console.log(`Application server running and listening on port ${DEFAULT_PORT}`);
  });

  defaultServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${DEFAULT_PORT} already in use, proceeding...`);
    } else {
      console.error(`Error on port ${DEFAULT_PORT}:`, err);
    }
  });

  // 2. When deployed to Cloud Run, Cloud Run requires listening on process.env.PORT (typically 8080)
  if (envPort && envPort !== DEFAULT_PORT && !isNaN(envPort)) {
    const cloudRunServer = app.listen(envPort, '0.0.0.0', () => {
      console.log(`Application server also running and listening on Cloud Run PORT ${envPort}`);
    });

    cloudRunServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Cloud Run port ${envPort} already in use, proceeding...`);
      } else {
        console.error(`Error on Cloud Run port ${envPort}:`, err);
      }
    });
  }
}

startServer().catch(err => {
  console.error("Failed to start the application server:", err);
});
