import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Store connected users with their socket IDs
const connectedUsers = new Map<string, string>(); // userId -> socketId

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string
        email: string
        role: string
      };
      
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log('User connected:', user.userId, socket.id);
    
    // Store user connection
    connectedUsers.set(user.userId, socket.id);
    
    // Join user-specific room
    socket.join(`user_${user.userId}`);
    
    // Join role-specific room
    socket.join(`role_${user.role}`);

    // Handle booking status updates
    socket.on('booking_update', async (data: { 
      bookingId: string; 
      status: string; 
      message?: string 
    }) => {
      try {
        // Broadcast to relevant users
        const booking = await getBookingDetails(data.bookingId);
        if (booking) {
          // Notify customer
          const customerSocketId = connectedUsers.get(booking.customerId);
          if (customerSocketId) {
            io.to(customerSocketId).emit('booking_notification', {
              type: 'BOOKING_UPDATE',
              bookingId: data.bookingId,
              status: data.status,
              message: data.message || `تم تحديث حالة حجزك إلى ${data.status}`,
              timestamp: new Date().toISOString()
            });
          }

          // Notify craftsman
          const craftsmanSocketId = connectedUsers.get(booking.craftsmanId);
          if (craftsmanSocketId) {
            io.to(craftsmanSocketId).emit('booking_notification', {
              type: 'BOOKING_UPDATE',
              bookingId: data.bookingId,
              status: data.status,
              message: data.message || `تم تحديث حالة الحجز إلى ${data.status}`,
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        console.error('Error handling booking update:', error);
      }
    });

    // Handle new notifications
    socket.on('new_notification', (data: { 
      userId: string; 
      title: string; 
      message: string; 
      type: string 
    }) => {
      const targetSocketId = connectedUsers.get(data.userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('notification', {
          ...data,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle real-time messaging
    socket.on('send_message', (data: { 
      receiverId: string; 
      message: string; 
      bookingId?: string 
    }) => {
      const receiverSocketId = connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', {
          senderId: user.userId,
          senderName: user.email,
          message: data.message,
          bookingId: data.bookingId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle craftsman location updates
    socket.on('location_update', (data: { 
      latitude: number; 
      longitude: number; 
      bookingId?: string 
    }) => {
      if (user.role === 'CRAFTSMAN') {
        // Broadcast location to customer if there's an active booking
        socket.broadcast.emit('craftsman_location', {
          craftsmanId: user.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          bookingId: data.bookingId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', user.userId);
      connectedUsers.delete(user.userId);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Craftsmen Platform',
      userId: user.userId,
      timestamp: new Date().toISOString()
    });
  });
};

// Helper function to get booking details (would be implemented with actual DB call)
async function getBookingDetails(bookingId: string) {
  // This would be replaced with actual database query
  // For now, return mock data
  return {
    id: bookingId,
    customerId: 'customer1',
    craftsmanId: 'craftsman1',
    status: 'PENDING'
  };
}

// Utility function to send notification to specific user
export const sendNotificationToUser = (io: Server, userId: string, notification: {
  title: string;
  message: string;
  type: string;
}) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
};

// Utility function to broadcast to all users in a role
export const broadcastToRole = (io: Server, role: string, message: {
  title: string;
  message: string;
  type: string;
}) => {
  io.to(`role_${role}`).emit('broadcast', {
    ...message,
    timestamp: new Date().toISOString()
  });
};