import { Router } from 'express';
import { SessionService } from '../services/sessionService';
import { AgentProfile } from '../models';

export function sessionRoutes(sessionService: SessionService) {
  const router = Router();

  router.post('/', (req, res) => {
    try {
      const { title, goal, participants } = req.body;
      
      if (!title || !goal || !participants || !Array.isArray(participants)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const session = sessionService.createSession(title, goal, participants);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  router.get('/', (req, res) => {
    try {
      const sessions = sessionService.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      const session = sessionService.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  });

  return router;
}