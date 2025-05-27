import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChatInterface } from '../ChatInterface';
import { Message, AgentProfile } from '../../types';

// Mock scrollIntoView
const mockScrollIntoView = jest.fn();
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: mockScrollIntoView,
});

// Mock scroll properties
Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
  configurable: true,
  value: 0,
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
  configurable: true,
  value: 1000,
  writable: true,
});

Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 400,
  writable: true,
});

describe('ChatInterface', () => {
  const mockAgents: AgentProfile[] = [
    {
      id: 'agent1',
      name: 'Dr. Alice',
      personality: 'Analytical and precise',
      role: 'Doctor',
      traits: ['detail-oriented'],
      systemPrompt: 'You are Dr. Alice',
      contextPreferences: {
        maxTokens: 8000,
        summaryStyle: 'detailed'
      }
    },
    {
      id: 'agent2',
      name: 'Bob Explorer',
      personality: 'Curious and adventurous',
      role: 'Researcher',
      traits: ['exploration-minded'],
      systemPrompt: 'You are Bob Explorer',
      contextPreferences: {
        maxTokens: 8000,
        summaryStyle: 'concise'
      }
    }
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      sessionId: 'session1',
      agentId: 'agent1',
      content: 'Hello, this is my first message.',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      type: 'agent',
      metadata: {
        tokensUsed: 50,
        responseTime: 1000
      }
    },
    {
      id: '2',
      sessionId: 'session1',
      agentId: 'agent2',
      content: 'Great to meet you! I have some thoughts to share.',
      timestamp: new Date('2024-01-01T10:01:00Z'),
      type: 'agent',
      metadata: {
        tokensUsed: 45,
        responseTime: 900
      }
    }
  ];

  beforeEach(() => {
    mockScrollIntoView.mockClear();
  });

  it('renders messages correctly', () => {
    render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    expect(screen.getByText('Hello, this is my first message.')).toBeInTheDocument();
    expect(screen.getByText('Great to meet you! I have some thoughts to share.')).toBeInTheDocument();
    expect(screen.getByText('Dr. Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob Explorer')).toBeInTheDocument();
  });

  it('auto-scrolls when new messages are added and user is at bottom', () => {
    const { rerender, container } = render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Mock being at bottom (scrollTop = scrollHeight - clientHeight - 50, within 100px threshold)
    const chatContainer = container.querySelector('.overflow-y-auto') as HTMLElement;
    if (chatContainer) {
      Object.defineProperty(chatContainer, 'scrollTop', { value: 550, writable: true });
      Object.defineProperty(chatContainer, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(chatContainer, 'clientHeight', { value: 400, writable: true });
    }

    // Clear any initial scroll calls
    mockScrollIntoView.mockClear();

    // Add a new message
    const newMessage: Message = {
      id: '3',
      sessionId: 'session1',
      agentId: 'agent1',
      content: 'This is a new message that should trigger auto-scroll.',
      timestamp: new Date('2024-01-01T10:02:00Z'),
      type: 'agent',
      metadata: {
        tokensUsed: 60,
        responseTime: 1100
      }
    };

    rerender(
      <ChatInterface 
        messages={[...mockMessages, newMessage]} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Should have called scrollIntoView due to message change
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('does not auto-scroll when user has scrolled up', async () => {
    const { rerender, container } = render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Mock being scrolled up (not at bottom)
    const chatContainer = container.querySelector('.overflow-y-auto') as HTMLElement;
    if (chatContainer) {
      Object.defineProperty(chatContainer, 'scrollTop', { value: 100, writable: true });
      Object.defineProperty(chatContainer, 'scrollHeight', { value: 1000, writable: true });
      Object.defineProperty(chatContainer, 'clientHeight', { value: 400, writable: true });
      
      // Simulate a scroll event to update the isAtBottom state
      chatContainer.dispatchEvent(new Event('scroll'));
    }

    // Wait a tick for state updates
    await new Promise(resolve => setTimeout(resolve, 0));

    // Clear any scroll calls after state update
    mockScrollIntoView.mockClear();

    // Add a new message
    const newMessage: Message = {
      id: '3',
      sessionId: 'session1',
      agentId: 'agent1',
      content: 'This message should not trigger auto-scroll.',
      timestamp: new Date('2024-01-01T10:02:00Z'),
      type: 'agent',
      metadata: {
        tokensUsed: 60,
        responseTime: 1100
      }
    };

    rerender(
      <ChatInterface 
        messages={[...mockMessages, newMessage]} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Should NOT have called scrollIntoView because user is not at bottom
    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('auto-scrolls when thinking indicator appears', () => {
    const { rerender } = render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Clear any initial scroll calls
    mockScrollIntoView.mockClear();

    // Add thinking indicator
    rerender(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking="agent1" 
      />
    );

    // Should have called scrollIntoView due to thinking change
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('auto-scrolls when thinking indicator disappears', () => {
    const { rerender } = render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking="agent1" 
      />
    );

    // Clear any initial scroll calls
    mockScrollIntoView.mockClear();

    // Remove thinking indicator
    rerender(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    // Should have called scrollIntoView due to thinking change
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('displays thinking indicator with correct agent name', () => {
    render(
      <ChatInterface 
        messages={mockMessages} 
        agents={mockAgents} 
        thinking="agent1" 
      />
    );

    expect(screen.getByText('thinking...')).toBeInTheDocument();
    // Should show Dr. Alice as the thinking agent
    const thinkingElements = screen.getAllByText('Dr. Alice');
    expect(thinkingElements.length).toBeGreaterThan(1); // One for message, one for thinking
  });

  it('handles system messages correctly', () => {
    const systemMessage: Message = {
      id: 'system1',
      sessionId: 'session1',
      agentId: 'system',
      content: '🎯 CONSENSUS REACHED: We agree on the plan.',
      timestamp: new Date('2024-01-01T10:03:00Z'),
      type: 'system',
      metadata: {
        tokensUsed: 0,
        responseTime: 0
      }
    };

    render(
      <ChatInterface 
        messages={[...mockMessages, systemMessage]} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    expect(screen.getByText('🎯 CONSENSUS REACHED: We agree on the plan.')).toBeInTheDocument();
  });

  it('handles moderator messages correctly', () => {
    const moderatorMessage: Message = {
      id: 'mod1',
      sessionId: 'session1',
      agentId: 'moderator',
      content: 'Let\'s focus on the main topic.',
      timestamp: new Date('2024-01-01T10:03:00Z'),
      type: 'moderator',
      metadata: {
        tokensUsed: 0,
        responseTime: 0
      }
    };

    render(
      <ChatInterface 
        messages={[...mockMessages, moderatorMessage]} 
        agents={mockAgents} 
        thinking={null} 
      />
    );

    expect(screen.getByText('Let\'s focus on the main topic.')).toBeInTheDocument();
    expect(screen.getByText('Moderator')).toBeInTheDocument();
  });
});