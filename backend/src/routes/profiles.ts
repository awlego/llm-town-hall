import { Router } from 'express';
import { AgentService } from '../services/agentService';

export function profileRoutes() {
  const router = Router();
  const agentService = new AgentService();

  router.get('/', (req, res) => {
    try {
      const profiles = agentService.getDefaultProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profiles' });
    }
  });

  return router;
}