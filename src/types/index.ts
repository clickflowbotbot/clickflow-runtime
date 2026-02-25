// ClickFlow Event Types

export interface Event {
  id: string;
  type: string;
  timestamp: string;
  source: 'kommo' | 'stripe' | 'internal';
  traceId: string;
  conversationId?: string;
  context?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  owner: AgentType | null;
  stage: PipelineStage;
  startedAt: string;
  updatedAt: string;
  context: Record<string, unknown>;
}

export type AgentType = 
  | 'ClickFlow-Dispatcher'
  | 'ClickFlow-Growth'
  | 'ClickFlow-Intake'
  | 'ClickFlow-Support'
  | 'ClickFlow-Build'
  | 'ClickFlow-Ops';

export type PipelineStage =
  | 'Applied'
  | 'Approved'
  | 'Payment Sent'
  | 'Paid'
  | 'In Build'
  | 'QA'
  | 'Live'
  | 'Ongoing';

// SiteSpec Types
export interface SiteSpec {
  business: {
    name: string;
    trade: string;
    tagline: string;
    established?: string;
    license?: string;
    abn?: string;
  };
  contact: {
    phone: string;
    email: string;
    address?: string;
  };
  serviceArea: string[];
  about: {
    headline: string;
    story: string;
    highlights?: string[];
  };
  services: Service[];
  reviews?: Review[];
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  cta?: {
    primary?: string;
    secondary?: string;
    emergency?: string;
  };
  seo?: {
    title?: string;
    description?: string;
  };
  theme: 'astrowind' | 'astro-starter-pro' | 'astroship';
  themeConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    font?: string;
  };
  assets: {
    logo: string;
    heroImage?: string;
    gallery?: string[];
  };
}

export interface Service {
  title: string;
  description: string;
  icon?: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
}

// Build Types
export interface BuildConfig {
  leadId: string;
  repoName: string;
  template: string;
  siteSpec: SiteSpec;
}

export interface BuildResult {
  success: boolean;
  projectId?: string;
  repoUrl?: string;
  previewUrl?: string;
  error?: string;
}
