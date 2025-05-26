import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionCreator } from '../components/SessionCreator';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSessionCreated = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionCreator onSessionCreated={handleSessionCreated} />
    </div>
  );
};