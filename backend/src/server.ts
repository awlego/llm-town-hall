import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { sessionRoutes } from './routes/sessions';
import { profileRoutes } from './routes/profiles';
import { SocketService } from './services/socketService';
import { SessionService } from './services/sessionService';
import { AgentService } from './services/agentService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const sessionService = new SessionService();
const agentService = new AgentService();
const socketService = new SocketService(io, sessionService, agentService);

app.use('/api/sessions', sessionRoutes(sessionService));
app.use('/api/profiles', profileRoutes());

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});