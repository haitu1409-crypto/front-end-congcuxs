/**
 * Touch Sets Utility
 * Chạm trong xổ số là các số có chứa chữ số đó ít nhất 1 lần
 * Ví dụ: Chạm 0 gồm các số có chứa số 0: 00, 01, 02, ..., 09, 10, 20, 30, ..., 90
 * Chạm 1 gồm các số có chứa số 1: 01, 10, 11, 12, ..., 19, 21, 31, ..., 91
 */

// Tính chạm của một số (các chữ số chứa trong số đó)
export const getTouchOfNumber = (number) => {
    const numStr = number.toString().padStart(2, '0');
    const touches = [];

    // Thêm chữ số đầu
    touches.push(parseInt(numStr[0]));

    // Thêm chữ số thứ hai (nếu khác chữ số đầu)
    if (numStr[1] !== numStr[0]) {
        touches.push(parseInt(numStr[1]));
    }

    return touches;
};

// Tạo danh sách số theo chạm (0-9)
export const getAllTouchSets = () => {
    const touchSets = {};

    // Khởi tạo mảng cho mỗi chạm từ 0-9
    for (let touch = 0; touch <= 9; touch++) {
        touchSets[touch] = [];
    }

    // Phân loại tất cả số từ 00-99 theo chạm
    for (let num = 0; num <= 99; num++) {
        const numStr = num.toString().padStart(2, '0');
        const touches = getTouchOfNumber(num);

        // Thêm số vào tất cả các chạm mà nó thuộc về
        touches.forEach(touch => {
            if (touchSets[touch]) {
                touchSets[touch].push(numStr);
            }
        });
    }

    return touchSets;
};

// Lấy số theo chạm đã chọn
export const getNumbersByTouch = (selectedTouches) => {
    const touchSets = getAllTouchSets();
    const result = [];

    selectedTouches.forEach(touch => {
        if (touchSets[touch]) {
            result.push(...touchSets[touch]);
        }
    });

    return [...new Set(result)]; // Loại bỏ trùng lặp
};

// Lấy thông tin chạm cho hiển thị
export const getTouchInfo = () => {
    const touchSets = getAllTouchSets();
    return Object.keys(touchSets).map(touch => ({
        id: parseInt(touch),
        name: `Chạm ${touch}`,
        numbers: touchSets[touch],
        count: touchSets[touch].length
    }));
};
