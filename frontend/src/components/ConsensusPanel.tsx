import React from 'react';
import { Session, AgentConsensusState } from '../types';
import { getAgentColor } from '../utils/colors';

interface ConsensusPanelProps {
  session: Session;
}

export const ConsensusPanel: React.FC<ConsensusPanelProps> = ({ session }) => {
  if (session.type !== 'consensus' || !session.consensus) {
    return null;
  }

  const { consensus } = session;
  const agentStates = Object.values(consensus.agentStates);
  const satisfiedCount = agentStates.filter(agent => !agent.hasMoreToSay).length;
  const progressPercentage = (satisfiedCount / agentStates.length) * 100;

  const getAgentName = (agentId: string) => {
    const agent = session.participants.find(p => p.id === agentId);
    return agent ? agent.name : 'Unknown';
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Consensus Building</h3>
        <p className="text-sm text-gray-600 mb-3">{consensus.question}</p>
        
        {consensus.consensusReached ? (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-800">Consensus Reached!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">{consensus.finalDecision}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Round {consensus.currentRound} of {consensus.maxRounds}</span>
                <span>{satisfiedCount}/{agentStates.length} satisfied</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Agent Status</h4>
              {agentStates.map((agentState) => {
                const colors = getAgentColor(agentState.agentId, session.participants);
                const isActive = agentState.lastActive === consensus.currentRound;
                
                return (
                  <div 
                    key={agentState.agentId}
                    className={`flex items-center justify-between p-2 rounded text-xs ${
                      isActive ? `${colors.bg} ${colors.border} border` : 'bg-gray-50'
                    }`}
                  >
                    <span className={`font-medium ${isActive ? colors.text : 'text-gray-700'}`}>
                      {getAgentName(agentState.agentId)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {agentState.currentPosition && (
                        <span className="bg-white px-2 py-1 rounded text-xs border">
                          {agentState.currentPosition.length > 20 
                            ? agentState.currentPosition.substring(0, 20) + '...'
                            : agentState.currentPosition
                          }
                        </span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${
                        agentState.hasMoreToSay ? 'bg-yellow-400' : 'bg-green-400'
                      }`} title={agentState.hasMoreToSay ? 'Has more to say' : 'Satisfied'}>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {consensus.positions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Current Positions</h4>
                {consensus.positions.map((position) => (
                  <div key={position.id} className="bg-gray-50 rounded p-2">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{position.title}</span>
                      <span className="text-xs text-gray-500">
                        {position.supporters.length} supporter{position.supporters.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{position.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};