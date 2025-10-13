# Hướng dẫn tránh Memory Leaks trong React/Next.js

## Vấn đề đã được khắc phục

### 1. **setTimeout không được cleanup**
**Vấn đề**: Khi component unmount, các setTimeout vẫn chạy và cố gắng update state của component đã bị destroy.

**Giải pháp**: 
- Sử dụng `useRef` để lưu trữ timeout IDs
- Cleanup trong `useEffect` cleanup function
- Hoặc sử dụng custom hook `useTimeoutCleanup`

```javascript
// ❌ Cách cũ - gây memory leak
setTimeout(() => setStatus(false), 2000);

// ✅ Cách mới - an toàn
const timeoutId = setTimeout(() => setStatus(false), 2000);
timeoutRefs.current.push(timeoutId);

// Cleanup
useEffect(() => {
    return () => {
        timeoutRefs.current.forEach(id => clearTimeout(id));
    };
}, []);
```

### 2. **IntersectionObserver không được cleanup**
**Vấn đề**: Observer tiếp tục observe elements ngay cả khi component unmount.

**Giải pháp**:
```javascript
useEffect(() => {
    const observer = new IntersectionObserver(callback);
    const elements = document.querySelectorAll('[data-aos]');
    elements.forEach(el => observer.observe(el));

    return () => {
        elements.forEach(el => observer.unobserve(el));
        observer.disconnect(); // Quan trọng!
    };
}, []);
```

### 3. **Next.js Page Buffer**
**Vấn đề**: Pages bị dispose quá nhanh khi chuyển trang.

**Giải pháp**: Tăng buffer trong `next.config.js`:
```javascript
onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 giây
    pagesBufferLength: 5, // Giữ 5 pages
}
```

## Best Practices

### 1. **Luôn cleanup trong useEffect**
```javascript
useEffect(() => {
    const subscription = subscribe();
    const timeoutId = setTimeout(callback, 1000);
    const observer = new MutationObserver(callback);
    
    return () => {
        subscription.unsubscribe();
        clearTimeout(timeoutId);
        observer.disconnect();
    };
}, []);
```

### 2. **Sử dụng AbortController cho API calls**
```javascript
useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', { signal: controller.signal })
        .then(response => response.json())
        .then(data => setData(data))
        .catch(err => {
            if (err.name !== 'AbortError') {
                console.error(err);
            }
        });
    
    return () => controller.abort();
}, []);
```

### 3. **Tránh state updates sau khi unmount**
```javascript
const [data, setData] = useState(null);
const isMountedRef = useRef(true);

useEffect(() => {
    return () => {
        isMountedRef.current = false;
    };
}, []);

const fetchData = async () => {
    const result = await api.getData();
    if (isMountedRef.current) {
        setData(result);
    }
};
```

## Custom Hooks hữu ích

### useTimeoutCleanup
```javascript
import { useTimeoutCleanup } from '../hooks/useTimeoutCleanup';

const { addTimeout } = useTimeoutCleanup();

// Thay vì setTimeout thông thường
addTimeout(() => setStatus(false), 2000);
```

### useIsMounted
```javascript
const useIsMounted = () => {
    const isMountedRef = useRef(true);
    
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);
    
    return isMountedRef.current;
};
```

## Monitoring Memory Leaks

### 1. **React DevTools Profiler**
- Kiểm tra component re-renders không cần thiết
- Phát hiện memory leaks trong development

### 2. **Chrome DevTools Memory Tab**
- Take heap snapshots
- So sánh memory usage trước/sau khi chuyển trang

### 3. **Console Warnings**
- React sẽ cảnh báo về memory leaks trong development mode
- "Can't perform a React state update on an unmounted component"

## Kết luận

Memory leaks trong React thường xảy ra do:
1. Không cleanup timers (setTimeout, setInterval)
2. Không cleanup event listeners
3. Không cleanup subscriptions
4. Không cleanup observers (IntersectionObserver, MutationObserver)
5. State updates sau khi component unmount

Luôn nhớ cleanup trong useEffect return function để tránh các vấn đề này.
