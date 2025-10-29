# Tối Ưu Hình Ảnh Bài Viết - Phiên Bản Cuối Cùng

## Tổng Quan

Hình ảnh được tối ưu để **hiển thị đầy đủ** và **vừa vặn**, không bị cắt xén, phù hợp với phong cách trang tin tức cổ điển.

## Nguyên Tắc Thiết Kế

### ✅ Ưu Tiên
1. **Hiển thị đầy đủ** - Không cắt, không crop hình ảnh
2. **Tỷ lệ gốc** - Giữ nguyên aspect ratio của ảnh
3. **Kích thước vừa phải** - Không quá to, không quá nhỏ
4. **Căn giữa** - Professional và dễ nhìn

### ❌ Tránh
- ~~Object-fit: cover~~ (cắt mất một phần ảnh)
- ~~Max-height cứng~~ (bóp méo ảnh)
- ~~Force aspect ratio~~ (không linh hoạt)

## Kích Thước Hình Ảnh

### Featured Image (Ảnh Đại Diện)

```css
.featuredImage {
  width: 100%;
  max-width: 600px;      /* Giới hạn chiều rộng */
  height: auto;          /* Tự động theo tỷ lệ gốc */
  object-fit: contain;   /* Hiển thị đầy đủ */
  border-radius: 4px;
  display: block;
}
```

**Đặc điểm:**
- Desktop: max 600px width
- Chiều cao: tự động theo tỷ lệ ảnh gốc
- Căn giữa trang
- Hiển thị 100% nội dung ảnh

### Content Images (Hình Trong Bài Viết)

```css
.articleContent img {
  max-width: 600px;      /* Giới hạn chiều rộng */
  width: auto;           /* Tự động */
  height: auto;          /* Tự động theo tỷ lệ */
  margin: 20px auto;     /* Căn giữa */
  border-radius: 4px;
  display: block;
}
```

**Đặc điểm:**
- Max 600px width
- Tự động scale theo tỷ lệ gốc
- Không bị cắt hoặc méo
- Căn giữa

## Responsive Design

### Desktop (> 768px)
```
Max Width: 600px
Height: Auto (theo tỷ lệ gốc)
```

### Tablet & Mobile (≤ 768px)
```
Max Width: 100% (full container width)
Height: Auto (theo tỷ lệ gốc)
```

## Next.js Image Component

```jsx
<Image
  src={article.featuredImage.url}
  alt={article.featuredImage.alt || article.title}
  width={600}           // Base width
  height={400}          // Base height (3:2 common ratio)
  className={styles.featuredImage}
  style={{
    width: '100%',
    maxWidth: '600px',  // Limit max width
    height: 'auto'      // Auto height maintains ratio
  }}
  priority              // LCP optimization
  itemProp="image"
/>
```

## So Sánh Các Phiên Bản

### Version 1.0 (Quá To)
```
Width: 700-800px
Height: 400-500px
→ Quá lớn, chiếm nhiều không gian
```

### Version 2.0 (Bị Cắt)
```
Width: 550px
Height: 320px (max)
Object-fit: cover
→ Bị cắt mất một phần hình ảnh
→ Không hiển thị đầy đủ
```

### Version 3.0 (Tối Ưu) ✅
```
Width: 600px (max)
Height: Auto (theo tỷ lệ gốc)
Object-fit: contain
→ Hiển thị đầy đủ 100% hình ảnh
→ Vừa vặn, không quá to
→ Giữ nguyên tỷ lệ gốc
```

## Ví Dụ Cụ Thể

### Ảnh Landscape (16:9)
```
Original: 1920×1080
Display: 600×337 (giữ tỷ lệ 16:9)
```

### Ảnh Portrait (2:3)
```
Original: 800×1200
Display: 600×900 (giữ tỷ lệ 2:3)
```

### Ảnh Square (1:1)
```
Original: 1000×1000
Display: 600×600 (giữ tỷ lệ 1:1)
```

## CSS Code Hoàn Chỉnh

```css
/* Featured Image */
.featuredImageWrapper {
  padding: 0 30px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.featuredImage {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 4px;
  display: block;
  object-fit: contain;
}

.imageCaption {
  font-size: 13px;
  color: #757575;
  font-style: italic;
  margin-top: 8px;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* Content Images */
.articleContent img {
  max-width: 600px;
  width: auto;
  height: auto;
  margin: 20px auto;
  border-radius: 4px;
  display: block;
}

/* Tablet & Mobile */
@media (max-width: 768px) {
  .featuredImage {
    max-width: 100%;
  }

  .articleContent img {
    max-width: 100%;
  }
}
```

## Lợi Ích

### 1. Hiển Thị Đầy Đủ
- ✅ Không bị cắt
- ✅ Không bị méo
- ✅ Hiện 100% nội dung ảnh

### 2. Tối Ưu Kích Thước
- ✅ Giới hạn max 600px (vừa vặn)
- ✅ Không quá to làm mất tập trung
- ✅ Đủ lớn để xem rõ chi tiết

### 3. Linh Hoạt
- ✅ Hỗ trợ mọi tỷ lệ ảnh (16:9, 4:3, 1:1, portrait...)
- ✅ Tự động scale theo ảnh gốc
- ✅ Responsive tốt

### 4. Performance
- ✅ Next.js Image optimization
- ✅ Lazy loading
- ✅ Proper width/height attributes

## Khuyến Nghị Upload

### Kích Thước Lý Tưởng
- Width: 1200-1600px
- Height: Tùy theo nội dung (giữ tỷ lệ tự nhiên)
- Format: WebP
- Quality: 80-85%

### Tỷ Lệ Phổ Biến
- **Landscape (16:9)**: 1600×900 - Tốt nhất cho hầu hết bài viết
- **Standard (3:2)**: 1500×1000 - Cân bằng
- **Portrait (2:3)**: 1000×1500 - Cho ảnh dọc
- **Square (1:1)**: 1200×1200 - Cho infographic

## Testing Checklist

- [x] Hình ảnh hiển thị đầy đủ (không bị cắt)
- [x] Giữ nguyên tỷ lệ gốc
- [x] Max width 600px trên desktop
- [x] Full width 100% trên mobile
- [x] Caption căn giữa dưới ảnh
- [x] Không có layout shift
- [x] Responsive tốt trên mọi thiết bị
- [x] Next.js Image optimization hoạt động

## Files Updated

1. ✅ `styles/ArticleDetailClassic.module.css`
   - Featured Image: max-width 600px, height auto, object-fit contain
   - Content Images: max-width 600px, height auto
   - Responsive: 100% width trên mobile

2. ✅ `pages/tin-tuc/[slug].js`
   - Image component: width 600, height 400
   - Style: maxWidth 600px, height auto

## Troubleshooting

### Hình ảnh vẫn bị cắt?
- Kiểm tra `object-fit: contain` đã được áp dụng
- Xóa bất kỳ `max-height` nào trong CSS
- Clear browser cache

### Hình ảnh quá to?
- Kiểm tra `max-width: 600px` trong CSS
- Kiểm tra không có `width: 100%` ở parent

### Hình ảnh bị méo?
- Đảm bảo `height: auto`
- Kiểm tra không có fixed height
- Xóa aspect-ratio nếu có

## Kết Luận

**Version 3.0** cung cấp trải nghiệm tốt nhất:
- ✅ **Hiển thị đầy đủ** - Không mất chi tiết
- ✅ **Tối ưu kích thước** - Vừa vặn, dễ nhìn
- ✅ **Linh hoạt** - Hỗ trợ mọi loại ảnh
- ✅ **Performance** - Tải nhanh, tối ưu

---

**Version**: 3.0 (Final)  
**Date**: October 13, 2025  
**Status**: ✅ Production Ready

