import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { SessionService } from './sessionService';
import { AgentService } from './agentService';
import { Message } from '../models';

export class SocketService {
  private activeGenerations: Set<string> = new Set(); // Track which sessions are generating

  constructor(
    private io: Server,
    private sessionService: SessionService,
    private agentService: AgentService
  ) {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket) {
    console.log('Client connected:', socket.id);

    socket.on('join_session', (sessionId: string) => {
      socket.join(sessionId);
      const session = this.sessionService.getSession(sessionId);
      if (session) {
        socket.emit('session_joined', session);
      }
    });

    socket.on('start_discussion', async (sessionId: string) => {
      await this.startDiscussion(sessionId);
    });

    socket.on('moderator_input', (data: { sessionId: string; content: string; type: string }) => {
      this.handleModeratorInput(data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  }

  private async startDiscussion(sessionId: string) {
    const session = this.sessionService.getSession(sessionId);
    if (!session || session.status !== 'active') return;

    const firstAgent = this.agentService.getNextAgent(session);
    if (!firstAgent) return;

    await this.generateAgentResponse(sessionId, firstAgent.id);
  }

  private async generateAgentResponse(sessionId: string, agentId: string) {
    const session = this.sessionService.getSession(sessionId);
    if (!session || session.status !== 'active') {
      this.activeGenerations.delete(sessionId);
      return;
    }

    // Prevent multiple simultaneous generations for the same session
    if (this.activeGenerations.has(sessionId)) {
      return;
    }
    this.activeGenerations.add(sessionId);

    const agent = session.participants.find(p => p.id === agentId);
    if (!agent) {
      this.activeGenerations.delete(sessionId);
      return;
    }

    this.io.to(sessionId).emit('agent_thinking', { agentId, sessionId });

    const recentMessages = this.sessionService.getRecentMessages(sessionId, 10);
    
    try {
      const response = await this.agentService.generateResponse(agent, session, recentMessages);
      
      const message: Message = {
        id: uuidv4(),
        sessionId,
        agentId,
        content: response,
        timestamp: new Date(),
        type: 'agent',
        metadata: {
          tokensUsed: 0,
          responseTime: 0
        }
      };

      this.sessionService.addMessage(sessionId, message);
      this.io.to(sessionId).emit('agent_message', message);

      // Remove from active generations
      this.activeGenerations.delete(sessionId);

      // Schedule next agent response with longer delay
      setTimeout(() => {
        const updatedSession = this.sessionService.getSession(sessionId);
        if (updatedSession && updatedSession.status === 'active') {
          const nextAgent = this.agentService.getNextAgent(updatedSession, agentId);
          if (nextAgent) {
            this.generateAgentResponse(sessionId, nextAgent.id);
          }
        }
      }, 3000); // Increased delay to 3 seconds

    } catch (error) {
      console.error('Error generating agent response:', error);
      this.activeGenerations.delete(sessionId);
      this.io.to(sessionId).emit('error', { 
        message: 'Failed to generate agent response', 
        code: 'AGENT_ERROR' 
      });
    }
  }

  private handleModeratorInput(data: { sessionId: string; content: string; type: string }) {
    const { sessionId, content, type } = data;
    
    if (type === 'pause') {
      this.sessionService.updateSessionStatus(sessionId, 'paused');
      this.activeGenerations.delete(sessionId); // Stop any ongoing generation
    } else if (type === 'resume') {
      this.sessionService.updateSessionStatus(sessionId, 'active');
      // Add small delay before restarting to ensure clean state
      setTimeout(() => {
        this.startDiscussion(sessionId);
      }, 500);
    }

    const message: Message = {
      id: uuidv4(),
      sessionId,
      agentId: 'moderator',
      content,
      timestamp: new Date(),
      type: 'moderator',
      metadata: {
        tokensUsed: 0,
        responseTime: 0
      }
    };

    this.sessionService.addMessage(sessionId, message);
    this.io.to(sessionId).emit('moderator_input', { sessionId, content, type });
    this.io.to(sessionId).emit('agent_message', message);
  }
}