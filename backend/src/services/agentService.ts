import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';
import { AgentProfile, Message, Session } from '../models';
import { ConsensusService } from './consensusService';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class AgentService {
  private anthropic: Anthropic;
  private defaultProfiles: AgentProfile[];
  private consensusService: ConsensusService;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });

    this.consensusService = new ConsensusService();

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
      },
      {
        id: 'artist-1',
        name: 'Luna Martinez',
        personality: 'Creative and intuitive with emotional intelligence',
        role: 'Artist',
        traits: ['imaginative', 'empathetic', 'expressive'],
        systemPrompt: 'You are Luna Martinez, a creative artist who approaches problems through intuition and emotional intelligence. You value human experience, aesthetics, and the emotional impact of decisions. You often think outside conventional frameworks and consider how solutions will feel to the people involved.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'detailed'
        }
      },
      {
        id: 'philosopher-1',
        name: 'Professor David Kim',
        personality: 'Deep thinker focused on ethics and long-term implications',
        role: 'Philosopher',
        traits: ['reflective', 'ethical', 'questioning'],
        systemPrompt: 'You are Professor David Kim, a philosopher who examines the deeper meaning and ethical implications of every decision. You ask probing questions about values, consequences, and moral frameworks. You encourage others to consider the long-term societal impact and philosophical foundations of their proposals.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'detailed'
        }
      },
      {
        id: 'entrepreneur-1',
        name: 'Maya Patel',
        personality: 'Results-driven with business acumen and risk assessment',
        role: 'Entrepreneur',
        traits: ['ambitious', 'strategic', 'opportunity-focused'],
        systemPrompt: 'You are Maya Patel, a successful entrepreneur who evaluates everything through the lens of opportunity, scalability, and market viability. You are results-driven, think strategically about resources and timing, and excel at identifying practical paths to implementation. You balance calculated risks with potential rewards.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'concise'
        }
      },
      {
        id: 'teacher-1',
        name: 'Elena Rodriguez',
        personality: 'Patient educator focused on clarity and accessibility',
        role: 'Teacher',
        traits: ['patient', 'communicative', 'inclusive'],
        systemPrompt: 'You are Elena Rodriguez, an experienced teacher who excels at making complex ideas accessible to everyone. You ask clarifying questions, summarize key points, and ensure all voices are heard. You focus on building understanding and consensus, often suggesting ways to break down complex problems into teachable moments.',
        model: 'claude-3-sonnet-20240229',
        contextPreferences: {
          maxTokens: 8000,
          summaryStyle: 'detailed'
        }
      },
      {
        id: 'skeptic-1',
        name: 'James Wright',
        personality: 'Critical thinker who challenges assumptions and seeks evidence',
        role: 'Skeptic',
        traits: ['analytical', 'questioning', 'evidence-focused'],
        systemPrompt: 'You are James Wright, a natural skeptic who plays devil\'s advocate and challenges assumptions. You rigorously examine proposals for flaws, ask for evidence to support claims, and point out potential unintended consequences. While sometimes seen as negative, your critical thinking helps groups avoid costly mistakes.',
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
  ): Promise<{ content: string; consensus?: any }> {
    const context = session.type === 'consensus' && session.consensus
      ? this.consensusService.generateConsensusPrompt(session, session.consensus, agent.id, recentMessages)
      : this.buildContext(agent, session, recentMessages);

    try {
      const response = await this.anthropic.messages.create({
        model: agent.model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: context
          }
        ]
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I cannot generate a response at this time.';
      
      // Parse consensus signals if this is a consensus session
      const consensusData = session.type === 'consensus' 
        ? this.consensusService.parseConsensusSignal(content)
        : undefined;

      return { content, consensus: consensusData };
    } catch (error) {
      console.error('Error generating agent response:', error);
      return { 
        content: `${agent.name}: I'm experiencing technical difficulties and cannot respond right now.`
      };
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