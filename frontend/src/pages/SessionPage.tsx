import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { AgentCards } from '../components/AgentCards';
import { ModeratorPanel } from '../components/ModeratorPanel';
import { ConsensusPanel } from '../components/ConsensusPanel';
import { getAgentColor } from '../utils/colors';

export const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    isConnected,
    currentSession,
    messages,
    thinking,
    joinSession,
    startDiscussion,
    sendModeratorInput
  } = useSocket('http://localhost:3001');

  useEffect(() => {
    if (sessionId && isConnected) {
      joinSession(sessionId);
    }
  }, [sessionId, isConnected, joinSession]);

  const handleModeratorInput = (content: string, type: string) => {
    if (sessionId) {
      sendModeratorInput(sessionId, content, type);
    }
  };

  const getAgentName = (agentId: string) => {
    if (!currentSession) return 'Unknown';
    const agent = currentSession.participants.find(a => a.id === agentId);
    return agent ? agent.name : agentId === 'moderator' ? 'Moderator' : 'Unknown';
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentSession.title}</h1>
          <p className="text-gray-600 mt-2">{currentSession.goal}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Discussion</h2>
              </div>
              <div className="p-4 space-y-4">
                {messages.map((message) => {
                  const colors = getAgentColor(message.agentId, currentSession.participants);
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
                  const colors = getAgentColor(thinking, currentSession.participants);
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
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6 space-y-6">
              <AgentCards agents={currentSession.participants} thinking={thinking} />
              {currentSession.type === 'consensus' && (
                <ConsensusPanel session={currentSession} />
              )}
              <ModeratorPanel
                session={currentSession}
                onModeratorInput={handleModeratorInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};