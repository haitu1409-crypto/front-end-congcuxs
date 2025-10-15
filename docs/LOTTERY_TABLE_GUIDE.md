# Hướng Dẫn Thêm Bảng Kết Quả Xổ Số Vào Bài Viết

Hướng dẫn chi tiết cách thêm bảng kết quả xổ số vào bài viết tin tức.

## 🎯 Vấn Đề

Bạn muốn paste HTML table phức tạp (bảng kết quả xổ số) vào content của bài viết nhưng nó không hiển thị đúng.

## ✅ Giải Pháp

Frontend **ĐÃ hỗ trợ render HTML raw** bằng `dangerouslySetInnerHTML`. Bạn chỉ cần paste HTML đúng cách.

---

## 📋 Cách 1: Paste HTML Trực Tiếp (Khuyến Nghị)

### Bước 1: Chuẩn Bị HTML

Lấy HTML bảng kết quả xổ số của bạn. Ví dụ:

```html
<div class="kqsx-today text-center v-card mb-3">
    <h1 class="lead df-title pt-3 d-block">XSMT - Kết Quả Xổ Số Miền Trung - SXMT Hôm Nay</h1>
    
    <h2 class="site-link">
        <a href="/xsmt-xo-so-mien-trung" title="Kết quả xổ số Miền Trung">XSMT</a>
        <a href="/xsmt-thu-2" title="Xổ số Miền Trung Thứ 2">XSMT Thứ 2</a>
        <a href="/xsmt-13-10-2025" title="Xổ số Miền Trung ngày 13/10/2025">XSMT 13/10/2025</a>
    </h2>
    
    <table class="kqmb kqsx-mt w-100" data-zone="kqmt">
        <tbody>
            <tr class="bg-pr">
                <th class="first"></th>
                <th data-pid="41467">
                    <a href="https://xosovn.com/xspy-xo-so-phu-yen" title="XSPY">
                        <b>Phú Yên</b>
                    </a>
                </th>
                <th data-pid="41468">
                    <a href="https://xosovn.com/xstth-xo-so-hue" title="XSTTH">
                        <b>Huế</b>
                    </a>
                </th>
            </tr>
            <tr class="g8">
                <td>G8</td>
                <td>
                    <span id="PY_prize_8_item_0" data-nc="2" class="v-g8" data-id="20">20</span>
                </td>
                <td>
                    <span id="TTH_prize_8_item_0" data-nc="2" class="v-g8" data-id="03">03</span>
                </td>
            </tr>
            <!-- ... thêm các row khác ... -->
        </tbody>
    </table>
    
    <div class="control-panel">
        <form class="digits-form mt-3 mb-3 text-left">
            <label class="radio">
                <input type="radio" name="showed-digits" value="0" checked="checked">
                <b></b>
                <span>Tất cả</span>
            </label>
            <!-- ... thêm options khác ... -->
        </form>
    </div>
</div>
```

### Bước 2: Tạo Bài Viết

1. Vào trang admin: `/admin/dang-bai`
2. Điền thông tin bài viết:
   - **Tiêu đề**: "Kết Quả Xổ Số Miền Trung ngày 13/10/2025"
   - **Tóm tắt**: "Kết quả xổ số miền Trung hôm nay, cập nhật nhanh chính xác..."
   - **Danh mục**: `tin-tuc-xo-so`

### Bước 3: Paste HTML vào Content

**QUAN TRỌNG:** Paste HTML **TRỰC TIẾP** vào field Content. KHÔNG qua rich text editor.

```javascript
// Trong admin form, content field nên là <textarea> hoặc code editor
// KHÔNG dùng TinyMCE/CKEditor vì nó sẽ strip HTML

<textarea name="content" rows="20">
    <!-- Paste HTML ở đây -->
    <div class="kqsx-today text-center v-card mb-3">
        ...
    </div>
</textarea>
```

### Bước 4: Submit & Kiểm Tra

1. Click "Đăng bài"
2. Truy cập bài viết: `/tin-tuc/ket-qua-xo-so-mien-trung-13-10-2025`
3. HTML table sẽ hiển thị đúng với đầy đủ styles

---

## 📋 Cách 2: Sử Dụng Component LotteryResultTable

Nếu bạn muốn có styles đẹp hơn và quản lý tốt hơn.

### Bước 1: Import Component

```javascript
// pages/tin-tuc/[slug].js

import LotteryResultTable from '../../components/LotteryResultTable';
```

### Bước 2: Modify Article Content Rendering

```javascript
// Thay vì:
<div
    className={styles.articleContent}
    dangerouslySetInnerHTML={{ __html: article.content }}
/>

// Làm thế này:
<div className={styles.articleContent}>
    {/* Nếu bài viết có bảng xổ số */}
    {article.lotteryTableHTML && (
        <LotteryResultTable 
            htmlContent={article.lotteryTableHTML}
            title={article.lotteryTableTitle || "Kết Quả Xổ Số"}
            region={article.lotteryRegion || "MT"}
        />
    )}
    
    {/* Content chính */}
    <div dangerouslySetInnerHTML={{ __html: article.content }} />
</div>
```

### Bước 3: Update Article Model

Thêm fields vào article model:

```javascript
// back_end_dande/src/models/article.model.js

const articleSchema = new mongoose.Schema({
    // ... existing fields ...
    
    // Thêm fields cho lottery table
    lotteryTableHTML: {
        type: String,
        default: null
    },
    lotteryTableTitle: {
        type: String,
        default: null
    },
    lotteryRegion: {
        type: String,
        enum: ['MB', 'MN', 'MT', null],
        default: null
    }
});
```

### Bước 4: Update Create Article API

```javascript
// back_end_dande/src/controllers/article.controller.js

const createArticle = async (req, res) => {
    const {
        title,
        excerpt,
        content,
        category,
        lotteryTableHTML,    // ✅ Thêm field này
        lotteryTableTitle,   // ✅ Thêm field này
        lotteryRegion        // ✅ Thêm field này
    } = req.body;

    const article = new Article({
        title,
        excerpt,
        content,
        category,
        lotteryTableHTML,    // ✅ Save riêng HTML table
        lotteryTableTitle,
        lotteryRegion,
        // ... other fields
    });

    await article.save();
    // ...
};
```

---

## 🎨 Styles Đã Có

Component `LotteryResultTable` đã có đầy đủ styles cho:

✅ Bảng kết quả xổ số  
✅ Header với tên tỉnh  
✅ Giải 8 (màu vàng)  
✅ Giải đặc biệt (màu đỏ, nổi bật)  
✅ Control panel (radio buttons)  
✅ Hover effects  
✅ Responsive mobile  
✅ Dark mode (optional)  

---

## 🔧 Troubleshooting

### Vấn Đề 1: HTML bị escape (hiển thị dạng text)

**Nguyên nhân:** Editor đang sanitize HTML

**Giải pháp:**
1. Tắt rich text editor, dùng plain textarea
2. Hoặc thêm setting để cho phép raw HTML:

```javascript
// Nếu dùng TinyMCE
tinymce.init({
    selector: 'textarea',
    valid_elements: '*[*]',  // Allow all elements
    extended_valid_elements: '*[*]',
    verify_html: false
});
```

### Vấn Đề 2: Styles không đúng

**Nguyên nhân:** CSS không được import

**Giải pháp:**
```javascript
// pages/tin-tuc/[slug].js
import '../../styles/LotteryResultTable.module.css';
```

### Vấn Đề 3: Security Warning

**Nguyên nhân:** `dangerouslySetInnerHTML` có warning

**Giải pháp:** 
- Chỉ cho phép admin paste HTML
- Sanitize HTML nếu user-generated content
- Hoặc dùng library `dompurify`:

```javascript
import DOMPurify from 'dompurify';

<div 
    dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(article.content) 
    }} 
/>
```

---

## ✅ Checklist Deploy

- [ ] Component `LotteryResultTable.js` đã tạo
- [ ] CSS `LotteryResultTable.module.css` đã tạo
- [ ] Article model đã update (nếu dùng Cách 2)
- [ ] Article controller đã update (nếu dùng Cách 2)
- [ ] Test paste HTML vào content field
- [ ] Kiểm tra hiển thị trên frontend
- [ ] Test responsive mobile
- [ ] Test với nhiều loại bảng (MB, MN, MT)

---

## 📞 Support

Nếu vẫn gặp vấn đề, kiểm tra:

1. **Console log** - Xem có error không
2. **Network tab** - Kiểm tra API response có content đúng không
3. **Inspect element** - Xem HTML có render ra không

**Debug:**
```javascript
// pages/tin-tuc/[slug].js
console.log('Article content:', article.content);
console.log('Article lottery HTML:', article.lotteryTableHTML);
```

---

**Last Updated:** 2025-01-13  
**Version:** 1.0.0


