/**
 * Editable Cell Component
 * Component ô có thể chỉnh sửa trong bảng thống kê
 */

import { useState, useEffect, useRef } from 'react';
import styles from '../../styles/ThongKe.module.css';

export default function EditableCell({
    value,
    onSave,
    isEditing,
    type = 'text',
    maxLength = 2,
    pattern = null,
    placeholder = '',
    className = '',
    isNhanCell = false // Thêm prop để xác định ô "Nhận"
}) {
    const [editValue, setEditValue] = useState(value || '');
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        setEditValue(value || '');
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const validateInput = (inputValue) => {
        if (!inputValue) return true; // Empty is valid

        if (pattern) {
            const regex = new RegExp(pattern);
            return regex.test(inputValue);
        }

        return true;
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setEditValue(newValue);
        setIsValid(validateInput(newValue));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setEditValue(value || '');
            setIsValid(true);
            onSave(value || ''); // Cancel edit
        }
    };

    const handleBlur = () => {
        handleSave();
    };

    const handleSave = () => {
        if (isValid) {
            let finalValue = editValue;

            if (isNhanCell && finalValue) {
                // Chuyển 'x' thường thành 'X' hoa
                finalValue = finalValue.replace(/x/g, 'X');

                // Nếu người dùng chỉ nhập số (0-9) mà không có X, tự động thêm X
                if (/^\d$/.test(finalValue)) {
                    finalValue = finalValue + 'X';
                }
            }

            onSave(finalValue);
        } else {
            setEditValue(value || '');
            setIsValid(true);
            onSave(value || '');
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                value={editValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                maxLength={maxLength}
                placeholder={placeholder}
                className={`${styles.editableInput} ${!isValid ? styles.invalidInput : ''} ${className}`}
            />
        );
    }

    return (
        <span className={`${styles.editableValue} ${className}`}>
            {value || ''}
        </span>
    );
}
