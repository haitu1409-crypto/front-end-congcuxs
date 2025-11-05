/**
 * Auth Button Component - Nút đăng nhập/đăng ký trong navbar
 */

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AuthModal from './AuthModal';
import UserManagement from '../Admin/UserManagement';
import styles from '../../styles/AuthButton.module.css';

export default function AuthButton({ variant = 'desktop' }) {
    const { user, logout, isAuthenticated, token } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const menuRef = useRef(null);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    if (isAuthenticated) {
        return (
            <>
                <div className={`${styles.authButton} ${styles[variant]} ${styles.hasDropdown}`} ref={menuRef}>
                    <div 
                        className={styles.userInfo}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <User size={16} />
                        <span className={styles.userName}>{user?.displayName || user?.username}</span>
                        {user?.role === 'admin' && (
                            <span className={styles.adminBadge}>Admin</span>
                        )}
                        <ChevronDown 
                            size={14} 
                            className={`${styles.chevron} ${showUserMenu ? styles.chevronOpen : ''}`} 
                        />
                    </div>
                    
                    {/* User Menu Dropdown - Giống submenu Thống Kê */}
                    {showUserMenu && (
                        <div className={styles.userMenu}>
                            {user?.role === 'admin' && (
                                <button
                                    onClick={() => {
                                        setShowUserManagement(true);
                                        setShowUserMenu(false);
                                    }}
                                    className={styles.menuItem}
                                >
                                    <Settings size={16} />
                                    <span>Quản lý người dùng</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className={styles.menuItem}
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
                
                {/* User Management Modal */}
                {showUserManagement && user?.role === 'admin' && (
                    <UserManagement
                        token={token}
                        onClose={() => setShowUserManagement(false)}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <button
                onClick={handleOpenModal}
                className={`${styles.authButton} ${styles.loginButton} ${styles[variant]}`}
            >
                <User size={16} />
                <span>Đăng Nhập</span>
            </button>
            <AuthModal isOpen={isModalOpen} onClose={handleCloseModal} />
        </>
    );
}

