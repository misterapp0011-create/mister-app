import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

/**
 * Lazily creates a single authenticated socket connection, reused across
 * the app. Chat and live-tracking event handlers are added in later phases.
 */
export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('mister_token');
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: false,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
