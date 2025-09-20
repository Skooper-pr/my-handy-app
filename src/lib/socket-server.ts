import { Server } from 'socket.io';

// Global reference to the Socket.IO server instance
let io: Server | null = null;

// Function to set the Socket.IO server instance
export const setSocketServer = (socketServer: Server) => {
  io = socketServer;
};

// Function to get the Socket.IO server instance
export const getSocketServer = (): Server | null => {
  return io;
};