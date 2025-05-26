import React from 'react';
import { AgentProfile } from '../types';
import { getAgentColor } from '../utils/colors';

interface AgentCardsProps {
  agents: AgentProfile[];
  thinking: string | null;
}

export const AgentCards: React.FC<AgentCardsProps> = ({ agents, thinking }) => {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg text-gray-900">Participants</h3>
      <div className="space-y-3">
        {agents.map((agent) => {
          const colors = getAgentColor(agent.id, agents);
          const isThinking = thinking === agent.id;
          return (
            <div
              key={agent.id}
              className={`p-3 border rounded-lg shadow-sm transition-colors ${
                isThinking 
                  ? `${colors.bg} ${colors.border} border-2` 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold text-sm ${isThinking ? colors.text : 'text-gray-900'}`}>
                  {agent.name}
                </h4>
                {isThinking && (
                  <div className="flex space-x-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${colors.text.replace('text-', 'bg-')}`}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${colors.text.replace('text-', 'bg-')}`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${colors.text.replace('text-', 'bg-')}`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-1">{agent.role}</p>
              <p className="text-xs text-blue-600 mb-1 font-mono">{agent.model}</p>
              <p className="text-xs text-gray-700 mb-2">{agent.personality}</p>
              <div className="flex flex-wrap gap-1">
                {agent.traits.map((trait) => (
                  <span
                    key={trait}
                    className={`px-1.5 py-0.5 text-xs rounded-full ${
                      isThinking 
                        ? `bg-white ${colors.text} border border-current` 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};