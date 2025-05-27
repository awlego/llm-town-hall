import React, { useEffect, useRef, useState } from 'react';
import { Message, AgentProfile } from '../types';
import { getAgentColor } from '../utils/colors';

interface ChatInterfaceProps {
  messages: Message[];
  agents: AgentProfile[];
  thinking: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, agents, thinking }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessagesLength = useRef(messages.length);
  const prevThinking = useRef(thinking);
  const prevScrollState = useRef({ isAtBottom: true, scrollTop: 0, scrollHeight: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkIfAtBottom = () => {
    if (!containerRef.current) return true; // Default to true if container not available
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // If content doesn't overflow, user is always "at bottom"
    if (scrollHeight <= clientHeight) return true;
    // Consider "at bottom" if within 100px of the bottom
    return scrollHeight - scrollTop - clientHeight < 100;
  };

  const handleScroll = () => {
    setIsAtBottom(checkIfAtBottom());
  };

  // Temporary debug logging - only on changes
  const currentScrollTop = containerRef.current?.scrollTop || 0;
  const currentScrollHeight = containerRef.current?.scrollHeight || 0;
  if (isAtBottom !== prevScrollState.current.isAtBottom || 
      currentScrollTop !== prevScrollState.current.scrollTop ||
      currentScrollHeight !== prevScrollState.current.scrollHeight) {
    console.log('Scroll Debug:', {
      messageCount: messages.length,
      isAtBottom,
      scrollTop: currentScrollTop,
      scrollHeight: currentScrollHeight,
      clientHeight: containerRef.current?.clientHeight,
      hasOverflow: currentScrollHeight > (containerRef.current?.clientHeight || 0),
      containerHeight: containerRef.current?.offsetHeight,
      containerStyle: containerRef.current ? window.getComputedStyle(containerRef.current).height : 'unknown',
      distanceFromBottom: containerRef.current ? 
        containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight : 0
    });
    prevScrollState.current = { isAtBottom, scrollTop: currentScrollTop, scrollHeight: currentScrollHeight };
  }

  useEffect(() => {
    // Only auto-scroll if user is at the bottom AND something actually changed
    const messagesChanged = messages.length !== prevMessagesLength.current;
    const thinkingChanged = thinking !== prevThinking.current;
    
    if (isAtBottom && (messagesChanged || thinkingChanged)) {
      scrollToBottom();
    }
    
    // Update refs
    prevMessagesLength.current = messages.length;
    prevThinking.current = thinking;
  }, [messages, thinking, isAtBottom]);

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : agentId === 'moderator' ? 'Moderator' : 'Unknown';
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 overflow-y-auto p-4 space-y-4"
      onScroll={handleScroll}
    >
      {messages.map((message) => {
        const colors = getAgentColor(message.agentId, agents);
        return (
          <div
            key={message.id}
            className={`p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`font-semibold ${colors.text}`}>
                {getAgentName(message.agentId)}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
          </div>
        );
      })}
      
      {thinking && (() => {
        const colors = getAgentColor(thinking, agents);
        return (
          <div className={`p-3 rounded-lg border-l-4 ${colors.bg} ${colors.border} opacity-70`}>
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${colors.text}`}>
                {getAgentName(thinking)}
              </span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <p className="text-gray-600 italic">thinking...</p>
          </div>
        );
      })()}
      
      <div ref={messagesEndRef} />
    </div>
  );
};