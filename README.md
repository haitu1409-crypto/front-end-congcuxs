# Frontend - Tạo Dàn Đề

Frontend application cho công cụ tạo dàn đề, được xây dựng với Next.js và tối ưu hóa cho SEO và hiệu suất.

## 🚀 Tính năng

- ✅ Giao diện hiện đại, responsive trên mọi thiết bị
- ✅ Tối ưu SEO với meta tags đầy đủ
- ✅ PWA-ready với manifest.json
- ✅ Code splitting tự động với Next.js
- ✅ Sitemap tự động
- ✅ robots.txt
- ✅ Structured Data (JSON-LD)
- ✅ Tối ưu hóa hiệu suất với compression
- ✅ Lazy loading images
- ✅ API fallback (hoạt động ngay cả khi backend lỗi)
- ✅ Smooth animations và transitions
- ✅ Dark mode gradient background

## 📋 Yêu cầu hệ thống

- Node.js >= 18.0.0
- npm hoặc yarn

## 🔧 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Copy file .env.example thành .env.local và cấu hình
cp .env.example .env.local
```

## 🌐 Cấu hình Environment

Tạo file `.env.local` với các biến môi trường sau:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Tạo Dàn Đề
```

## 🏃 Chạy ứng dụng

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate sitemap
npm run postbuild
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 🏗️ Cấu trúc thư mục

```
front_end_dande/
├── components/
│   ├── DanDeGenerator.js      # Component chính tạo dàn đề
│   └── SEO.js                  # SEO component với meta tags
├── pages/
│   ├── _app.js                 # Custom App
│   ├── _document.js            # Custom Document
│   └── index.js                # Homepage
├── styles/
│   ├── globals.css             # Global styles
│   ├── Home.module.css         # Home page styles
│   └── DanDeGenerator.module.css  # Generator component styles
├── public/
│   ├── robots.txt              # Robots file
│   ├── manifest.json           # PWA manifest
│   └── favicon.ico             # Favicon
├── next.config.js              # Next.js configuration
├── next-sitemap.config.js      # Sitemap configuration
└── package.json
```

## 🎨 Design Features

### Gradient Background
- Beautiful purple gradient background
- Glassmorphism effects
- Smooth animations

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly buttons

### Modern UI/UX
- Card-based layout
- Smooth transitions
- Loading states
- Error handling
- Modal notifications
- Copy to clipboard functionality

## 🔍 SEO Optimization

### Meta Tags
- Title tags
- Description tags
- Keywords
- Open Graph (Facebook)
- Twitter Cards
- Canonical URLs

### Structured Data
- JSON-LD schema
- WebApplication type
- AggregateRating
- Offers

### Technical SEO
- Sitemap.xml
- robots.txt
- Semantic HTML
- Alt tags for images
- Fast loading time
- Mobile-friendly

## ⚡ Performance Optimization

### Next.js Features
- Automatic code splitting
- Image optimization
- Font optimization
- Pre-rendering (SSG/SSR)

### Custom Optimizations
- Compression enabled
- Lazy loading
- Debounced API calls
- Efficient re-renders
- CSS modules (scoped styles)
- Minimal bundle size

### Loading Performance
- FCP (First Contentful Paint): < 1.8s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3.8s
- CLS (Cumulative Layout Shift): < 0.1

## 🛡️ Security Headers

- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- DNS Prefetch Control

## 📱 PWA Support

- Manifest.json
- Service worker ready
- Installable app
- Offline capability (can be added)

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🔄 API Integration

### Endpoints Used
- POST `/api/dande/generate` - Tạo dàn đề

### Fallback Strategy
Nếu API không khả dụng, ứng dụng sẽ tự động chuyển sang tạo dàn đề ở client-side, đảm bảo UX mượt mà.

## 📊 Analytics Ready

Component đã sẵn sàng tích hợp:
- Google Analytics
- Facebook Pixel
- Custom tracking events

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build test
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t front-end-dande .
docker run -p 3000:3000 front-end-dande
```

### Static Export
```bash
# Add to package.json scripts
"export": "next build && next export"

# Run export
npm run export
```

## 🎨 Customization

### Colors
Chỉnh sửa gradient colors trong `styles/globals.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Fonts
Thêm fonts trong `pages/_document.js`:
```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font&display=swap" rel="stylesheet" />
```

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Save history to database
- [ ] Share dàn đề via URL
- [ ] Export to PDF
- [ ] Statistics dashboard
- [ ] Multiple themes
- [ ] Internationalization (i18n)

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@example.com or create an issue.

