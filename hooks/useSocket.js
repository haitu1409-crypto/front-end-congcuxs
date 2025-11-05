/**
 * useSocket Hook - Quản lý Socket.io connection
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import socketClient from '../services/socketClient';

export const useSocket = () => {
    const { token, isAuthenticated } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            // Disconnect if not authenticated
            socketClient.disconnect();
            setIsConnected(false);
            return;
        }

        // Check if already connected with same token
        if (socketClient.isConnected && socketRef.current) {
            // Check if token is still valid
            const currentToken = localStorage.getItem('auth_token');
            if (currentToken === token) {
                setIsConnected(true);
                return;
            } else {
                // Token changed, reconnect
                socketClient.disconnect();
            }
        }

        // Connect with new token
        try {
            socketRef.current = socketClient.connect(token);
            setIsConnected(socketClient.isConnected);
        } catch (error) {
            console.error('Failed to connect socket:', error);
            setIsConnected(false);
            setConnectionError(error.message || 'Failed to connect');
        }

        // Listen to connection events (using custom event names)
        const handleConnect = () => {
            setIsConnected(true);
            setConnectionError(null);
        };

        const handleDisconnect = (reason) => {
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // Server disconnected, reconnect manually
                setTimeout(() => {
                    if (token && isAuthenticated) {
                        socketClient.connect(token);
                    }
                }, 1000);
            }
        };

        const handleError = (error) => {
            setConnectionError(error?.message || 'Connection error');
            setIsConnected(false);
        };

        // Use custom event names instead of reserved ones
        socketClient.on('connected', handleConnect);
        socketClient.on('disconnected', handleDisconnect);
        socketClient.on('connection_error', handleError);

        // 🔥 OPTIMIZED: Heartbeat reduced from 30s to 15s for better online status accuracy
        const heartbeatInterval = setInterval(() => {
            if (socketClient.isConnected && socketRef.current) {
                socketRef.current.emit('ping');
            }
        }, 15000); // 15 seconds (reduced from 30s)

        // Cleanup
        return () => {
            clearInterval(heartbeatInterval);
            socketClient.off('connected', handleConnect);
            socketClient.off('disconnected', handleDisconnect);
            socketClient.off('connection_error', handleError);
        };
    }, [token, isAuthenticated]);

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        emit: socketClient.emit.bind(socketClient),
        on: socketClient.on.bind(socketClient),
        off: socketClient.off.bind(socketClient)
    };
};

