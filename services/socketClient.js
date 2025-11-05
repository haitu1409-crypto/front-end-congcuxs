/**
 * Socket.io Client Service
 * Quản lý kết nối Socket.io và realtime events
 */

import { io } from 'socket.io-client';

class SocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Connect to server
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                          process.env.NEXT_PUBLIC_API_URL || 
                          'http://localhost:5000';

        if (!token) {
            console.error('❌ No token provided for socket connection');
            throw new Error('Token is required for socket connection');
        }

        console.log('🔌 Connecting to socket server:', SOCKET_URL);
        
        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            query: {
                token: token // Also send in query as fallback
            },
            // Performance optimizations
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            // Reconnection strategy with exponential backoff
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000, // Increased from 5000
            reconnectionAttempts: 10, // Increased from 5
            timeout: 20000,
            forceNew: false, // Reuse connection if possible
            // Additional performance options
            autoConnect: true,
            multiplex: true, // Enable connection multiplexing
            // Reduce overhead
            perMessageDeflate: false, // Disable client-side compression (server handles it)
            path: '/socket.io/'
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Log connection info
            console.log('📊 Socket ID:', this.socket.id);
            console.log('📊 Transport:', this.socket.io.engine.transport.name);
            
            // Emit custom event instead of 'connect' (reserved)
            this.notifyListeners('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
            
            // Handle different disconnect reasons
            if (reason === 'io server disconnect') {
                // Server forced disconnect, try to reconnect manually after delay
                console.log('🔄 Server disconnected, will attempt reconnect...');
                setTimeout(() => {
                    if (!this.isConnected && token) {
                        console.log('🔄 Manual reconnect attempt...');
                        this.socket.connect();
                    }
                }, 2000);
            } else if (reason === 'transport close' || reason === 'transport error') {
                // Network issue, socket.io will auto-reconnect
                console.log('🔄 Network issue, auto-reconnecting...');
            }
            
            // Emit custom event instead of 'disconnect' (reserved)
            this.notifyListeners('disconnected', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', {
                message: error.message,
                type: error.type,
                description: error.description
            });
            this.reconnectAttempts++;
            
            // If auth error, don't reconnect
            if (error.message && (
                error.message.includes('xác thực') || 
                error.message.includes('token') ||
                error.message.includes('Token') ||
                error.message.includes('authentication')
            )) {
                console.error('🔐 Authentication failed, stopping reconnection');
                this.socket.disconnect();
                this.isConnected = false;
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('🔴 Max reconnection attempts reached');
            } else {
                console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            }
            
            // Emit custom event instead of 'connect_error' (reserved)
            this.notifyListeners('connection_error', error);
        });
        
        // Listen to reconnect events for better logging
        this.socket.io.on('reconnect_attempt', (attempt) => {
            console.log(`🔄 Reconnect attempt ${attempt}...`);
        });
        
        this.socket.io.on('reconnect', (attempt) => {
            console.log(`✅ Reconnected after ${attempt} attempts`);
            this.reconnectAttempts = 0;
        });
        
        this.socket.io.on('reconnect_failed', () => {
            console.error('🔴 Reconnection failed after all attempts');
        });

        // Heartbeat
        this.socket.on('pong', () => {
            // Heartbeat response
        });

        // Start heartbeat
        this.startHeartbeat();

        return this.socket;
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            this.stopHeartbeat();
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Emit event to server
    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot emit:', event);
        }
    }

    // Notify listeners (for internal events)
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

    // Listen to event
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    // Remove listener
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

    // Remove all listeners
    removeAllListeners(event) {
        this.listeners.delete(event);
        if (this.socket) {
            this.socket.removeAllListeners(event);
        }
    }

    // Start heartbeat
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('ping');
            }
        }, 30000); // 30 seconds
    }

    // Stop heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            socket: this.socket
        };
    }
}

// Singleton instance
const socketClient = new SocketClient();

export default socketClient;

