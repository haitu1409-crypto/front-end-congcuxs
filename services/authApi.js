/**
 * Auth API Service - Gọi API authentication
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const authApi = axios.create({
    baseURL: `${API_URL}/api/auth`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Register new user
export const register = async (userData) => {
    try {
        const response = await authApi.post('/register', {
            username: userData.username,
            displayName: userData.displayName,
            password: userData.password,
            confirmPassword: userData.confirmPassword
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi đăng ký' };
    }
};

// Login
export const login = async (username, password) => {
    try {
        const response = await authApi.post('/login', {
            username,
            password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi đăng nhập' };
    }
};

// Logout
export const logout = async (token) => {
    try {
        const response = await authApi.post('/logout', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi đăng xuất' };
    }
};

// Get current user
export const getMe = async (token) => {
    try {
        const response = await authApi.get('/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi lấy thông tin user' };
    }
};

// Update profile
export const updateProfile = async (token, profileData) => {
    try {
        const response = await authApi.put('/profile', profileData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Lỗi khi cập nhật thông tin' };
    }
};








