// ClickFlow-Intake: Qualifier + Spec Collector

import type { Event, SiteSpec } from '../types/index.js';
import { kommo } from '../lib/kommo.js';

export class IntakeAgent {
  async handleEvent(event: Event): Promise<void> {
    console.log(`[Intake] Handling event: ${event.type}`);

    switch (event.type) {
      case 'lead.qualified':
        await this.sendIntakeForm(event);
        break;
      case 'intake.submitted':
        await this.validateSpec(event);
        break;
      case 'intake.missing_data':
        await this.requestMissingData(event);
        break;
      default:
        console.log(`[Intake] Unknown event type: ${event.type}`);
    }
  }

  private async sendIntakeForm(event: Event): Promise<void> {
    console.log('[Intake] Sending intake form to lead');
    
    // Send form link via email/WhatsApp
    // Log to Kommo
    if (event.conversationId) {
      await kommo.addNote('leads', parseInt(event.conversationId), 
        'Intake form sent - awaiting submission'
      );
    }
  }

  private async validateSpec(event: Event): Promise<void> {
    console.log('[Intake] Validating SiteSpec');
    
    const spec = this.extractSiteSpec(event);
    const missingFields = this.checkRequiredFields(spec);
    
    if (missingFields.length === 0) {
      // Approve and route to payment
      console.log('[Intake] Spec approved');
      // Emit: intake.approved
    } else {
      // Request missing data
      console.log(`[Intake] Missing fields: ${missingFields.join(', ')}`);
      // Emit: intake.missing_data
    }
  }

  private async requestMissingData(event: Event): Promise<void> {
    console.log('[Intake] Requesting missing data from lead');
    // Send message with specific missing fields
  }

  private extractSiteSpec(event: Event): Partial<SiteSpec> {
    // Extract from event data
    return {} as SiteSpec;
  }

  private checkRequiredFields(spec: Partial<SiteSpec>): string[] {
    const required: string[] = [];
    
    if (!spec.business?.name) required.push('business.name');
    if (!spec.business?.trade) required.push('business.trade');
    if (!spec.contact?.phone) required.push('contact.phone');
    if (!spec.contact?.email) required.push('contact.email');
    if (!spec.about?.headline) required.push('about.headline');
    if (!spec.about?.story) required.push('about.story');
    if (!spec.services || spec.services.length < 2) required.push('services');
    
    return required;
  }
}

export const intakeAgent = new IntakeAgent();
