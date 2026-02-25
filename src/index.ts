// Main entry point for ClickFlow Runtime

import express from 'express';
import dotenv from 'dotenv';
import { dispatcher } from './agents/dispatcher.js';
import { growthAgent } from './agents/growth.js';
import { intakeAgent } from './agents/intake.js';
import { supportAgent } from './agents/support.js';
import { buildAgent } from './agents/build.js';
import { opsAgent } from './agents/ops.js';
import { kommo } from './lib/kommo.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Agent registry
const agents = {
  'ClickFlow-Growth': growthAgent,
  'ClickFlow-Intake': intakeAgent,
  'ClickFlow-Support': supportAgent,
  'ClickFlow-Build': buildAgent,
  'ClickFlow-Ops': opsAgent
};

// Health check
app.get('/health', async (_req, res) => {
  // Test Kommo connection
  let kommoStatus = 'unknown';
  try {
    await kommo.getAccount();
    kommoStatus = 'connected';
  } catch (e) {
    kommoStatus = 'disconnected';
  }

  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    conversations: dispatcher.getAllConversations().length,
    kommo: kommoStatus,
    agents: Object.keys(agents)
  });
});

// Get all conversations
app.get('/conversations', (_req, res) => {
  res.json(dispatcher.getAllConversations());
});

// Get specific conversation
app.get('/conversations/:id', (req, res) => {
  const conv = dispatcher.getConversation(req.params.id);
  if (conv) {
    res.json(conv);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Trigger agent directly (for testing)
app.post('/agents/:name', async (req, res) => {
  const agentName = req.params.name as keyof typeof agents;
  const agent = agents[agentName];
  
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }

  try {
    await agent.handleEvent(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Kommo webhook
app.post('/webhooks/kommo', async (req, res) => {
  console.log('[Webhook] Kommo event received:', req.body);
  
  // Acknowledge immediately
  res.status(200).json({ received: true });
  
  // Process async
  try {
    await dispatcher.handleEvent({
      id: `evt_${Date.now()}`,
      type: mapKommoEvent(req.body),
      timestamp: new Date().toISOString(),
      source: 'kommo',
      traceId: `trace_${Date.now()}`,
      conversationId: req.body.leads?.add?.[0]?.id || req.body.id,
      context: req.body
    });
  } catch (error) {
    console.error('[Webhook] Error processing Kommo event:', error);
  }
});

// Stripe webhook
app.post('/webhooks/stripe', async (req, res) => {
  console.log('[Webhook] Stripe event received:', req.body.type);
  
  res.status(200).json({ received: true });
  
  try {
    await dispatcher.handleEvent({
      id: `evt_${Date.now()}`,
      type: mapStripeEvent(req.body.type),
      timestamp: new Date().toISOString(),
      source: 'stripe',
      traceId: `trace_${Date.now()}`,
      context: req.body
    });
  } catch (error) {
    console.error('[Webhook] Error processing Stripe event:', error);
  }
});

// Event mappers
function mapKommoEvent(kommoBody: any): string {
  // Map Kommo webhook to internal event types
  if (kommoBody.leads?.add) return 'lead.created';
  if (kommoBody.leads?.update) return 'lead.updated';
  if (kommoBody.notes?.add) return 'note.added';
  return 'unknown';
}

function mapStripeEvent(stripeType: string): string {
  const mapping: Record<string, string> = {
    'payment_intent.succeeded': 'payment.received',
    'payment_intent.payment_failed': 'payment.failed',
    'charge.refunded': 'payment.refunded'
  };
  return mapping[stripeType] || 'payment.unknown';
}

app.listen(PORT, () => {
  console.log(`
🎯 ClickFlow Runtime v2.0.0
═══════════════════════════════
Port:        ${PORT}
Health:      http://localhost:${PORT}/health
Conversations: http://localhost:${PORT}/conversations

Webhooks:
  • Kommo:  POST http://localhost:${PORT}/webhooks/kommo
  • Stripe: POST http://localhost:${PORT}/webhooks/stripe

Agents:
  • ClickFlow-Dispatcher   (supervisor)
  • ClickFlow-Growth       (outbound)
  • ClickFlow-Intake       (qualifier)
  • ClickFlow-Support      (AM/support)
  • ClickFlow-Build        (Astro/Codex)
  • ClickFlow-Ops          (Vercel/infra)
  `);
});
