import React from 'react';
import { Message, AgentProfile } from '../types';
import { getAgentColor } from '../utils/colors';

interface ChatInterfaceProps {
  messages: Message[];
  agents: AgentProfile[];
  thinking: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, agents, thinking }) => {
  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : agentId === 'moderator' ? 'Moderator' : 'Unknown';
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
    </div>
  );
};