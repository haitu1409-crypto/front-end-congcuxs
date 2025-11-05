/**
 * useAuth Hook - Quản lý authentication state
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { register as registerApi, login as loginApi, logout as logoutApi, getMe } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        let isMounted = true;
        const abortController = new AbortController();
        
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            
            // Verify token with server
            getMe(storedToken)
                .then((response) => {
                    if (!isMounted) return;
                    
                    if (response.success) {
                        setUser(response.data.user);
                        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('auth_user');
                        if (isMounted) {
                            setToken(null);
                            setUser(null);
                        }
                    }
                })
                .catch(() => {
                    if (!isMounted) return;
                    
                    // Token invalid, clear storage
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => {
                    if (isMounted) {
                        setLoading(false);
                    }
                });
        } else {
            setLoading(false);
        }

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, []);

    // Register
    const register = async (userData) => {
        try {
            const response = await registerApi(userData);
            if (response.success) {
                const { user: newUser, token: newToken } = response.data;
                setUser(newUser);
                setToken(newToken);
                localStorage.setItem('auth_token', newToken);
                localStorage.setItem('auth_user', JSON.stringify(newUser));
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Lỗi khi đăng ký'
            };
        }
    };

    // Login
    const login = async (username, password) => {
        try {
            const response = await loginApi(username, password);
            if (response.success) {
                const { user: loggedUser, token: newToken } = response.data;
                setUser(loggedUser);
                setToken(newToken);
                localStorage.setItem('auth_token', newToken);
                localStorage.setItem('auth_user', JSON.stringify(loggedUser));
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || error.errors?.[0]?.msg || 'Lỗi khi đăng nhập'
            };
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (token) {
                await logoutApi(token);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    };

    // Update user (for real-time updates like avatar)
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    };

    // Refresh user data from server
    const refreshUser = async () => {
        try {
            if (token) {
                const response = await getMe(token);
                if (response.success) {
                    setUser(response.data.user);
                    localStorage.setItem('auth_user', JSON.stringify(response.data.user));
                    return response.data.user;
                }
            }
        } catch (error) {
            console.error('Refresh user error:', error);
        }
        return null;
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        register,
        login,
        logout,
        updateUser,
        refreshUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

