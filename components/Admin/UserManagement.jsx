/**
 * User Management Component - Quản lý users (Admin only)
 */

import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Ban, CheckCircle, XCircle, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import styles from '../../styles/UserManagement.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UserManagement({ token, onClose }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(searchTerm && { search: searchTerm }),
                ...(roleFilter && { role: roleFilter })
            };

            const response = await axios.get(`${API_URL}/api/admin/users`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setUsers(response.data.data.users);
                setTotalPages(response.data.data.pagination.pages);
            }
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            displayName: user.displayName,
            role: user.role,
            isActive: user.isActive,
            chatBanned: user.chatBanned
        });
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(
                `${API_URL}/api/admin/users/${editingUser._id}`,
                editForm,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setEditingUser(null);
                fetchUsers();
            }
        } catch (error) {
            console.error('Update user error:', error);
            alert('Lỗi khi cập nhật người dùng');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        try {
            const response = await axios.delete(
                `${API_URL}/api/admin/users/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Delete user error:', error);
            alert('Lỗi khi xóa người dùng');
        }
    };

    const handleToggleBan = async (userId, currentStatus) => {
        try {
            const response = await axios.post(
                `${API_URL}/api/admin/users/${userId}/chat-ban`,
                { banned: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Toggle ban error:', error);
            alert('Lỗi khi cập nhật trạng thái cấm chat');
        }
    };

    return (
        <div className={styles.userManagement}>
            <div className={styles.header}>
                <h2>Quản Lý Người Dùng</h2>
                <button onClick={onClose} className={styles.closeButton}>Đóng</button>
            </div>

            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc username..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                    }}
                    className={styles.roleFilter}
                >
                    <option value="">Tất cả vai trò</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {loading ? (
                <div className={styles.loading}>Đang tải...</div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.usersTable}>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Tên hiển thị</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Chat Verified</th>
                                    <th>Chat Banned</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>
                                            {editingUser?._id === user._id ? (
                                                <input
                                                    type="text"
                                                    value={editForm.displayName}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, displayName: e.target.value })
                                                    }
                                                    className={styles.editInput}
                                                />
                                            ) : (
                                                user.displayName
                                            )}
                                        </td>
                                        <td>
                                            {editingUser?._id === user._id ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, role: e.target.value })
                                                    }
                                                    className={styles.editSelect}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            ) : (
                                                <span className={user.role === 'admin' ? styles.adminBadge : ''}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {editingUser?._id === user._id ? (
                                                <select
                                                    value={editForm.isActive}
                                                    onChange={(e) =>
                                                        setEditForm({ ...editForm, isActive: e.target.value === 'true' })
                                                    }
                                                    className={styles.editSelect}
                                                >
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            ) : (
                                                user.isActive ? (
                                                    <span className={styles.activeBadge}>Active</span>
                                                ) : (
                                                    <span className={styles.inactiveBadge}>Inactive</span>
                                                )
                                            )}
                                        </td>
                                        <td>
                                            {user.chatVerified ? (
                                                <CheckCircle size={18} className={styles.verified} />
                                            ) : (
                                                <XCircle size={18} className={styles.notVerified} />
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleBan(user._id, user.chatBanned)}
                                                className={`${styles.banButton} ${user.chatBanned ? styles.banned : ''}`}
                                                title={user.chatBanned ? 'Bỏ cấm chat' : 'Cấm chat'}
                                            >
                                                <Ban size={16} />
                                            </button>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                {editingUser?._id === user._id ? (
                                                    <>
                                                        <button
                                                            onClick={handleSave}
                                                            className={styles.saveButton}
                                                        >
                                                            Lưu
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className={styles.cancelButton}
                                                        >
                                                            Hủy
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className={styles.editButton}
                                                            title="Sửa"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            className={styles.deleteButton}
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Trước
                            </button>
                            <span>Trang {page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}




