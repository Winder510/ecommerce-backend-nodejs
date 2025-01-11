// server.js
import express from 'express';
import {
    createServer
} from 'http';
import {
    Server
} from 'socket.io';
import MessageService from "./src/services/consumerQueue.service.js";
import './src/dbs/init.mongo.js';

const initServer = async () => {
    const app = express();
    const httpServer = createServer(app);

    // Khởi tạo Socket.IO
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Quản lý kết nối Socket.IO
    const userSockets = new Map();

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('authenticate', (userId) => {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} authenticated with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            // Xóa mapping khi user disconnect
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    // Tạo global socket instance để sử dụng ở các service khác
    global.io = io;
    global.userSockets = userSockets;

    // Start server
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Khởi động các consumer
    try {
        await Promise.all([
            MessageService.consumeSyncData(),
            MessageService.consumeSyncDataFailed(),
            MessageService.consumeNotification(),
            MessageService.consumeNotificationFailed()
        ]);
        console.log('All consumers started successfully');
    } catch (error) {
        console.error('Error starting consumers:', error);
    }
};

// Start server và các services
initServer().catch(console.error);