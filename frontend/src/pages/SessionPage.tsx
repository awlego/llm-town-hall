import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { AgentCards } from '../components/AgentCards';
import { ModeratorPanel } from '../components/ModeratorPanel';
import { ConsensusPanel } from '../components/ConsensusPanel';
import { ChatInterface } from '../components/ChatInterface';

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
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto p-6 flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentSession.title}</h1>
          <p className="text-gray-600 mt-2">{currentSession.goal}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-white border rounded-lg shadow-sm flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Discussion</h2>
              </div>
              <div className="flex-1 relative">
                <ChatInterface 
                  messages={messages} 
                  agents={currentSession.participants} 
                  thinking={thinking} 
                />
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