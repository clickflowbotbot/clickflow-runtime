import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dispatcher } from '../../../src/agents/dispatcher.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Kommo Webhook] Received:', JSON.stringify(req.body, null, 2));

  try {
    // Map Kommo event to internal event
    const event = mapKommoEvent(req.body);
    
    if (event) {
      console.log('[Kommo Webhook] Mapped to:', event.type);
      await dispatcher.handleEvent(event);
      console.log('[Kommo Webhook] Processed successfully');
    } else {
      console.log('[Kommo Webhook] Event type not handled');
    }

    res.status(200).json({ 
      received: true, 
      processed: !!event,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('[Kommo Webhook] Error:', error);
    res.status(500).json({ 
      received: true, 
      error: String(error),
      timestamp: new Date().toISOString() 
    });
  }
}

function mapKommoEvent(body: any) {
  // New lead created
  if (body.leads?.add?.length > 0) {
    const lead = body.leads.add[0];
    return {
      id: `evt_${Date.now()}`,
      type: 'lead.created',
      timestamp: new Date().toISOString(),
      source: 'kommo' as const,
      traceId: `trace_${lead.id}`,
      conversationId: `kommo_${lead.id}`,
      context: { lead }
    };
  }

  // Lead updated
  if (body.leads?.update?.length > 0) {
    const lead = body.leads.update[0];
    return {
      id: `evt_${Date.now()}`,
      type: 'lead.updated',
      timestamp: new Date().toISOString(),
      source: 'kommo' as const,
      traceId: `trace_${lead.id}`,
      conversationId: `kommo_${lead.id}`,
      context: { lead }
    };
  }

  // Note added (includes WhatsApp messages)
  if (body.notes?.add?.length > 0) {
    const note = body.notes.add[0];
    return {
      id: `evt_${Date.now()}`,
      type: 'inbound.message',
      timestamp: new Date().toISOString(),
      source: 'kommo' as const,
      traceId: `trace_${note.entity_id}`,
      conversationId: `kommo_${note.entity_id}`,
      context: { note }
    };
  }

  // Contact created/updated
  if (body.contacts?.add?.length > 0 || body.contacts?.update?.length > 0) {
    const contact = body.contacts.add?.[0] || body.contacts.update?.[0];
    return {
      id: `evt_${Date.now()}`,
      type: 'contact.updated',
      timestamp: new Date().toISOString(),
      source: 'kommo' as const,
      traceId: `trace_${contact.id}`,
      conversationId: `kommo_contact_${contact.id}`,
      context: { contact }
    };
  }

  return null;
}
