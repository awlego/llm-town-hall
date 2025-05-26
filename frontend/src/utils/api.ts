import { AgentProfile, Session } from '../types';

const API_BASE = 'http://localhost:3001/api';

export const api = {
  async createSession(title: string, goal: string, participants: AgentProfile[]): Promise<Session> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, goal, participants, type: 'discussion' }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    return response.json();
  },

  async createConsensusSession(title: string, goal: string, consensusQuestion: string, participants: AgentProfile[]): Promise<Session> {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title, 
        goal, 
        participants, 
        type: 'consensus',
        consensusQuestion 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create consensus session');
    }
    
    return response.json();
  },

  async getSessions(): Promise<Session[]> {
    const response = await fetch(`${API_BASE}/sessions`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }
    
    return response.json();
  },

  async getSession(id: string): Promise<Session> {
    const response = await fetch(`${API_BASE}/sessions/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch session');
    }
    
    return response.json();
  },

  async getProfiles(): Promise<AgentProfile[]> {
    const response = await fetch(`${API_BASE}/profiles`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }
    
    return response.json();
  },
};