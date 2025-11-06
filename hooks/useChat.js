/**
 * useChat Hook - Quản lý chat state và messages
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useChat = (roomId) => {
    const { token, user } = useAuth();
    const { socket, isConnected, emit, on, off } = useSocket();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const messagesLoadedRef = useRef(false);
    const lastRoomIdRef = useRef(null);
    
    // Message queue for batching updates (reduce re-renders)
    const messageQueueRef = useRef([]);
    const messageQueueTimerRef = useRef(null);
    // Message Map for O(1) lookup instead of O(n) find
    const messageMapRef = useRef(new Map());
    // Scroll throttling (supports both requestAnimationFrame and setTimeout)
    const scrollTimeoutRef = useRef(null);
    const scrollIsRAFRef = useRef(false); // Track if using requestAnimationFrame
    const lastScrollTimeRef = useRef(0);
    
    // Typing indicator throttling (prevent spam)
    const lastTypingEmitRef = useRef(0);
    const typingThrottleDelay = 2000; // 2 seconds
    
    // Mark as read call tracking (prevent duplicate calls)
    const markAsReadCallRef = useRef({});
    
    // Audio notification for new messages
    const audioRef = useRef(null);
    
    // Initialize audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const audio = new Audio('/soundChat.mp3');
                audio.volume = 0.5; // 50% volume
                audio.preload = 'auto';
                // Try to load audio to avoid autoplay issues
                audio.load();
                audioRef.current = audio;
                console.log('🔊 Audio notification initialized in useChat');
                
                // Unlock audio on user interaction (required by browser autoplay policy)
                const unlockAudio = async () => {
                    if (audioRef.current) {
                        try {
                            await audioRef.current.play();
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            console.log('🔊 Audio unlocked via user interaction in useChat');
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

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Load messages
    const loadMessages = useCallback(async () => {
        if (!roomId || !token) return;
        
        // Prevent multiple loads for same room
        if (messagesLoadedRef.current && lastRoomIdRef.current === roomId) {
            return;
        }

        // Retry logic for 429 errors
        const loadMessagesWithRetry = async (attempt = 0) => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/chat/room/${roomId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success) {
                    setMessages(response.data.data.messages || []);
                    messagesLoadedRef.current = true;
                    lastRoomIdRef.current = roomId;
                    setTimeout(scrollToBottom, 100);
                }
            } catch (error) {
                // Retry on 429 with exponential backoff (max 2 retries)
                if (error.response?.status === 429 && attempt < 2) {
                    const retryDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
                    console.warn(`⚠️ Load messages rate limited, retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    return loadMessagesWithRetry(attempt + 1);
                }
                
                // Log error only if not 429 or after max retries
                if (error.response?.status !== 429) {
                    console.error('Load messages error:', error);
                }
            } finally {
                setLoading(false);
            }
        };
        
        loadMessagesWithRetry();
    }, [roomId, token, scrollToBottom]);

    // Send message
    const sendMessage = useCallback(async (payload, legacyReplyToId = null, legacyMentions = [], legacyReplyTo = null) => {
        if (!roomId || sending) return;

        let messagePayload = null;

        if (typeof payload === 'string') {
            const trimmed = payload.trim();
            if (!trimmed) {
                return;
            }

            messagePayload = {
                roomId,
                content: trimmed,
                type: 'text',
                mentions: legacyMentions
            };

            if (legacyReplyTo) {
                messagePayload.replyTo = typeof legacyReplyTo === 'object' ? (legacyReplyTo.id || legacyReplyTo._id) : legacyReplyTo;
            } else if (legacyReplyToId) {
                messagePayload.replyTo = legacyReplyToId;
            }
        } else if (payload && typeof payload === 'object') {
            const {
                content: payloadContent = '',
                type: payloadType = 'text',
                mentions: payloadMentions = [],
                replyTo: payloadReplyTo = null,
                attachments: payloadAttachments = []
            } = payload;

            const trimmed = typeof payloadContent === 'string' ? payloadContent.trim() : '';
            const hasAttachments = Array.isArray(payloadAttachments) && payloadAttachments.length > 0;

            if (!trimmed && !hasAttachments) {
                return;
            }

            const resolvedMentions = (payloadMentions && payloadMentions.length > 0) ? payloadMentions : legacyMentions;
            const resolvedType = payloadType || (hasAttachments ? 'image' : 'text');
            let resolvedReplyTo = payloadReplyTo;
            if (!resolvedReplyTo) {
                resolvedReplyTo = legacyReplyTo || legacyReplyToId || null;
            }

            messagePayload = {
                roomId,
                content: trimmed,
                type: resolvedType,
                mentions: resolvedMentions,
                attachments: hasAttachments ? payloadAttachments.map(att => ({ ...att })) : []
            };

            if (resolvedReplyTo) {
                if (typeof resolvedReplyTo === 'object') {
                    const replyId = resolvedReplyTo.id || resolvedReplyTo._id;
                    if (replyId) {
                        messagePayload.replyTo = replyId;
                    }
                } else {
                    messagePayload.replyTo = resolvedReplyTo;
                }
            }
        } else {
            return;
        }

        try {
            setSending(true);
            emit('message:send', messagePayload);

            setTimeout(() => {
                if (messagesEndRef.current) {
                    messagesEndRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                        inline: 'nearest'
                    });
                }
            }, 100);
        } catch (error) {
            console.error('Send message error:', error);
        } finally {
            setSending(false);
        }
    }, [roomId, emit, sending, messagesEndRef]);

    // Start typing with throttling (prevent spam)
    const startTyping = useCallback(() => {
        if (!roomId) return;

        // Throttle: Only emit if 2 seconds have passed since last emit
        const now = Date.now();
        if (now - lastTypingEmitRef.current < typingThrottleDelay) {
            return;
        }
        lastTypingEmitRef.current = now;

        emit('typing:start', { roomId });

        // Stop typing after 3 seconds
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            emit('typing:stop', { roomId });
            lastTypingEmitRef.current = 0; // Reset throttle
        }, 3000);
    }, [roomId, emit]);

    // Stop typing
    const stopTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (roomId) {
            emit('typing:stop', { roomId });
            lastTypingEmitRef.current = 0; // Reset throttle
        }
    }, [roomId, emit]);

    // Toggle reaction
    const toggleReaction = useCallback(async (messageId, emoji) => {
        if (!messageId || !emoji || !isConnected) return;

        try {
            // Use socket for real-time updates
            emit('message:reaction', {
                messageId,
                emoji
            });
        } catch (error) {
            console.error('Toggle reaction error:', error);
        }
    }, [emit, isConnected]);

    // Delete messages - Admin only
    const deleteMessages = useCallback(async (roomId, messageIds) => {
        if (!roomId || !messageIds || messageIds.length === 0 || !isConnected) return;

        try {
            // Use socket for real-time updates
            emit('messages:delete', {
                roomId,
                messageIds
            });
        } catch (error) {
            console.error('Delete messages error:', error);
            // Fallback to API if socket fails
            try {
                const response = await axios.delete(`${API_URL}/api/chat/messages`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: { messageIds }
                });
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Lỗi khi xóa tin nhắn');
                }
            } catch (apiError) {
                console.error('Delete messages API error:', apiError);
                throw apiError;
            }
        }
    }, [emit, isConnected, token]);

    // Delete single message
    const deleteMessage = useCallback(async (roomId, messageId) => {
        if (!roomId || !messageId || !isConnected) return;

        try {
            // Use socket for real-time updates
            emit('message:delete', {
                roomId,
                messageId
            });
        } catch (error) {
            console.error('Delete message error:', error);
            // Fallback to API if socket fails
            try {
                const response = await axios.delete(`${API_URL}/api/chat/message/${messageId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Lỗi khi xóa tin nhắn');
                }
            } catch (apiError) {
                console.error('Delete message API error:', apiError);
                throw apiError;
            }
        }
    }, [emit, isConnected, token]);

    // Edit message
    const editMessage = useCallback(async (roomId, messageId, content) => {
        if (!roomId || !messageId || !content || !isConnected) return;

        try {
            // Use socket for real-time updates
            emit('message:edit', {
                roomId,
                messageId,
                content: content.trim()
            });
        } catch (error) {
            console.error('Edit message error:', error);
            // Fallback to API if socket fails
            try {
                const response = await axios.put(`${API_URL}/api/chat/message/${messageId}`, {
                    content: content.trim()
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Lỗi khi sửa tin nhắn');
                }
                return response.data.data.message;
            } catch (apiError) {
                console.error('Edit message API error:', apiError);
                throw apiError;
            }
        }
    }, [emit, isConnected, token]);

    // Join room
    const joinRoom = useCallback(() => {
        if (!roomId || !isConnected) return;
        emit('room:join', { roomId });
    }, [roomId, isConnected, emit]);

    // Leave room
    const leaveRoom = useCallback(() => {
        if (!roomId) return;
        emit('room:leave', { roomId });
    }, [roomId, emit]);

    // Reset flags when roomId changes
    useEffect(() => {
        if (lastRoomIdRef.current !== roomId) {
            messagesLoadedRef.current = false;
            setMessages([]);
            setTypingUsers([]);
        }
    }, [roomId]);

    // Setup socket listeners
    useEffect(() => {
        if (!isConnected || !roomId) {
            messagesLoadedRef.current = false;
            return;
        }

        // Join room
        if (socket) {
            socket.emit('room:join', { roomId });
        } else if (emit) {
            emit('room:join', { roomId });
        }

        // Message batch handler with client-side queue batching
        const handleMessagesBatch = (data) => {
            if (data.roomId === roomId) {
                // Add messages to queue instead of updating state immediately
                messageQueueRef.current.push(...data.messages);
                
                // Clear existing timer
                if (messageQueueTimerRef.current) {
                    clearTimeout(messageQueueTimerRef.current);
                }
                
                // 🔥 OPTIMIZED: Reduced delay from 16ms to 8ms for ultra-low latency (120fps feel)
                // Or immediately if queue is large (burst messages) - threshold reduced from 10 to 5
                const delay = messageQueueRef.current.length > 5 ? 0 : 8;
                
                messageQueueTimerRef.current = setTimeout(() => {
                    if (messageQueueRef.current.length === 0) return;
                    
                    let hasNewMessage = false;
                    let shouldPlaySound = false;
                    const queuedMessages = [...messageQueueRef.current];
                    messageQueueRef.current = []; // Clear queue
                    
                    setMessages(prev => {
                        // Use Map for O(1) lookup instead of O(n) find
                        const messagesMap = new Map();
                        let isPrivateChat = roomId && roomId.startsWith('private_');
                        
                        // Add existing messages to Map (maintain sorted order from prev)
                        prev.forEach(msg => {
                            const msgId = (msg.id || msg._id).toString();
                            messagesMap.set(msgId, msg);
                        });
                        
                        // Add new messages (deduplication with O(1) lookup)
                        queuedMessages.forEach(msg => {
                            const msgId = (msg.id || msg._id).toString();
                            if (!messagesMap.has(msgId)) {
                                messagesMap.set(msgId, msg);
                                hasNewMessage = true;
                                
                                // Check if should play sound (both private chat and groupchat)
                                const isFromOther = msg.senderId !== user?.id;
                                if (isFromOther) {
                                    shouldPlaySound = true;
                                }
                            }
                        });
                        
                        // Convert Map back to sorted array (only sort if needed)
                        const result = Array.from(messagesMap.values()).sort((a, b) => {
                            const timeA = new Date(a.createdAt).getTime();
                            const timeB = new Date(b.createdAt).getTime();
                            return timeA - timeB;
                        });
                        
                        // Update message map ref for next batch
                        messageMapRef.current = new Map(result.map(msg => {
                            const msgId = (msg.id || msg._id).toString();
                            return [msgId, msg];
                        }));
                        
                        return result;
                    });
                    
                    // Play sound if needed
                    if (shouldPlaySound) {
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
                                console.log('🔊 Playing notification sound for new message');
                            } else {
                                console.warn('🔊 Audio ref not initialized in useChat');
                            }
                        } catch (error) {
                            console.error('🔊 Error playing sound:', error);
                        }
                    }
                    
                    // 🔥 OPTIMIZED: Use requestAnimationFrame for smoother scroll (reduced throttle from 100ms to 16ms)
                    if (hasNewMessage) {
                        const now = Date.now();
                        if (now - lastScrollTimeRef.current > 16) { // 1 frame at 60fps instead of 100ms
                            lastScrollTimeRef.current = now;
                            if (scrollTimeoutRef.current) {
                                // Clean up previous animation frame or timeout
                                if (scrollIsRAFRef.current) {
                                    cancelAnimationFrame(scrollTimeoutRef.current);
                                } else {
                                clearTimeout(scrollTimeoutRef.current);
                                }
                            }
                            // Use requestAnimationFrame for smoother, frame-synced scrolling
                            scrollIsRAFRef.current = true;
                            scrollTimeoutRef.current = requestAnimationFrame(() => {
                                if (messagesEndRef.current) {
                                    messagesEndRef.current.scrollIntoView({ 
                                        behavior: 'smooth',
                                        block: 'end',
                                        inline: 'nearest'
                                    });
                                }
                                scrollTimeoutRef.current = null;
                            });
                        }
                    }
                }, delay);
            }
        };

        // Message history handler
        const handleMessagesHistory = (data) => {
            if (data.roomId === roomId) {
                const messages = data.messages || [];
                setMessages(messages);
                // Update message map ref for O(1) lookups
                messageMapRef.current = new Map(messages.map(msg => {
                    const msgId = (msg.id || msg._id).toString();
                    return [msgId, msg];
                }));
                messagesLoadedRef.current = true;
                // 🔥 OPTIMIZED: Use requestAnimationFrame for smoother initial scroll
                requestAnimationFrame(() => {
                    if (messagesEndRef.current) {
                        messagesEndRef.current.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'end',
                            inline: 'nearest'
                        });
                    }
                });
            }
        };

        // Typing handlers
        const handleTypingUser = (data) => {
            if (data.roomId === roomId && data.userId !== user?.id) {
                setTypingUsers(prev => {
                    const exists = prev.find(u => u.userId === data.userId);
                    if (!exists) {
                        return [...prev, { userId: data.userId, username: data.username, displayName: data.displayName }];
                    }
                    return prev;
                });

                // Remove after 3 seconds
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
                }, 3000);
            }
        };

        const handleTypingStop = (data) => {
            if (data.roomId === roomId) {
                setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
            }
        };

        // User online/offline - Update status only
        const handleUserOnline = (data) => {
            // Only update if for current room
            if (data.roomId === roomId || !data.roomId) {
                setOnlineUsers(prev => {
                    const exists = prev.find(u => u.userId === data.userId);
                    if (exists) {
                        // Update existing user status
                        return prev.map(u => 
                            u.userId === data.userId 
                                ? { ...u, status: 'online', avatar: data.avatar || u.avatar }
                                : u
                        );
                    } else {
                        // Add new user
                        return [...prev, { 
                            userId: data.userId, 
                            username: data.username, 
                            displayName: data.displayName,
                            avatar: data.avatar || null,
                            role: data.role || 'user',
                            status: 'online'
                        }].sort((a, b) => {
                            // Online first
                            if (a.status === 'online' && b.status === 'offline') return -1;
                            if (a.status === 'offline' && b.status === 'online') return 1;
                            return (a.displayName || '').localeCompare(b.displayName || '');
                        });
                    }
                });
            }
        };

        const handleUserOffline = (data) => {
            // Only update if for current room
            if (data.roomId === roomId || !data.roomId) {
                setOnlineUsers(prev => 
                    prev.map(u => 
                        u.userId === data.userId 
                            ? { ...u, status: 'offline', lastSeen: data.lastSeen }
                            : u
                    ).sort((a, b) => {
                        // Online first
                        if (a.status === 'online' && b.status === 'offline') return -1;
                        if (a.status === 'offline' && b.status === 'online') return 1;
                        return (a.displayName || '').localeCompare(b.displayName || '');
                    })
                );
            }
        };

        // Handle users list (all participants with status)
        const handleUsersList = (data) => {
            if (data.roomId === roomId && data.users) {
                setOnlineUsers(data.users); // Already sorted from backend
            }
        };
        
        // Keep backward compatibility with old event
        const handleOnlineUsersList = (data) => {
            if (data.roomId === roomId && data.users) {
                setOnlineUsers(data.users.map(u => ({
                    userId: u.userId,
                    username: u.username,
                    displayName: u.displayName,
                    avatar: u.avatar || null,
                    role: u.role || 'user',
                    status: u.status || 'online'
                })));
            }
        };

        // Handle reaction update
        const handleReactionUpdate = (data) => {
            if (data.messageId) {
                setMessages(prev => prev.map(msg => {
                    const msgId = msg.id || msg._id;
                    if (msgId === data.messageId) {
                        return {
                            ...msg,
                            reactions: data.reactions || []
                        };
                    }
                    return msg;
                }));
            }
        };

        // Handle messages deleted (bulk)
        const handleMessagesDeleted = (data) => {
            if (data.roomId === roomId && data.messageIds) {
                setMessages(prev => prev.filter(msg => {
                    const msgId = msg.id || msg._id;
                    return !data.messageIds.includes(msgId.toString());
                }));
            }
        };

        // Handle single message deleted
        const handleMessageDeleted = (data) => {
            if (data.roomId === roomId && data.messageId) {
                setMessages(prev => prev.filter(msg => {
                    const msgId = msg.id || msg._id;
                    return msgId.toString() !== data.messageId;
                }));
            }
        };

        // Handle message edited
        const handleMessageEdited = (data) => {
            if (data.roomId === roomId && data.messageId) {
                setMessages(prev => prev.map(msg => {
                    const msgId = msg.id || msg._id;
                    if (msgId.toString() === data.messageId) {
                        return {
                            ...msg,
                            content: data.content,
                            isEdited: data.isEdited,
                            updatedAt: data.updatedAt
                        };
                    }
                    return msg;
                }));
            }
        };

        // Error handler
        const handleError = (error) => {
            console.error('Chat error:', error);
        };

        // Register listeners (only if socket is connected)
        if (isConnected) {
            on('messages:batch', handleMessagesBatch);
            on('messages:history', handleMessagesHistory);
            on('typing:user', handleTypingUser);
            on('typing:stop', handleTypingStop);
            on('user:online', handleUserOnline);
            on('user:offline', handleUserOffline);
            on('users:list', handleUsersList); // New event for all users
            on('users:online:list', handleOnlineUsersList); // Backward compatibility
            on('message:reaction:updated', handleReactionUpdate);
            on('messages:deleted', handleMessagesDeleted);
            on('message:deleted', handleMessageDeleted);
            on('message:edited', handleMessageEdited);
            on('error', handleError);
        }

        // 🔥 FIX: Use loadMessages function instead of duplicate axios.get
        // This ensures retry logic and prevents duplicate calls
        const shouldLoad = !messagesLoadedRef.current || lastRoomIdRef.current !== roomId;
        if (shouldLoad && roomId && token) {
            loadMessages();
        }

        // Cleanup
        return () => {
            // Clear message queue timer
            if (messageQueueTimerRef.current) {
                clearTimeout(messageQueueTimerRef.current);
            }
            if (scrollTimeoutRef.current) {
                // Clean up properly based on type
                if (scrollIsRAFRef.current) {
                    cancelAnimationFrame(scrollTimeoutRef.current);
                } else {
                clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = null;
                scrollIsRAFRef.current = false;
            }
            messageQueueRef.current = [];
            messageMapRef.current.clear();
            
            off('messages:batch', handleMessagesBatch);
            off('messages:history', handleMessagesHistory);
            off('typing:user', handleTypingUser);
            off('typing:stop', handleTypingStop);
            off('user:online', handleUserOnline);
            off('user:offline', handleUserOffline);
            off('users:list', handleUsersList);
            off('users:online:list', handleOnlineUsersList);
            off('message:reaction:updated', handleReactionUpdate);
            off('messages:deleted', handleMessagesDeleted);
            off('message:deleted', handleMessageDeleted);
            off('message:edited', handleMessageEdited);
            off('error', handleError);
            
            if (socket && roomId) {
                socket.emit('room:leave', { roomId });
            } else if (emit && roomId) {
                emit('room:leave', { roomId });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected, roomId, user?.id, token]); // Remove on, off, socket from dependencies to prevent infinite loop

    // 🔥 REMOVED: Auto mark as read when loading messages
    // This was causing too many socket events and potential 429 errors
    // Mark as read is now ONLY done when user clicks chat icon (manual action)
    // This simplifies the logic and reduces unnecessary backend queries

    return {
        messages,
        loading,
        sending,
        typingUsers,
        onlineUsers,
        unreadCount,
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
    };
};

