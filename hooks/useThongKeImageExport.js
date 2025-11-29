import { useState, useCallback } from 'react';
import { 
    generateBoxImage, 
    generateMultipleBoxImages, 
    downloadImage, 
    extractElementHTML, 
    extractAllBoxesHTML 
} from '../utils/thongKeImageExport';

/**
 * Hook để export các box thống kê thành hình ảnh
 */
export function useThongKeImageExport() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Generate và download hình ảnh của một box
     * @param {HTMLElement|string} elementOrHTML - Element hoặc HTML string
     * @param {string} filename - Tên file để download
     * @param {string} boxId - ID của box (optional)
     */
    const exportBoxImage = useCallback(async (elementOrHTML, filename = 'thongke-box.png', boxId = null) => {
        setIsGenerating(true);
        setError(null);

        try {
            let boxHTML;
            if (typeof elementOrHTML === 'string') {
                boxHTML = elementOrHTML;
            } else if (elementOrHTML instanceof HTMLElement) {
                boxHTML = extractElementHTML(elementOrHTML);
            } else {
                throw new Error('Invalid element or HTML provided');
            }

            const blob = await generateBoxImage(boxHTML, boxId);
            downloadImage(blob, filename);
        } catch (err) {
            console.error('[useThongKeImageExport] Lỗi khi export hình ảnh:', err);
            setError(err.message || 'Không thể export hình ảnh');
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * Generate và download nhiều hình ảnh từ nhiều boxes
     * @param {Array<{element: HTMLElement, filename: string, boxId?: string}>} boxes - Mảng các box
     */
    const exportMultipleBoxImages = useCallback(async (boxes) => {
        setIsGenerating(true);
        setError(null);

        try {
            const boxesData = boxes.map(box => ({
                html: extractElementHTML(box.element),
                id: box.boxId || null,
                options: box.options || {}
            }));

            const images = await generateMultipleBoxImages(boxesData);

            // Download từng hình ảnh
            images.forEach((image, index) => {
                const box = boxes[index];
                if (box && box.filename) {
                    const byteCharacters = atob(image.data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: image.mimeType });
                    downloadImage(blob, box.filename);
                }
            });
        } catch (err) {
            console.error('[useThongKeImageExport] Lỗi khi export nhiều hình ảnh:', err);
            setError(err.message || 'Không thể export hình ảnh');
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    /**
     * Extract và export tất cả các box từ container
     * @param {string} containerId - ID của container (default: 'tknhanh')
     */
    const exportAllBoxes = useCallback(async (containerId = 'tknhanh') => {
        setIsGenerating(true);
        setError(null);

        try {
            const boxes = extractAllBoxesHTML(containerId);
            
            if (boxes.length === 0) {
                throw new Error('Không tìm thấy box nào để export');
            }

            const boxesData = boxes.map(box => ({
                html: box.html,
                id: box.id,
                options: {}
            }));

            const images = await generateMultipleBoxImages(boxesData);

            // Download từng hình ảnh
            images.forEach((image, index) => {
                const box = boxes[index];
                if (box) {
                    const byteCharacters = atob(image.data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: image.mimeType });
                    const filename = `${box.title.replace(/[^a-z0-9]/gi, '_')}.png`;
                    downloadImage(blob, filename);
                }
            });
        } catch (err) {
            console.error('[useThongKeImageExport] Lỗi khi export tất cả boxes:', err);
            setError(err.message || 'Không thể export hình ảnh');
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        exportBoxImage,
        exportMultipleBoxImages,
        exportAllBoxes,
        isGenerating,
        error
    };
}

