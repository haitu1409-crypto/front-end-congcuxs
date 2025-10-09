/**
 * Sum Sets Utility
 * Tổng trong xổ số là tổng các chữ số của số đó
 * Ví dụ: số 23 có tổng = 2 + 3 = 5, thuộc tổng 5
 * Số 99 có tổng = 9 + 9 = 18, tổng = 8 (lấy chữ số cuối)
 */

// Tính tổng của một số
export const getSumOfNumber = (number) => {
    const numStr = number.toString().padStart(2, '0');
    const sum = parseInt(numStr[0]) + parseInt(numStr[1]);
    return sum % 10;
};

// Tạo danh sách số theo tổng (0-9)
export const getAllSumSets = () => {
    const sumSets = {};
    
    // Khởi tạo mảng cho mỗi tổng từ 0-9
    for (let sum = 0; sum <= 9; sum++) {
        sumSets[sum] = [];
    }
    
    // Phân loại tất cả số từ 00-99 theo tổng
    for (let num = 0; num <= 99; num++) {
        const numStr = num.toString().padStart(2, '0');
        const sum = getSumOfNumber(num);
        sumSets[sum].push(numStr);
    }
    
    return sumSets;
};

// Lấy số theo tổng đã chọn
export const getNumbersBySum = (selectedSums) => {
    const sumSets = getAllSumSets();
    const result = [];
    
    selectedSums.forEach(sum => {
        if (sumSets[sum]) {
            result.push(...sumSets[sum]);
        }
    });
    
    return [...new Set(result)]; // Loại bỏ trùng lặp
};

// Lấy thông tin tổng cho hiển thị
export const getSumInfo = () => {
    const sumSets = getAllSumSets();
    return Object.keys(sumSets).map(sum => ({
        id: parseInt(sum),
        name: `Tổng ${sum}`,
        numbers: sumSets[sum],
        count: sumSets[sum].length
    }));
};
