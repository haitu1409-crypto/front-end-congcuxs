/**
 * Virtualized Table Component
 * Tối ưu hóa hiệu suất cho bảng lớn với virtual scrolling
 */

import { memo, useMemo, useState, useEffect, useRef } from 'react';

const VirtualizedTable = memo(({
    data = [],
    rowHeight = 50,
    containerHeight = 400,
    renderRow,
    className = ''
}) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);

    // ✅ Mark component as ready after mount to prevent CLS
    useEffect(() => {
        setIsReady(true);
    }, []);

    // Tính toán các rows hiển thị
    const visibleRange = useMemo(() => {
        const startIndex = Math.floor(scrollTop / rowHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / rowHeight) + 1,
            data.length
        );

        return { startIndex, endIndex };
    }, [scrollTop, rowHeight, containerHeight, data.length]);

    // Tính toán offset cho virtual scrolling
    const offsetY = visibleRange.startIndex * rowHeight;
    const totalHeight = data.length * rowHeight;

    // Handle scroll
    const handleScroll = (e) => {
        setScrollTop(e.target.scrollTop);
    };

    // Visible items
    const visibleItems = useMemo(() => {
        return data.slice(visibleRange.startIndex, visibleRange.endIndex);
    }, [data, visibleRange.startIndex, visibleRange.endIndex]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
                // ✅ FIX: Add containment and stability optimizations to prevent CLS
                contain: 'layout style paint',
                willChange: isReady ? 'auto' : 'transform',
                minHeight: containerHeight
            }}
            onScroll={handleScroll}
        >
            {/* Total height spacer */}
            <div style={{
                height: totalHeight,
                position: 'relative',
                minHeight: totalHeight // ✅ Ensure consistent height
            }}>
                {/* Visible items container */}
                <div
                    style={{
                        transform: `translateY(${offsetY}px)`,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        // ✅ Prevent layout shifts during scroll
                        willChange: 'transform'
                    }}
                >
                    {visibleItems.map((item, index) =>
                        renderRow(item, visibleRange.startIndex + index)
                    )}
                </div>
            </div>
        </div>
    );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;
