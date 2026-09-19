import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// In-Memory Cache to prevent duplicate GCP TTS API calls for identical words
const ttsCache = new Map<string, Buffer>();

async function startServer() {
  const app = express();

  app.use(express.json());

  // API Route: Health check & Cloud Run probes
  app.get(['/api/health', '/healthz', '/_health'], (req: Request, res: Response) => {
    res.json({ status: 'ok', server: 'full-stack' });
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
