import type { Role, ContentType, ContentTypeDef } from '@/types';

export const ROLES: Role[] = [
  {
    id: 'president',
    label: 'President',
    icon: 'Crown',
    accent: '#2563eb',
    accentLight: '#dbeafe',
    accentDark: '#1e40af',
    description: 'Formal communications from the top',
    contentTypes: ['formal_email'],
  },
  {
    id: 'deputy_president',
    label: 'Deputy President',
    icon: 'Shield',
    accent: '#059669',
    accentLight: '#d1fae5',
    accentDark: '#065f46',
    description: 'Emails & announcements',
    contentTypes: ['email', 'event_announcement', 'general_announcement'],
  },
  {
    id: 'secretary',
    label: 'Secretary',
    icon: 'FileText',
    accent: '#d97706',
    accentLight: '#fef3c7',
    accentDark: '#92400e',
    description: 'Emails, agendas & minutes',
    contentTypes: ['formal_email', 'meeting_agenda', 'meeting_minutes'],
  },
  {
    id: 'treasury',
    label: 'Treasury',
    icon: 'Wallet',
    accent: '#dc2626',
    accentLight: '#fee2e2',
    accentDark: '#991b1b',
    description: 'Budgets & bookkeeping',
    contentTypes: ['budget_draft', 'bookkeeping_summary'],
  },
  {
    id: 'community_engagement',
    label: 'Community Engagement',
    icon: 'HeartHandshake',
    accent: '#0891b2',
    accentLight: '#cffafe',
    accentDark: '#155e75',
    description: 'Outreach & impact promotions',
    contentTypes: ['promo_poster', 'event_ideas'],
  },
  {
    id: 'social_culture',
    label: 'Social & Culture',
    icon: 'PartyPopper',
    accent: '#7c3aed',
    accentLight: '#ede9fe',
    accentDark: '#5b21b6',
    description: 'Fun events & campus hype',
    contentTypes: ['promo_poster', 'event_ideas'],
  },
  {
    id: 'internal_comms',
    label: 'Internal Communications',
    icon: 'Megaphone',
    accent: '#4f46e5',
    accentLight: '#e0e7ff',
    accentDark: '#3730a3',
    description: 'Posters, write-ups & social',
    contentTypes: ['promo_poster', 'event_writeup', 'social_caption'],
  },
];

const PLATFORM_OPTIONS = ['Instagram', 'WhatsApp', 'Email', 'Poster'];

export const CONTENT_TYPES: Record<ContentType, ContentTypeDef> = {
  formal_email: {
    id: 'formal_email',
    label: 'Formal Email',
    icon: 'Mail',
    isEmail: true,
    outputFormat: 'email',
    fields: [
      { key: 'recipient', label: 'Recipient', type: 'text', placeholder: 'e.g. The Dean of Students', required: true },
      { key: 'purpose', label: 'Purpose', type: 'text', placeholder: 'e.g. Request approval for SRC budget', required: true },
      { key: 'key_points', label: 'Key Points', type: 'textarea', placeholder: 'Main points to cover, one per line', required: true },
      { key: 'tone', label: 'Tone', type: 'select', options: ['Formal', 'Very Formal'], required: true },
    ],
  },
  email: {
    id: 'email',
    label: 'Email',
    icon: 'Mail',
    isEmail: true,
    outputFormat: 'email',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. SRC meeting reschedule', required: true },
      { key: 'key_details', label: 'Key Details', type: 'textarea', placeholder: 'Important details to include', required: true },
      { key: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. All SRC members', required: true },
    ],
  },
  event_announcement: {
    id: 'event_announcement',
    label: 'Event Announcement',
    icon: 'CalendarPlus',
    outputFormat: 'announcement',
    fields: [
      { key: 'event_name', label: 'Event Name', type: 'text', placeholder: 'e.g. Annual SRC Town Hall', required: true },
      { key: 'date_time', label: 'Date & Time', type: 'text', placeholder: 'e.g. 15 March, 6pm', required: true },
      { key: 'venue', label: 'Venue', type: 'text', placeholder: 'e.g. Main Auditorium', required: true },
      { key: 'key_details', label: 'Key Details', type: 'textarea', placeholder: 'What students need to know', required: true },
    ],
  },
  general_announcement: {
    id: 'general_announcement',
    label: 'General Announcement',
    icon: 'Bell',
    outputFormat: 'announcement',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. SRC office hours', required: true },
      { key: 'key_details', label: 'Key Details', type: 'textarea', placeholder: 'What to announce', required: true },
      { key: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. All students', required: true },
    ],
  },
  meeting_agenda: {
    id: 'meeting_agenda',
    label: 'Meeting Agenda',
    icon: 'ListOrdered',
    isDocument: true,
    outputFormat: 'document',
    fields: [
      { key: 'meeting_date', label: 'Meeting Date', type: 'text', placeholder: 'e.g. 20 March 2026', required: true },
      { key: 'start_time', label: 'Start Time', type: 'text', placeholder: 'e.g. 14:00' },
      { key: 'topics', label: 'Topics (one per line)', type: 'textarea', placeholder: 'Budget review\nElection preparations\nCampus feedback', required: true },
      { key: 'attendees', label: 'Expected Attendees', type: 'text', placeholder: 'e.g. All portfolio heads' },
    ],
  },
  meeting_minutes: {
    id: 'meeting_minutes',
    label: 'Meeting Minutes',
    icon: 'ClipboardList',
    isDocument: true,
    outputFormat: 'document',
    fields: [
      { key: 'meeting_date', label: 'Meeting Date', type: 'text', placeholder: 'e.g. 20 March 2026', required: true },
      { key: 'attendees', label: 'Attendees (comma separated)', type: 'text', placeholder: 'e.g. Jane, John, Sarah', required: true },
      { key: 'topics', label: 'Topics Discussed (one per line)', type: 'textarea', placeholder: 'Budget review\nElection preparations', required: true },
      { key: 'decisions', label: 'Decisions Made (one per line)', type: 'textarea', placeholder: 'Approved R5000 for event\nPostponed elections to April' },
    ],
  },
  budget_draft: {
    id: 'budget_draft',
    label: 'Budget Draft',
    icon: 'Banknote',
    isDocument: true,
    outputFormat: 'document',
    fields: [
      { key: 'purpose', label: 'Budget Purpose', type: 'text', placeholder: 'e.g. SRC Annual Gala', required: true },
      { key: 'line_items', label: 'Line Items (description: amount, one per line)', type: 'textarea', placeholder: 'Venue hire: 3000\nCatering: 1500\nDecorations: 500', required: true },
      { key: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Any context or constraints' },
    ],
  },
  bookkeeping_summary: {
    id: 'bookkeeping_summary',
    label: 'Bookkeeping Summary',
    icon: 'Calculator',
    isDocument: true,
    outputFormat: 'document',
    fields: [
      { key: 'period', label: 'Period', type: 'text', placeholder: 'e.g. March 2026', required: true },
      { key: 'line_items', label: 'Transactions (description: amount, one per line)', type: 'textarea', placeholder: 'Event tickets sold: 2000\nVenue payment: -1500\nStationery: -200', required: true },
      { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Any additional context' },
    ],
  },
  promo_poster: {
    id: 'promo_poster',
    label: 'Promotional Poster',
    icon: 'Image',
    isPoster: true,
    outputFormat: 'poster',
    fields: [
      { key: 'event_name', label: 'Event / Initiative Name', type: 'text', placeholder: 'e.g. Campus Clean-Up Day', required: true },
      { key: 'date_location', label: 'Date & Location', type: 'text', placeholder: 'e.g. 22 March, Main Quad', required: true },
      { key: 'key_info', label: 'Key Info', type: 'textarea', placeholder: 'What, why, who can join', required: true },
      { key: 'platform', label: 'Platform', type: 'select', options: PLATFORM_OPTIONS, required: true },
      { key: 'rsvp_url', label: 'RSVP / Info Link (optional, for QR code)', type: 'text', placeholder: 'https://forms.gle/...' },
    ],
  },
  event_ideas: {
    id: 'event_ideas',
    label: 'Event Ideas',
    icon: 'Lightbulb',
    isIdeas: true,
    outputFormat: 'ideas',
    fields: [
      { key: 'vibe', label: 'Vibe / Theme', type: 'text', placeholder: 'e.g. chill and low-key, high energy, give-back focused', required: true },
      { key: 'goal', label: 'Goal', type: 'select', options: ['Fundraising', 'Raising Awareness', 'Just for Fun', 'Community Building', 'Skill-Building'], required: true },
      { key: 'audience_size', label: 'Audience Size', type: 'select', options: ['Small (under 30)', 'Medium (30-100)', 'Large (100+)'], required: true },
      { key: 'budget', label: 'Budget Level', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
      { key: 'timeframe', label: 'Timeframe', type: 'select', options: ['This week', 'This month', 'This semester'], required: true },
    ],
  },
  event_writeup: {
    id: 'event_writeup',
    label: 'Event Write-Up',
    icon: 'PenLine',
    isDocument: true,
    outputFormat: 'document',
    fields: [
      { key: 'event_name', label: 'Event Name', type: 'text', placeholder: 'e.g. SRC Welcome Braai', required: true },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g. 5 March 2026', required: true },
      { key: 'highlights', label: 'Highlights (one per line)', type: 'textarea', placeholder: 'Great turnout of 200+ students\nLive music from the band\nR10,000 raised for charity', required: true },
      { key: 'image_provided', label: 'Photo included?', type: 'select', options: ['No', 'Yes'] },
    ],
  },
  social_caption: {
    id: 'social_caption',
    label: 'Social Media Captions',
    icon: 'Share2',
    isSocial: true,
    outputFormat: 'social',
    fields: [
      { key: 'event_name', label: 'Event / Topic', type: 'text', placeholder: 'e.g. SRC Town Hall', required: true },
      { key: 'date', label: 'Date', type: 'text', placeholder: 'e.g. 15 March' },
      { key: 'highlights', label: 'Highlights', type: 'textarea', placeholder: 'Key points to mention', required: true },
      { key: 'platform', label: 'Platform', type: 'select', options: PLATFORM_OPTIONS, required: true },
    ],
  },
};

export function getRole(id: string): Role | undefined {
  return ROLES.find((r) => r.id === id);
}

export function getContentType(id: string): ContentTypeDef | undefined {
  return CONTENT_TYPES[id as ContentType];
}
