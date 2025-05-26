import { v4 as uuidv4 } from 'uuid';
import { Session, AgentProfile, Message } from '../models';
import { ConsensusService } from './consensusService';

export class SessionService {
  private sessions: Map<string, Session> = new Map();
  private consensusService = new ConsensusService();

  createSession(title: string, goal: string, participants: AgentProfile[], type: 'discussion' | 'consensus' = 'discussion', consensusQuestion?: string): Session {
    const session: Session = {
      id: uuidv4(),
      title,
      goal,
      participants,
      messages: [],
      status: 'paused',
      type,
      metadata: {
        createdAt: new Date(),
        lastActive: new Date(),
        totalMessages: 0
      }
    };

    if (type === 'consensus' && consensusQuestion) {
      session.consensus = this.consensusService.initializeConsensusSession(session, consensusQuestion);
    }

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  addMessage(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
      session.metadata.totalMessages++;
      session.metadata.lastActive = new Date();
    }
  }

  updateSessionStatus(sessionId: string, status: Session['status']): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      session.metadata.lastActive = new Date();
    }
  }

  getRecentMessages(sessionId: string, count: number = 10): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    
    return session.messages.slice(-count);
  }

  // Consensus-specific methods
  updateConsensusState(sessionId: string, message: Message): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return;

    this.consensusService.updateAgentState(session.consensus, message.agentId, message);
    
    // Check if consensus is reached
    const consensusResult = this.consensusService.detectConsensus(session.consensus);
    if (consensusResult.reached) {
      session.consensus.consensusReached = true;
      session.consensus.finalDecision = consensusResult.decision;
      session.status = 'completed';
    }
  }

  getNextConsensusAgent(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return null;

    return this.consensusService.getNextSpeaker(session.consensus, session);
  }

  shouldAdvanceConsensusRound(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return false;

    return this.consensusService.shouldAdvanceRound(session.consensus);
  }

  advanceConsensusRound(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return;

    session.consensus.currentRound++;
    
    // Reset hasMoreToSay and messagesThisRound for all agents at start of new round
    Object.values(session.consensus.agentStates).forEach(agentState => {
      agentState.hasMoreToSay = true;
      agentState.messagesThisRound = 0;
    });
  }

  checkConsensusReached(sessionId: string): { reached: boolean; decision?: string } {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return { reached: false };

    return this.consensusService.detectConsensus(session.consensus);
  }

  finalizeConsensus(sessionId: string, decision: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.consensus) return;

    session.consensus.consensusReached = true;
    session.consensus.finalDecision = decision;
    session.status = 'completed';
    
    // Add system message with final consensus
    const finalMessage: Message = {
      id: uuidv4(),
      sessionId,
      agentId: 'system',
      content: `🎯 CONSENSUS REACHED: ${decision}`,
      timestamp: new Date(),
      type: 'system',
      metadata: {
        tokensUsed: 0,
        responseTime: 0
      }
    };
    
    session.messages.push(finalMessage);
  }
}