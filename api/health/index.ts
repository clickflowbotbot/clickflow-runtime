import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    agents: [
      'ClickFlow-Dispatcher',
      'ClickFlow-Growth',
      'ClickFlow-Intake',
      'ClickFlow-Support',
      'ClickFlow-Build',
      'ClickFlow-Ops'
    ]
  });
}
