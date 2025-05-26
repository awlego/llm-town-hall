import React, { useState, useEffect } from 'react';
import { AgentProfile } from '../types';
import { api } from '../utils/api';

interface SessionCreatorProps {
  onSessionCreated: (sessionId: string) => void;
}

export const SessionCreator: React.FC<SessionCreatorProps> = ({ onSessionCreated }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
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
    if (!title.trim() || !goal.trim() || selectedProfiles.length < 2) {
      alert('Please provide a title, goal, and select at least 2 agents');
      return;
    }

    setLoading(true);
    try {
      const session = await api.createSession(title, goal, selectedProfiles);
      onSessionCreated(session.id);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Create LLM Town Hall Session</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Climate Change Solutions Discussion"
            className="w-full p-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Discussion Goal
          </label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Describe what you want the agents to discuss and accomplish..."
            className="w-full p-3 border border-gray-300 rounded-md resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select Agents (2-5 required)
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
            Selected: {selectedProfiles.length}/5
          </p>
        </div>

        <button
          onClick={handleCreateSession}
          disabled={loading || !title.trim() || !goal.trim() || selectedProfiles.length < 2}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          {loading ? 'Creating Session...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
};