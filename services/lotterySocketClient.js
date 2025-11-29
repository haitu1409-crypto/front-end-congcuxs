/**
 * Socket.io Client cho Live Lottery Results
 * Kết nối không cần authentication (public room)
 */

import { io } from 'socket.io-client';

class LotterySocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
    }

    /**
     * Kết nối đến server
     */
    connect() {
        if (this.socket?.connected) {
            // Nếu đã kết nối, yêu cầu dữ liệu mới nhất cho consumer mới
            this.socket.emit('lottery:get-latest');
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

        console.log('🔌 Connecting to lottery socket server:', SOCKET_URL);

        // Connect to /lottery namespace (không cần auth)
        this.socket = io(`${SOCKET_URL}/lottery`, {
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
            console.log('✅ Lottery socket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Request latest result (auto-joined to lottery:xsmb room)
            this.socket.emit('lottery:get-latest');

            this.notifyListeners('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Lottery socket disconnected:', reason);
            this.isConnected = false;
            this.notifyListeners('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Lottery socket connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('🔴 Max reconnection attempts reached');
                this.notifyListeners('connection_error', error);
            } else {
                console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            }
        });

        // Lottery events
        this.socket.on('lottery:latest', (data) => {
            console.log('📡 Received latest lottery result:', data);
            this.notifyListeners('lottery:latest', data);
        });

        this.socket.on('lottery:prize-update', (data) => {
            console.log('📡 Received prize update:', data);
            this.notifyListeners('lottery:prize-update', data);
        });

        this.socket.on('lottery:complete', (data) => {
            console.log('📡 Received complete result:', data);
            this.notifyListeners('lottery:complete', data);
        });

        this.socket.on('lottery:full-update', (data) => {
            console.log('📡 Received full update:', data);
            this.notifyListeners('lottery:full-update', data);
        });

        this.socket.on('lottery:pong', (data) => {
            // Heartbeat response
        });

        this.socket.on('lottery:error', (error) => {
            console.error('❌ Lottery socket error:', error);
            this.notifyListeners('lottery:error', error);
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
            this.socket.emit('lottery:get-latest');
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
        }
    }

    /**
     * Emit event
     */
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Lottery socket not connected, cannot emit:', event);
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
                this.socket.emit('lottery:ping');
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
const lotterySocketClient = new LotterySocketClient();

export default lotterySocketClient;

