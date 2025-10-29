# Hướng Dẫn Tối Ưu Hình Ảnh - Bài Viết Chi Tiết

## Tổng Quan

Hình ảnh trong bài viết đã được tối ưu để đảm bảo trải nghiệm đọc tốt nhất, không quá to làm mất tập trung, đủ lớn để xem rõ chi tiết.

## Kích Thước Hình Ảnh

### 1. Featured Image (Ảnh Đại Diện)

**Desktop (> 768px):**
- Max-width: **550px** (hình chữ nhật nằm ngang)
- Max-height: **320px**
- Aspect ratio: **16:9**
- Alignment: **center** (căn giữa)
- Object-fit: **cover**

**Tablet (768px - 480px):**
- Max-width: **100%** (full width trong container)
- Max-height: **250px**

**Mobile (< 480px):**
- Max-width: **100%**
- Max-height: **200px**

```css
.featuredImage {
  width: 100%;
  max-width: 550px;  /* Hình chữ nhật vừa phải */
  height: auto;
  max-height: 320px;
  object-fit: cover; /* Giữ tỷ lệ 16:9 */
  border-radius: 4px;
  display: block;
}
```

### 2. Content Images (Hình Ảnh Trong Nội Dung)

**Desktop (> 768px):**
- Max-width: **550px** (cùng kích thước featured image)
- Max-height: **320px** 
- Object-fit: **cover**
- Display: **block**
- Margin: **20px auto** (căn giữa)

**Tablet (768px - 480px):**
- Max-width: **100%**
- Max-height: **250px**

**Mobile (< 480px):**
- Max-width: **100%**
- Max-height: **200px**

```css
/* Desktop */
.articleContent img {
  max-width: 550px;  /* Hình chữ nhật nằm ngang */
  width: 100%;
  height: auto;
  max-height: 320px;
  object-fit: cover;
  margin: 20px auto;
  border-radius: 4px;
  display: block;
}

/* Tablet */
@media (max-width: 768px) {
  .articleContent img {
    max-width: 100%;
    max-height: 250px;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .articleContent img {
    max-width: 100%;
    max-height: 200px;
  }
}
```

## Lý Do Tối Ưu

### 1. Khả Năng Đọc
- Hình ảnh không chiếm toàn bộ màn hình
- Người đọc có thể xem ảnh và đọc text một cách cân bằng
- Giảm sự phân tâm

### 2. Hiệu Suất
- Kích thước hợp lý giảm thời gian tải
- Responsive images cho từng thiết bị
- Lazy loading cho hình phụ

### 3. Trải Nghiệm Người Dùng
- Tương tự các trang tin tức lớn (VnExpress, Tuổi Trẻ)
- Chuyên nghiệp, dễ nhìn
- Không scroll quá nhiều

## So Sánh Trước/Sau

### ❌ Trước (Quá To)
```
Featured Image: 800px (full width) × 450px
Content Images: Không giới hạn, chiều cao lên đến 500-600px
→ Chiếm quá nhiều không gian dọc
→ Mất tập trung khi đọc
→ Phải scroll nhiều
```

### ✅ Sau (Hình Chữ Nhật Nằm - Vừa Vặn)
```
Featured Image: 550px × 320px (16:9 landscape)
Content Images: 550px × 320px max
→ Hình chữ nhật nằm ngang, dễ nhìn
→ Vừa đủ xem rõ chi tiết
→ Cân bằng với nội dung text
→ Giảm scroll, đọc mượt hơn
→ Tương tự VnExpress, Tuổi Trẻ
```

## Next.js Image Component

### Featured Image
```jsx
<Image
  src={article.featuredImage.url}
  alt={article.featuredImage.alt || article.title}
  width={550}          // Hình chữ nhật nằm
  height={310}         // Tỷ lệ 16:9
  className={styles.featuredImage}
  style={{
    width: '100%',
    maxWidth: '550px', // Giới hạn
    height: 'auto',
    aspectRatio: '16/9' // Hình chữ nhật
  }}
  priority             // Tải ngay (LCP optimization)
  itemProp="image"
/>
```

### Related Article Image
```jsx
<Image
  src={article.featuredImage?.url || '/images/default-news.jpg'}
  alt={article.title}
  width={300}
  height={160}
  className={styles.relatedCardImage}
  loading="lazy"       // Lazy load
/>
```

## Breakpoints

| Thiết bị | Breakpoint | Featured Image | Content Images |
|----------|-----------|----------------|----------------|
| Desktop  | > 768px   | 550px × 320px (16:9) | 550px × 320px max |
| Tablet   | 768-480px | 100% × 250px | 100% × 250px |
| Mobile   | < 480px   | 100% × 200px | 100% × 200px |

**Chi tiết:**
- Desktop: Hình chữ nhật nằm ngang, aspect ratio 16:9
- Tablet: Giảm chiều cao để phù hợp màn hình
- Mobile: Tối ưu cho màn hình nhỏ, giảm chiều cao

## Tùy Chỉnh

### Thay đổi kích thước Featured Image

```css
/* In ArticleDetailClassic.module.css */
.featuredImage {
  max-width: 550px;  /* Thay đổi chiều rộng */
  max-height: 320px; /* Thay đổi chiều cao */
  object-fit: cover; /* Giữ aspect ratio */
}
```

### Thay đổi chiều cao Content Images

```css
/* Desktop */
.articleContent img {
  max-width: 550px;  /* Thay đổi chiều rộng */
  max-height: 320px; /* Thay đổi chiều cao */
}

/* Tablet */
@media (max-width: 768px) {
  .articleContent img {
    max-height: 250px; /* Thay đổi chiều cao */
  }
}

/* Mobile */
@media (max-width: 480px) {
  .articleContent img {
    max-height: 200px; /* Thay đổi chiều cao */
  }
}
```

## Best Practices

### ✅ Nên Làm
- Sử dụng Next.js Image component
- Cung cấp width và height
- Sử dụng lazy loading cho hình phụ
- Optimize hình ảnh trước khi upload (WebP, compression)
- Sử dụng alt text mô tả

### ❌ Không Nên
- Upload hình quá lớn (> 2MB)
- Không set width/height (gây layout shift)
- Sử dụng format cũ (BMP, uncompressed PNG)
- Quên lazy loading
- Bỏ qua responsive design

## Công Cụ Optimize

### Online Tools
1. **TinyPNG** - Nén PNG/JPG
2. **Squoosh** - Convert sang WebP
3. **ImageOptim** - Optimize batch

### Format Khuyến Nghị
- **WebP**: Modern, nhẹ, quality tốt
- **JPEG**: Ảnh thực tế, nhiều màu
- **PNG**: Ảnh có chữ, screenshot

### Kích Thước Upload Khuyến Nghị
- Featured Image: **1100x620** (16:9, WebP, quality 80%)
- Content Images: **1100x620 max** (16:9, WebP, quality 75%)
- Thumbnails: **320x180** (16:9, WebP, quality 70%)

**Lưu ý:** Tất cả hình ảnh nên theo tỷ lệ 16:9 (landscape) để hiển thị đẹp và nhất quán.

## Kiểm Tra Performance

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
  - Featured image nên < 100KB
  - Priority loading
  
- **CLS** (Cumulative Layout Shift): < 0.1
  - Luôn set width/height
  - Reserve space với aspect-ratio

### Testing
```bash
# Lighthouse score
npm run build
npm run start
# Open DevTools > Lighthouse > Run audit

# Check image sizes
# DevTools > Network > Filter: Img
```

## Troubleshooting

### Hình ảnh vẫn quá to?
1. Check CSS max-width
2. Check inline styles
3. Clear browser cache
4. Rebuild project

### Hình ảnh bị vỡ layout?
1. Thêm width/height vào Image component
2. Check aspect-ratio CSS
3. Kiểm tra media queries

### Performance chậm?
1. Optimize hình nguồn (compression)
2. Sử dụng WebP
3. Enable lazy loading
4. Kiểm tra CDN

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Related**: ARTICLE_DETAIL_CLASSIC_DESIGN.md

