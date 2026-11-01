# Руководство по развертыванию Axiom Capital

Проект полностью оптимизирован и готов к запуску в production на любом сервере (VPS / Docker / PaaS).

---

## 1. Запуск через Docker (Рекомендуемый способ)

В проекте уже настроен защищенный multi-stage `Dockerfile` (образ на Alpine Linux, запуск от непривилегированного пользователя `node` без root-прав, автоматический healthcheck).

### Запуск одной командой:
```bash
docker compose up -d --build
```

Сервер запустится на порту `3000` (http://localhost:3000).

---

## 2. Запуск на обычном сервере / VPS (Ubuntu, Debian)

### Шаг 1: Установка зависимостей и сборка
```bash
npm install
npm run build
```

### Шаг 2: Запуск в фоновом режиме через PM2
```bash
npm install -g pm2
pm2 start server.ts --interpreter tsx --name "axiom-capital"
pm2 save
pm2 startup
```

---

## 3. Настройка Nginx с SSL (HTTPS) и обратным прокси

Пример конфигурации `/etc/nginx/sites-available/axiom`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL сертификаты (Certbot Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Сжатие Gzip для ускорения
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. Архитектура безопасности, включенная в проект

1. **Защитные заголовки OWASP**:
   - `Content-Security-Policy (CSP)` — защита от внедрения вредоносных скриптов.
   - `X-Content-Type-Options: nosniff` — защита от MIME-спуфинга.
   - `X-Frame-Options: SAMEORIGIN` — защита от Clickjacking.
   - `Permissions-Policy` — блокировка доступа к неиспользуемым датчикам устройства (микрофон, камера, геолокация).
2. **Кэширование и PWA**:
   - Статические ассеты (`/assets/*`) кэшируются с параметром `immutable` на 1 год.
   - `sw.js` и `index.html` отдаются с директивой `no-cache`, чтобы обновления мгновенно доходили до пользователей без задержек.
3. **Мониторинг здоровья**:
   - Эндпоинт `GET /health` возвращает статус сервера, время непрерывной работы (uptime) и timestamp.
