// ClickFlow-Dispatcher: Routes events and manages conversation ownership

import type { Event, Conversation, AgentType, PipelineStage } from '../types/index.js';

export class Dispatcher {
  private conversations: Map<string, Conversation> = new Map();

  async handleEvent(event: Event): Promise<void> {
    console.log(`[Dispatcher] Handling event: ${event.type}`);
    
    switch (event.type) {
      case 'lead.created':
        await this.routeToAgent(event, 'ClickFlow-Growth', 'Applied');
        break;
      case 'lead.qualified':
        await this.routeToAgent(event, 'ClickFlow-Intake', 'Approved');
        break;
      case 'payment.received':
        await this.handlePaymentReceived(event);
        break;
      case 'build.preview_ready':
        await this.routeToAgent(event, 'ClickFlow-Support', 'QA');
        break;
      case 'qa.approved':
        await this.routeToAgent(event, 'ClickFlow-Ops', 'Live');
        break;
      case 'inbound.message':
        await this.handleInboundMessage(event);
        break;
      default:
        console.log(`[Dispatcher] Unhandled event type: ${event.type}`);
    }
  }

  private async routeToAgent(
    event: Event,
    agent: AgentType,
    stage: PipelineStage
  ): Promise<void> {
    const conversationId = this.extractConversationId(event);
    
    // Release current lock if exists
    const existing = this.conversations.get(conversationId);
    if (existing) {
      console.log(`[Dispatcher] Releasing lock from ${existing.owner}`);
    }

    // Assign new owner
    const conversation: Conversation = {
      id: conversationId,
      owner: agent,
      stage,
      startedAt: existing?.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      context: { ...existing?.context, lastEvent: event }
    };

    this.conversations.set(conversationId, conversation);
    console.log(`[Dispatcher] Routed to ${agent}, stage: ${stage}`);
    
    // Trigger agent
    await this.triggerAgent(agent, event, conversation);
  }

  private async handlePaymentReceived(event: Event): Promise<void> {
    // Check if spec is complete before routing to build
    const conversationId = this.extractConversationId(event);
    const conversation = this.conversations.get(conversationId);
    
    if (conversation?.context?.specComplete) {
      await this.routeToAgent(event, 'ClickFlow-Build', 'Paid');
    } else {
      // Route to Intake to complete spec first
      await this.routeToAgent(event, 'ClickFlow-Intake', 'Approved');
    }
  }

  private async handleInboundMessage(event: Event): Promise<void> {
    const conversationId = this.extractConversationId(event);
    const existing = this.conversations.get(conversationId);
    
    // If conversation exists and has an owner, route to them
    // Otherwise, route to Support as default
    if (existing?.owner) {
      console.log(`[Dispatcher] Routing inbound message to existing owner: ${existing.owner}`);
      await this.triggerAgent(existing.owner, event, existing);
    } else {
      console.log(`[Dispatcher] Routing inbound message to ClickFlow-Support`);
      await this.routeToAgent(event, 'ClickFlow-Support', 'Ongoing');
    }
  }

  private async triggerAgent(
    agent: AgentType,
    event: Event,
    conversation: Conversation
  ): Promise<void> {
    // Agent trigger logic would go here
    // For now, just log
    console.log(`[Dispatcher] Triggering ${agent} with event ${event.type}`);
  }

  private extractConversationId(event: Event): string {
    // Extract from event data
    return `conv_${event.traceId}`;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }
}

export const dispatcher = new Dispatcher();
