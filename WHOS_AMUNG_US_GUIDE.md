# 📊 Hướng Dẫn Sử Dụng whos.amung.us

## 🎯 Tổng Quan

[whos.amung.us](https://whos.amung.us/stats/halo7p3pwa/#google_vignette) là một dịch vụ analytics miễn phí để theo dõi số lượng người dùng đang online trên website real-time.

## 🔧 Đã Tích Hợp

### ✅ Các Component Đã Tạo:

1. **OnlineCounter** (`components/OnlineCounter.js`)
   - Widget hiển thị số người online ở góc phải dưới
   - Tự động load và cập nhật real-time
   - Responsive design cho mobile

2. **VisitorStats** (`components/VisitorStats.js`)
   - Dashboard chi tiết với thống kê
   - Hiển thị online count, pageviews, countries
   - Auto-refresh mỗi 30 giây

3. **WhosAmungUsTest** (`components/WhosAmungUsTest.js`)
   - Công cụ debug để kiểm tra widget
   - Hiển thị trạng thái script loading
   - Console logs chi tiết

4. **WhosAmungUsEmbed** (`components/WhosAmungUsEmbed.js`)
   - Embed dashboard trực tiếp bằng iframe
   - Script embed thay thế
   - Link trực tiếp đến dashboard

### ✅ Cấu Hình Đã Thiết Lập:

1. **Script Loading** (`pages/_document.js`)
   - Tự động load script whos.amung.us
   - Error handling và logging
   - Widget container creation

2. **Layout Integration** (`components/Layout.js`)
   - OnlineCounter widget ở góc phải dưới
   - Link admin trong navigation
   - Theme gradient với animation

3. **Admin Dashboard** (`pages/admin/thong-ke.js`)
   - Trang quản trị với password protection
   - Debug tools và embed options
   - Real-time statistics display

## 🚀 Cách Sử Dụng

### 📱 Widget Online Counter

Widget sẽ tự động hiển thị ở góc phải dưới mọi trang:

```jsx
// Tự động hiển thị trong Layout
<OnlineCounter 
    position="bottom-right"
    theme="gradient"
    size="medium"
    showLabel={true}
/>
```

### 🔐 Truy Cập Admin Dashboard

1. Vào menu "Admin" trên website
2. Nhập mật khẩu: `141920`
3. Xem thống kê chi tiết và debug tools

### 🛠️ Debug Widget

Nếu widget không hiển thị số người:

1. **Kiểm tra Console:**
   - Mở Developer Tools (F12)
   - Xem tab Console để check logs
   - Tìm messages về whos.amung.us

2. **Sử dụng Debug Tools:**
   - Vào `/admin/thong-ke`
   - Xem section "Debug Widget"
   - Check trạng thái script loading

3. **Test Embed Options:**
   - Thử iframe embed
   - Test script embed trực tiếp
   - Verify dashboard link

## 🔍 Troubleshooting

### ❌ Widget Loading Mãi

**Nguyên nhân có thể:**
- Widget ID không đúng
- Script bị block bởi ad blocker
- Network connectivity issues
- CORS policy restrictions

**Giải pháp:**
```javascript
// Kiểm tra trong console:
console.log('Widget element:', document.getElementById('amung_us_widget_7p3pwa'));
console.log('Script loaded:', !!window.amung_us_widget);
```

### ❌ Dashboard Không Truy Cập Được

**Kiểm tra:**
- URL: https://whos.amung.us/stats/7p3pwa
- Widget ID có đúng không
- Account whos.amung.us có active không

### ❌ Script Loading Errors

**Debug steps:**
1. Check network tab trong DevTools
2. Verify script URL: `https://whos.amung.us/scripts/7p3pwa.js`
3. Check for JavaScript errors
4. Test với browser khác

## 📊 Dashboard Features

### 🎯 Thống Kê Available:

- **Real-time Online Count** - Số người đang online
- **Page Views** - Lượt xem trang
- **Countries** - Thống kê theo quốc gia
- **Devices** - Desktop vs Mobile
- **Pages** - Trang phổ biến nhất
- **History** - Biểu đồ 24h

### 🔔 Notifications:

- Alert khi số người online đạt threshold
- Notify khi có page view cao
- Country-based notifications
- Device usage alerts

## 🎨 Customization

### 🎨 Widget Themes:

```jsx
// Available themes
<OnlineCounter theme="dark" />    // Dark background
<OnlineCounter theme="light" />   // Light background  
<OnlineCounter theme="gradient" /> // Gradient background
```

### 📏 Widget Sizes:

```jsx
// Available sizes
<OnlineCounter size="small" />   // Compact
<OnlineCounter size="medium" />  // Default
<OnlineCounter size="large" />   // Large
```

### 📍 Widget Positions:

```jsx
// Available positions
<OnlineCounter position="bottom-right" /> // Default
<OnlineCounter position="bottom-left" />
<OnlineCounter position="top-right" />
<OnlineCounter position="top-left" />
```

## 🔗 Links & Resources

- **Dashboard:** https://whos.amung.us/stats/7p3pwa
- **Script URL:** https://whos.amung.us/scripts/7p3pwa.js
- **Documentation:** https://whos.amung.us/help
- **Admin Panel:** http://localhost:3001/admin/thong-ke (password: 141920)

## 📝 Notes

1. **Widget ID:** `7p3pwa` - Đảm bảo ID này đúng với account của bạn
2. **Password Admin:** `141920` - Có thể thay đổi trong code
3. **Auto-refresh:** Widget tự động cập nhật mỗi 30 giây
4. **Mobile Responsive:** Widget tự động ẩn label trên mobile
5. **Performance:** Script load async không ảnh hưởng page speed

## 🆘 Support

Nếu gặp vấn đề:

1. Check console logs
2. Sử dụng debug tools trong admin
3. Test với embed options khác
4. Verify widget ID với whos.amung.us dashboard
5. Contact support nếu cần thiết

---

**Widget hiện tại đang loading vì cần thời gian để script khởi tạo và kết nối với whos.amung.us servers. Hãy chờ vài phút hoặc refresh trang để thấy kết quả.**
