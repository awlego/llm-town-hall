import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message, Session } from '../types';

export const useSocket = (serverUrl: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('session_joined', (session: Session) => {
      setCurrentSession(session);
      setMessages(session.messages);
    });

    socketRef.current.on('agent_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      setThinking(null);
    });

    socketRef.current.on('agent_thinking', ({ agentId }: { agentId: string }) => {
      setThinking(agentId);
    });

    socketRef.current.on('moderator_input', ({ sessionId, content, type }: any) => {
      if (type === 'pause') {
        setCurrentSession(prev => prev ? { ...prev, status: 'paused' } : null);
      } else if (type === 'resume') {
        setCurrentSession(prev => prev ? { ...prev, status: 'active' } : null);
      }
    });

    socketRef.current.on('consensus_reached', ({ decision, round }: any) => {
      // Handle consensus reached
      setCurrentSession(prev => {
        if (prev && prev.consensus) {
          return {
            ...prev,
            status: 'completed',
            consensus: {
              ...prev.consensus,
              consensusReached: true,
              finalDecision: decision
            }
          };
        }
        return prev;
      });
    });

    socketRef.current.on('consensus_round_advance', ({ round }: any) => {
      // Handle round advancement
      setCurrentSession(prev => {
        if (prev && prev.consensus) {
          return {
            ...prev,
            consensus: {
              ...prev.consensus,
              currentRound: round
            }
          };
        }
        return prev;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [serverUrl]);

  const joinSession = (sessionId: string) => {
    socketRef.current?.emit('join_session', sessionId);
  };

  const startDiscussion = (sessionId: string) => {
    socketRef.current?.emit('start_discussion', sessionId);
  };

  const sendModeratorInput = (sessionId: string, content: string, type: string) => {
    socketRef.current?.emit('moderator_input', { sessionId, content, type });
  };

  return {
    isConnected,
    currentSession,
    messages,
    thinking,
    joinSession,
    startDiscussion,
    sendModeratorInput
  };
};