import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[Kommo Webhook] Received:', JSON.stringify(req.body, null, 2));

  try {
    // Import kommo client
    const { kommo } = await import('../../../src/lib/kommo.js');
    
    // Map Kommo event
    const event = mapKommoEvent(req.body);
    
    if (event) {
      console.log('[Kommo Webhook] Mapped to:', event.type);
      
      // If it's an inbound message, send auto-reply
      if (event.type === 'inbound.message') {
        const leadId = event.conversationId?.replace('kommo_', '');
        const note = event.context?.note as any;
        const messageText = note?.params?.text || '';
        
        console.log(`[Kommo Webhook] Processing message from lead ${leadId}: "${messageText}"`);
        
        // Simple auto-response
        let response = '';
        if (messageText.toLowerCase().includes('hello') || messageText.toLowerCase().includes('hi') || messageText.toLowerCase().includes('hey')) {
          response = "Hi there! I'm ClickFlow Support. How can I help you today?";
        } else if (messageText.toLowerCase().includes('price')) {
          response = "Our packages start at $500. Would you like me to connect you with our team to discuss options?";
        } else {
          response = "Thanks for your message! I'm connecting you with our team. Someone will be with you shortly.";
        }
        
        console.log(`[Kommo Webhook] Sending auto-reply: "${response}"`);
        
        // Send response via Kommo
        try {
          await kommo.addNote('leads', parseInt(leadId!), `[ClickFlow Auto-Reply] ${response}`);
          console.log('[Kommo Webhook] Auto-reply sent successfully');
        } catch (kommoError) {
          console.error('[Kommo Webhook] Failed to send Kommo reply:', kommoError);
        }
      }
      
      return res.status(200).json({ 
        received: true, 
        processed: true,
        type: event.type,
        timestamp: new Date().toISOString() 
      });
    } else {
      console.log('[Kommo Webhook] Event type not handled');
      return res.status(200).json({ 
        received: true, 
        processed: false,
        reason: 'Event type not handled',
        timestamp: new Date().toISOString() 
      });
    }
  } catch (error) {
    console.error('[Kommo Webhook] Error:', error);
    return res.status(500).json({ 
      received: true, 
      error: String(error),
      timestamp: new Date().toISOString() 
    });
  }
}

function mapKommoEvent(body: any) {
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
  return null;
}
