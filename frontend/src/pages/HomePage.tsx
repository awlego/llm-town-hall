import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionCreator } from '../components/SessionCreator';
import { ConsensusSessionCreator } from '../components/ConsensusSessionCreator';

type SessionType = 'discussion' | 'consensus';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState<SessionType>('discussion');

  const handleSessionCreated = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">LLM Town Hall</h1>
        
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg border p-1 inline-flex">
            <button
              onClick={() => setSessionType('discussion')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                sessionType === 'discussion'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Discussion
            </button>
            <button
              onClick={() => setSessionType('consensus')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                sessionType === 'consensus'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Consensus Building
            </button>
          </div>
        </div>

        <div className="mb-6">
          {sessionType === 'discussion' ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Discussion Mode</h3>
              <p className="text-sm text-blue-700">
                Open-ended conversation where agents share ideas and explore topics together. 
                Great for brainstorming, analysis, and creative discussions.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Consensus Building Mode</h3>
              <p className="text-sm text-green-700">
                Structured decision-making process where agents work toward agreement on a specific question. 
                Features rounds, position tracking, and automatic consensus detection.
              </p>
            </div>
          )}
        </div>

        {sessionType === 'discussion' ? (
          <SessionCreator onSessionCreated={handleSessionCreated} />
        ) : (
          <ConsensusSessionCreator onSessionCreated={handleSessionCreated} />
        )}
      </div>
    </div>
  );
};