# LLM Town Hall Meeting - Technical Specification

## Project Overview
A web-based platform for orchestrating collaborative discussions between multiple LLM agents with distinct personalities, working together toward common goals in a town hall meeting format.

## Core Requirements

### MVP Features
- **Multi-Agent Chat**: 3-5 LLM agents with distinct personalities participating in real-time discussion
- **Personality Profiles**: Reusable character profiles (e.g., "Precision-focused Doctor", "Exploration-minded Researcher")
- **Real-time Interface**: WebSocket-based chat interface showing all agent responses
- **Context Management**: Smart context window management with summarization for long conversations
- **Session Management**: Save/load conversation sessions with full transcript logging
- **Moderator Controls**: Pause discussion and inject new information/instructions
- **Goal Setting**: Initial topic/goal setting that persists throughout the session

### Future Features (Post-MVP)
- **Voting Mechanisms**: Agents can vote on proposals or decisions
- **Consensus Building**: Tools to identify areas of agreement/disagreement
- **Turn Management**: Structured turn-taking modes (round-robin, raised-hand, etc.)
- **Visual Elements**: Image generation/analysis capabilities
- **Analytics Dashboard**: Conversation analysis, participation metrics
- **Advanced Moderation**: Time limits, speaking time allocation
- **Multi-Provider Support**: Support for OpenAI, local models via LangChain
- **Export Features**: PDF reports, summary generation

## Technical Architecture

### Backend (Node.js/TypeScript)
```
├── API Layer
│   ├── WebSocket Server (real-time communication)
│   ├── REST API (session management, profiles)
│   └── Authentication (basic for MVP)
├── LLM Orchestration
│   ├── Agent Manager (maintains agent states)
│   ├── Context Manager (handles context windows & summarization)
│   ├── Conversation Flow Controller
│   └── LangChain Integration (Anthropic Claude focus)
├── Data Layer
│   ├── Session Storage (conversations, metadata)
│   ├── Profile Storage (personality definitions)
│   └── Transcript Logging
└── Services
    ├── Summarization Service
    ├── Turn Management
    └── Moderation Controls
```

### Frontend (React/TypeScript)
```
├── Components
│   ├── ChatInterface (real-time message display)
│   ├── AgentCards (show agent personalities, status)
│   ├── ModeratorPanel (pause, inject, controls)
│   ├── SessionManager (new/load/save sessions)
│   └── ProfileEditor (create/edit personality profiles)
├── Real-time Features
│   ├── WebSocket Client
│   ├── Live Message Stream
│   └── Agent Status Indicators
└── State Management
    ├── Chat History
    ├── Agent States
    └── Session Data
```

## Data Models

### Agent Profile
```typescript
interface AgentProfile {
  id: string;
  name: string;
  personality: string; // Core personality prompt
  role: string; // e.g., "Doctor", "Researcher"
  traits: string[]; // e.g., ["detail-oriented", "cautious"]
  systemPrompt: string; // Full system message
  contextPreferences: {
    maxTokens: number;
    summaryStyle: 'detailed' | 'concise';
  };
}
```

### Session
```typescript
interface Session {
  id: string;
  title: string;
  goal: string; // The common objective
  participants: AgentProfile[];
  messages: Message[];
  status: 'active' | 'paused' | 'completed';
  metadata: {
    createdAt: Date;
    lastActive: Date;
    totalMessages: number;
  };
}
```

### Message
```typescript
interface Message {
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
```

## Core Workflows

### 1. Session Initialization
1. User creates new session with goal/topic
2. User selects 3-5 agent profiles
3. System generates initial context for each agent
4. Session begins with agents introducing themselves (optional)

### 2. Discussion Flow
1. Agent receives turn notification
2. Context Manager builds appropriate context window:
   - Recent messages (last N messages)
   - Summarized earlier conversation
   - Session goal reminder
   - Agent personality prompt
3. Agent generates response via LLM
4. Response broadcasted to all participants and frontend
5. Next agent selected (initially round-robin, later more sophisticated)

### 3. Context Management
1. Monitor each agent's context usage
2. When approaching limit:
   - Summarize older conversation segments
   - Preserve recent messages (last 10-15)
   - Maintain session goal and personality prompts
3. Store full conversation history separately

### 4. Moderation Actions
- **Pause**: Stop agent responses, allow moderator input
- **Inject Information**: Add new context/constraints visible to all agents
- **Redirect**: Modify the session goal or add sub-goals
- **Resume**: Continue discussion with updated context

## Technical Implementation Details

### Context Window Strategy
- **Default Context Limit**: 8,000 tokens per agent (configurable)
- **Context Composition**:
  - System prompt + personality: ~500 tokens
  - Session goal: ~200 tokens
  - Recent messages: ~4,000 tokens
  - Summarized history: ~3,000 tokens
  - Buffer: ~300 tokens

### Real-time Communication
- **WebSocket Events**:
  - `agent_message`: New agent response
  - `session_update`: Status changes
  - `moderator_input`: Injected information
  - `agent_thinking`: Typing indicators
  - `error`: Error handling

### Error Handling & Resilience
- **LLM API Failures**: Retry logic, fallback responses
- **WebSocket Disconnection**: Automatic reconnection
- **Context Overflow**: Emergency summarization
- **Agent Unresponsiveness**: Timeout handling

## Development Phases

### Phase 1: MVP Core (2-3 weeks)
- [ ] Basic web interface with real-time chat
- [ ] Agent profile creation and storage
- [ ] Simple round-robin discussion flow
- [ ] Basic context management
- [ ] Session save/load functionality

### Phase 2: Enhanced Features (2-3 weeks)
- [ ] Smart context summarization
- [ ] Moderator pause/inject controls
- [ ] Improved UI with agent status indicators
- [ ] Better turn management logic
- [ ] Conversation analytics

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Voting and consensus mechanisms
- [ ] Multiple discussion modes
- [ ] Export and reporting features
- [ ] Performance optimization
- [ ] Comprehensive testing

## Technology Stack

### Core Technologies
- **Backend**: Node.js, TypeScript, Express
- **Frontend**: React, TypeScript, Tailwind CSS
- **Real-time**: Socket.io
- **LLM Integration**: LangChain.js
- **Database**: SQLite (MVP) → PostgreSQL (production)
- **Deployment**: Docker, potentially Vercel/Railway

### Dependencies
```json
{
  "backend": [
    "express", "socket.io", "langchain", "@anthropic-ai/sdk",
    "sqlite3", "winston", "joi", "cors"
  ],
  "frontend": [
    "react", "socket.io-client", "tailwindcss", 
    "react-router-dom", "zustand", "react-hot-toast"
  ]
}
```

## Success Metrics
- **Technical**: Sub-2 second agent response times, 99% uptime
- **User Experience**: Smooth real-time interaction, intuitive controls
- **AI Quality**: Coherent multi-turn conversations, personality consistency
- **Scalability**: Handle 5 concurrent agents with full context management

## Open Questions
1. Should agents be aware they're AI, or roleplay as humans?
2. How to handle conflicting agent opinions that don't resolve?
3. Maximum session duration before forced summarization?
4. Rate limiting strategy for LLM API calls?
5. Multi-language support priority?