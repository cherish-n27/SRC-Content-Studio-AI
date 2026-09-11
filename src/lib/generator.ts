import type { ContentType, GenerationInput, RoleId } from '@/types';
import type {
  EmailOutput,
  AnnouncementOutput,
  DocumentOutput,
  PosterOutput,
  SocialOutput,
  EventIdeasOutput,
  EventIdea,
} from '@/types';

function isOutOfScope(input: GenerationInput): boolean {
  const text = Object.values(input).join(' ').toLowerCase();
  const blocked = ['buy gun', 'drug deal', 'hack ', 'porn', 'gambling', 'casino', 'weapon', 'kill', 'bomb'];
  return blocked.some((kw) => text.includes(kw));
}

const OUT_OF_SCOPE_MSG = 'This falls outside SRC-related content. Could you rephrase your request around a campus or governance topic?';

function cap(s: string, max: number): string {
  const words = s.trim().split(/\s+/);
  if (words.length <= max) return s.trim();
  return words.slice(0, max).join(' ');
}

function generateEmail(role: RoleId, contentType: ContentType, input: GenerationInput, tone: 'formal' | 'casual'): EmailOutput {
  const isPresident = role === 'president';
  const isSecretary = role === 'secretary' && contentType === 'formal_email';
  const veryFormal = input.tone === 'Very Formal' || contentType === 'formal_email';

  const greeting = veryFormal ? 'Dear' : 'Hi';
  const signoff = isPresident ? 'Yours sincerely,' : isSecretary ? 'Respectfully,' : 'Kind regards,';
  const senderRole = role === 'president' ? 'President, Student Representative Council'
    : role === 'deputy_president' ? 'Deputy President, Student Representative Council'
    : role === 'secretary' ? 'Secretary, Student Representative Council'
    : 'Student Representative Council';

  let subject = '';
  let body = '';

  if (contentType === 'formal_email' || contentType === 'email') {
    const recipient = input.recipient || input.audience || 'Sir/Madam';
    const purpose = input.purpose || input.topic || '';
    const keyPoints = (input.key_points || input.key_details || '').split('\n').filter((l) => l.trim());

    subject = `${purpose}`;

    body = `${greeting} ${recipient},\n\n`;
    body += `I hope this message finds you well.\n\n`;
    body += `I am writing on behalf of the Student Representative Council regarding ${purpose.toLowerCase()}.\n\n`;

    if (keyPoints.length > 0) {
      body += `The following points are of particular importance:\n\n`;
      keyPoints.forEach((pt, i) => {
        body += `${i + 1}. ${pt.trim()}\n`;
      });
      body += `\n`;
    }

    if (tone === 'casual') {
      body += `We'd love to discuss this further at your earliest convenience. Feel free to reach out if you have any questions.\n\n`;
    } else {
      body += `We would appreciate the opportunity to discuss this matter further at your earliest convenience. Should you require any additional information, please do not hesitate to contact us.\n\n`;
    }

    body += `${signoff}\n${senderRole}`;
  }

  return { subject, body };
}

function generateAnnouncement(input: GenerationInput): AnnouncementOutput {
  const eventName = input.event_name || input.topic || '';
  const dateTime = input.date_time || '';
  const venue = input.venue || '';
  const details = input.key_details || '';

  const headline = `${eventName}`;

  let body = '';
  if (dateTime) body += `When: ${dateTime}\n`;
  if (venue) body += `Where: ${venue}\n`;
  if (body) body += '\n';
  body += `${details}\n\n`;
  body += `Stay connected with your SRC for more updates.`;

  return { headline, body };
}

function generateAgenda(input: GenerationInput): DocumentOutput {
  const meetingDate = input.meeting_date || '';
  const startTime = input.start_time || '';
  const topics = (input.topics || '').split('\n').filter((l) => l.trim());
  const attendees = input.attendees || '';

  const title = `SRC Meeting Agenda — ${meetingDate}`;

  const sections: { heading: string; items: string[] }[] = [];

  const infoItems: string[] = [];
  if (meetingDate) infoItems.push(`Date: ${meetingDate}`);
  if (startTime) infoItems.push(`Start Time: ${startTime}`);
  if (attendees) infoItems.push(`Expected Attendees: ${attendees}`);
  if (infoItems.length) sections.push({ heading: 'Meeting Details', items: infoItems });

  const agendaItems = topics.map((t, i) => `${i + 1}. ${t.trim()}`);
  if (agendaItems.length) sections.push({ heading: 'Agenda Items', items: agendaItems });

  sections.push({ heading: 'Closing', items: ['Open floor for additional items', 'Confirm next meeting date'] });

  return { title, sections };
}

function generateMinutes(input: GenerationInput): DocumentOutput {
  const meetingDate = input.meeting_date || '';
  const attendees = (input.attendees || '').split(',').map((a) => a.trim()).filter(Boolean);
  const topics = (input.topics || '').split('\n').filter((l) => l.trim());
  const decisions = (input.decisions || '').split('\n').filter((l) => l.trim());

  const title = `SRC Meeting Minutes — ${meetingDate}`;

  const sections: { heading: string; items: string[] }[] = [];

  sections.push({ heading: 'Attendees', items: attendees.length ? attendees : ['To be confirmed'] });
  sections.push({ heading: 'Apologies', items: ['None recorded'] });

  if (topics.length) {
    sections.push({
      heading: 'Discussion',
      items: topics.map((t, i) => `${i + 1}. ${t.trim()} — Discussed and noted.`),
    });
  }

  if (decisions.length) {
    sections.push({
      heading: 'Decisions',
      items: decisions.map((d, i) => `${i + 1}. ${d.trim()}`),
    });
  } else {
    sections.push({ heading: 'Decisions', items: ['No formal decisions recorded.'] });
  }

  sections.push({
    heading: 'Action Items',
    items: ['Follow up on decisions made', 'Distribute minutes to all members', 'Confirm next meeting date'],
  });

  return { title, sections };
}

function generateBudget(input: GenerationInput, contentType: ContentType): DocumentOutput {
  const purpose = input.purpose || input.period || '';
  const lineItemsRaw = (input.line_items || '').split('\n').filter((l) => l.trim());
  const notes = input.notes || '';

  const isBudget = contentType === 'budget_draft';
  const title = isBudget ? `Budget Draft — ${purpose}` : `Bookkeeping Summary — ${purpose}`;

  const sections: { heading: string; items: string[] }[] = [];

  const lineItems: { desc: string; amount: number }[] = [];
  let total = 0;

  lineItemsRaw.forEach((line) => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const desc = parts[0].trim();
      const amountStr = parts.slice(1).join(':').trim().replace(/[^0-9.\-]/g, '');
      const amount = parseFloat(amountStr) || 0;
      lineItems.push({ desc, amount });
      total += amount;
    } else {
      lineItems.push({ desc: line.trim(), amount: 0 });
    }
  });

  const itemRows = lineItems.map((li) => {
    const sign = li.amount < 0 ? '-' : '';
    return `${li.desc}: ${sign}R${Math.abs(li.amount).toFixed(2)}`;
  });

  if (itemRows.length) sections.push({ heading: isBudget ? 'Proposed Expenditure' : 'Transactions', items: itemRows });

  const totalLabel = isBudget ? 'Total Budgeted' : 'Net Position';
  sections.push({ heading: 'Summary', items: [`${totalLabel}: R${total.toFixed(2)}`] });

  if (notes) sections.push({ heading: 'Notes', items: [notes] });

  return { title, sections };
}

function generatePoster(role: RoleId, contentType: ContentType, input: GenerationInput): PosterOutput {
  const eventName = input.event_name || input.initiative || '';
  const dateLocation = input.date_location || '';
  const keyInfo = input.key_info || '';

  const isSocial = role === 'social_culture';
  const isCommunity = role === 'community_engagement';

  let headline: string;
  let subtext: string;
  let cta: string;

  if (isSocial) {
    headline = cap(cap(eventName, 7), 7);
    subtext = keyInfo.split('\n')[0]?.trim() || 'The event everyone will be talking about';
    cta = 'Be There or Miss Out!';
  } else if (isCommunity) {
    headline = cap(cap(eventName, 8), 8);
    subtext = keyInfo.split('\n')[0]?.trim() || 'Make a difference on campus';
    cta = 'Join Us & Bring a Friend';
  } else {
    headline = cap(cap(eventName, 8), 8);
    subtext = keyInfo.split('\n')[0]?.trim() || 'Your SRC invites you';
    cta = 'All Students Welcome';
  }

  const details = dateLocation;

  let hashtags: string[];
  if (isSocial) {
    hashtags = ['#SRC', '#CampusLife', '#StudentVibes', '#DontMissOut', '#CampusCulture'];
  } else if (isCommunity) {
    hashtags = ['#SRC', '#CommunityFirst', '#GetInvolved', '#CampusCare', '#StudentLed'];
  } else {
    hashtags = ['#SRC', '#CampusLife', '#StudentVoice', '#CollegeEvents', '#OurCampus'];
  }

  return { headline, subtext, details, cta, hashtags };
}

function generateWriteup(input: GenerationInput): DocumentOutput {
  const eventName = input.event_name || '';
  const date = input.date || '';
  const highlights = (input.highlights || '').split('\n').filter((l) => l.trim());

  const title = `Event Write-Up: ${eventName}`;

  const sections: { heading: string; items: string[] }[] = [];

  const intro: string[] = [];
  if (eventName && date) intro.push(`On ${date}, the Student Representative Council hosted ${eventName}.`);
  if (intro.length) sections.push({ heading: 'Overview', items: intro });

  if (highlights.length) {
    sections.push({
      heading: 'Highlights',
      items: highlights.map((h) => h.trim()),
    });
  }

  sections.push({
    heading: 'Summary',
    items: ['The event was a great success, thanks to the participation and support of the student body. The SRC looks forward to hosting more engaging events in the future.'],
  });

  return { title, sections };
}

function generateSocial(input: GenerationInput): SocialOutput {
  const eventName = input.event_name || '';
  const date = input.date || '';
  const highlights = (input.highlights || '').split('\n').filter((l) => l.trim()).join('. ');
  const platform = input.platform || 'Instagram';

  const hashtagPool = ['#SRC', '#CampusLife', '#StudentVoice', '#CollegeEvents', '#OurCampus'];

  const result: { platform: string; caption: string; hashtags: string[] }[] = [];

  const p = platform.toLowerCase().trim();
  let caption = '';

  if (p.includes('instagram')) {
    caption = `${eventName} is happening${date ? ` on ${date}` : ''}! ${highlights} Join us and be part of the experience. Save the date!`;
    result.push({ platform: 'Instagram', caption, hashtags: hashtagPool.slice(0, 5) });
  } else if (p.includes('whatsapp')) {
    caption = `*${eventName}*${date ? ` — ${date}` : ''}\n${highlights}\nSee you there!`;
    result.push({ platform: 'WhatsApp', caption, hashtags: hashtagPool.slice(0, 3) });
  } else if (p.includes('email')) {
    caption = `Dear Students,\n\nYou're invited to ${eventName}${date ? ` on ${date}` : ''}. ${highlights}\n\nWe look forward to seeing you there.\n\nKind regards,\nStudent Representative Council`;
    result.push({ platform: 'Email', caption, hashtags: hashtagPool.slice(0, 3) });
  } else if (p.includes('poster')) {
    caption = `${eventName}${date ? ` — ${date}` : ''}. ${highlights}`;
    result.push({ platform: 'Poster', caption, hashtags: hashtagPool.slice(0, 3) });
  } else {
    caption = `${eventName}${date ? ` — ${date}` : ''}. ${highlights}`;
    result.push({ platform: 'General', caption, hashtags: hashtagPool.slice(0, 3) });
  }

  return { platforms: result };
}

// ─── Event Idea Generator ────────────────────────────────────────────

const COMMUNITY_IDEAS: Omit<EventIdea, 'whyItFits'>[] = [
  {
    name: 'Campus Clean-Up Drive',
    concept: 'Students team up to clean and green a designated campus zone.',
    format: 'Meet at a central point, split into teams with gloves and bags, clean for 90 minutes, end with a group photo and refreshments.',
    effort: 'Low',
  },
  {
    name: 'Book & Stationery Donation Drive',
    concept: 'Collect unwanted textbooks and supplies for under-resourced students.',
    format: 'Set up collection points at the SRC office and library over a week. Sort and distribute at the end.',
    effort: 'Low',
  },
  {
    name: 'Community Tutoring Day',
    concept: 'SRC members offer free tutoring sessions for first-year students.',
    format: 'Book 3-4 classrooms, assign tutors by subject, run 2-hour drop-in sessions, promote through faculty reps.',
    effort: 'Medium',
  },
  {
    name: 'Winter Warmth Collection',
    concept: 'Collect blankets, scarves, and jackets for a local shelter.',
    format: 'Two-week collection campaign with drop-off bins in residence halls. Partner with a local NGO for distribution.',
    effort: 'Medium',
  },
  {
    name: 'Campus Awareness Walk',
    concept: 'A peaceful walk across campus to raise awareness for a social cause.',
    format: 'Plan a route, create placards, invite speakers to open and close, walk for 45 minutes, end with a short address.',
    effort: 'Medium',
  },
  {
    name: 'Skills Exchange Workshop',
    concept: 'Students teach students practical skills like budgeting, CV writing, or coding.',
    format: 'Find 3-4 student volunteers to lead 30-minute sessions. Book a venue, set up stations, rotate groups.',
    effort: 'High',
  },
];

const SOCIAL_IDEAS: Omit<EventIdea, 'whyItFits'>[] = [
  {
    name: 'Campus Colour Run',
    concept: 'A 2km fun run where runners get doused in coloured powder at stations.',
    format: 'Mark a route on campus, set up 3 colour stations with volunteers, start and finish at the quad with music.',
    effort: 'Medium',
  },
  {
    name: 'Silent Disco Night',
    concept: 'Students dance to music streamed wirelessly to their headphones.',
    format: 'Hire headphone sets, book the hall, set up 3 DJ channels, run for 2 hours with a countdown to channel switches.',
    effort: 'High',
  },
  {
    name: 'Outdoor Movie Under the Stars',
    concept: 'A big-screen movie night on the campus lawn with blankets and snacks.',
    format: 'Rent a projector and screen, pick a crowd-favourite film, set up a snack bar, start at sunset.',
    effort: 'Low',
  },
  {
    name: 'Cultural Food Festival',
    concept: 'Students bring dishes from their cultures for a campus-wide tasting.',
    format: 'Book the quad, set up food stalls by cultural group, sell tasting tickets, add music and performances.',
    effort: 'High',
  },
  {
    name: 'SRC Game Night',
    concept: 'Board games, console tournaments, and casual socialising in the student centre.',
    format: 'Bring board games and a console, set up stations, run a mini-tournament with small prizes, free entry.',
    effort: 'Low',
  },
  {
    name: 'Karaoke & Milkshake Night',
    concept: 'Sing your heart out with cheap milkshakes and good vibes.',
    format: 'Book a small venue, set up a karaoke system, sell milkshakes at cost, run for 2 hours with sign-up slots.',
    effort: 'Low',
  },
];

function generateEventIdeas(role: RoleId, input: GenerationInput): EventIdeasOutput {
  const isSocial = role === 'social_culture';
  const pool = isSocial ? SOCIAL_IDEAS : COMMUNITY_IDEAS;

  const goal = input.goal || '';
  const vibe = input.vibe || '';
  const audienceSize = input.audience_size || '';
  const budget = input.budget || '';
  const timeframe = input.timeframe || '';

  const ideas: EventIdea[] = pool.map((idea) => {
    const whyParts: string[] = [];
    if (goal) whyParts.push(`fits a ${goal.toLowerCase()} goal`);
    if (vibe) whyParts.push(`matches a ${vibe} vibe`);
    if (audienceSize) whyParts.push(`works for a ${audienceSize.toLowerCase()} audience`);
    if (budget && budget !== 'Low') whyParts.push(`feasible on a ${budget.toLowerCase()} budget`);
    if (timeframe) whyParts.push(`can be pulled together ${timeframe.toLowerCase()}`);

    const whyItFits = whyParts.length > 0
      ? `This ${whyParts.join(', ')}.`
      : `A practical, engaging option for your portfolio.`;

    return { ...idea, whyItFits };
  });

  return { ideas };
}

export function generateContent(
  role: RoleId,
  contentType: ContentType,
  input: GenerationInput,
  tone: 'formal' | 'casual'
):
  | { type: 'email'; data: EmailOutput }
  | { type: 'announcement'; data: AnnouncementOutput }
  | { type: 'document'; data: DocumentOutput }
  | { type: 'poster'; data: PosterOutput }
  | { type: 'social'; data: SocialOutput }
  | { type: 'ideas'; data: EventIdeasOutput }
  | { type: 'redirect'; data: string } {
  if (isOutOfScope(input)) {
    return { type: 'redirect', data: OUT_OF_SCOPE_MSG };
  }

  const ct = contentType;

  if (ct === 'formal_email' || ct === 'email') {
    return { type: 'email', data: generateEmail(role, ct, input, tone) };
  }
  if (ct === 'event_announcement' || ct === 'general_announcement') {
    return { type: 'announcement', data: generateAnnouncement(input) };
  }
  if (ct === 'meeting_agenda') {
    return { type: 'document', data: generateAgenda(input) };
  }
  if (ct === 'meeting_minutes') {
    return { type: 'document', data: generateMinutes(input) };
  }
  if (ct === 'budget_draft' || ct === 'bookkeeping_summary') {
    return { type: 'document', data: generateBudget(input, ct) };
  }
  if (ct === 'promo_poster') {
    return { type: 'poster', data: generatePoster(role, ct, input) };
  }
  if (ct === 'event_ideas') {
    return { type: 'ideas', data: generateEventIdeas(role, input) };
  }
  if (ct === 'event_writeup') {
    return { type: 'document', data: generateWriteup(input) };
  }
  if (ct === 'social_caption') {
    return { type: 'social', data: generateSocial(input) };
  }

  return { type: 'redirect', data: OUT_OF_SCOPE_MSG };
}
