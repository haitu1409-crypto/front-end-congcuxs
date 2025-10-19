# ✅ CHECKLIST HÀNH ĐỘNG NGAY - CẢI THIỆN SEO

## 🚨 CRITICAL - LÀM NGAY HÔM NAY

### ⏰ Task 1: Fix Sitemap URLs (30 phút)

#### A. Update `.env.local` file
```bash
# Tạo file .env.local trong thư mục root
NEXT_PUBLIC_SITE_URL=https://taodandewukong.pro
NEXT_PUBLIC_API_URL=https://api.taodandewukong.pro
```

#### B. Regenerate sitemap
```bash
# Trong terminal, chạy:
cd c:\webSite_xs\front_end_dande
npm run postbuild
```

#### C. Verify sitemap
```bash
# Kiểm tra file: public/sitemap.xml
# URL phải là: https://taodandewukong.pro (KHÔNG phải localhost)
```

#### D. Upload to server
```bash
# Deploy lại website hoặc upload file sitemap.xml mới
```

---

### ⏰ Task 2: Submit to Search Engines (1 giờ)

#### A. Google Search Console
```
1. Truy cập: https://search.google.com/search-console
2. Add property: taodandewukong.pro
3. Verify ownership (chọn HTML tag method)
4. Copy verification code
5. Paste vào pages/_app.js line 103
6. Deploy website
7. Click "Verify"
8. Submit sitemap: https://taodandewukong.pro/sitemap.xml
```

**Verification code placement:**
```javascript
// pages/_app.js - Line 103
<meta name="google-site-verification" content="PASTE_CODE_HERE" />
```

#### B. Bing Webmaster Tools
```
1. Truy cập: https://www.bing.com/webmasters
2. Add site: taodandewukong.pro
3. Verify với BingSiteAuth.xml hoặc meta tag
4. Copy verification code
5. Paste vào pages/_app.js line 104
6. Deploy
7. Verify
8. Submit sitemap
```

**Verification code placement:**
```javascript
// pages/_app.js - Line 104
<meta name="msvalidate.01" content="PASTE_CODE_HERE" />
```

#### C. Cốc Cốc Webmaster
```
1. Truy cập: https://webmaster.coccoc.com/
2. Đăng ký tài khoản
3. Add site: taodandewukong.pro
4. Verify ownership
5. Copy verification code
6. Paste vào pages/_app.js line 105
7. Deploy
8. Verify
9. Submit sitemap
```

**Verification code placement:**
```javascript
// pages/_app.js - Line 105
<meta name="coccoc-verification" content="PASTE_CODE_HERE" />
```

---

### ⏰ Task 3: Request Indexing (30 phút)

#### A. Google Search Console
```
1. Vào "URL Inspection" tool
2. Nhập: https://taodandewukong.pro
3. Click "Request Indexing"
4. Repeat cho các trang quan trọng:
   - https://taodandewukong.pro/dan-9x0x
   - https://taodandewukong.pro/dan-2d
   - https://taodandewukong.pro/dan-3d4d
   - https://taodandewukong.pro/dan-dac-biet
   - https://taodandewukong.pro/thong-ke
```

#### B. Bing Webmaster
```
1. Vào "URL Submission" tool
2. Submit các URLs quan trọng
```

#### C. IndexNow (Instant Indexing)
```bash
# Submit URL qua IndexNow API (cho Bing, Yandex)
curl https://www.bing.com/indexnow \
  -d '{"host":"taodandewukong.pro","key":"[YOUR_KEY]","urlList":["https://taodandewukong.pro/"]}'
```

---

### ⏰ Task 4: Fix robots.txt (15 phút)

#### Check current robots.txt
```
✅ File hiện tại đã tốt: public/robots.txt
❓ Verify nó đang work:
   - Truy cập: https://taodandewukong.pro/robots.txt
   - Check sitemap URL có đúng production URL không
```

#### If needed, update:
```txt
# Ensure these lines exist:
Sitemap: https://taodandewukong.pro/sitemap.xml
Sitemap: https://taodandewukong.pro/sitemap-0.xml
```

---

## 🔥 HIGH PRIORITY - TUẦN NÀY

### ⏰ Task 5: Add Structured Data (2 giờ)

#### A. Create Organization Schema
```javascript
// components/OrganizationSchema.js
export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dàn Đề Wukong",
    "alternateName": "TaoDanDeWukong",
    "url": "https://taodandewukong.pro",
    "logo": "https://taodandewukong.pro/imgs/wukong.png",
    "description": "Công cụ tạo dàn đề chuyên nghiệp #1 Việt Nam. Miễn phí 100%, không quảng cáo.",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": ["Vietnamese", "vi"]
    },
    "sameAs": [
      "https://facebook.com/taodandewukong",
      "https://youtube.com/@taodandewukong",
      "https://tiktok.com/@taodandewukong"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### B. Add to _app.js
```javascript
// pages/_app.js
import OrganizationSchema from '../components/OrganizationSchema';

// Inside <Head>:
<OrganizationSchema />
```

#### C. Create BreadcrumbList Schema
```javascript
// components/BreadcrumbSchema.js
// Add this to each page with proper breadcrumb
```

#### D. Verify schemas
```
1. Visit: https://search.google.com/test/rich-results
2. Enter URL: https://taodandewukong.pro
3. Check for errors
4. Fix if needed
```

---

### ⏰ Task 6: Create First 2 Blog Posts (4 giờ)

#### Blog Post #1: Comparison with main competitor
```
Title: "Tạo Dàn Đề Wukong vs KangDH: So Sánh Chi Tiết 2025"
Word Count: 2500+ words
Target Keywords:
  - wukong vs kangdh
  - so sánh wukong kangdh
  - kangdh alternative
  - thay thế kangdh

Structure:
1. Introduction (200 words)
2. Quick Overview Table (100 words)
3. Wukong Strengths (500 words)
4. KangDH Weaknesses (400 words)
5. Feature Comparison (600 words)
6. UI/UX Comparison (300 words)
7. When to Choose Each (200 words)
8. FAQ (200 words)
9. Conclusion (100 words)

Include:
- Screenshots
- Comparison table
- Feature matrix
- Schema: FAQPage, HowTo
```

#### Blog Post #2: How-to Guide
```
Title: "Hướng Dẫn Tạo Dàn Đề 9x-0x Chi Tiết Từ A-Z (2025)"
Word Count: 2000+ words
Target Keywords:
  - cách tạo dàn 9x0x
  - hướng dẫn tạo dàn 9x0x
  - tạo dàn 9x0x như thế nào

Structure:
1. Introduction (150 words)
2. What is 9x-0x? (300 words)
3. Step-by-step Guide (1000 words)
4. Tips & Tricks (300 words)
5. Common Mistakes (200 words)
6. FAQ (150 words)

Include:
- Step-by-step screenshots
- Video tutorial (if possible)
- HowTo schema
- FAQPage schema
```

#### File location:
```
Create: pages/blog/[slug].js
Or: pages/huong-dan/[slug].js
```

---

### ⏰ Task 7: Create Social Media Pages (2 giờ)

#### A. Facebook Page
```
1. Create: https://www.facebook.com/pages/create
2. Page Name: "Dàn Đề Wukong"
3. Category: "Software"
4. Description: [Use from seoConfig.js]
5. Profile Picture: wukong.png
6. Cover Photo: Create branded cover
7. Add website link
8. First post: Giới thiệu website
```

#### B. YouTube Channel
```
1. Create: https://www.youtube.com/create_channel
2. Channel Name: "Dàn Đề Wukong"
3. Description: [Use from seoConfig.js]
4. Profile Picture: wukong.png
5. Banner: Create branded banner
6. Add website link
7. First video: "Giới Thiệu Wukong" (2-3 minutes)
```

#### C. TikTok Account
```
1. Create: https://www.tiktok.com/signup
2. Username: @taodandewukong
3. Bio: "Công cụ tạo dàn đề #1 VN 🎯"
4. Profile Picture: wukong.png
5. Add website link
6. First video: Quick tip (15s)
```

---

### ⏰ Task 8: Submit to Directories (2 giờ)

#### A. Vietnamese Directories
```
✅ Submit to:
1. dmoz-odp.org
2. hotfrog.vn
3. cylex.vn
4. vietnamyp.com
5. 24h.com.vn/congcu
6. ...

Information needed:
- Site name: Dàn Đề Wukong
- URL: https://taodandewukong.pro
- Description: [From seoConfig.js]
- Category: Tools / Software / Games
- Keywords: tạo dàn đề, lô đề, ...
```

#### B. Tech Directories
```
✅ Submit to:
1. alternativeto.net
2. producthunt.com (if applicable)
3. saashub.com
4. ...
```

---

## 📊 MEDIUM PRIORITY - TUẦN SAU

### Task 9: Create More Content (8 giờ)

```
Blog Post #3: "Top 5 Alternative to KangDH 2025"
Blog Post #4: "Cách Tạo Dàn 2D Hiệu Quả"
Blog Post #5: "Nuôi Dàn Khung 3 Ngày: Bí Quyết"
```

---

### Task 10: Internal Linking (2 giờ)

```
1. Add "Related Posts" section to all pages
2. Add "You May Also Like" widget
3. Link blog posts to tool pages
4. Link tool pages to blog posts
5. Add breadcrumbs to all pages
```

---

### Task 11: Optimize Images (1 giờ)

```
1. Add alt text to all images
2. Optimize file sizes (compress)
3. Convert to WebP format
4. Add lazy loading
5. Create image sitemap
```

---

## 🎯 ONGOING TASKS - MỖI TUẦN

### Weekly Checklist

#### Monday
```
✅ Check Google Search Console for errors
✅ Review Analytics data (last week)
✅ Plan content for the week
✅ Check competitor updates
```

#### Wednesday
```
✅ Publish new blog post
✅ Share on social media
✅ Engage with comments
✅ Monitor keyword rankings
```

#### Friday
```
✅ Weekly SEO report
✅ Update internal links
✅ Check for broken links
✅ Review backlinks
✅ Plan next week content
```

---

## 📈 TRACKING & VERIFICATION

### Daily Checks (5 phút/ngày)
```
✅ Google Search Console: Errors?
✅ Google Analytics: Traffic trends?
✅ Social Media: New comments?
```

### Weekly Checks (30 phút/tuần)
```
✅ Keyword rankings (top 10 keywords)
✅ Backlinks (new/lost)
✅ Indexing status
✅ Traffic growth
```

### Monthly Audit (2 giờ/tháng)
```
✅ Full technical SEO audit
✅ Content performance review
✅ Competitor analysis
✅ Backlink quality check
✅ Conversion rate optimization
```

---

## 🚀 SUCCESS METRICS

### Week 1 Goals:
```
✅ All technical fixes done
✅ Verified on 3 search engines
✅ 2 blog posts published
✅ 5+ directory submissions
✅ Social media pages created
```

### Month 1 Goals:
```
✅ 10+ blog posts
✅ 10+ backlinks
✅ Indexed on all search engines
✅ 100-200 organic visitors
✅ Rank for 5+ long-tail keywords
```

### Month 3 Goals:
```
✅ 30+ blog posts
✅ 50+ backlinks
✅ 1,000+ organic visitors
✅ Rank in top 20 for main keywords
✅ Start appearing for competitor searches
```

---

## ⚠️ COMMON MISTAKES TO AVOID

```
❌ Don't skip sitemap fix - This is CRITICAL
❌ Don't skip search console verification
❌ Don't spam keywords
❌ Don't buy backlinks
❌ Don't copy competitor content
❌ Don't neglect mobile optimization
❌ Don't forget to submit sitemap
❌ Don't ignore search console errors
```

---

## 📞 NEED HELP?

### Resources:
```
✅ Google Search Console Help: https://support.google.com/webmasters
✅ Bing Webmaster Help: https://www.bing.com/webmasters/help
✅ SEO Guide: /docs/SEO_ANALYSIS_REPORT.md
✅ Competitor Strategy: /docs/COMPETITOR_SEO_STRATEGY.md
```

---

## ✅ PROGRESS TRACKING

### Copy this template to track your progress:

```markdown
## Week 1 Progress

### Monday - Oct 19
- [x] Fix sitemap URLs
- [x] Submit to Google Search Console
- [ ] Submit to Bing
- [ ] Submit to Cốc Cốc

### Tuesday - Oct 20
- [ ] Request indexing (Google)
- [ ] Add structured data
- [ ] Start blog post #1

### Wednesday - Oct 21
- [ ] Finish blog post #1
- [ ] Publish blog post #1
- [ ] Create Facebook page

### Thursday - Oct 22
- [ ] Create YouTube channel
- [ ] Start blog post #2
- [ ] Submit to 5 directories

### Friday - Oct 23
- [ ] Finish blog post #2
- [ ] Publish blog post #2
- [ ] Weekly review

### Weekend - Oct 24-25
- [ ] Plan next week
- [ ] Research keywords
- [ ] Competitor analysis
```

---

**START NOW! 🚀**

First 3 tasks (Fix Sitemap, Submit to Search Engines, Request Indexing) are CRITICAL and should be done today!


