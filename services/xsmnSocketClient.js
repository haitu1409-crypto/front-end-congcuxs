/**
 * Socket.io Client cho Live XSMN Results
 * Kết nối đến namespace /lottery-xsmn (public, không cần authentication)
 * Hỗ trợ nhiều tỉnh mỗi ngày (3-4 tỉnh)
 */

import { io } from 'socket.io-client';

class XSMNSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        // ✅ Reference counting để tự động disconnect khi không còn component nào sử dụng
        this.referenceCount = 0;
    }

    /**
     * Kết nối đến server
     */
    connect() {
        // ✅ OPTIMIZED: Kiểm tra kỹ hơn để tránh duplicate connections
        if (this.socket?.connected) {
            console.log('✅ XSMN Socket already connected, skipping new connection');
            // Nếu đã kết nối, yêu cầu dữ liệu mới nhất cho consumer mới
            this.socket.emit('xsmn:get-latest');
            return this.socket;
        }

        // ✅ OPTIMIZED: Nếu socket tồn tại nhưng chưa connected, đợi connection
        if (this.socket && !this.socket.connected) {
            console.log('⏳ XSMN Socket exists but not connected, waiting for connection...');
            return this.socket;
        }

        // Get socket URL - use production API as fallback
        let SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                ? 'http://localhost:5000' 
                : 'https://api1.taodandewukong.pro');

        // Log source of URL for debugging
        if (process.env.NEXT_PUBLIC_SOCKET_URL) {
            console.log('📡 Using NEXT_PUBLIC_SOCKET_URL:', process.env.NEXT_PUBLIC_SOCKET_URL);
        } else if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('📡 Using NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
        } else {
            console.warn('⚠️ No API URL env variable found, using fallback:', SOCKET_URL);
        }

        // Normalize URL
        if (SOCKET_URL.startsWith('ws://')) {
            SOCKET_URL = SOCKET_URL.replace('ws://', 'http://');
        } else if (SOCKET_URL.startsWith('wss://')) {
            SOCKET_URL = SOCKET_URL.replace('wss://', 'https://');
        }

        console.log('🔌 Connecting to XSMN socket server:', SOCKET_URL);

        // Connect to /lottery-xsmn namespace (không cần auth)
        this.socket = io(`${SOCKET_URL}/lottery-xsmn`, {
            // Không cần auth cho lottery room
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: this.maxReconnectAttempts,
            timeout: 20000,
            forceNew: false,
            autoConnect: true,
            path: '/socket.io/',
            withCredentials: false // Public room, không cần credentials
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ XSMN socket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Request latest result
            this.socket.emit('xsmn:get-latest');

            this.notifyListeners('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ XSMN socket disconnected:', reason);
            this.isConnected = false;
            this.notifyListeners('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ XSMN socket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('🔴 Max reconnection attempts reached');
                this.notifyListeners('connection_error', error);
            } else {
                console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            }
        });

        // XSMN events
        this.socket.on('xsmn:latest', (data) => {
            console.log('📡 Received latest XSMN result:', data);
            this.notifyListeners('xsmn:latest', data);
        });

        this.socket.on('xsmn:prize-update', (data) => {
            console.log('📡 Received XSMN prize update:', data);
            this.notifyListeners('xsmn:prize-update', data);
        });

        this.socket.on('xsmn:complete', (data) => {
            console.log('📡 Received XSMN complete result:', data);
            this.notifyListeners('xsmn:complete', data);
        });

        this.socket.on('xsmn:full-update', (data) => {
            console.log('📡 Received XSMN full update:', data);
            this.notifyListeners('xsmn:full-update', data);
        });

        this.socket.on('xsmn:pong', (data) => {
            // Heartbeat response
        });

        this.socket.on('xsmn:error', (error) => {
            console.error('❌ XSMN socket error:', error);
            this.notifyListeners('xsmn:error', error);
        });

        // Start heartbeat
        this.startHeartbeat();

        return this.socket;
    }

    /**
     * Yêu cầu dữ liệu latest thủ công
     */
    requestLatest() {
        if (this.socket && this.isConnected) {
            this.socket.emit('xsmn:get-latest');
        }
    }

    /**
     * Ngắt kết nối
     */
    disconnect() {
        if (this.socket) {
            this.stopHeartbeat();
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.referenceCount = 0; // Reset reference count khi disconnect thủ công
        }
    }

    /**
     * Tăng reference count (khi component mount)
     * Tự động connect nếu chưa connected
     */
    incrementRef() {
        this.referenceCount++;
        console.log(`📊 XSMN socket reference count: ${this.referenceCount}`);
        
        // Nếu chưa connected và có reference, tự động connect
        if (!this.isConnected && !this.socket) {
            this.connect();
        } else if (this.socket && !this.isConnected) {
            // Socket tồn tại nhưng chưa connected, đợi connection
            console.log('⏳ XSMN Socket exists but not connected, waiting...');
        }
    }

    /**
     * Giảm reference count (khi component unmount)
     * Tự động disconnect nếu reference count = 0
     */
    decrementRef() {
        if (this.referenceCount > 0) {
            this.referenceCount--;
            console.log(`📊 XSMN socket reference count: ${this.referenceCount}`);
        }
        
        // Nếu không còn component nào sử dụng, tự động disconnect
        if (this.referenceCount === 0 && this.socket) {
            console.log('🔌 No components using XSMN socket, disconnecting...');
            this.disconnect();
        }
    }

    /**
     * Lấy reference count hiện tại
     */
    getReferenceCount() {
        return this.referenceCount;
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('XSMN socket not connected, cannot emit:', event);
        }
    }

    /**
     * Listen to event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    /**
     * Remove listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    /**
     * Remove all listeners
     */
    removeAllListeners(event) {
        this.listeners.delete(event);
        if (this.socket) {
            this.socket.removeAllListeners(event);
        }
    }

    /**
     * Notify listeners
     */
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Listener error:', error);
                }
            });
        }
    }

    /**
     * Start heartbeat
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('xsmn:ping');
            }
        }, 30000); // 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            socket: this.socket
        };
    }
}

// Singleton instance
const xsmnSocketClient = new XSMNSocketClient();

export default xsmnSocketClient;


