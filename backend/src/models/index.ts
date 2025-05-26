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
  type: 'discussion' | 'consensus';
  consensus?: ConsensusState;
  metadata: {
    createdAt: Date;
    lastActive: Date;
    totalMessages: number;
  };
}

export interface ConsensusState {
  question: string;
  currentRound: number;
  maxRounds: number;
  agentStates: Record<string, AgentConsensusState>;
  positions: ConsensusPosition[];
  finalDecision?: string;
  consensusReached: boolean;
}

export interface AgentConsensusState {
  agentId: string;
  currentPosition: string;
  confidence: number; // 1-10 scale
  hasMoreToSay: boolean;
  roundsActive: number;
  lastActive: number;
  messagesThisRound: number;
}

export interface ConsensusPosition {
  id: string;
  title: string;
  description: string;
  supporters: string[]; // agent IDs
  createdBy: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  agentId: string;
  content: string;
  timestamp: Date;
  type: 'agent' | 'moderator' | 'system';
  consensus?: {
    signal: 'has_more' | 'satisfied' | 'position_change';
    position?: string;
    confidence?: number;
  };
  metadata: {
    tokensUsed: number;
    responseTime: number;
    contextSummary?: string;
  };
}

export interface WebSocketEvents {
  agent_message: Message;
  session_update: Partial<Session>;
  moderator_input: {
    sessionId: string;
    content: string;
    type: 'pause' | 'inject' | 'redirect' | 'resume';
  };
  agent_thinking: {
    agentId: string;
    sessionId: string;
  };
  error: {
    message: string;
    code: string;
  };
}