
export enum QuestionType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  DATE = 'DATE',
  IMAGE_UPLOAD = 'IMAGE_UPLOAD', // New Type
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

// Added subscription fields
export interface UserProfile {
  email: string;
  name: string;
  isPro: boolean;
  credits: number;
  isAdmin?: boolean;
  planType?: 'free' | 'monthly' | 'master_monthly' | 'yearly' | 'credits_pack';
  subscriptionDate?: string;
  lastFreeReset?: string; // New field to track the 3-day reset rule
}
