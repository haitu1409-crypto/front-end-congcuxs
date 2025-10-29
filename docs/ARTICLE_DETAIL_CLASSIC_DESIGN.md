# Thiết Kế Bài Viết Chi Tiết - Phong Cách Cổ Điển

## Tổng Quan

Giao diện bài viết chi tiết được thiết kế lại theo phong cách cổ điển của các trang tin tức lớn tại Việt Nam (VnExpress, Tuổi Trẻ, Thanh Niên). Thiết kế tập trung vào **khả năng đọc**, **tính đơn giản** và **trải nghiệm người dùng**.

## Đặc Điểm Chính

### 1. **Layout 2 Cột**
- **Nội dung chính (Main)**: 70% chiều rộng (responsive)
- **Sidebar**: 340px (cố định trên desktop)
- **Breakpoint**: 992px (tablet và mobile sẽ chuyển sang 1 cột)

### 2. **Typography**
- **Font Heading**: Georgia, 'Times New Roman', serif (phong cách cổ điển)
- **Font Body**: Georgia cho nội dung bài viết (dễ đọc)
- **Font Size**:
  - Title: 32px (mobile: 20px)
  - Content: 16px (mobile: 14px)
  - Line Height: 1.75 (thoải mái cho mắt)

### 3. **Màu Sắc**
- **Primary Color**: #c00 (đỏ truyền thống của báo)
- **Text**: #222, #333, #666, #999 (gradient xám)
- **Background**: #f5f5f5 (nền nhẹ), white (content box)
- **Border**: #e5e5e5 (tinh tế)

### 4. **Spacing & Layout**
- Padding container: 30px (desktop), 20px (tablet), 15px (mobile)
- Gap giữa elements: 20px-30px
- Border radius: 4px (góc nhẹ, không quá tròn)

## Cấu Trúc Component

### Header Section
```jsx
<header className={styles.articleHeader}>
  - Category Badge (màu đỏ #c00)
  - Article Title (font serif, 32px)
  - Article Summary (sapo, in đậm, border trái)
  - Meta Info (ngày, tác giả, lượt xem, thời gian đọc)
</header>
```

### Featured Image
```jsx
<div className={styles.featuredImageWrapper}>
  - Image chính (700x400, max-width: 700px)
  - Caption (nếu có)
  - Centered alignment
  - Responsive: max-height giảm trên mobile
</div>
```

### Table of Contents
```jsx
<div className={styles.tocBox}>
  - Header có thể click để mở/đóng
  - List các heading trong bài
  - Smooth scroll khi click
  - Active state cho heading hiện tại
</div>
```

### Article Content
```jsx
<div className={styles.articleContent}>
  - Typography chuẩn cho h2, h3, h4
  - Paragraph với text-align: justify
  - List, blockquote, table styled
  - Images responsive
</div>
```

### Article Footer
```jsx
<footer className={styles.articleFooter}>
  - Tags section
  - Social sharing buttons (Facebook, Twitter, Zalo, Copy)
</footer>
```

### Related Articles
```jsx
<section className={styles.relatedSection}>
  - Grid 3 cột (2 cột tablet, 1 cột mobile)
  - Card với image + title + meta
  - Hover effect nhẹ
</section>
```

### Sidebar
```jsx
<aside className={styles.sidebar}>
  1. Xem nhiều nhất (Most Viewed)
     - List 5 bài viết
     - Thumbnail 80x60
     
  2. Chuyên mục (Categories)
     - List các category
     - Hover animation
     
  3. Công cụ hữu ích (Useful Tools)
     - List tools links
     - Icon arrow right
</aside>
```

## Responsive Design

### Desktop (>= 992px)
- Layout 2 cột: Content + Sidebar
- Full typography size
- All features visible

### Tablet (768px - 991px)
- Sidebar di chuyển lên trên (order: -1)
- Layout 1 cột
- Related grid: 2 cột

### Mobile (<= 767px)
- Padding giảm: 20px
- Font size giảm
- Related grid: 1 cột
- Share buttons: full width

### Small Mobile (<= 480px)
- Title: 20px
- Content: 14px
- Padding: 15px
- Share buttons: vertical stack

## Tính Năng Đặc Biệt

### 1. Reading Progress Bar
- Fixed top, width thay đổi theo scroll
- Màu gradient đỏ
- Z-index: 1000

### 2. Breadcrumb Navigation
- Sử dụng structured data cho SEO
- Separator: "/"
- Current item không có link

### 3. Social Sharing
- Facebook: màu #1877f2
- Twitter: màu #1da1f2
- Zalo: màu #0068ff
- Copy: màu #10b981
- Hover effect: translateY(-1px)

### 4. Table of Contents
- Collapsible (có thể đóng/mở)
- Smooth scroll
- Active heading tracking
- Indent theo level (h2, h3, h4)

### 5. SEO Optimization
- Structured Data (Schema.org Article)
- Meta tags đầy đủ
- Open Graph tags
- Breadcrumbs markup
- Semantic HTML

## Best Practices

### Performance
- Images: lazy loading cho related articles
- Priority loading cho featured image
- Next.js Image component với width/height
- CSS module (scoped styles, no conflicts)

### Image Optimization
- **Featured Image**: max-width 700px (tối ưu cho đọc)
- **Content Images**: max-height 500px (desktop), 350px (tablet), 280px (mobile)
- **Centered alignment**: Hình ảnh căn giữa, không chiếm toàn bộ chiều rộng
- **Aspect ratio**: Tự động điều chỉnh theo nội dung
- **Lazy loading**: Áp dụng cho hình ảnh bổ sung và related articles

### Accessibility
- Semantic HTML (article, header, footer, aside)
- ARIA labels cho buttons
- Breadcrumb navigation
- Keyboard navigation support

### UX
- Clear visual hierarchy
- Comfortable reading experience
- Easy navigation
- Quick access to related content
- Share buttons dễ thấy

## File Structure
```
pages/
  tin-tuc/
    [slug].js          # Article detail page

styles/
  ArticleDetailClassic.module.css  # Classic design styles

docs/
  ARTICLE_DETAIL_CLASSIC_DESIGN.md # This file
```

## Customization

### Thay đổi màu chính
```css
/* In ArticleDetailClassic.module.css */
.categoryBadge {
  background: #c00; /* Đổi màu này */
}

.tocLink.active,
.tag:hover {
  background: #c00; /* Đổi màu này */
}
```

### Thay đổi font
```css
/* In ArticleDetailClassic.module.css */
.articleTitle,
.articleContent {
  font-family: Georgia, 'Times New Roman', serif; /* Đổi font này */
}
```

### Thay đổi layout ratio
```css
/* In ArticleDetailClassic.module.css */
@media (min-width: 992px) {
  .contentLayout {
    grid-template-columns: 1fr 340px; /* Đổi 340px thành số khác */
  }
}
```

## Testing Checklist

- [ ] Hiển thị đúng trên desktop (>= 1200px)
- [ ] Hiển thị đúng trên tablet (768px - 991px)
- [ ] Hiển thị đúng trên mobile (<= 767px)
- [ ] Table of Contents hoạt động
- [ ] Social sharing hoạt động
- [ ] Reading progress bar chạy đúng
- [ ] Related articles hiển thị
- [ ] Breadcrumb navigation đúng
- [ ] Images lazy load
- [ ] SEO tags đầy đủ
- [ ] Print styles hoạt động

## Browser Support

- Chrome: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest
- Edge: ✅ Latest
- IE11: ❌ Not supported

## Credits

Design inspired by:
- VnExpress.net
- TuoiTre.vn
- ThanhNien.vn
- Dantri.com.vn

---

**Version**: 1.0.0  
**Last Updated**: October 13, 2025  
**Author**: Web Development Team

