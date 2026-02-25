// ClickFlow-Support: Account Manager + QA

import type { Event } from '../types/index.js';
import { kommo } from '../lib/kommo.js';

export class SupportAgent {
  async handleEvent(event: Event): Promise<void> {
    console.log(`[Support] Handling event: ${event.type}`);

    switch (event.type) {
      case 'build.preview_ready':
        await this.sendPreviewForQA(event);
        break;
      case 'qa.approved':
        await this.handleQAApproval(event);
        break;
      case 'qa.fixes_requested':
        await this.handleFixRequest(event);
        break;
      case 'inbound_message':
        await this.handleInboundMessage(event);
        break;
      case 'change_order.requested':
        await this.handleChangeOrder(event);
        break;
      default:
        console.log(`[Support] Unknown event type: ${event.type}`);
    }
  }

  private async sendPreviewForQA(event: Event): Promise<void> {
    console.log('[Support] Sending preview URL for QA');
    
    const previewUrl = event.context?.previewUrl;
    
    // Send to customer:
    // "Your preview is ready: {previewUrl}
    //  Reply APPROVED or list fixes (typos, contact info, images only)"
    
    console.log(`[Support] Preview URL: ${previewUrl}`);
  }

  private async handleQAApproval(event: Event): Promise<void> {
    console.log('[Support] QA approved, routing to Ops');
    // Emit: qa.approved → Ops for domain attachment
  }

  private async handleFixRequest(event: Event): Promise<void> {
    console.log('[Support] Processing fix request');
    
    const fixes = event.context?.fixes as string[];
    
    // Validate: are these fix-list only?
    const allowedFixes = [
      'typo', 'phone', 'email', 'service', 'image', 'logo', 
      'cta', 'hours', 'license'
    ];
    
    const allAllowed = fixes.every(f => 
      allowedFixes.some(a => f.toLowerCase().includes(a))
    );
    
    if (allAllowed) {
      // Route to Build
      console.log('[Support] Fixes are allowed, routing to Build');
      // Emit: build.fix_list
    } else {
      // Create Change Order
      console.log('[Support] Non-fix changes, creating Change Order');
      // Emit: change_order.quote
    }
  }

  private async handleInboundMessage(event: Event): Promise<void> {
    console.log('[Support] Handling inbound message');
    // Categorize and respond
  }

  private async handleChangeOrder(event: Event): Promise<void> {
    console.log('[Support] Creating Change Order quote');
    // Quote and send to customer
  }
}

export const supportAgent = new SupportAgent();
