# LLM Town Hall Meeting Platform

A web-based platform for orchestrating collaborative discussions and consensus-building between multiple LLM agents with distinct personalities.

## Features

### 💬 **Discussion Mode**
- **Multi-Agent Chat**: 3-5 LLM agents with distinct personalities participate in real-time discussions
- **Real-time Interface**: WebSocket-based chat interface showing all agent responses
- **Agent Profiles**: 8 diverse character profiles (Doctor, Researcher, Engineer, Artist, Philosopher, Entrepreneur, Teacher, Skeptic)
- **Session Management**: Create new sessions with custom goals and agent selection
- **Moderator Controls**: Pause/resume discussions and inject new information
- **Live Status**: Real-time indicators showing which agents are thinking/responding

### 🤝 **Consensus Building Mode**
- **Structured Decision Making**: Agents work toward agreement on specific questions
- **Round-Based Discussions**: 5-round maximum with automatic progression
- **Smart Agent Signaling**: Agents signal when they have more to say or are satisfied
- **Position Tracking**: Real-time tracking of agent positions and confidence levels
- **Automatic Consensus Detection**: System detects when 60%+ agreement is reached
- **Progress Visualization**: Live progress bars and status indicators
- **Intelligent Speaker Selection**: Prioritizes agents who haven't contributed to current round

## Quick Start

### Prerequisites
- Node.js 16+
- Anthropic API key

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Setup
Create a `.env` file in the backend directory:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
PORT=3001
```

## Usage

### Discussion Mode
1. **Create Discussion**: Set a discussion goal and select 2-5 agents
2. **Start Discussion**: Agents will begin conversing about the topic
3. **Moderate**: Use controls to pause, inject information, or redirect the conversation
4. **Observe**: Watch real-time agent responses and thinking indicators

### Consensus Building Mode
1. **Create Consensus Session**: Define a specific question that needs a decision
2. **Select 3-5 Agents**: Choose diverse personalities for richer perspectives
3. **Watch the Process**: Agents discuss in rounds, stating positions and building on each other's ideas
4. **Track Progress**: Monitor the consensus panel showing agent satisfaction and current positions
5. **Reach Decision**: Session automatically completes when consensus is reached or max rounds hit

## Architecture

- **Backend**: Node.js + TypeScript + Express + Socket.io
- **Frontend**: React + TypeScript + Tailwind CSS
- **LLM**: Anthropic Claude integration
- **Real-time**: WebSocket communication

## Agent Profiles

### 🩺 Dr. Sarah Chen (Doctor)
- **Personality**: Precision-focused and evidence-based
- **Approach**: Analytical, cautious, detail-oriented

### 🔬 Alex Rivera (Researcher) 
- **Personality**: Exploration-minded and innovative
- **Approach**: Curious, creative, risk-taking

### ⚙️ Marcus Thompson (Engineer)
- **Personality**: Practical and solution-oriented  
- **Approach**: Pragmatic, systematic, efficient

### 🎨 Luna Martinez (Artist)
- **Personality**: Creative and intuitive with emotional intelligence
- **Approach**: Values human experience, aesthetics, and emotional impact

### 🤔 Professor David Kim (Philosopher)
- **Personality**: Deep thinker focused on ethics and long-term implications
- **Approach**: Examines moral frameworks and societal impact

### 💼 Maya Patel (Entrepreneur)
- **Personality**: Results-driven with business acumen and risk assessment
- **Approach**: Evaluates opportunity, scalability, and market viability

### 📚 Elena Rodriguez (Teacher)
- **Personality**: Patient educator focused on clarity and accessibility
- **Approach**: Makes complex ideas accessible, builds consensus

### 🔍 James Wright (Skeptic)
- **Personality**: Critical thinker who challenges assumptions and seeks evidence
- **Approach**: Plays devil's advocate, examines flaws, prevents mistakes

## Consensus Building Technical Details

### Agent Signaling Protocol
Agents use structured signals to communicate their state:
- `[SIGNAL: HAS_MORE]` - Agent has additional points to contribute
- `[SIGNAL: SATISFIED]` - Agent is done and accepts current direction  
- `[SIGNAL: POSITION: "statement"]` - Agent states or updates their position

### Consensus Detection Algorithm
- **Threshold**: 60%+ agent agreement with 7+ confidence level
- **Fallback**: If all agents satisfied, largest position group wins (40%+ minimum)
- **Rounds**: Maximum 5 rounds with automatic advancement
- **Speaker Priority**: Agents who haven't spoken > agents with more to say > random

### Visual Progress Tracking
- Real-time progress bars showing satisfied agents
- Color-coded agent cards matching chat message themes
- Position summaries with supporter counts
- Round progression indicators

## Roadmap

### Completed ✅
- Multi-agent discussions with 8 personality profiles
- Real-time WebSocket communication  
- Consensus building with round-based discussions
- Smart agent signaling and position tracking
- Automatic consensus detection
- Color-coordinated UI with sticky sidebar
- Session management and moderator controls

### Future Enhancements
- **Database Persistence**: PostgreSQL for session storage
- **Custom Agent Creation**: User-defined personalities and traits
- **Advanced Analytics**: Discussion metrics and participation analysis
- **Export Features**: PDF reports and conversation summaries
- **Multi-Model Support**: OpenAI GPT, local models via LangChain
- **Voting Mechanisms**: Formal voting on proposals
- **Context Summarization**: Smart compression for long conversations