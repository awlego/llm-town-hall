import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { AgentProfile, Message, Session } from '../models';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class AgentService {
  private anthropic: Anthropic;
  private defaultProfiles: AgentProfile[];

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });

    this.defaultProfiles = [
      {
        id: 'doctor-1',
        name: 'Dr. Sarah Chen',
        personality: 'Precision-focused and evidence-based',
        role: 'Doctor',
        traits: ['analytical', 'cautious', 'detail-oriented'],
        systemPrompt: 'You are Dr. Sarah Chen, a precision-focused doctor who values evidence-based reasoning. You are analytical, cautious, and detail-oriented. In discussions, you focus on facts, research, and careful consideration of all variables.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'detailed'
        }
      },
      {
        id: 'researcher-1',
        name: 'Alex Rivera',
        personality: 'Exploration-minded and innovative',
        role: 'Researcher',
        traits: ['curious', 'creative', 'risk-taking'],
        systemPrompt: 'You are Alex Rivera, an exploration-minded researcher who thrives on innovation and discovery. You are curious, creative, and willing to take calculated risks. You often propose novel approaches and challenge conventional thinking.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'concise'
        }
      },
      {
        id: 'engineer-1',
        name: 'Marcus Thompson',
        personality: 'Practical and solution-oriented',
        role: 'Engineer',
        traits: ['pragmatic', 'systematic', 'efficient'],
        systemPrompt: 'You are Marcus Thompson, a practical engineer focused on finding workable solutions. You are pragmatic, systematic, and value efficiency. You break down complex problems into manageable components.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'concise'
        }
      }
    ];
  }

  getDefaultProfiles(): AgentProfile[] {
    return this.defaultProfiles;
  }

  async generateResponse(
    agent: AgentProfile,
    session: Session,
    recentMessages: Message[]
  ): Promise<string> {
    const context = this.buildContext(agent, session, recentMessages);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: context
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I cannot generate a response at this time.';
    } catch (error) {
      console.error('Error generating agent response:', error);
      return `${agent.name}: I'm experiencing technical difficulties and cannot respond right now.`;
    }
  }

  private buildContext(agent: AgentProfile, session: Session, recentMessages: Message[]): string {
    const messageHistory = recentMessages
      .map(msg => `${msg.agentId === 'moderator' ? 'Moderator' : this.getAgentName(msg.agentId, session)}: ${msg.content}`)
      .join('\n');

    return `${agent.systemPrompt}

Session Goal: ${session.goal}

Recent Discussion:
${messageHistory}

Please respond as ${agent.name} in character, contributing meaningfully to the discussion while staying true to your personality and role. Keep your response concise but thoughtful.`;
  }

  private getAgentName(agentId: string, session: Session): string {
    const agent = session.participants.find(p => p.id === agentId);
    return agent ? agent.name : 'Unknown Agent';
  }

  getNextAgent(session: Session, currentAgentId?: string): AgentProfile | null {
    if (session.participants.length === 0) return null;
    
    if (!currentAgentId) {
      return session.participants[0];
    }

    const currentIndex = session.participants.findIndex(p => p.id === currentAgentId);
    const nextIndex = (currentIndex + 1) % session.participants.length;
    return session.participants[nextIndex];
  }
}