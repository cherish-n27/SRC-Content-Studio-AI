export type RoleId =
  | 'president'
  | 'deputy_president'
  | 'secretary'
  | 'treasury'
  | 'community_engagement'
  | 'social_culture'
  | 'internal_comms';

export interface Role {
  id: RoleId;
  label: string;
  icon: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  description: string;
  contentTypes: ContentType[];
}

export type ContentType =
  | 'formal_email'
  | 'email'
  | 'event_announcement'
  | 'general_announcement'
  | 'meeting_agenda'
  | 'meeting_minutes'
  | 'budget_draft'
  | 'bookkeeping_summary'
  | 'promo_poster'
  | 'event_ideas'
  | 'event_writeup'
  | 'social_caption';

export interface ContentTypeDef {
  id: ContentType;
  label: string;
  icon: string;
  isPoster?: boolean;
  isEmail?: boolean;
  isDocument?: boolean;
  isSocial?: boolean;
  isIdeas?: boolean;
  fields: FieldDef[];
  outputFormat: OutputFormat;
}

export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export type OutputFormat = 'email' | 'announcement' | 'document' | 'poster' | 'social' | 'ideas';

export interface GenerationInput {
  [key: string]: string;
}

export interface EmailOutput {
  subject: string;
  body: string;
}

export interface AnnouncementOutput {
  headline: string;
  body: string;
}

export interface DocumentOutput {
  title: string;
  sections: { heading: string; items: string[] }[];
  raw?: string;
}

export interface PosterOutput {
  headline: string;
  subtext: string;
  details: string;
  cta: string;
  hashtags: string[];
}

export interface SocialOutput {
  platforms: { platform: string; caption: string; hashtags: string[] }[];
}

export interface EventIdea {
  name: string;
  concept: string;
  whyItFits: string;
  format: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface EventIdeasOutput {
  ideas: EventIdea[];
}

export interface Generation {
  id: string;
  user_id: string;
  role: RoleId;
  content_type: ContentType;
  input_data: GenerationInput;
  output_data:
    | EmailOutput
    | AnnouncementOutput
    | DocumentOutput
    | PosterOutput
    | SocialOutput
    | EventIdeasOutput;
  created_at: string;
}

export interface Profile {
  user_id: string;
  role: RoleId;
  brand_color: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
