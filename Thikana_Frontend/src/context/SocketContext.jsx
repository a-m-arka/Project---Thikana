import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const { token, logout } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return undefined;
    }

    const connection = io(socketUrl, { auth: { token } });
    const handleConnectionError = (error) => {
      if (/authentication|expired|invalid/i.test(error.message || '')) {
        logout();
      }
    };

    connection.on('connect_error', handleConnectionError);
    setSocket(connection);
    return () => {
      connection.off('connect_error', handleConnectionError);
      connection.disconnect();
      setSocket(null);
    };
  }, [token, logout]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
