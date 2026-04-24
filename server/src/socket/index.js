import { Server } from "socket.io";
import { env } from "../config/env.js";
import { setIo } from "../services/socketService.js";

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.emit("system:connected", { ok: true });
  });

  // Store the singleton so the queue worker can publish leaderboard refreshes.
  setIo(io);
  return io;
};
