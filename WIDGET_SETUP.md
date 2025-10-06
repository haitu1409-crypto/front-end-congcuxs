# 🔧 Hướng Dẫn Cập Nhật Widget ID

## 📝 Sau Khi Đăng Ký whos.amung.us

### 1. Lấy Widget ID Mới
- Vào dashboard whos.amung.us
- Copy Widget ID (ví dụ: `xyz789abc`)

### 2. Cập Nhật Files Cần Thiết

#### A. Cập nhật `pages/_document.js`:
```javascript
// Thay thế '7p3pwa' bằng Widget ID mới của bạn
script.src = 'https://whos.amung.us/scripts/YOUR_WIDGET_ID.js';
widgetContainer.id = 'amung_us_widget_YOUR_WIDGET_ID';
```

#### B. Cập nhật `components/OnlineCounter.js`:
```javascript
// Thay thế trong useEffect
document.getElementById('amung_us_widget_YOUR_WIDGET_ID')
```

#### C. Cập nhật `pages/admin/thong-ke.js`:
```javascript
// Thay thế widgetId
<VisitorStats widgetId="YOUR_WIDGET_ID" />
<WhosAmungUsEmbed widgetId="YOUR_WIDGET_ID" />
```

#### D. Cập nhật `components/WhosAmungUsEmbed.js`:
```javascript
// Thay thế widgetId trong component props
const WhosAmungUsEmbed = ({ widgetId = 'YOUR_WIDGET_ID' })
```

### 3. Restart Development Server
```bash
# Stop server hiện tại (Ctrl+C)
# Sau đó restart
npm run dev
```

### 4. Test Widget
- Vào website localhost
- Check widget góc phải dưới
- Vào admin dashboard để debug nếu cần

## 🔍 Troubleshooting

### Widget vẫn không hiển thị:
1. **Verify Widget ID:** Đảm bảo ID đúng với dashboard
2. **Check Dashboard:** Đảm bảo có traffic trên website
3. **Wait Time:** Widget cần 5-10 phút để hiển thị data
4. **Browser Cache:** Clear cache và refresh trang

### Dashboard hiển thị "No data":
- Widget cần có traffic thực tế để hiển thị số liệu
- Mở website trong nhiều tab để tạo traffic test
- Đợi vài phút để data được ghi nhận
