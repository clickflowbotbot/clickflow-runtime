import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Kommo Webhook]', req.body);

  // Process the webhook
  // TODO: Add actual processing logic

  res.status(200).json({ 
    received: true, 
    timestamp: new Date().toISOString() 
  });
}
