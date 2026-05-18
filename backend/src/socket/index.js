const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('../models/User');

const onlineUsers = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL?.split(',') || '*',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Socket token required.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.isBlocked) {
        return next(new Error('Socket authentication failed.'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', async (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { online: true, lastSeenAt: new Date() });
    socket.broadcast.emit('presence:update', { userId, online: true });

    socket.on('typing:start', ({ recipientId }) => {
      io.to(recipientId).emit('typing:start', { senderId: userId });
    });

    socket.on('typing:stop', ({ recipientId }) => {
      io.to(recipientId).emit('typing:stop', { senderId: userId });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeenAt: new Date() });
      socket.broadcast.emit('presence:update', { userId, online: false });
    });
  });

  io.onlineUsers = onlineUsers;
  return io;
};

module.exports = initSocket;
