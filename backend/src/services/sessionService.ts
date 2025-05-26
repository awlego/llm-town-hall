import { v4 as uuidv4 } from 'uuid';
import { Session, AgentProfile, Message } from '../models';

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  createSession(title: string, goal: string, participants: AgentProfile[]): Session {
    const session: Session = {
      id: uuidv4(),
      title,
      goal,
      participants,
      messages: [],
      status: 'paused',
      metadata: {
        createdAt: new Date(),
        lastActive: new Date(),
        totalMessages: 0
      }
    };

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
}