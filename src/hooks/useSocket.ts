import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface SocketState {
  connected: boolean;
  error: string | null;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const { url = 'ws://localhost:3001', autoConnect = true } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    error: null,
  });

  useEffect(() => {
    if (!autoConnect) return;

    socketRef.current = io(url, {
      transports: ['websocket'],
      timeout: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setState({ connected: true, error: null });
    });

    socket.on('disconnect', () => {
      setState({ connected: false, error: null });
    });

    socket.on('connect_error', (error) => {
      setState({ connected: false, error: error.message });
    });

    return () => {
      socket.disconnect();
    };
  }, [url, autoConnect]);

  const emit = (event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return {
    socket: socketRef.current,
    connected: state.connected,
    error: state.error,
    emit,
    on,
    off,
  };
};

// Hook for ride-related socket events
export const useRideSocket = () => {
  const { socket, connected, emit, on, off } = useSocket();

  const joinRide = (rideId: string) => {
    emit('join-ride', { rideId });
  };

  const leaveRide = (rideId: string) => {
    emit('leave-ride', { rideId });
  };

  const updateDriverLocation = (rideId: string, location: { lat: number; lng: number }) => {
    emit('driver-location-update', { rideId, location });
  };

  return {
    socket,
    connected,
    joinRide,
    leaveRide,
    updateDriverLocation,
    on,
    off,
  };
};

// Hook for driver-related socket events  
export const useDriverSocket = () => {
  const { socket, connected, emit, on, off } = useSocket();

  const goOnline = (location: { lat: number; lng: number }) => {
    emit('driver-online', { location });
  };

  const goOffline = () => {
    emit('driver-offline');
  };

  const updateLocation = (location: { lat: number; lng: number }) => {
    emit('location-update', { location });
  };

  return {
    socket,
    connected,
    goOnline,
    goOffline,
    updateLocation,
    on,
    off,
  };
};