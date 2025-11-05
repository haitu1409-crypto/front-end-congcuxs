/**
 * ChatRoom Component - Groupchat interface
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ChatQRCode from './ChatQRCode';
import { MessageCircle, Users, X, Wifi, WifiOff, QrCode, CheckSquare, Trash2 } from 'lucide-react';
import styles from '../../styles/ChatRoom.module.css';
import MessageModal from './MessageModal';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get color from first letter
const getColorFromLetter = (letter) => {
    const upperLetter = letter.toUpperCase();
    const colors = {
        'A': '#667eea', 'B': '#f59e0b', 'C': '#10b981', 'D': '#3b82f6',
        'E': '#8b5cf6', 'F': '#ec4899', 'G': '#14b8a6', 'H': '#f97316',
        'I': '#6366f1', 'J': '#84cc16', 'K': '#eab308', 'L': '#06b6d4',
        'M': '#a855f7', 'N': '#22c55e', 'O': '#ef4444', 'P': '#06b6d4',
        'Q': '#f43f5e', 'R': '#0ea5e9', 'S': '#8b5cf6', 'T': '#14b8a6',
        'U': '#3b82f6', 'V': '#ec4899', 'W': '#10b981', 'X': '#f59e0b',
        'Y': '#667eea', 'Z': '#6366f1'
    };
    return colors[upperLetter] || '#9ca3af';
};

// Helper function to get first letter
const getFirstLetter = (name) => {
    if (!name) return '?';
    const firstChar = name.trim().charAt(0).toUpperCase();
    return /[A-Z]/.test(firstChar) ? firstChar : '?';
};

export default function ChatRoom({ roomId, onClose }) {
    const router = useRouter();
    const { user, isAdmin, token, updateUser } = useAuth();
    const {
        messages,
        loading,
        sending,
        typingUsers,
        onlineUsers,
        isConnected,
        sendMessage,
        startTyping,
        stopTyping,
        scrollToBottom,
        messagesEndRef,
        toggleReaction,
        deleteMessages,
        deleteMessage,
        editMessage
    } = useChat(roomId);

    const [showUserList, setShowUserList] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [mentions, setMentions] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState(new Set());
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [otherParticipant, setOtherParticipant] = useState(null);
    const [newMessageNotification, setNewMessageNotification] = useState(null);
    const fileInputRef = useRef(null);
    const notificationTimeoutRef = useRef(null);
    const previousUnreadCountsRef = useRef({});

    // Check if this is a private chat
    const isPrivateChat = roomId && roomId.startsWith('private_');

    // Get other participant from online users list (for private chat)
    useEffect(() => {
        if (!isPrivateChat || !user) {
            setOtherParticipant(null);
            return;
        }

        // Extract other userId from roomId format: private_userId1_userId2
        const parts = roomId.split('_');
        if (parts.length === 3) {
            const userId1 = parts[1];
            const userId2 = parts[2];
            const otherUserId = userId1 === user._id ? userId2 : userId1;
            
            // Clear unread count for this user immediately (entering private chat)
            // This ensures badge disappears instantly
            setUnreadCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[otherUserId];
                previousUnreadCountsRef.current = newCounts;
                return newCounts;
            });
            
            // Find in online users list
            const other = onlineUsers.find(u => u.userId === otherUserId);
            if (other) {
                setOtherParticipant(other);
            } else {
                // Fallback: Create basic participant object from userId
                setOtherParticipant({
                    userId: otherUserId,
                    displayName: 'User',
                    username: 'user'
                });
            }
        }
    }, [isPrivateChat, roomId, user, onlineUsers]);

    // Handle back to groupchat
    const handleBackToGroupchat = () => {
        // Refetch after 2 seconds to ensure backend has processed mark-as-read
        // mark-as-read happens after 1s in useChat hook, so 2s is safe
        setTimeout(() => {
            if (token) {
                axios.get(
                    `${API_URL}/api/chat/private/unread-counts`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                ).then(response => {
                    if (response.data.success) {
                        const newCounts = response.data.data.counts || {};
                        previousUnreadCountsRef.current = newCounts;
                        setUnreadCounts(newCounts);
                    }
                }).catch(err => {
                    console.error('Error refetching unread counts:', err);
                });
            }
        }, 2000);
        
        // Use replace to clear query param and not add to history
        router.replace('/chat', undefined, { shallow: false });
    };

    const handleReaction = async (messageId, emoji) => {
        await toggleReaction(messageId, emoji);
    };

    const handleToggleSelection = () => {
        setSelectionMode(!selectionMode);
        setSelectedMessages(new Set()); // Clear selection when toggling
    };

    const handleMessageSelect = (messageId) => {
        setSelectedMessages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(messageId)) {
                newSet.delete(messageId);
            } else {
                newSet.add(messageId);
            }
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedMessages.size === 0) return;
        
        const messageIds = Array.from(selectedMessages);
        await deleteMessages(roomId, messageIds);
        setSelectedMessages(new Set());
        setSelectionMode(false);
    };

    // Handle private chat click
    const handlePrivateChatClick = async (targetUser) => {
        try {
            // Create or get private chat room
            const response = await axios.post(
                `${API_URL}/api/chat/private/create`,
                { targetUserId: targetUser.userId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const privateRoomId = response.data.data.room.roomId;
                
                // Clear unread count for this user immediately (optimistic update)
                setUnreadCounts(prev => {
                    const newCounts = { ...prev };
                    delete newCounts[targetUser.userId];
                    // Also update ref to prevent stale data
                    previousUnreadCountsRef.current = newCounts;
                    return newCounts;
                });
                
                // Navigate to private chat
                router.push(`/chat?room=${privateRoomId}`);
            }
        } catch (error) {
            console.error('Error creating private chat:', error);
            alert('Không thể tạo chat riêng. Vui lòng thử lại.');
        }
    };

    // Fetch unread counts for all users
    useEffect(() => {
        if (!token || !user) return;

        const fetchUnreadCounts = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/chat/private/unread-counts`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    const newCounts = response.data.data.counts || {};
                    
                    // Check for new messages and show notification
                    Object.keys(newCounts).forEach(userId => {
                        const oldCount = previousUnreadCountsRef.current[userId] || 0;
                        const newCount = newCounts[userId] || 0;
                        
                        // Show notification only if:
                        // 1. Count increased (new message)
                        // 2. NOT in private chat with this user
                        if (newCount > oldCount) {
                            const isChattingWithThisUser = isPrivateChat && otherParticipant && otherParticipant.userId === userId;
                            if (!isChattingWithThisUser) {
                                const sender = onlineUsers.find(u => u.userId === userId);
                                if (sender) {
                                    showNewMessageNotification(sender);
                                }
                            }
                        }
                    });
                    
                    // Update both state and ref - use backend as single source of truth
                    previousUnreadCountsRef.current = newCounts;
                    setUnreadCounts(newCounts);
                }
            } catch (error) {
                console.error('Error fetching unread counts:', error);
            }
        };

        // Fetch initially
        fetchUnreadCounts();

        // Refetch every 5 seconds for real-time updates
        const interval = setInterval(fetchUnreadCounts, 5000);

        return () => {
            clearInterval(interval);
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, [token, user, onlineUsers, isPrivateChat, otherParticipant]);

    // Show new message notification
    const showNewMessageNotification = (sender) => {
        // Clear existing timeout
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        
        // Set new notification
        setNewMessageNotification({
            senderName: sender.displayName || sender.username,
            timestamp: Date.now()
        });
        
        // Auto-dismiss after 3 seconds
        notificationTimeoutRef.current = setTimeout(() => {
            setNewMessageNotification(null);
        }, 3000);
    };

    const handleMessageClick = (message) => {
        if (!selectionMode) {
            setSelectedMessage(message);
            setShowMessageModal(true);
        }
    };

    const handleMessageEdited = () => {
        // Message will be updated via socket event
        setShowMessageModal(false);
        setSelectedMessage(null);
    };

    const handleMessageDeleted = () => {
        // Message will be removed via socket event
        setShowMessageModal(false);
        setSelectedMessage(null);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File quá lớn. Vui lòng chọn file nhỏ hơn 2MB');
            return;
        }

        setUploadingAvatar(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axios.post(`${API_URL}/api/auth/avatar`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Update user in auth context immediately for real-time display
                const avatarUrl = response.data.data.url || response.data.data.user?.avatar;
                const updatedUser = {
                    ...user,
                    avatar: avatarUrl
                };
                updateUser(updatedUser);
            } else {
                throw new Error(response.data.message || 'Upload avatar thất bại');
            }
        } catch (error) {
            console.error('Upload avatar error:', error);
            alert(error.response?.data?.message || error.message || 'Lỗi khi upload avatar');
        } finally {
            setUploadingAvatar(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (!roomId) {
        return (
            <div className={styles.chatRoom}>
                <div className={styles.emptyState}>
                    <MessageCircle size={48} />
                    <p>Chọn phòng chat để bắt đầu</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chatRoom}>
            {/* New Message Notification */}
            {newMessageNotification && (
                <div className={styles.newMessageNotification}>
                    <MessageCircle size={16} />
                    <span>Bạn có tin nhắn mới từ: <strong>{newMessageNotification.senderName}</strong></span>
                </div>
            )}

            {/* Header */}
            <div className={`${styles.chatHeader} ${isPrivateChat ? styles.privateChatHeader : ''}`}>
                <div className={styles.chatHeaderLeft}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                    />
                    {user ? (
                        <div 
                            className={styles.userAvatar}
                            onClick={handleAvatarClick}
                            style={{ 
                                backgroundColor: user.avatar ? 'transparent' : getColorFromLetter(getFirstLetter(user.displayName || user.username))
                            }}
                            title={uploadingAvatar ? 'Đang upload...' : 'Nhấn để đổi avatar'}
                        >
                            {user.avatar ? (
                                <img 
                                    key={user.avatar} // Force re-render when avatar URL changes
                                    src={`${API_URL}${user.avatar}`}
                                    alt={user.displayName || user.username}
                                    className={styles.avatarImage}
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <span className={styles.avatarInitial}>{getFirstLetter(user.displayName || user.username)}</span>
                            )}
                        </div>
                    ) : (
                        <MessageCircle size={20} />
                    )}
                    <div>
                        <h3 className={styles.chatTitle}>
                            {isPrivateChat 
                                ? (otherParticipant 
                                    ? `Chat với ${otherParticipant.displayName || otherParticipant.username}`
                                    : 'Private Chat')
                                : 'Group Chat'}
                        </h3>
                        <div className={styles.chatStatus}>
                            {isConnected ? (
                                <>
                                    <Wifi size={12} />
                                    <span>Đang kết nối</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff size={12} />
                                    <span>Đang kết nối lại...</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.chatHeaderRight}>
                    {isPrivateChat && (
                        <button
                            className={styles.backButton}
                            onClick={handleBackToGroupchat}
                            title="Quay lại groupchat"
                        >
                            ← Groupchat
                        </button>
                    )}
                    {isAdmin && (
                        <>
                            {selectionMode ? (
                                <>
                                    <button
                                        className={styles.deleteButton}
                                        onClick={handleDeleteSelected}
                                        disabled={selectedMessages.size === 0}
                                        title={`Xóa ${selectedMessages.size} tin nhắn`}
                                    >
                                        <Trash2 size={18} />
                                        {selectedMessages.size > 0 && (
                                            <span className={styles.selectedCount}>{selectedMessages.size}</span>
                                        )}
                                    </button>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={handleToggleSelection}
                                        title="Hủy chọn"
                                    >
                                        <X size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={styles.selectButton}
                                    onClick={handleToggleSelection}
                                    title="Chọn tin nhắn để xóa"
                                >
                                    <CheckSquare size={18} />
                                </button>
                            )}
                        </>
                    )}
                    <button
                        className={styles.qrCodeButton}
                        onClick={() => setShowQRCode(true)}
                        title="QR Code"
                    >
                        <QrCode size={18} />
                    </button>
                    <button
                        className={styles.userListButton}
                        onClick={() => setShowUserList(!showUserList)}
                        title="Danh sách thành viên"
                    >
                        <Users size={18} />
                        <span className={styles.userCount}>
                            {onlineUsers.filter(u => u.status === 'online').length}/{onlineUsers.length}
                        </span>
                        {(() => {
                            const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
                            return totalUnread > 0 && (
                                <span className={styles.unreadBadge}>
                                    {totalUnread > 99 ? '99+' : totalUnread}
                                </span>
                            );
                        })()}
                    </button>
                    {onClose && (
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            title="Đóng"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={styles.chatContent}>
                {/* User List Sidebar */}
                {showUserList && (
                    <div className={styles.userListSidebar}>
                        <UserList 
                            users={onlineUsers}
                            currentUserId={user?._id}
                            currentUserRole={user?.role}
                            onPrivateChatClick={handlePrivateChatClick}
                            unreadCounts={unreadCounts}
                        />
                    </div>
                )}

                {/* Messages */}
                <div className={`${styles.messagesContainer} ${isPrivateChat ? styles.privateChatBackground : ''}`}>
                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải tin nhắn...</p>
                        </div>
                    ) : (
                        <>
                            <MessageList
                                messages={messages}
                                typingUsers={typingUsers}
                                currentUserId={user?._id}
                                messagesEndRef={messagesEndRef}
                                selectionMode={selectionMode}
                                selectedMessages={selectedMessages}
                                onMessageSelect={handleMessageSelect}
                                onMessageClick={handleMessageClick}
                                isAdmin={isAdmin}
                                onMention={(userData) => {
                                    // Add to mentions if not already added
                                    setMentions(prev => {
                                        const exists = prev.find(m => m.userId === userData.userId);
                                        if (!exists) {
                                            return [...prev, userData];
                                        }
                                        return prev;
                                    });
                                    // Focus input to allow typing
                                    setTimeout(() => {
                                        const input = document.querySelector(`.${styles.messageInput} input`);
                                        if (input) {
                                            input.focus();
                                        }
                                    }, 100);
                                }}
                                onReaction={handleReaction}
                            />
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Input */}
            <MessageInput
                onSend={sendMessage}
                onTyping={startTyping}
                onStopTyping={stopTyping}
                sending={sending}
                disabled={!isConnected}
                mentions={mentions}
                onCancelMentions={() => setMentions([])}
            />

            {/* QR Code Modal */}
            <ChatQRCode
                isOpen={showQRCode}
                onClose={() => setShowQRCode(false)}
            />

            {/* Message Modal */}
            <MessageModal
                isOpen={showMessageModal}
                onClose={() => {
                    setShowMessageModal(false);
                    setSelectedMessage(null);
                }}
                message={selectedMessage}
                currentUserId={user?._id}
                isAdmin={isAdmin}
                onMessageEdited={handleMessageEdited}
                onMessageDeleted={handleMessageDeleted}
                roomId={roomId}
                deleteMessage={deleteMessage}
                editMessage={editMessage}
            />
        </div>
    );
}

