// Kommo API Client for ClickFlow

const KOMMO_BASE_URL = process.env.KOMMO_BASE_URL || 'https://alexgrundy.kommo.com';
const KOMMO_TOKEN = process.env.KOMMO_TOKEN;

export class KommoClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = KOMMO_BASE_URL;
    this.token = KOMMO_TOKEN || '';
    
    if (!this.token) {
      console.error('[Kommo] ERROR: KOMMO_TOKEN not configured');
      throw new Error('KOMMO_TOKEN not configured');
    }
    console.log('[Kommo] Initialized with baseUrl:', this.baseUrl);
  }

  private async request(endpoint: string, options: any = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    console.log(`[Kommo] Request: ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      console.log(`[Kommo] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Kommo] ERROR: ${response.status} - ${errorText}`);
        throw new Error(`Kommo API error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[Kommo] Request failed:`, error);
      throw error;
    }
  }

  async addNote(entityType: 'leads' | 'contacts', entityId: number, text: string) {
    console.log(`[Kommo] Adding note to ${entityType} ${entityId}: "${text}"`);
    
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
}

export const kommo = new KommoClient();
