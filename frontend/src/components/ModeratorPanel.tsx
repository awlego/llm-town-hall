import React, { useState } from 'react';
import { Session } from '../types';

interface ModeratorPanelProps {
  session: Session | null;
  onModeratorInput: (content: string, type: string) => void;
}

export const ModeratorPanel: React.FC<ModeratorPanelProps> = ({
  session,
  onModeratorInput,
}) => {
  const [input, setInput] = useState('');

  const handlePause = () => {
    onModeratorInput('Discussion paused by moderator', 'pause');
  };

  const handleResume = () => {
    onModeratorInput('Discussion resumed by moderator', 'resume');
  };

  const handleInject = () => {
    if (input.trim()) {
      onModeratorInput(input, 'inject');
      setInput('');
    }
  };

  if (!session) return null;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-4">Moderator Controls</h3>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          {session.status === 'active' ? (
            <button
              onClick={handlePause}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Pause Discussion
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {session.metadata.totalMessages === 0 ? 'Start Discussion' : 'Resume Discussion'}
            </button>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Inject information or redirect the discussion..."
            className="w-full p-2 border rounded-md resize-none"
            rows={3}
          />
          <button
            onClick={handleInject}
            disabled={!input.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            Inject Input
          </button>
        </div>

        <div className="text-sm">
          <p><strong>Session:</strong> {session.title}</p>
          <p><strong>Goal:</strong> {session.goal}</p>
          <p><strong>Status:</strong> 
            <span className={`ml-1 ${
              session.status === 'active' ? 'text-green-600' : 
              session.status === 'paused' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {session.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};