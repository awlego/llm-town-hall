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
        content: response.content,
        timestamp: new Date(),
        type: 'agent',
        consensus: response.consensus,
        metadata: {
          tokensUsed: 0,
          responseTime: 0
        }
      };

      this.sessionService.addMessage(sessionId, message);
      
      // Handle consensus-specific logic
      if (session.type === 'consensus' && session.consensus) {
        this.sessionService.updateConsensusState(sessionId, message);
        
        // Check if consensus reached
        if (session.consensus.consensusReached) {
          this.io.to(sessionId).emit('consensus_reached', {
            decision: session.consensus.finalDecision,
            round: session.consensus.currentRound
          });
          this.io.to(sessionId).emit('agent_message', message);
          this.activeGenerations.delete(sessionId);
          return;
        }
        
        // Check if we should advance to next round
        if (this.sessionService.shouldAdvanceConsensusRound(sessionId)) {
          this.sessionService.advanceConsensusRound(sessionId);
          this.io.to(sessionId).emit('consensus_round_advance', {
            round: session.consensus.currentRound
          });
        }
      }

      this.io.to(sessionId).emit('agent_message', message);

      // Remove from active generations
      this.activeGenerations.delete(sessionId);

      // Schedule next agent response
      setTimeout(() => {
        const updatedSession = this.sessionService.getSession(sessionId);
        if (updatedSession && updatedSession.status === 'active') {
          let nextAgentId: string | null = null;
          
          if (updatedSession.type === 'consensus' && updatedSession.consensus) {
            // Check if consensus has been reached
            const consensusResult = this.sessionService.checkConsensusReached(sessionId);
            if (consensusResult.reached) {
              // End consensus building and output final decision
              this.sessionService.finalizeConsensus(sessionId, consensusResult.decision || 'No clear consensus reached');
              this.io.to(sessionId).emit('consensus_reached', {
                decision: consensusResult.decision,
                finalRound: updatedSession.consensus.currentRound
              });
            } else {
              nextAgentId = this.sessionService.getNextConsensusAgent(sessionId);
              
              // Check if we need to advance round
              if (!nextAgentId && this.sessionService.shouldAdvanceConsensusRound(sessionId)) {
                this.sessionService.advanceConsensusRound(sessionId);
                nextAgentId = this.sessionService.getNextConsensusAgent(sessionId);
              }
            }
          } else {
            const nextAgent = this.agentService.getNextAgent(updatedSession, agentId);
            nextAgentId = nextAgent ? nextAgent.id : null;
          }
          
          if (nextAgentId) {
            this.generateAgentResponse(sessionId, nextAgentId);
          }
        }
      }, 3000);

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