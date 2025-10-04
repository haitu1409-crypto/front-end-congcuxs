# 🌐 Hướng dẫn tích hợp tên miền Hostinger

## 📋 Thông tin cần thiết:
- **Domain:** yourdomain.com
- **Frontend:** Vercel
- **Backend:** Render
- **DNS:** Hostinger

## 🎯 BƯỚC 1: CẤU HÌNH DNS TRÊN HOSTINGER

### 1.1 Truy cập DNS Management:
1. Login vào Hostinger control panel
2. Chọn domain bạn muốn sử dụng
3. Click "DNS Zone Editor" hoặc "Manage DNS"

### 1.2 Thêm DNS Records:

#### Cho Frontend (Vercel):
```
Type: A
Name: @ (hoặc để trống)
Value: 76.76.19.61
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### Cho Backend (Render):
```
Type: CNAME
Name: api
Value: your-backend-name.onrender.com
TTL: 3600

Type: CNAME
Name: backend
Value: your-backend-name.onrender.com
TTL: 3600
```

## 🚀 BƯỚC 2: CẤU HÌNH VERCEL (FRONTEND)

### 2.1 Thêm Custom Domain:
1. Truy cập Vercel Dashboard
2. Chọn project frontend
3. Click "Settings" → "Domains"
4. Click "Add Domain"
5. Nhập domain: `yourdomain.com`
6. Click "Add"

### 2.2 Verify Domain:
Vercel sẽ hiển thị DNS records cần thêm. Thêm vào Hostinger:
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2.3 Update Environment Variables:
Trong Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## ⚙️ BƯỚC 3: CẤU HÌNH RENDER (BACKEND)

### 3.1 Thêm Custom Domain:
1. Truy cập Render Dashboard
2. Chọn service backend
3. Click "Settings" → "Custom Domains"
4. Click "Add Custom Domain"
5. Nhập: `api.yourdomain.com`
6. Click "Add"

### 3.2 Update DNS:
Thêm vào Hostinger:
```
Type: CNAME
Name: api
Value: your-backend-name.onrender.com
```

### 3.3 Update Environment Variables:
Trong Render Dashboard → Environment:
```
FRONTEND_URL=https://yourdomain.com
```

## 🔧 BƯỚC 4: CẤU HÌNH NEXT.JS

### 4.1 Update next.config.js:
```javascript
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
```

### 4.2 Update API endpoints:
Trong `config/api.js`:
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com';

export const API_ENDPOINTS = {
  // ... existing endpoints
  BASE_URL: API_BASE_URL,
};
```

## 📊 BƯỚC 5: KIỂM TRA VÀ TEST

### 5.1 Test DNS Propagation:
```bash
# Test A record
nslookup yourdomain.com

# Test CNAME record
nslookup api.yourdomain.com
```

### 5.2 Test SSL Certificates:
- Vercel tự động cấp SSL cho custom domain
- Render tự động cấp SSL cho custom domain

### 5.3 Test Integration:
1. Truy cập: `https://yourdomain.com`
2. Test API: `https://api.yourdomain.com/health`
3. Test tạo dàn đề từ frontend

## 🔒 BƯỚC 6: BẢO MẬT VÀ TỐI ƯU

### 6.1 Security Headers:
Đã cấu hình trong `next.config.js` và `vercel.json`

### 6.2 CORS Configuration:
Trong backend, cập nhật CORS:
```javascript
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 6.3 Rate Limiting:
Đã cấu hình trong backend với Render

## 📈 BƯỚC 7: MONITORING VÀ ANALYTICS

### 7.1 Google Analytics:
Cập nhật domain trong Google Analytics

### 7.2 Search Console:
Submit sitemap với domain mới:
```
https://yourdomain.com/sitemap.xml
```

### 7.3 Uptime Monitoring:
Setup monitoring cho:
- `https://yourdomain.com`
- `https://api.yourdomain.com/health`

## 🎯 KẾT QUẢ CUỐI CÙNG:

### URLs:
- **Frontend:** `https://yourdomain.com`
- **Backend API:** `https://api.yourdomain.com`
- **Admin Panel:** `https://yourdomain.com/admin` (nếu có)

### SSL:
- ✅ Automatic SSL từ Vercel
- ✅ Automatic SSL từ Render
- ✅ HTTPS redirect

### Performance:
- ✅ CDN từ Vercel
- ✅ Edge caching
- ✅ Image optimization

## 🆘 TROUBLESHOOTING:

### DNS không hoạt động:
1. Kiểm tra DNS propagation: https://dnschecker.org
2. Wait 24-48 hours cho DNS propagation
3. Clear DNS cache

### SSL không hoạt động:
1. Kiểm tra domain verification
2. Wait cho SSL certificate generation
3. Check DNS records

### CORS errors:
1. Kiểm tra FRONTEND_URL trong backend
2. Verify CORS configuration
3. Check API endpoints

---

**🎉 Chúc mừng! Dự án đã có tên miền riêng!**
