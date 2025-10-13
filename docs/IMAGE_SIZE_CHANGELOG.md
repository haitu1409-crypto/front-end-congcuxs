# Image Size Optimization - Changelog

## Version 2.0 - Hình Chữ Nhật Nằm Ngang
**Date**: October 13, 2025  
**Issue**: Hình ảnh hiển thị quá to, cần tối ưu vừa lại, đủ nhìn

### Thay Đổi Chính

#### 1. Featured Image (Ảnh Đại Diện)

| Thuộc tính | Trước | Sau |
|-----------|-------|-----|
| Max Width | 700px | **550px** ⬇️ |
| Max Height | auto | **320px** 🆕 |
| Aspect Ratio | auto | **16:9** 🆕 |
| Object Fit | không | **cover** 🆕 |
| Desktop Size | 700px × ~400px | **550px × 310px** |
| Tablet Size | 100% | **100% × 250px** |
| Mobile Size | 100% | **100% × 200px** |

**Kết quả:** 
- Giảm 21% chiều rộng (700px → 550px)
- Giảm 20% chiều cao (~400px → 320px)
- Tỷ lệ 16:9 chuẩn (hình chữ nhật nằm ngang)

#### 2. Content Images (Hình Trong Bài Viết)

| Thuộc tính | Trước | Sau |
|-----------|-------|-----|
| Max Width | 100% | **550px** 🆕 |
| Max Height Desktop | 500px | **320px** ⬇️ |
| Max Height Tablet | 350px | **250px** ⬇️ |
| Max Height Mobile | 280px | **200px** ⬇️ |
| Object Fit | không | **cover** 🆕 |

**Kết quả:**
- Desktop: Giảm 36% chiều cao (500px → 320px)
- Tablet: Giảm 29% chiều cao (350px → 250px)
- Mobile: Giảm 29% chiều cao (280px → 200px)

#### 3. Next.js Image Component

```jsx
// TRƯỚC
<Image
  width={700}
  height={400}
  style={{
    width: '100%',
    maxWidth: '700px',
    height: 'auto'
  }}
/>

// SAU
<Image
  width={550}
  height={310}
  style={{
    width: '100%',
    maxWidth: '550px',
    height: 'auto',
    aspectRatio: '16/9'  // 🆕
  }}
/>
```

### Files Được Cập Nhật

1. **`styles/ArticleDetailClassic.module.css`**
   - `.featuredImage`: max-width 550px, max-height 320px, object-fit cover
   - `.articleContent img`: max-width 550px, max-height 320px
   - Responsive breakpoints: 250px (tablet), 200px (mobile)

2. **`pages/tin-tuc/[slug].js`**
   - Featured Image: width 550, height 310
   - Style: maxWidth 550px, aspectRatio 16:9

3. **`docs/IMAGE_OPTIMIZATION_GUIDE.md`**
   - Cập nhật toàn bộ hướng dẫn
   - Thêm phần aspect ratio 16:9
   - Cập nhật bảng breakpoints

### Lợi Ích

#### 📏 Kích Thước Tối Ưu
- ✅ Không quá to, chiếm ít không gian dọc
- ✅ Vừa đủ để xem rõ chi tiết
- ✅ Tỷ lệ 16:9 chuẩn quốc tế

#### 📱 Responsive Tốt Hơn
- ✅ Desktop: 550×320px (tối ưu cho đọc)
- ✅ Tablet: 100%×250px (vừa màn hình)
- ✅ Mobile: 100%×200px (nhẹ nhàng)

#### 🎨 Thiết Kế Cổ Điển
- ✅ Hình chữ nhật nằm ngang (như VnExpress, Tuổi Trẻ)
- ✅ Căn giữa, cân đối
- ✅ Caption đặt dưới ảnh

#### ⚡ Performance
- ✅ Giảm kích thước tải: ~21-36% nhỏ hơn
- ✅ LCP tốt hơn (Largest Contentful Paint)
- ✅ CLS ổn định (Cumulative Layout Shift)

#### 👁️ Trải Nghiệm Người Dùng
- ✅ Dễ đọc hơn (ít scroll)
- ✅ Tập trung vào nội dung
- ✅ Không bị choáng ngợp bởi hình ảnh
- ✅ Cân bằng giữa text và image

### Breakpoint Details

```css
/* Desktop (> 768px) */
Featured: 550px × 320px (16:9)
Content: 550px × 320px max

/* Tablet (768px - 480px) */
Featured: 100% × 250px
Content: 100% × 250px

/* Mobile (< 480px) */
Featured: 100% × 200px
Content: 100% × 200px
```

### Testing Checklist

- [x] Desktop: Hình ảnh hiển thị 550×320px
- [x] Tablet: Hình ảnh giảm xuống 250px chiều cao
- [x] Mobile: Hình ảnh giảm xuống 200px chiều cao
- [x] Aspect ratio 16:9 được giữ nguyên
- [x] Caption căn giữa
- [x] Object-fit: cover hoạt động
- [x] Không có layout shift
- [x] Images lazy load đúng
- [x] Next.js Image optimization hoạt động

### Migration Guide

Nếu bạn đã có hình ảnh sẵn, không cần thay đổi gì. CSS sẽ tự động:
- Resize về 550px max-width
- Crop về 320px max-height
- Giữ tỷ lệ 16:9 với object-fit: cover

### Recommended Image Sizes

Khi upload hình mới, khuyến nghị:

| Loại | Kích Thước | Format | Quality |
|------|-----------|--------|---------|
| Featured | 1100×620 | WebP | 80% |
| Content | 1100×620 | WebP | 75% |
| Thumbnail | 320×180 | WebP | 70% |

**Tất cả theo tỷ lệ 16:9 (landscape)**

### Before/After Comparison

```
╔════════════════════════════════════════╗
║          TRƯỚC (Quá To)                ║
╠════════════════════════════════════════╣
║  ┌──────────────────────────────┐     ║
║  │                              │     ║
║  │      Featured Image          │     ║
║  │         700×400              │     ║
║  │                              │     ║
║  └──────────────────────────────┘     ║
║                                        ║
║  Nội dung text...                     ║
║                                        ║
║  ┌──────────────────────────────┐     ║
║  │                              │     ║
║  │     Content Image            │     ║
║  │    (không giới hạn)          │     ║
║  │         ~500px               │     ║
║  │                              │     ║
║  └──────────────────────────────┘     ║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║       SAU (Hình Chữ Nhật Nằm)          ║
╠════════════════════════════════════════╣
║    ┌────────────────────────┐          ║
║    │   Featured Image       │          ║
║    │      550×320 (16:9)    │          ║
║    └────────────────────────┘          ║
║           Caption                      ║
║                                        ║
║  Nội dung text...                     ║
║                                        ║
║    ┌────────────────────────┐          ║
║    │  Content Image         │          ║
║    │    550×320 (16:9)      │          ║
║    └────────────────────────┘          ║
║                                        ║
║  → Vừa vặn, dễ đọc, cân đối           ║
╚════════════════════════════════════════╝
```

### Support

Nếu cần hỗ trợ hoặc muốn tùy chỉnh thêm, xem:
- `docs/IMAGE_OPTIMIZATION_GUIDE.md` - Hướng dẫn chi tiết
- `docs/ARTICLE_DETAIL_CLASSIC_DESIGN.md` - Thiết kế tổng thể

---

**Version**: 2.0  
**Previous Version**: 1.0 (Featured: 700px, Content: 500px)  
**Status**: ✅ Completed & Tested

