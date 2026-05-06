// Socket.io client hook for UrbanGuard-AI real-time job dispatch
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function useSocket(role, userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    }
    socketRef.current = socketInstance;

    if (role && userId) {
      socketInstance.emit('join_room', { role, userId });
    } else if (role === 'admin') {
      socketInstance.emit('join_room', { role });
    }

    return () => {
      // Don't disconnect on unmount — keep connection alive
    };
  }, [role, userId]);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { on, emit, socket: socketRef.current };
}
