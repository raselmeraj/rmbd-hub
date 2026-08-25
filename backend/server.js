require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'RMBD Hub API Running - Real MERN Stack', version: '1.0.0' });
});

// Socket.io Real-time logic
let onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('sendMessage', ({ senderId, receiverId, text, conversationId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('getMessage', {
        senderId,
        text,
        conversationId,
        createdAt: new Date()
      });
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('userTyping', senderId);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });
});

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected - RMBD Hub Real DB'))
  .catch(err => console.error('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('RMBD Hub Backend running on port ' + PORT);
});
