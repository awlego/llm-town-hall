# LLM Town Hall Meeting - MVP

A web-based platform for orchestrating collaborative discussions between multiple LLM agents with distinct personalities.

## Features

- **Multi-Agent Chat**: 3-5 LLM agents with distinct personalities participate in real-time discussions
- **Real-time Interface**: WebSocket-based chat interface showing all agent responses
- **Agent Profiles**: Pre-defined character profiles (Doctor, Researcher, Engineer)
- **Session Management**: Create new sessions with custom goals and agent selection
- **Moderator Controls**: Pause/resume discussions and inject new information
- **Live Status**: Real-time indicators showing which agents are thinking/responding

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

1. **Create Session**: Set a discussion goal and select 2-5 agents
2. **Start Discussion**: Agents will begin conversing about the topic
3. **Moderate**: Use controls to pause, inject information, or redirect the conversation
4. **Observe**: Watch real-time agent responses and thinking indicators

## Architecture

- **Backend**: Node.js + TypeScript + Express + Socket.io
- **Frontend**: React + TypeScript + Tailwind CSS
- **LLM**: Anthropic Claude integration
- **Real-time**: WebSocket communication

## Agent Profiles

### Dr. Sarah Chen (Doctor)
- Precision-focused and evidence-based
- Analytical, cautious, detail-oriented

### Alex Rivera (Researcher) 
- Exploration-minded and innovative
- Curious, creative, risk-taking

### Marcus Thompson (Engineer)
- Practical and solution-oriented  
- Pragmatic, systematic, efficient

## Next Steps

- Add context summarization for long conversations
- Implement session persistence with database
- Add voting and consensus mechanisms
- Support for custom agent profiles
- Enhanced moderation features