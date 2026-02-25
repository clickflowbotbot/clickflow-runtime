import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    message: '🎯 ClickFlow Runtime',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      kommo: 'POST /api/webhooks/kommo',
      stripe: 'POST /api/webhooks/stripe'
    }
  });
}
