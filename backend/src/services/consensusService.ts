import { v4 as uuidv4 } from 'uuid';
import { Session, ConsensusState, AgentConsensusState, ConsensusPosition, Message } from '../models';

export class ConsensusService {
  
  initializeConsensusSession(session: Session, question: string, maxRounds: number = 5): ConsensusState {
    const agentStates: Record<string, AgentConsensusState> = {};
    
    session.participants.forEach(agent => {
      agentStates[agent.id] = {
        agentId: agent.id,
        currentPosition: '',
        confidence: 5,
        hasMoreToSay: true,
        roundsActive: 0,
        lastActive: 0,
        messagesThisRound: 0
      };
    });

    return {
      question,
      currentRound: 1,
      maxRounds,
      agentStates,
      positions: [],
      consensusReached: false
    };
  }

  updateAgentState(consensus: ConsensusState, agentId: string, message: Message): void {
    const agentState = consensus.agentStates[agentId];
    if (!agentState) return;

    agentState.lastActive = consensus.currentRound;
    agentState.roundsActive++;
    agentState.messagesThisRound++;

    if (message.consensus) {
      switch (message.consensus.signal) {
        case 'satisfied':
          agentState.hasMoreToSay = false;
          break;
        case 'has_more':
          agentState.hasMoreToSay = true;
          break;
        case 'position_change':
          if (message.consensus.position) {
            agentState.currentPosition = message.consensus.position;
          }
          if (message.consensus.confidence) {
            agentState.confidence = message.consensus.confidence;
          }
          break;
      }
    }
  }

  checkRoundComplete(consensus: ConsensusState): boolean {
    // Round is complete when all agents have either:
    // 1. Signaled they're satisfied, OR
    // 2. All agents have participated in this round
    
    const agentStates = Object.values(consensus.agentStates);
    const satisfiedAgents = agentStates.filter(agent => !agent.hasMoreToSay);
    const activeThisRound = agentStates.filter(agent => agent.lastActive === consensus.currentRound);
    
    // If all agents are satisfied, round is complete
    if (satisfiedAgents.length === agentStates.length) {
      return true;
    }
    
    // If all agents have spoken this round, round is complete
    if (activeThisRound.length === agentStates.length) {
      return true;
    }
    
    return false;
  }

  detectConsensus(consensus: ConsensusState): { reached: boolean; decision?: string } {
    const agentStates = Object.values(consensus.agentStates);
    
    // Group agents by position
    const positionGroups: Record<string, AgentConsensusState[]> = {};
    agentStates.forEach(agent => {
      if (agent.currentPosition) {
        if (!positionGroups[agent.currentPosition]) {
          positionGroups[agent.currentPosition] = [];
        }
        positionGroups[agent.currentPosition].push(agent);
      }
    });

    // Check if any position has strong support (60%+ with high confidence)
    for (const [position, supporters] of Object.entries(positionGroups)) {
      const supportPercentage = supporters.length / agentStates.length;
      const averageConfidence = supporters.reduce((sum, agent) => sum + agent.confidence, 0) / supporters.length;
      
      if (supportPercentage >= 0.6 && averageConfidence >= 7) {
        return { reached: true, decision: position };
      }
    }

    // Check if all agents are satisfied (even without strong position consensus)
    const allSatisfied = agentStates.every(agent => !agent.hasMoreToSay);
    if (allSatisfied) {
      // Find the most supported position
      const largestGroup = Object.entries(positionGroups)
        .sort(([,a], [,b]) => b.length - a.length)[0];
      
      if (largestGroup && largestGroup[1].length >= agentStates.length * 0.4) {
        return { reached: true, decision: largestGroup[0] };
      }
    }

    return { reached: false };
  }

  shouldAdvanceRound(consensus: ConsensusState): boolean {
    return this.checkRoundComplete(consensus) && 
           consensus.currentRound < consensus.maxRounds;
  }

  getNextSpeaker(consensus: ConsensusState, session: Session): string | null {
    const agentStates = Object.values(consensus.agentStates);
    
    // Priority order:
    // 1. Agents who haven't spoken this round and have more to say
    // 2. Agents who have more to say and haven't hit message limit (10 per round)
    // 3. No one if all are satisfied or hit limits
    
    const needToSpeak = agentStates.filter(agent => 
      agent.hasMoreToSay && 
      agent.lastActive < consensus.currentRound &&
      agent.messagesThisRound < 10
    );
    
    if (needToSpeak.length > 0) {
      // Sort by least active overall
      needToSpeak.sort((a, b) => a.roundsActive - b.roundsActive);
      return needToSpeak[0].agentId;
    }
    
    const hasMoreToSay = agentStates.filter(agent => 
      agent.hasMoreToSay && agent.messagesThisRound < 10
    );
    if (hasMoreToSay.length > 0) {
      // Sort by least recently active
      hasMoreToSay.sort((a, b) => a.lastActive - b.lastActive);
      return hasMoreToSay[0].agentId;
    }
    
    return null; // All agents are satisfied or hit message limits
  }

  generateConsensusPrompt(
    session: Session, 
    consensus: ConsensusState, 
    agentId: string, 
    recentMessages: Message[]
  ): string {
    const agentState = consensus.agentStates[agentId];
    const otherPositions = Object.values(consensus.agentStates)
      .filter(state => state.agentId !== agentId && state.currentPosition)
      .map(state => state.currentPosition);

    const roundStatus = consensus.currentRound > 1 ? 
      `This is round ${consensus.currentRound} of ${consensus.maxRounds}. ` : '';

    return `${roundStatus}We are working toward consensus on: "${consensus.question}"

CONSENSUS PROTOCOL: At the end of your response, you MUST include one of these signals:
[SIGNAL: HAS_MORE] - You have additional important points to raise
[SIGNAL: SATISFIED] - You've said everything you wanted and accept the current direction
[SIGNAL: POSITION: "your clear position statement"] - You're stating/updating your position on the question

Current positions from other participants: ${otherPositions.length > 0 ? otherPositions.join('; ') : 'None stated yet'}

Your previous position: ${agentState.currentPosition || 'Not yet stated'}

Guidelines for consensus building:
- Listen carefully to others and build on their ideas
- Be willing to compromise while maintaining your core principles
- Clearly state your position when you're ready
- Signal when you're satisfied or have more to contribute
- Focus on finding common ground

Recent discussion:
${recentMessages.map(msg => `${msg.agentId}: ${msg.content}`).join('\n')}

Please contribute thoughtfully to reaching consensus. Remember to end with a signal.`;
  }

  parseConsensusSignal(content: string): { signal: 'has_more' | 'satisfied' | 'position_change'; position?: string; confidence?: number } | null {
    const hasMoreMatch = content.match(/\[SIGNAL:\s*HAS_MORE\]/i);
    const satisfiedMatch = content.match(/\[SIGNAL:\s*SATISFIED\]/i);
    const positionMatch = content.match(/\[SIGNAL:\s*POSITION:\s*"([^"]+)"\]/i);

    if (hasMoreMatch) {
      return { signal: 'has_more' };
    }
    
    if (satisfiedMatch) {
      return { signal: 'satisfied' };
    }
    
    if (positionMatch) {
      return { 
        signal: 'position_change', 
        position: positionMatch[1],
        confidence: 8 // Default confidence when stating a position
      };
    }

    return null;
  }
}