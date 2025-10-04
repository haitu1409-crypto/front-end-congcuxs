# 🚀 Hướng dẫn Deploy Dự án Tạo Dàn Đề

## Tổng quan

Dự án bao gồm 2 phần:
1. **Backend** (Node.js + Express) - API Server
2. **Frontend** (Next.js) - Web Application

## 📦 Chuẩn bị

### 1. Backend Setup

```bash
cd back_end_dande

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env

# Chỉnh sửa .env với thông tin production
nano .env
```

Cấu hình `.env` cho production:
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Frontend Setup

```bash
cd front_end_dande

# Cài đặt dependencies
npm install

# Tạo file .env.local
cp .env.example .env.local

# Chỉnh sửa .env.local với thông tin production
nano .env.local
```

Cấu hình `.env.local` cho production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NEXT_PUBLIC_SITE_NAME=Tạo Dàn Đề
```

## 🌐 Deploy Options

### Option 1: Deploy trên VPS (Recommended for Full Control)

#### Backend Deploy

```bash
# SSH vào VPS
ssh user@your-vps-ip

# Clone repository
git clone your-repo-url
cd back_end_dande

# Install dependencies
npm install --production

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "dande-api"
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/dande-api

# Add configuration:
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/dande-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d api.your-domain.com
```

#### Frontend Deploy

```bash
# Build frontend
cd front_end_dande
npm run build

# Start with PM2
pm2 start npm --name "dande-frontend" -- start
pm2 save

# Setup Nginx for frontend
sudo nano /etc/nginx/sites-available/dande-frontend

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/dande-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com
```

### Option 2: Deploy Backend trên Render.com

1. Tạo tài khoản tại [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect repository
4. Cấu hình:
   - **Name**: dande-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Thêm từ `.env`

### Option 3: Deploy Frontend trên Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd front_end_dande
vercel

# Set environment variables on Vercel dashboard
# Add: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SITE_NAME

# Deploy to production
vercel --prod
```

### Option 4: Deploy với Docker

#### Backend Dockerfile

Create `back_end_dande/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Frontend Dockerfile

Create `front_end_dande/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./back_end_dande
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - FRONTEND_URL=http://localhost:3000
    restart: unless-stopped

  frontend:
    build: ./front_end_dande
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
      - NEXT_PUBLIC_SITE_URL=http://localhost:3000
    depends_on:
      - backend
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

## 🔒 Security Checklist

- [ ] Enable HTTPS với SSL certificate
- [ ] Cập nhật environment variables
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Enable CORS với domain cụ thể
- [ ] Setup monitoring và logging
- [ ] Regular security updates
- [ ] Backup strategy

## 📊 Monitoring

### Setup PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Setup PM2 Plus for advanced monitoring
pm2 link [secret-key] [public-key]
```

### Health Checks

Backend có sẵn health check endpoint:
```
GET /health
```

Setup monitoring với UptimeRobot hoặc similar service.

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_KEY }}
          script: |
            cd back_end_dande
            git pull
            npm install
            pm2 restart dande-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 🧪 Testing Production

```bash
# Test backend
curl https://api.your-domain.com/health

# Test frontend
curl -I https://your-domain.com

# Test API integration
curl -X POST https://api.your-domain.com/api/dande/generate \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

## 📈 Performance Optimization

### Backend
- Enable compression (đã có sẵn)
- Setup Redis caching (optional)
- Use CDN cho static assets

### Frontend
- Enable CDN với Vercel
- Setup caching headers
- Optimize images
- Enable gzip/brotli compression

## 🔧 Troubleshooting

### Backend issues
```bash
# Check logs
pm2 logs dande-api

# Check status
pm2 status

# Restart
pm2 restart dande-api
```

### Frontend issues
```bash
# Check build
npm run build

# Check logs
vercel logs
```

## 📞 Support

Nếu gặp vấn đề khi deploy, check:
1. Environment variables
2. CORS configuration
3. Network/Firewall rules
4. SSL certificates
5. Node.js version compatibility

## 🎉 Post-Deployment

1. Test tất cả chức năng
2. Setup monitoring alerts
3. Configure automatic backups
4. Document API endpoints
5. Setup analytics
6. Submit sitemap to Google Search Console

---

**Chúc bạn deploy thành công! 🚀**

