import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

/**
 * Socket.io is initialized here so the HTTP + WS server share one port
 * (required by Railway). Chat + live GPS tracking handlers are added in
 * later phases (job pipeline / live tracking phase) — this currently just
 * authenticates the socket connection via the same JWT used for the API.
 */
export function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Missing auth token'));
      const payload = verifyToken(token);
      socket.user = { id: payload.sub, role: payload.role, email: payload.email };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket] connected: ${socket.user.email} (${socket.user.role})`);

    // Future phases will add:
    // - chat:join / chat:message (offers + messages)
    // - job:location (contractor live GPS every 10s)
    // - job:status (en_route / arrived / in_progress / completed)

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.user.email}`);
    });
  });

  return io;
}
