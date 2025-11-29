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
        this.usedFallbackTransports = false;
    }

    // Connect to server
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        // Get socket URL - normalize to http/https (Socket.io will handle ws:// conversion)
        // Use production API as fallback (only use localhost in development)
        let SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 
                          process.env.NEXT_PUBLIC_API_URL || 
                          (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                              ? 'http://localhost:5000' 
                              : 'https://api1.taodandewukong.pro');

        // Normalize URL: remove ws:// or wss:// prefix, use http:// or https://
        // Socket.io client will automatically convert to ws:// or wss://
        if (SOCKET_URL.startsWith('ws://')) {
            SOCKET_URL = SOCKET_URL.replace('ws://', 'http://');
        } else if (SOCKET_URL.startsWith('wss://')) {
            SOCKET_URL = SOCKET_URL.replace('wss://', 'https://');
        }

        if (!token) {
            console.error('❌ No token provided for socket connection');
            throw new Error('Token is required for socket connection');
        }

        console.log('🔌 Connecting to socket server:', SOCKET_URL);

        const websocketOnlyTransports = ['websocket'];
        const fallbackTransports = ['websocket', 'polling'];
        const transports = this.usedFallbackTransports ? fallbackTransports : websocketOnlyTransports;
        const allowUpgrade = transports.length > 1;
        
        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            },
            query: {
                token: token // Also send in query as fallback
            },
            transports,
            upgrade: allowUpgrade,
            rememberUpgrade: allowUpgrade,
            // Reconnection strategy with exponential backoff
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 10,
            timeout: 20000,
            forceNew: false, // Reuse connection if possible
            // Additional performance options
            autoConnect: true,
            multiplex: true, // Enable connection multiplexing
            // Reduce overhead
            perMessageDeflate: false, // Disable client-side compression (server handles it)
            path: '/socket.io/',
            // 🔥 FIX: Better error handling
            withCredentials: true
        });

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Socket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Log connection info
            console.log('📊 Socket ID:', this.socket.id);
            const transport = this.socket.io?.engine?.transport?.name || 'unknown';
            console.log('📊 Transport:', transport);
            
            // If using polling, log that it will upgrade to WebSocket
            if (transport === 'polling') {
                console.log('📊 Will upgrade to WebSocket when available');
            }
            
            // Emit custom event instead of 'connect' (reserved)
            this.notifyListeners('connected');
        });
        
        // 🔥 FIX: Listen for transport upgrade events
        this.socket.io.on('upgrade', () => {
            const transport = this.socket.io?.engine?.transport?.name || 'unknown';
            console.log('📊 Transport upgraded to:', transport);
        });
        
        this.socket.io.on('upgradeError', (error) => {
            console.warn('⚠️ Transport upgrade error (will continue with polling):', error.message);
            // Don't fail - polling is still working
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
                description: error.description,
                transport: this.socket?.io?.engine?.transport?.name || 'unknown'
            });
            this.reconnectAttempts++;
            
            // Nếu WebSocket bị chặn hoặc không hỗ trợ, fallback sang polling một lần
            if (!this.usedFallbackTransports && (error.type === 'TransportError' || error.message?.includes('websocket'))) {
                console.warn('⚠️ WebSocket handshake thất bại, fallback sang polling...');
                this.usedFallbackTransports = true;
                if (this.socket) {
                    this.stopHeartbeat();
                    this.socket.off('connect');
                    this.socket.off('disconnect');
                    this.socket.off('connect_error');
                    this.socket.disconnect();
                    this.socket = null;
                }
                // Thử kết nối lại ngay với cấu hình fallback
                setTimeout(() => {
                    try {
                        this.connect(token);
                    } catch (fallbackError) {
                        console.error('❌ Fallback polling connection error:', fallbackError);
                    }
                }, 0);
                return;
            }
            
            // If auth error, don't reconnect
            if (error.message && (
                error.message.includes('xác thực') || 
                error.message.includes('token') ||
                error.message.includes('Token') ||
                error.message.includes('authentication') ||
                error.message.includes('Unauthorized')
            )) {
                console.error('🔐 Authentication failed, stopping reconnection');
                this.socket.disconnect();
                this.isConnected = false;
                this.notifyListeners('connection_error', error);
                return;
            }
            
            // If max attempts reached
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('🔴 Max reconnection attempts reached');
                this.notifyListeners('connection_error', error);
                return;
            }
            
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
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
        this.usedFallbackTransports = false;
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

        // 🔥 OPTIMIZED: Reduced heartbeat from 30s to 15s for better online status accuracy
        this.heartbeatInterval = setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.emit('ping');
            }
        }, 15000); // 15 seconds (reduced from 30s for better accuracy)
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

