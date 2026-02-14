// Cupid Backend Server
// Node.js + Express Server

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Cupid', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchRoutes = require('./routes/matches');
const messageRoutes = require('./routes/messages');
const hmuRoutes = require('./routes/hmu');
const communityRoutes = require('./routes/communities');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/hmu', hmuRoutes);
app.use('/api/communities', communityRoutes);

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Socket.IO for Real-time Features
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // User joins
    socket.on('user-online', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.join(`user:${userId}`); // Join personal room

        // Broadcast online status to friends
        socket.broadcast.emit('user-status-change', {
            userId: userId,
            status: 'online'
        });

        console.log(`User ${userId} came online and joined room user:${userId}`);
    });

    // Handle private messages
    socket.on('private-message', (data) => {
        const { recipientId, message } = data;

        // Emit to recipient's room
        io.to(`user:${recipientId}`).emit('new-message', {
            senderId: socket.userId,
            message: message,
            timestamp: new Date()
        });

        // Save to database (in real app)
        console.log('Message from', socket.userId, 'to', recipientId);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        const { recipientId } = data;
        const recipientSocketId = connectedUsers.get(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('user-typing', {
                userId: socket.userId
            });
        }
    });

    // Handle video/voice calls
    socket.on('call-user', (data) => {
        const { recipientId, callType, offer } = data;
        const recipientSocketId = connectedUsers.get(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('incoming-call', {
                callerId: socket.userId,
                callType: callType,
                offer: offer
            });
        }
    });

    socket.on('answer-call', (data) => {
        const { callerId, answer } = data;
        const callerSocketId = connectedUsers.get(callerId);

        if (callerSocketId) {
            io.to(callerSocketId).emit('call-answered', {
                answer: answer
            });
        }
    });

    socket.on('ice-candidate', (data) => {
        const { recipientId, candidate } = data;
        const recipientSocketId = connectedUsers.get(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('ice-candidate', {
                candidate: candidate
            });
        }
    });

    // Community Chat
    socket.on('join-community', (communityId) => {
        socket.join(`community_${communityId}`);
        console.log(`User ${socket.id} joined community ${communityId}`);
    });

    socket.on('leave-community', (communityId) => {
        socket.leave(`community_${communityId}`);
    });

    // HMU Post Chat
    socket.on('join-hmu', (postId) => {
        socket.join(`hmu_${postId}`);
        console.log(`User ${socket.id} joined HMU post ${postId}`);
    });

    socket.on('leave-hmu', (postId) => {
        socket.leave(`hmu_${postId}`);
    });

    // User disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (socket.userId) {
            connectedUsers.delete(socket.userId);

            // Broadcast offline status
            socket.broadcast.emit('user-status-change', {
                userId: socket.userId,
                status: 'offline'
            });
        }
    });
});

app.set('io', io);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   Cupid Server Running!     ║
    ║   Port: ${PORT}                        ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ╚══════════════════════════════════════╝
    `);
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = { app, io };
