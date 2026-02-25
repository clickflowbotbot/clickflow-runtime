// Kommo API Client for ClickFlow

import fetch from 'node-fetch';

const KOMMO_BASE_URL = process.env.KOMMO_BASE_URL || 'https://alexgrundy.kommo.com';
const KOMMO_TOKEN = process.env.KOMMO_TOKEN;

export class KommoClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = KOMMO_BASE_URL;
    this.token = KOMMO_TOKEN || '';
    
    if (!this.token) {
      throw new Error('KOMMO_TOKEN not configured');
    }
  }

  private async request(endpoint: string, options: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kommo API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Leads
  async getLeads(limit: number = 10) {
    return this.request(`/api/v4/leads?limit=${limit}`);
  }

  async getLead(id: number) {
    return this.request(`/api/v4/leads/${id}`);
  }

  async createLead(data: any) {
    return this.request('/api/v4/leads', {
      method: 'POST',
      body: JSON.stringify([data])
    });
  }

  async updateLead(id: number, data: any) {
    return this.request(`/api/v4/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Contacts
  async getContact(id: number) {
    return this.request(`/api/v4/contacts/${id}`);
  }

  // Notes (for logging agent actions)
  async addNote(entityType: 'leads' | 'contacts', entityId: number, text: string) {
    return this.request('/api/v4/notes', {
      method: 'POST',
      body: JSON.stringify([{
        entity_id: entityId,
        note_type: 'common',
        params: {
          text,
          service: 'ClickFlow'
        }
      }])
    });
  }

  // Custom Fields
  async getCustomFields(entityType: 'leads' | 'contacts' | 'companies') {
    return this.request(`/api/v4/${entityType}/custom_fields`);
  }

  // Pipeline/Statuses
  async getPipelines() {
    return this.request('/api/v4/pipelines');
  }

  // Account Info
  async getAccount() {
    return this.request('/api/v4/account');
  }
}

export const kommo = new KommoClient();
