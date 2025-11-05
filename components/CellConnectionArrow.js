/**
 * Component để vẽ đường mũi tên nối giữa các phần tử trong các ô khác nhau
 * Dựa trên định vị chặt chẽ của từng chữ số
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from '../styles/cellConnectionArrow.module.css';

const CellConnectionArrow = ({ 
    sourceElement,      // { cellKey, numberIndex, digitIndex, position }
    targetElement,      // { cellKey, numberIndex, digitIndex, position }
    tableContainerRef,  // Ref đến container của bảng
    color = '#c80505'   // Màu của mũi tên
}) => {
    const svgRef = useRef(null);
    const [path, setPath] = useState(null);
    const [arrowPoints, setArrowPoints] = useState(null);
    const markerIdRef = useRef(`arrowhead-${Math.random().toString(36).substr(2, 9)}`);

    // Debounce function để tránh update quá nhiều
    const debounceRef = useRef(null);
    
    const updateArrow = useCallback(() => {
        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        
        // Debounce với 50ms để tối ưu performance
        debounceRef.current = setTimeout(() => {
            if (!sourceElement || !targetElement || !tableContainerRef?.current) {
                setPath(null);
                setArrowPoints(null);
                return;
            }

        // Tìm các element trong DOM dựa trên globalIndex, elementId hoặc cellKey + digitIndex
        const findElement = (element) => {
            // Thử tìm bằng elementId trước (dùng cho PositionDetailBox)
            if (element.elementId) {
                const digitEl = tableContainerRef.current.querySelector(
                    `span[data-element-id="${element.elementId}"]`
                );
                if (digitEl) return digitEl;
            }
            
            // Thử tìm bằng globalIndex (chính xác nhất - hoạt động cho cả week và month mode)
            if (element.globalIndex !== undefined && element.globalIndex >= 0) {
                const digitEl = tableContainerRef.current.querySelector(
                    `span[data-global-index="${element.globalIndex}"]`
                );
                if (digitEl) return digitEl;
            }
            
            // Thử tìm số dự đoán (prediction element)
            if (element.isPrediction && element.digitIndex !== undefined) {
                const predictionEl = tableContainerRef.current.querySelector(
                    `span[data-element-id="prediction-digit-${element.digitIndex}"]`
                );
                if (predictionEl) return predictionEl;
            }
            
            // Thử tìm bằng data attributes (prize, elementIndex, digitIndex, tableIndex)
            if (element.prize !== undefined && element.elementIndex !== undefined && element.digitIndex !== undefined && element.tableIndex !== undefined) {
                const digitEl = tableContainerRef.current.querySelector(
                    `span[data-prize="${element.prize}"][data-element-index="${element.elementIndex}"][data-digit-index="${element.digitIndex}"][data-table-index="${element.tableIndex}"]`
                );
                if (digitEl) return digitEl;
            }

            // Nếu là virtual element, tìm cell
            if (element.isVirtual && element.cellKey) {
                // Kiểm tra xem cellKey có format week mode (number-number) hay month mode (year-month-day)
                const parts = element.cellKey.split('-');
                
                if (parts.length === 2) {
                    // Week mode: weekIndex-dayIndex
                    const [weekIndex, dayIndex] = parts.map(Number);
                    const cell = tableContainerRef.current.querySelector(
                        `td[data-week-index="${weekIndex}"][data-day-index="${dayIndex}"]`
                    );
                    return cell || null;
                } else if (parts.length === 3) {
                    // Month mode: year-month-day (ví dụ: "2025-11-1" -> year=2025, month=11, day=1)
                    const [year, month, day] = parts.map(Number);
                    // month là giá trị thực tế (1-12), cần trừ 1 để match với data-month-index (0-11)
                    // day là số ngày thực tế (1-31), dùng data-day để tìm
                    const cell = tableContainerRef.current.querySelector(
                        `td[data-year="${year}"][data-month-index="${month - 1}"][data-day="${day}"]`
                    );
                    return cell || null;
                }
            }

            // Fallback: tìm bằng cellKey
            if (element.cellKey) {
                const parts = element.cellKey.split('-');
                
                if (parts.length === 2) {
                    // Week mode
                    const [weekIndex, dayIndex] = parts.map(Number);
                    const cell = tableContainerRef.current.querySelector(
                        `td[data-week-index="${weekIndex}"][data-day-index="${dayIndex}"]`
                    );
                    
                    if (cell && element.digitIndex !== undefined) {
                        // Tìm chữ số cụ thể trong cell
                        const digitElements = cell.querySelectorAll('span[data-digit-index]');
                        for (const digitEl of digitElements) {
                            const elDigitIndex = parseInt(digitEl.getAttribute('data-digit-index'));
                            if (elDigitIndex === element.digitIndex) {
                                return digitEl;
                            }
                        }
                    }
                    
                    return cell || null;
                } else if (parts.length === 3) {
                    // Month mode: year-month-day (ví dụ: "2025-11-1" -> year=2025, month=11, day=1)
                    const [year, month, day] = parts.map(Number);
                    // month là giá trị thực tế (1-12), cần trừ 1 để match với data-month-index (0-11)
                    // day là số ngày thực tế (1-31), dùng data-day để tìm
                    const cell = tableContainerRef.current.querySelector(
                        `td[data-year="${year}"][data-month-index="${month - 1}"][data-day="${day}"]`
                    );
                    
                    if (cell && element.digitIndex !== undefined) {
                        // Tìm chữ số cụ thể trong cell
                        const digitElements = cell.querySelectorAll('span[data-digit-index]');
                        for (const digitEl of digitElements) {
                            const elDigitIndex = parseInt(digitEl.getAttribute('data-digit-index'));
                            if (elDigitIndex === element.digitIndex) {
                                return digitEl;
                            }
                        }
                    }
                    
                    return cell || null;
                }
            }
            
            return null;
        };

        const sourceEl = findElement(sourceElement);
        const targetEl = findElement(targetElement);

        if (!sourceEl || !targetEl) {
            setPath(null);
            setArrowPoints(null);
            return;
        }

        // Tính vị trí của container và các element
        const containerRect = tableContainerRef.current.getBoundingClientRect();
        const sourceRect = sourceEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        // Tính tọa độ tương đối trong container
        // getBoundingClientRect trả về tọa độ trên viewport, cần tính lại tương đối với container
        const sourceX = sourceRect.left + sourceRect.width / 2 - containerRect.left;
        const sourceY = sourceRect.top + sourceRect.height / 2 - containerRect.top;
        const targetX = targetRect.left + targetRect.width / 2 - containerRect.left;
        const targetY = targetRect.top + targetRect.height / 2 - containerRect.top;

        // Tính toán đường cong (bezier curve) cho đường nối
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Control points cho đường cong (tạo đường cong mượt)
        // Sử dụng cả dx và dy để tạo đường cong tự nhiên
        const controlOffsetX = Math.min(Math.abs(dx) * 0.5, 150);
        const controlOffsetY = Math.abs(dy) > 50 ? Math.min(Math.abs(dy) * 0.3, 100) : 0;
        
        const cp1x = sourceX + (dx > 0 ? controlOffsetX : -controlOffsetX);
        const cp1y = sourceY + (dy > 0 ? controlOffsetY : -controlOffsetY);
        const cp2x = targetX - (dx > 0 ? controlOffsetX : -controlOffsetX);
        const cp2y = targetY - (dy > 0 ? controlOffsetY : -controlOffsetY);

        // Tạo path string cho SVG (đường cong bezier)
        const pathString = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
        
        // Tính toán điểm đầu mũi tên (tại target)
        const angle = Math.atan2(dy, dx);
        const arrowLength = 12;
        
        const arrowPoint1 = {
            x: targetX - arrowLength * Math.cos(angle - Math.PI / 6),
            y: targetY - arrowLength * Math.sin(angle - Math.PI / 6)
        };
        
        const arrowPoint2 = {
            x: targetX - arrowLength * Math.cos(angle + Math.PI / 6),
            y: targetY - arrowLength * Math.sin(angle + Math.PI / 6)
        };

        setPath(pathString);
        setArrowPoints({ point1: arrowPoint1, point2: arrowPoint2, tip: { x: targetX, y: targetY } });

            // Update SVG size để cover toàn bộ container
            if (svgRef.current) {
                const container = tableContainerRef.current;
                const scrollWidth = container.scrollWidth || containerRect.width;
                const scrollHeight = container.scrollHeight || containerRect.height;
                svgRef.current.setAttribute('width', scrollWidth);
                svgRef.current.setAttribute('height', scrollHeight);
            }
        }, 50); // Debounce 50ms
    }, [sourceElement, targetElement, tableContainerRef, color]);

    useEffect(() => {
        updateArrow();

        // Debounced handler cho scroll và resize để tối ưu performance
        let scrollTimeout = null;
        const handleUpdate = () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => updateArrow(), 100); // Debounce 100ms cho scroll/resize
        };
        
        const container = tableContainerRef?.current;
        
        if (container) {
            // Sử dụng passive listeners để tối ưu scroll performance
            window.addEventListener('scroll', handleUpdate, { passive: true, capture: true });
            window.addEventListener('resize', handleUpdate, { passive: true });
            container.addEventListener('scroll', handleUpdate, { passive: true });
            
            return () => {
                if (scrollTimeout) clearTimeout(scrollTimeout);
                window.removeEventListener('scroll', handleUpdate, { capture: true });
                window.removeEventListener('resize', handleUpdate);
                container.removeEventListener('scroll', handleUpdate);
            };
        }
        
        return () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [updateArrow, tableContainerRef]);

    if (!path || !arrowPoints) return null;

    return (
        <svg
            ref={svgRef}
            className={styles.arrowSvg}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10 // Giảm z-index để các số nằm trên mũi tên
            }}
        >
            {/* Đường nối */}
            <path
                d={path}
                stroke={color}
                strokeWidth="2"
                fill="none"
                markerEnd={`url(#${markerIdRef.current})`}
                className={styles.connectionPath}
            />
            
            {/* Định nghĩa mũi tên */}
            <defs>
                <marker
                    id={markerIdRef.current}
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3, 0 6"
                        fill={color}
                    />
                </marker>
            </defs>
            
            {/* Vẽ mũi tên thủ công (backup) */}
            <polygon
                points={`${arrowPoints.tip.x},${arrowPoints.tip.y} ${arrowPoints.point1.x},${arrowPoints.point1.y} ${arrowPoints.point2.x},${arrowPoints.point2.y}`}
                fill={color}
                className={styles.arrowHead}
            />
        </svg>
    );
};

// Memoize component để tránh re-render không cần thiết
export default React.memo(CellConnectionArrow, (prevProps, nextProps) => {
    // Chỉ re-render nếu các props quan trọng thay đổi
    // Kiểm tra elementId, position, hoặc globalIndex
    const sourceChanged = 
        prevProps.sourceElement?.elementId !== nextProps.sourceElement?.elementId ||
        prevProps.sourceElement?.globalIndex !== nextProps.sourceElement?.globalIndex ||
        prevProps.sourceElement?.position !== nextProps.sourceElement?.position ||
        prevProps.sourceElement?.isVirtual !== nextProps.sourceElement?.isVirtual ||
        prevProps.sourceElement?.prize !== nextProps.sourceElement?.prize ||
        prevProps.sourceElement?.elementIndex !== nextProps.sourceElement?.elementIndex ||
        prevProps.sourceElement?.digitIndex !== nextProps.sourceElement?.digitIndex ||
        prevProps.sourceElement?.tableIndex !== nextProps.sourceElement?.tableIndex;
    
    const targetChanged = 
        prevProps.targetElement?.elementId !== nextProps.targetElement?.elementId ||
        prevProps.targetElement?.globalIndex !== nextProps.targetElement?.globalIndex ||
        prevProps.targetElement?.position !== nextProps.targetElement?.position ||
        prevProps.targetElement?.isVirtual !== nextProps.targetElement?.isVirtual ||
        prevProps.targetElement?.isPrediction !== nextProps.targetElement?.isPrediction ||
        prevProps.targetElement?.prize !== nextProps.targetElement?.prize ||
        prevProps.targetElement?.elementIndex !== nextProps.targetElement?.elementIndex ||
        prevProps.targetElement?.digitIndex !== nextProps.targetElement?.digitIndex ||
        prevProps.targetElement?.tableIndex !== nextProps.targetElement?.tableIndex;
    
    // Return true nếu KHÔNG thay đổi (không re-render), false nếu thay đổi (cần re-render)
    return !sourceChanged && !targetChanged && 
           prevProps.color === nextProps.color &&
           prevProps.tableContainerRef === nextProps.tableContainerRef;
});

