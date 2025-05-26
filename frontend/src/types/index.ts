export interface AgentProfile {
  id: string;
  name: string;
  personality: string;
  role: string;
  traits: string[];
  systemPrompt: string;
  model: string;
  contextPreferences: {
    maxTokens: number;
    summaryStyle: 'detailed' | 'concise';
  };
}

export interface Session {
  id: string;
  title: string;
  goal: string;
  participants: AgentProfile[];
  messages: Message[];
  status: 'active' | 'paused' | 'completed';
  metadata: {
    createdAt: Date;
    lastActive: Date;
    totalMessages: number;
  };
}

export interface Message {
  id: string;
  sessionId: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'agent' | 'moderator' | 'system';
  metadata: {
    tokensUsed: number;
    responseTime: number;
    contextSummary?: string;
  };
}