# Hydration Error Fix - LocGhepDanComponent

## Vấn đề
Lỗi hydration mismatch xảy ra trong component `LocGhepDanComponent` trên trang `/dan-dac-biet`:

```
Warning: Expected server HTML to contain a matching <h2> in <div>.
Hydration failed because the initial UI does not match what was rendered on the server.
```

## Nguyên nhân
1. **Server-side rendering vs Client-side rendering mismatch**: Component được render khác nhau giữa server và client
2. **Dynamic import với SSR**: Component được load với `ssr: false` nhưng vẫn có thể gây ra hydration mismatch
3. **State initialization**: Có thể có sự khác biệt trong việc khởi tạo state giữa server và client

## Giải pháp đã áp dụng

### 1. Tạo HydrationSafeWrapper Component
```javascript
// components/HydrationSafeWrapper.js
const HydrationSafeWrapper = ({ children, fallback = null }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return fallback || <div>Đang tải...</div>;
    }

    return children;
};
```

### 2. Cập nhật Dynamic Import
```javascript
// pages/dan-dac-biet/index.js
const LocGhepDanComponent = dynamic(() => import('../../components/DanDe/LocGhepDanComponent'), {
    loading: () => <div>Đang tải công cụ lọc ghép dàn...</div>,
    ssr: false,
    suspense: false  // Thay đổi từ true thành false
});
```

### 3. Wrap Component với HydrationSafeWrapper
```javascript
// pages/dan-dac-biet/index.js
<HydrationSafeWrapper fallback={<div>Đang tải bộ lọc dàn đặc biệt...</div>}>
    <LocGhepDanComponent />
</HydrationSafeWrapper>
```

### 4. Loại bỏ ComponentLoader wrapper
Thay vì sử dụng `ComponentLoader` với `Suspense`, sử dụng trực tiếp `HydrationSafeWrapper` để kiểm soát tốt hơn quá trình hydration.

## Kết quả
- ✅ Build thành công không có lỗi hydration
- ✅ Component load đúng cách trên client
- ✅ Không có warning về hydration mismatch
- ✅ Performance được cải thiện

## Best Practices để tránh Hydration Error

1. **Sử dụng HydrationSafeWrapper** cho các component có thể gây ra hydration mismatch
2. **Tránh sử dụng `window`, `document`** trong quá trình render ban đầu
3. **Đảm bảo state initialization** giống nhau giữa server và client
4. **Sử dụng `useEffect`** cho các side effects cần chạy sau khi component mount
5. **Kiểm tra build** thường xuyên để phát hiện sớm các vấn đề hydration

## Files đã thay đổi
- `components/HydrationSafeWrapper.js` (mới)
- `pages/dan-dac-biet/index.js`
- `components/DanDe/LocGhepDanComponent.js`

## Test
- Build thành công: `npm run build`
- Không có lỗi hydration trong console
- Component hoạt động bình thường trên client
