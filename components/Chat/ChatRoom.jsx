/**
 * ChatRoom Component - Groupchat interface
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../hooks/useSocket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import ChatQRCode from './ChatQRCode';
import { MessageCircle, Users, X, Wifi, WifiOff, QrCode, CheckSquare, Trash2, ArrowLeft } from 'lucide-react';
import styles from '../../styles/ChatRoom.module.css';
import MessageActionModal from './MessageActionModal';
import MessageModal from './MessageModal';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const MAX_CHAT_ATTACHMENTS = Number(process.env.NEXT_PUBLIC_CHAT_MAX_IMAGE_COUNT || 4);
const MAX_CHAT_IMAGE_BYTES = Number(process.env.NEXT_PUBLIC_CHAT_MAX_IMAGE_BYTES || 6 * 1024 * 1024);
const CHAT_IMAGE_TRANSFORMATION = process.env.NEXT_PUBLIC_CHAT_IMAGE_TRANSFORMATION || 'c_limit,w_1600,h_1600,q_auto,f_auto';
const CHAT_THUMB_TRANSFORMATION = process.env.NEXT_PUBLIC_CHAT_IMAGE_THUMB_TRANSFORMATION || 'c_limit,w_600,h_600,q_auto,f_auto';

const applyTransformation = (url, transformation) => {
    if (!url || !url.includes('/upload/')) {
        return url;
    }
    return url.replace('/upload/', `/upload/${transformation}/`);
};

const resolveAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (/^https?:\/\//i.test(avatar)) {
        return avatar;
    }
    return `${API_URL}${avatar}`;
};

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
    const { socket, isConnected: socketConnected } = useSocket();
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
    const [showMessageActionModal, setShowMessageActionModal] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [mediaUploading, setMediaUploading] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    
    // Reset avatarFailed when user avatar URL changes
    useEffect(() => {
        setAvatarFailed(false);
    }, [user?.avatar]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [otherParticipant, setOtherParticipant] = useState(null);
    const [newMessageNotification, setNewMessageNotification] = useState(null);
    const fileInputRef = useRef(null);
    const activeUploadsRef = useRef(0);
    const notificationTimeoutRef = useRef(null);
    const unreadCountsFetchedRef = useRef(false); // Track if initial fetch done
    const audioRef = useRef(null); // Audio notification for new messages
    const markAsReadCallRef = useRef({}); // Track mark as read calls to avoid duplicates
    // Use localStorage to persist cleared user IDs across component remounts
    const getClearedUserIds = () => {
        try {
            const stored = localStorage.getItem('chat_cleared_user_ids');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    };
    const clearedUserIdsRef = useRef(getClearedUserIds()); // Track user IDs that have been cleared (should not be re-added from backend)
    
    // Save cleared user IDs to localStorage whenever it changes
    const saveClearedUserIds = (userIdSet) => {
        try {
            localStorage.setItem('chat_cleared_user_ids', JSON.stringify(Array.from(userIdSet)));
        } catch (error) {
            console.error('Error saving cleared user IDs:', error);
        }
    };

    // Check if this is a private chat
    const isPrivateChat = roomId && roomId.startsWith('private_');
    
    // Auto-hide UserList when entering private chat (only once, not on every toggle)
    const prevIsPrivateChatRef = useRef(false);
    useEffect(() => {
        // Only hide if we just switched from groupchat to private chat
        if (isPrivateChat && !prevIsPrivateChatRef.current && showUserList) {
            setShowUserList(false);
        }
        prevIsPrivateChatRef.current = isPrivateChat;
    }, [isPrivateChat]);

    // Get other participant from online users list (for private chat)
    useEffect(() => {
        if (!isPrivateChat || !user || !token) {
            setOtherParticipant(null);
            return;
        }

        // Extract other userId from roomId format: private_userId1_userId2
        const parts = roomId.split('_');
        if (parts.length === 3) {
            const userId1 = parts[1];
            const userId2 = parts[2];
            const otherUserId = userId1 === user.id ? userId2 : userId1;
            
            // 🔥 SIMPLIFIED: Just clear unread badge locally when entering private chat
            // No need to mark as read immediately - user might just be checking
            // Only mark as read when they actually click the chat icon
            clearedUserIdsRef.current.add(otherUserId);
            saveClearedUserIds(clearedUserIdsRef.current);
            setUnreadCounts(prev => {
                if (!prev[otherUserId]) return prev;
                const newCounts = { ...prev };
                delete newCounts[otherUserId];
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
    }, [isPrivateChat, roomId, user, onlineUsers, token]);

    // Handle back to groupchat
    const handleBackToGroupchat = () => {
        // No need to refetch - socket events will keep counts updated
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

    // Handle private chat click - ULTRA SIMPLIFIED: Clear badge locally and mark as read ONCE
    // No backend queries, no duplicate calls - just simple frontend state + one socket event
    const handlePrivateChatClick = async (targetUser) => {
        // Retry logic for 429 errors
        const createPrivateChatWithRetry = async (attempt = 0) => {
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
                    
                    // 🔥 ULTRA SIMPLIFIED: Clear badge locally (instant UI update)
                    clearedUserIdsRef.current.add(targetUser.userId);
                    saveClearedUserIds(clearedUserIdsRef.current);
                    setUnreadCounts(prev => {
                        if (!prev[targetUser.userId]) return prev;
                        const newCounts = { ...prev };
                        delete newCounts[targetUser.userId];
                        return newCounts;
                    });
                    
                    // 🔥 Mark as read ONLY when user clicks chat icon (one socket event, no duplicate)
                    // Use cooldown to prevent duplicate calls
                    const now = Date.now();
                    const lastCall = markAsReadCallRef.current[privateRoomId];
                    if (!lastCall || (now - lastCall) > 5000) {
                        markAsReadCallRef.current[privateRoomId] = now;
                        if (socket && socketConnected) {
                            socket.emit('room:mark-read', { roomId: privateRoomId });
                        }
                    }
                    
                    // Navigate to private chat
                    router.push(`/chat?room=${privateRoomId}`);
                }
            } catch (error) {
                // Retry on 429 with exponential backoff (max 2 retries)
                if (error.response?.status === 429 && attempt < 2) {
                    const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
                    console.warn(`⚠️ Create private chat rate limited, retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return createPrivateChatWithRetry(attempt + 1);
                }
                
                console.error('Error creating private chat:', error);
                alert('Không thể tạo chat riêng. Vui lòng thử lại.');
            }
        };
        
        createPrivateChatWithRetry();
    };

    // 🔥 REAL-TIME: Listen for new private messages via Socket.io
    useEffect(() => {
        if (!socketConnected || !socket) return;

        const handlePrivateMessageNew = (data) => {
            console.log('🔔 Received private message notification:', data);
            
            // Don't show notification if already in this private chat
            const isInThisChat = isPrivateChat && 
                                otherParticipant && 
                                otherParticipant.userId === data.fromUserId;
            
            if (!isInThisChat) {
                // Update unread count instantly - socket events are the source of truth
                // Remove from cleared set if new messages arrive
                if (data.unreadCount > 0) {
                    clearedUserIdsRef.current.delete(data.fromUserId);
                    saveClearedUserIds(clearedUserIdsRef.current);
                }
                
                setUnreadCounts(prev => ({
                    ...prev,
                    [data.fromUserId]: data.unreadCount
                }));
                
                // 🔔 Play notification sound
                try {
                    if (audioRef.current) {
                        // Clone audio to allow playing multiple times
                        const audio = audioRef.current.cloneNode();
                        audio.volume = 0.5;
                        audio.play().catch(err => {
                            console.warn('🔊 Audio play failed (may need user interaction):', err.message);
                            // Fallback: try to play original audio
                            audioRef.current.play().catch(() => {
                                console.warn('🔊 Audio fallback also failed');
                            });
                        });
                        console.log('🔊 Playing notification sound');
                    } else {
                        console.warn('🔊 Audio ref not initialized');
                    }
                } catch (error) {
                    console.error('🔊 Error playing sound:', error);
                }
                
                // Show notification popup
                const sender = onlineUsers.find(u => u.userId === data.fromUserId);
                if (sender || data.fromDisplayName) {
                    showNewMessageNotification({
                        userId: data.fromUserId,
                        username: data.fromUsername,
                        displayName: data.fromDisplayName || sender?.displayName,
                        avatar: data.fromAvatar || sender?.avatar
                    });
                }
                
                console.log(`✅ Updated unread count for ${data.fromDisplayName}: ${data.unreadCount}`);
            }
        };

        // 🔥 SIMPLE: Listen for unread count updates - just update state
        const handleUnreadUpdated = (data) => {
            setUnreadCounts(prev => {
                // If count is 0, remove from state
                if (data.unreadCount === 0) {
                    if (!prev[data.fromUserId]) return prev; // Already cleared
                    clearedUserIdsRef.current.add(data.fromUserId); // Mark as cleared
                    saveClearedUserIds(clearedUserIdsRef.current);
                    const newCounts = { ...prev };
                    delete newCounts[data.fromUserId];
                    return newCounts;
                }
                
                // If count changed, update it (and remove from cleared set if new messages arrive)
                if (prev[data.fromUserId] !== data.unreadCount) {
                    clearedUserIdsRef.current.delete(data.fromUserId); // Remove from cleared set if new messages
                    saveClearedUserIds(clearedUserIdsRef.current);
                    return {
                        ...prev,
                        [data.fromUserId]: data.unreadCount
                    };
                }
                
                return prev; // No change
            });
        };

        // 🔥 SOCKET-BASED: Listen for mark as read confirmation
        const handleRoomMarkedRead = (data) => {
            // Socket confirmation that room was marked as read
            // This is just for logging/debugging - unread count updates come via private:unread:updated
            console.log(`✅ Room marked as read: ${data.roomId}, count: ${data.count}`);
        };

        // Register socket listeners
        socket.on('private:message:new', handlePrivateMessageNew);
        socket.on('private:unread:updated', handleUnreadUpdated);
        socket.on('room:marked-read', handleRoomMarkedRead);

        return () => {
            socket.off('private:message:new', handlePrivateMessageNew);
            socket.off('private:unread:updated', handleUnreadUpdated);
            socket.off('room:marked-read', handleRoomMarkedRead);
        };
    }, [socketConnected, socket, isPrivateChat, otherParticipant, onlineUsers]);

    // Initialize audio notification
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const audio = new Audio('/soundChat.mp3');
                audio.volume = 0.5; // 50% volume
                audio.preload = 'auto';
                // Try to load audio to avoid autoplay issues
                audio.load();
                audioRef.current = audio;
                console.log('🔊 Audio notification initialized');
                
                // Unlock audio on user interaction (required by browser autoplay policy)
                const unlockAudio = async () => {
                    if (audioRef.current) {
                        try {
                            await audioRef.current.play();
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            console.log('🔊 Audio unlocked via user interaction');
                        } catch (err) {
                            // Silent fail - will try again on actual play
                        }
                    }
                };
                
                // Unlock on any user interaction
                const events = ['click', 'touchstart', 'keydown'];
                events.forEach(event => {
                    document.addEventListener(event, unlockAudio, { once: true, passive: true });
                });
            } catch (error) {
                console.error('Failed to initialize audio:', error);
            }
        }
    }, []);

    // 🔥 SIMPLIFIED: No initial fetch - unread counts are managed by socket events only
    // When a new private message arrives, socket event will increment the count
    // When user clicks chat icon, we clear the count locally (no backend query needed)
    // This eliminates the 429 error from /api/chat/private/unread-counts


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
            setShowMessageActionModal(true);
        }
    };

    const handleReply = (message) => {
        setReplyingTo(message);
        setShowMessageActionModal(false);
        // Focus input
        setTimeout(() => {
            const input = document.querySelector(`textarea[class*="input"]`);
            if (input) {
                input.focus();
            }
        }, 100);
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleEdit = async (message) => {
        setEditingMessage(message);
        setEditing(true);
        setShowMessageActionModal(false);
    };

    const handleSaveEdit = async (content) => {
        if (!editingMessage || !content.trim()) return;
        
        setEditing(true);
        try {
            await editMessage(roomId, editingMessage.id || editingMessage._id, content.trim());
            setEditingMessage(null);
        } catch (error) {
            console.error('Edit error:', error);
            alert(error.message || 'Lỗi khi sửa tin nhắn');
        } finally {
            setEditing(false);
        }
    };

    const handleDelete = async (message) => {
        if (!message) return;
        
        if (!confirm('Bạn có chắc chắn muốn xóa tin nhắn này?')) {
            return;
        }
        
        setDeleting(true);
        try {
            await deleteMessage(roomId, message.id || message._id);
            setShowMessageActionModal(false);
            setSelectedMessage(null);
        } catch (error) {
            console.error('Delete error:', error);
            alert(error.message || 'Lỗi khi xóa tin nhắn');
        } finally {
            setDeleting(false);
        }
    };

    const handleUploadChatImage = async (file, options = {}) => {
        if (!file) {
            throw new Error('Không có file được chọn.');
        }

        if (!token) {
            throw new Error('Bạn cần đăng nhập để upload ảnh.');
        }

        activeUploadsRef.current += 1;
        setMediaUploading(true);

        let processedFile = file;
        try {
            const maxSizeMB = Math.max(Math.min(MAX_CHAT_IMAGE_BYTES / (1024 * 1024), 3.5), 0.3);
            processedFile = await imageCompression(file, {
                maxSizeMB,
                maxWidthOrHeight: 1400,
                useWebWorker: true,
                initialQuality: 0.75
            });
        } catch (compressionError) {
            console.warn('Không thể nén ảnh, dùng file gốc:', compressionError);
            processedFile = file;
        }

        const publicId = `chat_${user?.id || 'user'}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

        try {
            const signatureResponse = await axios.get(`${API_URL}/api/chat/media/signature`, {
                params: { publicId },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!signatureResponse.data?.success) {
                throw new Error(signatureResponse.data?.message || 'Không thể tạo cấu hình upload');
            }

            const signatureData = signatureResponse.data.data || {};

            if (signatureData.maxBytes && processedFile.size > signatureData.maxBytes) {
                const maxMB = Math.round(signatureData.maxBytes / (1024 * 1024));
                throw new Error(`Ảnh vượt quá giới hạn ${maxMB}MB.`);
            }

            const formData = new FormData();
            formData.append('file', processedFile);

            if (signatureData.mode === 'preset') {
                formData.append('upload_preset', signatureData.uploadPreset);
                if (signatureData.folder) {
                    formData.append('folder', signatureData.folder);
                }
            } else {
                if (!signatureData.signature || !signatureData.timestamp || !signatureData.apiKey) {
                    throw new Error('Thiếu thông tin ký upload');
                }

                formData.append('timestamp', signatureData.timestamp);
                formData.append('signature', signatureData.signature);
                formData.append('api_key', signatureData.apiKey);
                if (signatureData.folder) {
                    formData.append('folder', signatureData.folder);
                }
                formData.append('public_id', signatureData.publicId || publicId);
                formData.append('resource_type', 'image');
            }

            const uploadUrl = signatureData.uploadUrl || `https://api.cloudinary.com/v1_1/${signatureData.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

            const uploadResponse = await axios.post(uploadUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (event) => {
                    if (!event.total) return;
                    const percent = Math.round((event.loaded / event.total) * 100);
                    if (options?.onProgress) {
                        options.onProgress(percent);
                    }
                }
            });

            const uploadData = uploadResponse.data;
            const secureUrl = uploadData.secure_url || uploadData.url;

            if (!secureUrl || !uploadData.public_id) {
                throw new Error('Upload ảnh không thành công');
            }

            const mainTransformation = signatureData.transformation || CHAT_IMAGE_TRANSFORMATION;
            const thumbTransformation = signatureData.thumbTransformation || CHAT_THUMB_TRANSFORMATION;

            const optimizedUrl = applyTransformation(secureUrl, mainTransformation);
            const thumbnailUrl = applyTransformation(secureUrl, thumbTransformation);

            if (options?.onProgress) {
                options.onProgress(100);
            }

            return {
                url: optimizedUrl,
                secureUrl: optimizedUrl,
                thumbnailUrl,
                publicId: uploadData.public_id,
                resourceType: uploadData.resource_type || 'image',
                format: uploadData.format,
                bytes: uploadData.bytes,
                width: uploadData.width,
                height: uploadData.height,
                originalFilename: uploadData.original_filename,
                type: 'image'
            };
        } catch (directError) {
            console.warn('Cloudinary direct upload thất bại, thử dùng fallback:', directError);

            try {
                const fallbackForm = new FormData();
                fallbackForm.append('image', processedFile);

                const fallbackResponse = await axios.post(`${API_URL}/api/chat/media/image`, fallbackForm, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (event) => {
                        if (!event.total) return;
                        const percent = Math.round((event.loaded / event.total) * 100);
                        if (options?.onProgress) {
                            options.onProgress(percent);
                        }
                    }
                });

                if (fallbackResponse.data?.success && fallbackResponse.data?.data?.attachment) {
                    if (options?.onProgress) {
                        options.onProgress(100);
                    }
                    return fallbackResponse.data.data.attachment;
                }

                throw new Error(fallbackResponse.data?.message || 'Upload ảnh thất bại');
            } catch (fallbackError) {
                console.error('Upload chat image error:', fallbackError);
                const message = fallbackError.response?.data?.message || fallbackError.message || directError.message || 'Upload ảnh thất bại';
                throw new Error(message);
            }
        } finally {
            activeUploadsRef.current = Math.max(0, activeUploadsRef.current - 1);
            if (activeUploadsRef.current === 0) {
                setMediaUploading(false);
            }
        }
    };

    const handleSendMessage = (payload) => {
        if (!payload) return;
        sendMessage(payload);
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
                
                // Reset avatarFailed when new avatar is uploaded
                setAvatarFailed(false);
                
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

    const userAvatarMap = useMemo(() => {
        const map = new Map();
        onlineUsers.forEach(u => {
            if (u?.userId) {
                map.set(u.userId, u.avatar || null);
            }
        });
        if (user?.id) {
            map.set(user.id.toString(), user.avatar || null);
        }
        return map;
    }, [onlineUsers, user?.id, user?.avatar]);

    const enrichedMessages = useMemo(() => {
        if (!messages || messages.length === 0) return messages;
        return messages.map(msg => {
            if (msg.senderAvatar && /^https?:\/\//i.test(msg.senderAvatar)) {
                return msg;
            }
            const avatar = msg.senderAvatar || userAvatarMap.get(msg.senderId?.toString?.() || msg.senderId) || null;
            if (avatar && avatar !== msg.senderAvatar) {
                return { ...msg, senderAvatar: avatar };
            }
            return msg;
        });
    }, [messages, userAvatarMap]);

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
                    {isPrivateChat && (
                        <button
                            className={styles.backButton}
                            onClick={handleBackToGroupchat}
                            title="Quay lại groupchat"
                        >
                            <ArrowLeft size={18} />
                            <span className={styles.backButtonText}>Groupchat</span>
                        </button>
                    )}
                    {user ? (
                        <div 
                            className={styles.userAvatar}
                            onClick={handleAvatarClick}
                            style={{ 
                                backgroundColor: (user.avatar && !avatarFailed) ? 'transparent' : getColorFromLetter(getFirstLetter(user.displayName || user.username))
                            }}
                            title={uploadingAvatar ? 'Đang upload...' : 'Nhấn để đổi avatar'}
                        >
                            {user.avatar && !avatarFailed ? (
                                <img 
                                    key={user.avatar}
                                    src={resolveAvatarUrl(user.avatar)}
                                    alt={user.displayName || user.username}
                                    className={styles.avatarImage}
                                    crossOrigin="anonymous"
                                    onError={() => {
                                        setAvatarFailed(true);
                                        console.warn(`Avatar failed to load: ${user.avatar}`);
                                    }}
                                    onLoad={() => {
                                        // Successfully loaded - ensure failed state is cleared
                                        setAvatarFailed(false);
                                    }}
                                    loading="lazy"
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
                                    ? `${otherParticipant.displayName || otherParticipant.username}`
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
                    {/* 🔥 Ẩn QR code button trong private chat */}
                    {!isPrivateChat && (
                    <button
                        className={styles.qrCodeButton}
                        onClick={() => setShowQRCode(true)}
                        title="QR Code"
                    >
                        <QrCode size={18} />
                    </button>
                    )}
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
                {/* Overlay mờ nhẹ khi UserList mở - chỉ hiện trên mobile */}
                {showUserList && (
                    <div 
                        className={styles.userListOverlay}
                        onClick={() => setShowUserList(false)}
                        aria-label="Đóng danh sách thành viên"
                    />
                )}
                
                {/* User List Sidebar - Can be shown in both groupchat and private chat */}
                {showUserList && (
                    <div className={styles.userListSidebar}>
                        <UserList 
                            users={onlineUsers}
                            currentUserId={user?.id}
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
                messages={enrichedMessages}
                                typingUsers={typingUsers}
                                currentUserId={user?.id}
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
                onSend={handleSendMessage}
                onTyping={startTyping}
                onStopTyping={stopTyping}
                sending={sending}
                disabled={!isConnected}
                mentions={mentions}
                onCancelMentions={() => setMentions([])}
                replyTo={replyingTo}
                onCancelReply={handleCancelReply}
                onUploadImage={handleUploadChatImage}
                uploadingAttachment={mediaUploading}
                maxAttachments={MAX_CHAT_ATTACHMENTS}
                maxImageBytes={MAX_CHAT_IMAGE_BYTES}
            />

            {/* QR Code Modal */}
            <ChatQRCode
                isOpen={showQRCode}
                onClose={() => setShowQRCode(false)}
            />

            {/* Message Action Modal */}
            <MessageActionModal
                isOpen={showMessageActionModal}
                onClose={() => {
                    setShowMessageActionModal(false);
                    setSelectedMessage(null);
                }}
                message={selectedMessage}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                editing={editing}
                deleting={deleting}
            />
            
            {/* Edit Modal - Reuse existing MessageModal for editing */}
            {editingMessage && (
                <MessageModal
                    isOpen={!!editingMessage}
                    onClose={() => {
                        setEditingMessage(null);
                        setEditing(false);
                    }}
                    message={editingMessage}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    onMessageEdited={() => {
                        setEditingMessage(null);
                        setEditing(false);
                    }}
                    onMessageDeleted={() => {
                        setEditingMessage(null);
                        setEditing(false);
                    }}
                    roomId={roomId}
                    deleteMessage={deleteMessage}
                    editMessage={async (roomId, messageId, content) => {
                        await handleSaveEdit(content);
                    }}
                />
            )}
        </div>
    );
}

