import React, { useState, useEffect } from 'react';
import { AgentProfile } from '../types';
import { api } from '../utils/api';

interface ConsensusSessionCreatorProps {
  onSessionCreated: (sessionId: string) => void;
}

export const ConsensusSessionCreator: React.FC<ConsensusSessionCreatorProps> = ({ onSessionCreated }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [consensusQuestion, setConsensusQuestion] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState<AgentProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profiles = await api.getProfiles();
        setAvailableProfiles(profiles);
      } catch (error) {
        console.error('Failed to load profiles:', error);
      }
    };
    loadProfiles();
  }, []);

  const handleProfileToggle = (profile: AgentProfile) => {
    setSelectedProfiles(prev => {
      const isSelected = prev.some(p => p.id === profile.id);
      if (isSelected) {
        return prev.filter(p => p.id !== profile.id);
      } else if (prev.length < 5) {
        return [...prev, profile];
      }
      return prev;
    });
  };

  const handleCreateSession = async () => {
    if (!title.trim() || !goal.trim() || !consensusQuestion.trim() || selectedProfiles.length < 3) {
      alert('Please provide a title, goal, consensus question, and select at least 3 agents');
      return;
    }

    setLoading(true);
    try {
      const session = await api.createConsensusSession(title, goal, consensusQuestion, selectedProfiles);
      onSessionCreated(session.id);
    } catch (error) {
      console.error('Failed to create consensus session:', error);
      alert('Failed to create consensus session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Create Consensus Building Session</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Climate Policy Decision Meeting"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discussion Context
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Provide background and context for the consensus decision..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Consensus Question
          </label>
          <textarea
            value={consensusQuestion}
            onChange={(e) => setConsensusQuestion(e.target.value)}
            placeholder="What specific question should the agents reach consensus on? e.g., 'What should be our primary strategy for reducing carbon emissions by 2030?'"
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Agents (3-5 required for consensus)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableProfiles.map((profile) => {
              const isSelected = selectedProfiles.some(p => p.id === profile.id);
              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileToggle(profile)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{profile.role}</p>
                  <p className="text-sm text-gray-700">{profile.personality}</p>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Selected: {selectedProfiles.length}/5 (minimum 3 for consensus building)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">How Consensus Building Works</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Agents discuss in rounds, with each agent signaling when they're satisfied</li>
            <li>• Agents can state their position and confidence level</li>
            <li>• The system tracks progress toward consensus automatically</li>
            <li>• Discussion ends when strong agreement is reached or max rounds completed</li>
          </ul>
        </div>

        <button
          onClick={handleCreateSession}
          disabled={loading || !title.trim() || !goal.trim() || !consensusQuestion.trim() || selectedProfiles.length < 3}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating Consensus Session...' : 'Create Consensus Session'}
        </button>
      </div>
    </div>
  );
};