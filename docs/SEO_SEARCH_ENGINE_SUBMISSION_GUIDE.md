# Hướng Dẫn Submit Sitemap Cho Nhiều Search Engines

Hướng dẫn chi tiết để submit sitemap của website **taodandewukong.pro** lên các search engines chính: Google, Bing, Cốc Cốc.

## 📋 Mục Lục

1. [Google Search Console](#1-google-search-console)
2. [Bing Webmaster Tools](#2-bing-webmaster-tools)
3. [Cốc Cốc Webmaster](#3-cốc-cốc-webmaster)
4. [Kiểm Tra Sitemap](#4-kiểm-tra-sitemap)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Google Search Console

### Bước 1: Đăng Ký & Verify Website

1. Truy cập: https://search.google.com/search-console
2. Click **"Add Property"** hoặc **"Thêm thuộc tính"**
3. Chọn **"URL prefix"** và nhập: `https://taodandewukong.pro`
4. Verify ownership bằng một trong các cách:
   - **HTML File** (Khuyến nghị): Download file và upload vào `/public`
   - **HTML Tag**: Thêm meta tag vào `pages/_app.js`
   - **Google Analytics**: Nếu đã cài GA
   - **DNS Record**: Thêm TXT record vào domain

**Ví dụ HTML Tag:**
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Bước 2: Submit Sitemap

1. Sau khi verify, vào **Sitemaps** trong menu bên trái
2. Nhập URL sitemap: `https://taodandewukong.pro/sitemap.xml`
3. Click **"Submit"**
4. Đợi Google crawl (có thể mất vài ngày)

### Bước 3: Submit Individual Sitemaps (Optional)

Google hỗ trợ sitemap index, bạn có thể submit từng sitemap riêng:

```
https://taodandewukong.pro/sitemap-0.xml
https://taodandewukong.pro/server-sitemap.xml
```

### Bước 4: Kiểm Tra Coverage

1. Vào **Coverage** (Phạm vi bao phủ)
2. Kiểm tra **Valid** pages
3. Fix các **Error** hoặc **Warning** nếu có

---

## 2. Bing Webmaster Tools

### Bước 1: Đăng Ký & Verify Website

1. Truy cập: https://www.bing.com/webmasters
2. Click **"Add a Site"**
3. Nhập: `https://taodandewukong.pro`
4. Verify bằng một trong các cách:
   - **XML File**: Upload file BingSiteAuth.xml vào `/public`
   - **Meta Tag**: Thêm vào `<head>` của website
   - **CNAME Record**: Thêm DNS record

**Ví dụ Meta Tag:**
```html
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
```

### Bước 2: Import từ Google Search Console (Nhanh hơn)

1. Click **"Import from Google Search Console"**
2. Authorize Bing truy cập Google account
3. Chọn property cần import
4. Bing sẽ tự động import sitemap và data

### Bước 3: Submit Sitemap Manually (Nếu không import)

1. Vào **Sitemaps** trong Dashboard
2. Nhập URL: `https://taodandewukong.pro/sitemap.xml`
3. Click **"Submit"**

### Bước 4: Cấu Hình Crawl Settings

1. Vào **Crawl Control**
2. Set **Crawl rate**: Normal hoặc Increase
3. Vào **Block URLs** để block `/api/*`, `/_next/*` (optional)

### Bước 5: Submit URL Inspection

Để Bing crawl nhanh hơn, submit từng page quan trọng:

1. Vào **URL Inspection**
2. Nhập URL: `https://taodandewukong.pro/`
3. Click **"Request Indexing"**

Làm tương tự cho các pages quan trọng:
- `/dan-9x0x`
- `/dan-2d`
- `/dan-3d4d`
- `/dan-dac-biet`

---

## 3. Cốc Cốc Webmaster

### Bước 1: Đăng Ký Webmaster

1. Truy cập: https://webmaster.coccoc.com
2. Đăng nhập bằng tài khoản Cốc Cốc (hoặc tạo mới)
3. Click **"Thêm website"**
4. Nhập: `https://taodandewukong.pro`

### Bước 2: Verify Website

Cốc Cốc hỗ trợ 2 cách verify:

**Cách 1: HTML File**
1. Download file `coccoc_verify_XXXXX.html`
2. Upload vào thư mục `/public`
3. Verify bằng URL: `https://taodandewukong.pro/coccoc_verify_XXXXX.html`

**Cách 2: Meta Tag**
```html
<meta name="coccoc-verification" content="YOUR_COCCOC_CODE" />
```

### Bước 3: Submit Sitemap

1. Sau khi verify, vào **Sơ đồ trang web** (Sitemap)
2. Nhập URL: `https://taodandewukong.pro/sitemap.xml`
3. Click **"Gửi"**

### Bước 4: Tối Ưu Cho Cốc Cốc

Cốc Cốc ưu tiên nội dung tiếng Việt chất lượng:

1. Đảm bảo có nhiều **keyword variations** tiếng Việt (có dấu + không dấu)
2. Nội dung phải **phù hợp với người Việt**
3. Tốc độ tải trang nhanh (< 2s)
4. Mobile-friendly

### Bước 5: Submit URL Nhanh (Optional)

Cốc Cốc cho phép submit URL từng cái để crawl nhanh:

1. Vào **Gửi URL**
2. Nhập URL cần index
3. Click **"Gửi yêu cầu"**

---

## 4. Kiểm Tra Sitemap

### Kiểm Tra Syntax

Sử dụng công cụ online:
- https://www.xml-sitemaps.com/validate-xml-sitemap.html
- https://validator.w3.org/

### Kiểm Tra Local

```bash
# Truy cập sitemap
https://taodandewukong.pro/sitemap.xml

# Kiểm tra robots.txt
https://taodandewukong.pro/robots.txt
```

### Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://taodandewukong.pro/</loc>
    <lastmod>2025-01-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://taodandewukong.pro/dan-9x0x</loc>
    <lastmod>2025-01-13</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- More URLs... -->
</urlset>
```

---

## 5. Troubleshooting

### Lỗi: "Sitemap cannot be read"

**Nguyên nhân:**
- File sitemap bị lỗi syntax XML
- Server trả về HTTP error (404, 500)
- Robots.txt block sitemap

**Giải pháp:**
1. Kiểm tra sitemap syntax: https://www.xml-sitemaps.com/validate-xml-sitemap.html
2. Kiểm tra HTTP status: `curl -I https://taodandewukong.pro/sitemap.xml`
3. Kiểm tra robots.txt không block sitemap:

```txt
# robots.txt
User-agent: *
Allow: /
Sitemap: https://taodandewukong.pro/sitemap.xml
```

### Lỗi: "Pages not indexed"

**Nguyên nhân:**
- Canonical tag sai
- Noindex meta tag
- Robots.txt block
- Low quality content

**Giải pháp:**
1. Kiểm tra canonical URL trên mỗi page
2. Kiểm tra không có `<meta name="robots" content="noindex" />`
3. Sử dụng URL Inspection để debug
4. Cải thiện nội dung, thêm keyword variations

### Lỗi: "Crawl errors"

**Nguyên nhân:**
- Server timeout
- SSL certificate issues
- Broken links

**Giải pháp:**
1. Tăng server timeout
2. Kiểm tra SSL certificate: https://www.ssllabs.com/ssltest/
3. Fix broken links bằng tool: https://validator.w3.org/checklink

---

## 6. Monitoring & Optimization

### Theo Dõi Performance

**Google Search Console:**
- **Performance** > Check impressions, clicks, CTR
- **Coverage** > Fix errors & warnings
- **Core Web Vitals** > Optimize LCP, FID, CLS

**Bing Webmaster:**
- **SEO Reports** > Check issues
- **Search Performance** > Track rankings
- **Crawl Information** > Monitor crawl stats

**Cốc Cốc Webmaster:**
- **Thống kê truy cập** > Check traffic from Cốc Cốc
- **Từ khóa** > Monitor keyword rankings

### Tối Ưu Keyword Variations

Đảm bảo mỗi page có đủ keyword variations trong:
- **Title tag**
- **Meta description**
- **H1, H2 headings**
- **Content body**
- **Alt text images**

Ví dụ cho homepage:
```html
<title>Tạo Dàn Đề Wukong (Tao Dan De) | Ứng Dụng Tạo Mức Số 2025</title>
<meta name="description" content="Tạo dàn đề (tao dan de) online miễn phí. Công cụ tạo dàn số, mức số chuyên nghiệp. Hỗ trợ: taodande, tạo dàn số, lô đề." />
<meta name="keywords" content="tạo dàn đề wukong, tao dan de wukong, taodandewukong, tạo dàn số, tao dan so, lô đề, lo de, dàn đề, dan de" />
```

---

## 7. Timeline Expectations

| Search Engine | Verification | First Crawl | Full Index | Ranking |
|---------------|--------------|-------------|------------|---------|
| Google        | 1-2 ngày     | 1-3 ngày    | 1-2 tuần   | 2-4 tuần |
| Bing          | 1-2 ngày     | 3-7 ngày    | 2-4 tuần   | 4-8 tuần |
| Cốc Cốc       | 1-3 ngày     | 3-10 ngày   | 2-4 tuần   | 4-12 tuần |

**Lưu ý:**
- Timeline có thể khác nhau tùy thuộc vào domain authority
- Website mới cần thời gian dài hơn để được index đầy đủ
- Nên tạo backlinks chất lượng để tăng tốc độ index

---

## 8. Checklist

### Pre-Submission Checklist

- [ ] Sitemap.xml đã được generate đúng
- [ ] Robots.txt cho phép crawl
- [ ] Tất cả pages có canonical URL
- [ ] Meta tags đầy đủ (title, description, keywords)
- [ ] Schema markup (JSON-LD) đầy đủ
- [ ] SSL certificate valid
- [ ] Mobile-friendly test passed
- [ ] Page speed < 3s
- [ ] No broken links

### Post-Submission Checklist

- [ ] Verified ownership trên Google Search Console
- [ ] Verified ownership trên Bing Webmaster
- [ ] Verified ownership trên Cốc Cốc Webmaster
- [ ] Submitted sitemap.xml
- [ ] No errors trong Coverage/Index
- [ ] Monitoring tools setup (Google Analytics, etc.)

---

## 9. Resources

### Official Documentation

- **Google:** https://developers.google.com/search/docs
- **Bing:** https://www.bing.com/webmasters/help
- **Cốc Cốc:** https://help.coccoc.com/webmaster

### SEO Tools

- **Sitemap Generator:** https://www.xml-sitemaps.com/
- **Robots.txt Tester:** https://support.google.com/webmasters/answer/6062598
- **Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Schema Markup Validator:** https://validator.schema.org/

---

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- Email: support@taodandewukong.pro
- Documentation: https://taodandewukong.pro/docs

---

**Last Updated:** 2025-01-13
**Version:** 1.0.0










