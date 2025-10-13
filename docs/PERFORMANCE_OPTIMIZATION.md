# Hướng dẫn tối ưu Performance cho Next.js App

## 🚀 **Các tối ưu đã thực hiện**

### 1. **Lazy Loading Components**
**Vấn đề**: Trang thống kê có 3867 modules, trang dàn đề đặc biệt có nhiều components nặng
**Giải pháp**: 
```javascript
// Trước - import trực tiếp
import StatisticsTable from '../components/ThongKe/StatisticsTable';

// Sau - lazy loading
const StatisticsTable = lazy(() => import('../components/ThongKe/StatisticsTable'));
```

**Kết quả**: 
- ✅ Giảm bundle size ban đầu
- ✅ Load components chỉ khi cần
- ✅ Cải thiện First Contentful Paint (FCP)

### 2. **Suspense Boundaries**
```javascript
<Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
    <StatisticsTable />
</Suspense>
```

**Lợi ích**:
- ✅ Hiển thị loading state ngay lập tức
- ✅ Không block UI khi load component
- ✅ Better user experience

### 3. **Memory Leak Prevention**
**Đã sửa**: Tất cả setTimeout được cleanup đúng cách
```javascript
// Refs để cleanup setTimeout
const timeoutRefs = useRef([]);

useEffect(() => {
    return () => {
        timeoutRefs.current.forEach(timeoutId => {
            if (timeoutId) clearTimeout(timeoutId);
        });
        timeoutRefs.current = [];
    };
}, []);
```

### 4. **Next.js Configuration Optimization**
```javascript
// Tăng cache time để tránh reload liên tục
onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 giây
    pagesBufferLength: 5, // Giữ 5 pages
}

// Tối ưu webpack chunk splitting
splitChunks: {
    chunks: 'all',
    cacheGroups: {
        framework: { /* React core */ },
        lucide: { /* Icons */ },
        commons: { /* Shared code */ }
    }
}
```

### 5. **CSS Optimization**
```css
/* Loading placeholder với animation */
.loadingPlaceholder {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

## 📊 **Performance Metrics**

### **Trước khi tối ưu:**
- ❌ Trang thống kê: 3867 modules (4.3s compile)
- ❌ Trang dàn đề đặc biệt: 619 modules (629ms compile)
- ❌ Memory leaks từ setTimeout
- ❌ Navigation bị kẹt khi chuyển trang

### **Sau khi tối ưu:**
- ✅ Trang thống kê: Lazy load components
- ✅ Trang dàn đề đặc biệt: Lazy load tools
- ✅ Không còn memory leaks
- ✅ Navigation mượt mà
- ✅ Loading states cho UX tốt hơn

## 🛠️ **Best Practices cho tương lai**

### 1. **Component Splitting**
```javascript
// Chia component lớn thành nhiều component nhỏ
const HeavyComponent = () => {
    return (
        <div>
            <LightHeader />
            <Suspense fallback={<Loading />}>
                <HeavyContent />
            </Suspense>
        </div>
    );
};
```

### 2. **Code Splitting**
```javascript
// Split theo route
const AdminPage = lazy(() => import('../pages/admin'));

// Split theo feature
const ChartComponent = lazy(() => import('../components/Charts'));
```

### 3. **Memory Management**
```javascript
// Luôn cleanup trong useEffect
useEffect(() => {
    const subscription = subscribe();
    const timer = setTimeout(callback, 1000);
    
    return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
    };
}, []);
```

### 4. **Bundle Analysis**
```bash
# Phân tích bundle size
npm run build
npm run analyze
```

### 5. **Performance Monitoring**
```javascript
// Sử dụng Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## 🎯 **Kết quả cuối cùng**

### **Navigation Performance:**
- ✅ Trang chủ → dan-2d: Mượt mà
- ✅ dan-2d → dan-dac-biet: Mượt mà  
- ✅ dan-dac-biet → thong-ke: Mượt mà
- ✅ Không còn lỗi chunk loading
- ✅ Không còn memory leaks

### **User Experience:**
- ✅ Loading states rõ ràng
- ✅ Không bị block UI
- ✅ Smooth transitions
- ✅ Responsive design

### **Developer Experience:**
- ✅ Faster development builds
- ✅ Better error handling
- ✅ Clean code structure
- ✅ Easy maintenance

## 📝 **Checklist cho tương lai**

- [ ] Monitor bundle size với mỗi feature mới
- [ ] Sử dụng React.memo cho components không thay đổi thường xuyên
- [ ] Implement virtual scrolling cho danh sách dài
- [ ] Sử dụng service worker cho caching
- [ ] Optimize images với next/image
- [ ] Implement preloading cho critical routes
- [ ] Monitor Core Web Vitals
- [ ] Regular performance audits

## 🚨 **Warning Signs**

Khi nào cần tối ưu:
- ⚠️ Compile time > 5s
- ⚠️ Bundle size > 500KB
- ⚠️ Memory usage tăng liên tục
- ⚠️ Navigation chậm > 2s
- ⚠️ Console errors về memory leaks
- ⚠️ User feedback về performance

Tối ưu hóa performance là quá trình liên tục, không phải một lần duy nhất!