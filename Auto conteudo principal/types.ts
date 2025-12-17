
export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  DATE = 'DATE',
  IMAGE_UPLOAD = 'IMAGE_UPLOAD',
  MULTI_IMAGE_UPLOAD = 'MULTI_IMAGE_UPLOAD'
}

export interface Option {
  label: string;
  value: string;
}

export interface WizardStep {
  id: string;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: Option[];
  placeholder?: string;
  required?: boolean;
  maxFiles?: number;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  outputType: 'TEXT' | 'IMAGE' | 'SITE'; 
  steps: WizardStep[];
  systemPrompt: string;
  category?: 'Curriculo' | 'Marketing' | 'Business' | 'Jurídico' | 'Criativo';
  minPlan?: 'free' | 'pro' | 'master';
  oneTimePrice?: number; // Preço para compra única
}

export interface UserAnswers {
  [stepId: string]: string | string[];
}

export interface GeneratedDocument {
  id: string;
  templateId: string;
  title: string;
  content: string; 
  createdAt: Date;
  previewSnippet: string;
  type?: 'TEXT' | 'IMAGE' | 'SITE'; 
}

export interface UserProfile {
  email: string;
  name: string;
  isPro: boolean;
  credits: number;
  isAdmin?: boolean;
  planType?: 'free' | 'monthly' | 'master_monthly' | 'yearly' | 'credits_pack' | 'individual_purchase';
  subscriptionDate?: string;
  lastFreeReset?: string;
}
