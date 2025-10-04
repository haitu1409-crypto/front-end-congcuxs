/**
 * useImageExport Hook
 * Custom hook để xuất ảnh từ HTML element
 */

import { useCallback, useState, useMemo } from 'react';

// Helper function để crop canvas và loại bỏ khoảng trống
const cropCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    // Tìm boundaries của nội dung (không phải background trắng)
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];

            // Nếu không phải màu trắng hoặc trong suốt
            if (!(r === 255 && g === 255 && b === 255) || a < 255) {
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    // Thêm padding nhỏ
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const width = maxX - minX;
    const height = maxY - minY;

    // Tạo canvas mới với kích thước đã crop
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const croppedCtx = croppedCanvas.getContext('2d');

    // Copy phần đã crop sang canvas mới
    croppedCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);

    return croppedCanvas;
};

const useImageExport = () => {
    const [isExporting, setIsExporting] = useState(false);

    // Memoize các config mặc định để tránh tạo lại object
    const defaultOptions = useMemo(() => ({
        scale: 4, // Tăng từ 2 lên 4 để có độ phân giải cao hơn
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        imageTimeout: 30000, // Tăng timeout cho việc render chất lượng cao
        quality: 1.0, // Tăng từ 0.95 lên 1.0 để có chất lượng tối đa
        pixelRatio: window.devicePixelRatio || 2, // Sử dụng device pixel ratio
        foreignObjectRendering: true, // Cải thiện render cho các element phức tạp
        logging: false // Tắt logging để tăng performance
    }), []);

    const exportToImage = useCallback(async (elementRef, options = {}) => {
        if (!elementRef.current) {
            throw new Error('Element reference không tồn tại');
        }

        setIsExporting(true);

        try {
            // Dynamic import html2canvas để tránh lỗi SSR
            const html2canvas = (await import('html2canvas')).default;

            // Lấy element và đảm bảo nó visible để render
            const element = elementRef.current;

            // Lưu trữ style gốc
            const originalStyle = {
                position: element.style.position,
                left: element.style.left,
                top: element.style.top,
                visibility: element.style.visibility,
                opacity: element.style.opacity
            };

            // Tạm thời hiển thị element để html2canvas có thể render
            element.style.position = 'fixed';
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
            element.style.zIndex = '9999';
            element.style.transform = 'none';
            element.style.width = 'auto';
            element.style.height = 'auto';

            // Đợi một chút để DOM cập nhật và fonts load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Đảm bảo tất cả fonts đã được load
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready;
            }

            // Lấy kích thước thực tế của element sau khi hiển thị
            const rect = element.getBoundingClientRect();
            const actualWidth = element.scrollWidth || rect.width;
            const actualHeight = element.scrollHeight || rect.height;

            console.log('Element dimensions:', { actualWidth, actualHeight, rect });

            const finalOptions = {
                ...defaultOptions,
                width: actualWidth,
                height: actualHeight,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                windowWidth: actualWidth,
                windowHeight: actualHeight,
                ...options
            };

            console.log('html2canvas options:', finalOptions);

            // Tạo canvas từ element
            const canvas = await html2canvas(element, finalOptions);

            // Khôi phục style gốc
            Object.keys(originalStyle).forEach(key => {
                if (originalStyle[key] !== undefined) {
                    element.style[key] = originalStyle[key];
                } else {
                    element.style.removeProperty(key);
                }
            });

            console.log('Canvas created:', { width: canvas.width, height: canvas.height });

            // Kiểm tra canvas có nội dung không
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas có kích thước 0. Element có thể không được render đúng cách.');
            }

            // Kiểm tra canvas có nội dung thực sự không (không chỉ là màu trắng)
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let hasContent = false;

            // Kiểm tra có pixel nào không phải màu trắng không
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                // Nếu có pixel không phải trắng hoặc trong suốt
                if (!(r === 255 && g === 255 && b === 255 && a === 255) && a > 0) {
                    hasContent = true;
                    break;
                }
            }

            if (!hasContent) {
                console.warn('Canvas chỉ chứa nội dung trắng hoặc trong suốt');
                // Không throw error, vẫn tiếp tục xuất ảnh
            }

            // Crop canvas để loại bỏ khoảng trống
            const croppedCanvas = cropCanvas(canvas);

            console.log('Canvas cropped:', { width: croppedCanvas.width, height: croppedCanvas.height });

            // Tạo URL từ canvas đã crop với chất lượng tối đa
            const imageDataUrl = croppedCanvas.toDataURL('image/png', 1.0);

            // Tạo filename với timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = options.filename || `thong-ke-3-mien-${timestamp}.png`;

            // Download ảnh
            const link = document.createElement('a');
            link.download = filename;
            link.href = imageDataUrl;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return {
                success: true,
                dataUrl: imageDataUrl,
                filename: filename,
                dimensions: {
                    width: croppedCanvas.width,
                    height: croppedCanvas.height
                }
            };

        } catch (error) {
            console.error('Lỗi khi xuất ảnh:', error);

            // Khôi phục style gốc nếu có lỗi
            if (elementRef.current) {
                const element = elementRef.current;
                try {
                    element.style.position = '';
                    element.style.left = '';
                    element.style.top = '';
                    element.style.visibility = '';
                    element.style.opacity = '';
                    element.style.zIndex = '';
                    element.style.transform = '';
                    element.style.width = '';
                    element.style.height = '';
                } catch (styleError) {
                    console.warn('Không thể khôi phục style:', styleError);
                }
            }

            throw new Error('Không thể xuất ảnh: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    }, [defaultOptions]); // Phụ thuộc vào defaultOptions

    const exportWithCustomSize = useCallback(async (elementRef, targetWidth = 800, options = {}) => {
        if (!elementRef.current) {
            throw new Error('Element reference không tồn tại');
        }

        // Lấy kích thước thực tế của element
        const element = elementRef.current;
        const rect = element.getBoundingClientRect();
        const actualWidth = element.scrollWidth || rect.width;

        // Tính scale để đạt được target width
        const scale = targetWidth / actualWidth;

        return exportToImage(elementRef, {
            ...options,
            width: actualWidth,
            scale: Math.max(1, scale * 2), // Minimum scale 1, với quality boost
            targetWidth: targetWidth
        });
    }, [exportToImage]);

    const exportHighQuality = useCallback(async (elementRef, options = {}) => {
        return exportToImage(elementRef, {
            ...options,
            scale: 6, // Ultra high quality - tăng từ 3 lên 6
            width: 1800, // Larger size for better quality - tăng từ 1200 lên 1800
            quality: 1.0, // Chất lượng tối đa
            pixelRatio: Math.max(window.devicePixelRatio || 2, 3) // Đảm bảo pixel ratio tối thiểu là 3
        });
    }, [exportToImage]);

    // Hàm xuất ảnh siêu chất lượng cho in ấn hoặc sử dụng chuyên nghiệp
    const exportUltraQuality = useCallback(async (elementRef, options = {}) => {
        return exportToImage(elementRef, {
            ...options,
            scale: 8, // Siêu cao - scale x8
            width: 2400, // Kích thước rất lớn
            quality: 1.0, // Chất lượng tối đa
            pixelRatio: Math.max(window.devicePixelRatio || 2, 4), // Pixel ratio tối thiểu là 4
            backgroundColor: '#ffffff', // Đảm bảo background trắng
            foreignObjectRendering: true,
            imageTimeout: 60000, // Timeout lâu hơn cho render chất lượng siêu cao
            filename: options.filename || `ultra-quality-thong-ke-${new Date().toISOString().split('T')[0]}.png`
        });
    }, [exportToImage]);

    const exportForFacebook = useCallback(async (elementRef, preset = 'facebook-post', options = {}) => {
        const facebookSizes = {
            'facebook-post': { width: 1200, scale: 4 }, // Tăng scale từ 2 lên 4
            'facebook-story': { width: 1080, scale: 4 },
            'facebook-cover': { width: 1640, scale: 4 },
            'facebook-event': { width: 1920, scale: 4 }
        };

        const config = facebookSizes[preset] || facebookSizes['facebook-post'];

        return exportToImage(elementRef, {
            ...options,
            width: config.width,
            scale: config.scale,
            quality: 1.0, // Tăng từ 0.95 lên 1.0 cho chất lượng tối đa
            pixelRatio: Math.max(window.devicePixelRatio || 2, 2), // Đảm bảo pixel ratio tối thiểu
            filename: options.filename || `facebook-${preset}-${new Date().toISOString().split('T')[0]}.png`
        });
    }, [exportToImage]);

    return {
        exportToImage,
        exportWithCustomSize,
        exportHighQuality,
        exportUltraQuality,
        exportForFacebook,
        isExporting
    };
};

export default useImageExport;
