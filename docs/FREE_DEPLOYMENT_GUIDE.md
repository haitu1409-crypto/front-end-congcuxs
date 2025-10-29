# 🚀 **HƯỚNG DẪN DEPLOY MIỄN PHÍ**

## 📋 **Tổng quan Platform miễn phí:**

### **Frontend (Next.js) - Deploy miễn phí:**
1. **Vercel** ⭐ (Recommended) - Tốt nhất cho Next.js
2. **Netlify** - Tốt cho static sites
3. **GitHub Pages** - Free hosting
4. **Firebase Hosting** - Google platform

### **Backend (Node.js) - Deploy miễn phí:**
1. **Render** ⭐ (Recommended) - Free tier tốt
2. **Railway** - Modern platform
3. **Cyclic** - Serverless
4. **Heroku** - Classic choice (có giới hạn)

---

## 🎯 **PHƯƠNG PHÁP 1: VERCEL + RENDER (Recommended)**

### **Bước 1: Deploy Backend trên Render.com**

#### 1.1 Chuẩn bị Backend:
```bash
cd back_end_dande

# Tạo file render.yaml
```

Tạo file `render.yaml`:
```yaml
services:
  - type: web
    name: dande-api
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: FRONTEND_URL
        value: https://your-frontend.vercel.app
```

#### 1.2 Deploy trên Render:
1. Đăng ký tại [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Chọn folder `back_end_dande`
5. Cấu hình:
   - **Name**: `dande-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Auto-Deploy**: `Yes`

#### 1.3 Environment Variables trên Render:
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Kết quả**: Backend sẽ có URL như `https://dande-api.onrender.com`

### **Bước 2: Deploy Frontend trên Vercel**

#### 2.1 Chuẩn bị Frontend:
```bash
cd front_end_dande

# Cài đặt Vercel CLI
npm install -g vercel
```

#### 2.2 Deploy trên Vercel:
1. Đăng ký tại [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Chọn folder `front_end_dande`
4. Vercel tự động detect Next.js

#### 2.3 Environment Variables trên Vercel:
```
NEXT_PUBLIC_API_URL=https://dande-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
NEXT_PUBLIC_SITE_NAME=Tạo Dàn Đề Tôn Ngộ Không
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

**Kết quả**: Frontend sẽ có URL như `https://your-project.vercel.app`

---

## 🎯 **PHƯƠNG PHÁP 2: NETLIFY + RAILWAY**

### **Bước 1: Deploy Backend trên Railway**

#### 1.1 Chuẩn bị:
```bash
cd back_end_dande

# Tạo file railway.json
```

Tạo file `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### 1.2 Deploy trên Railway:
1. Đăng ký tại [railway.app](https://railway.app)
2. Click "Deploy from GitHub repo"
3. Chọn repository và folder `back_end_dande`
4. Railway tự động detect Node.js

### **Bước 2: Deploy Frontend trên Netlify**

#### 2.1 Chuẩn bị:
```bash
cd front_end_dande

# Build static export
npm run build
npm run export  # Thêm script này vào package.json
```

Thêm vào `package.json`:
```json
{
  "scripts": {
    "export": "next export"
  }
}
```

#### 2.2 Deploy trên Netlify:
1. Đăng ký tại [netlify.com](https://netlify.com)
2. "New site from Git"
3. Chọn repository và folder `front_end_dande`
4. Build settings:
   - **Build command**: `npm run build && npm run export`
   - **Publish directory**: `out`

---

## 🎯 **PHƯƠNG PHÁP 3: FIREBASE HOSTING + CYCLIC**

### **Bước 1: Deploy Backend trên Cyclic**

#### 1.1 Deploy trên Cyclic:
1. Đăng ký tại [cyclic.sh](https://cyclic.sh)
2. Connect GitHub
3. Chọn folder `back_end_dande`
4. Cyclic tự động deploy

### **Bước 2: Deploy Frontend trên Firebase**

#### 2.1 Setup Firebase:
```bash
cd front_end_dande

# Cài Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Init project
firebase init hosting
```

#### 2.2 Cấu hình Firebase:
Tạo `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

#### 2.3 Deploy:
```bash
npm run build
npm run export
firebase deploy
```

---

## 🎯 **PHƯƠNG PHÁP 4: GITHUB PAGES + HEROKU**

### **Bước 1: Deploy Backend trên Heroku**

#### 1.1 Chuẩn bị:
```bash
cd back_end_dande

# Tạo Procfile
echo "web: node server.js" > Procfile

# Tạo app.json
```

Tạo `app.json`:
```json
{
  "name": "dande-api",
  "description": "API for Dàn Đề application",
  "repository": "https://github.com/your-username/your-repo",
  "logo": "https://your-logo-url.com",
  "keywords": ["node", "express", "api"],
  "image": "heroku/nodejs"
}
```

#### 1.2 Deploy trên Heroku:
1. Đăng ký tại [heroku.com](https://heroku.com)
2. Tạo new app
3. Connect GitHub
4. Deploy từ branch `main`

### **Bước 2: Deploy Frontend trên GitHub Pages**

#### 2.1 Cấu hình Next.js cho GitHub Pages:
Cập nhật `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
}
```

#### 2.2 GitHub Actions:
Tạo `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: front_end_dande/package-lock.json
      
      - name: Install dependencies
        run: |
          cd front_end_dande
          npm install
      
      - name: Build
        run: |
          cd front_end_dande
          npm run build
        env:
          NEXT_PUBLIC_API_URL: https://your-heroku-app.herokuapp.com
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./front_end_dande/out
```

---

## 🔧 **Cấu hình chi tiết cho mỗi platform:**

### **Environment Variables cần thiết:**

#### Backend (.env):
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MONGODB_URI=your-mongodb-connection-string
```

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NEXT_PUBLIC_SITE_NAME=Tạo Dàn Đề Tôn Ngộ Không
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

---

## 📊 **So sánh các platform:**

| Platform | Free Tier | Bandwidth | Build Time | Uptime | Best For |
|----------|-----------|-----------|------------|--------|----------|
| **Vercel** | 100GB | 100GB | Unlimited | 99.9% | Next.js |
| **Netlify** | 100GB | 100GB | 300 min | 99.9% | Static sites |
| **Render** | 750 hours | Unlimited | 500 hours | 99.9% | Node.js |
| **Railway** | $5 credit | Unlimited | Unlimited | 99.9% | Full-stack |
| **Cyclic** | Unlimited | Unlimited | Unlimited | 99.9% | Serverless |
| **Heroku** | 550 hours | 2TB | 500 hours | 99.9% | Traditional |
| **Firebase** | 10GB | 10GB | Unlimited | 99.95% | Google ecosystem |
| **GitHub Pages** | 1GB | 100GB | 2000 min | 99.9% | Static sites |

---

## 🚀 **RECOMMENDED SETUP (Best Performance):**

### **Option A: Vercel + Render**
- ✅ **Frontend**: Vercel (tối ưu cho Next.js)
- ✅ **Backend**: Render (free tier tốt)
- ✅ **Database**: MongoDB Atlas (free tier)
- ✅ **CDN**: Vercel Edge Network
- ✅ **SSL**: Tự động
- ✅ **Uptime**: 99.9%

### **Option B: Netlify + Railway**
- ✅ **Frontend**: Netlify (static export)
- ✅ **Backend**: Railway (modern platform)
- ✅ **Database**: MongoDB Atlas
- ✅ **CDN**: Netlify CDN
- ✅ **SSL**: Tự động
- ✅ **Uptime**: 99.9%

---

## 🔒 **Security & Performance:**

### **Security Checklist:**
- ✅ HTTPS enabled (tự động)
- ✅ CORS configured
- ✅ Rate limiting enabled
- ✅ Environment variables secured
- ✅ Input validation
- ✅ Error handling

### **Performance Optimization:**
- ✅ CDN enabled
- ✅ Gzip compression
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Caching headers

---

## 📈 **Monitoring & Analytics:**

### **Free Monitoring Tools:**
1. **UptimeRobot** - Website monitoring
2. **Google Analytics** - Traffic analysis
3. **Google Search Console** - SEO monitoring
4. **Vercel Analytics** - Performance metrics
5. **Render Dashboard** - Backend monitoring

### **Setup Instructions:**
```javascript
// Google Analytics setup
// Add to _app.js
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

---

## 🎯 **Quick Start Commands:**

### **Deploy với Vercel + Render:**
```bash
# 1. Setup Backend trên Render
# - Upload code lên GitHub
# - Connect GitHub với Render
# - Set environment variables

# 2. Setup Frontend trên Vercel
cd front_end_dande
npm install -g vercel
vercel login
vercel
# Set environment variables trên Vercel dashboard
vercel --prod
```

### **Deploy với Netlify + Railway:**
```bash
# 1. Setup Backend trên Railway
# - Connect GitHub với Railway
# - Deploy từ folder back_end_dande

# 2. Setup Frontend trên Netlify
cd front_end_dande
npm run build
npm run export
# Upload folder 'out' lên Netlify
```

---

## 🎉 **Post-Deployment Checklist:**

### **Testing:**
- ✅ Backend API endpoints working
- ✅ Frontend loading correctly
- ✅ Database connections
- ✅ CORS configuration
- ✅ SSL certificates
- ✅ Mobile responsiveness

### **SEO Setup:**
- ✅ Google Search Console
- ✅ Sitemap submission
- ✅ Analytics tracking
- ✅ Social media previews
- ✅ Performance monitoring

### **Maintenance:**
- ✅ Regular backups
- ✅ Security updates
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ User feedback

---

## 🆘 **Troubleshooting:**

### **Common Issues:**
1. **CORS errors**: Check FRONTEND_URL in backend
2. **Build failures**: Check Node.js version compatibility
3. **Environment variables**: Verify all required vars are set
4. **Database connections**: Check MongoDB connection string
5. **SSL issues**: Wait for certificate propagation

### **Support Resources:**
- 📚 [Vercel Documentation](https://vercel.com/docs)
- 📚 [Render Documentation](https://render.com/docs)
- 📚 [Netlify Documentation](https://docs.netlify.com)
- 📚 [Railway Documentation](https://docs.railway.app)

---

**🎯 RECOMMENDATION: Sử dụng Vercel + Render cho setup tốt nhất!**

**🚀 Chúc bạn deploy thành công!**
