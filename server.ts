import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production' || !process.env.VITE_DEV_SERVER;

// 1. Security Headers Middleware (OWASP recommended)
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (disable intrusive device sensors not needed)
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Content Security Policy (allows Google Fonts, inline scripts for Vite, PWA workers)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://* wss://*",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
    ].join('; ')
  );

  next();
});

// 2. Health Check endpoint for monitoring / Docker / Kubernetes / Cloud Run
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// 3. Static files & Cache Strategy
const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  // Static assets with long-term immutable caching
  app.use(
    '/assets',
    express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    })
  );

  // PWA Service worker and manifest — NO-CACHE so updates take effect immediately
  app.use(
    ['/sw.js', '/registerSW.js', '/manifest.webmanifest'],
    express.static(distPath, {
      maxAge: 0,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      },
    })
  );

  // All other static files (icons, favicon)
  app.use(
    express.static(distPath, {
      maxAge: '1d',
    })
  );

  // SPA fallback: return index.html for all non-file routes
  app.get('*', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist not yet built, serve helpful notice or handle dev
  app.get('*', (req: Request, res: Response) => {
    res.status(503).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Axiom Capital - Building</title></head>
        <body style="background:#090B10; color:#E2E8F0; font-family:sans-serif; text-align:center; padding:50px;">
          <h2>Сборка проекта не найдена</h2>
          <p>Выполните команду <code>npm run build</code> перед запуском сервера.</p>
        </body>
      </html>
    `);
  });
}

// 4. Global Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Server Error]:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Произошла непредвиденная ошибка' : err.message,
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Axiom Capital Server] Running securely on http://0.0.0.0:${PORT}`);
  console.log(`[Mode]: ${process.env.NODE_ENV || 'production'}`);
});
