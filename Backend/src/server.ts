import http from 'http';
import app from './app';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.io initialization for KDS and real-time updates
const io = new Server(server, {
  cors: {
    origin: '*', // To be restricted in production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Attach io to the app so controllers can use it
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Real-time events to be added (e.g., KDS updates, notifications)
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// MongoDB Connection and Server Start
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Backend API Link: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
