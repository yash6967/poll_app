import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleSocketConnections } from './socket/PollSocketHandler';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/live-polling';

// Simple health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Setup Socket.io connections
handleSocketConnections(io);

// Start server immediately so it doesn't crash if DB is down
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
const connectDB = () => {
    mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000 // Timeout early to prevent hanging
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB, will not crash server:', err.message);
    });
};

connectDB();

// Handle unexpected MongoDB disconnections gracefully
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});
