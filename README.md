# SRC Content Studio

A role-based AI content generator built for university and college Student Representative Council (SRC) members. It cuts down the repetitive work of writing emails, drafting posters, planning events, and posting to social media — by generating content shaped specifically to the SRC role you hold.

Built as an individual project for the CAPACITI 1-Month AI Bootcamp (Week 2 — Content Generation & AI Productivity).

## The Problem

SRC members spend a huge amount of time on communication work that's necessary but repetitive: formal emails, meeting minutes, event posters, promotional captions, budget summaries. Most of it follows a predictable structure, but still has to be written from scratch every time — and the tone, format, and priorities differ hugely depending on which portfolio you're in.

## The Idea

Instead of one generic "write me something" AI tool, SRC Content Studio asks you to pick your position on the council first. From there, everything — the content types available, the tone of the AI, the form fields you fill in — is shaped around what that specific role actually needs.

## Features

- **Role-based dashboard** — 7 SRC positions (President, Deputy President, Secretary, Treasury, Community Engagement, Social & Culture, Internal Communications), each with its own content types and AI persona/tone
- **Formal email generation** with one-click compose straight into Gmail or Outlook
- **Meeting agendas & minutes** with structured, consistent formatting
- **Budget drafts & bookkeeping summaries**
- **Designed poster generation** — AI-written copy (headline, subtext, call to action) automatically dropped into professionally laid-out templates, not plain text on a background
- **Event idea generator** — give a vibe, goal, audience size, budget, and timeframe, and get back several distinct event concepts to choose from, rather than formatting one you've already decided on
- **Social media captions** tailored per platform (Instagram, WhatsApp, Email), with a proper dropdown for platform selection
- **Export options** — download write-ups/agendas/minutes as Word documents, posters as PNG/PDF
- **Platform share shortcuts** — direct share links where platforms support it (WhatsApp, X/Twitter); copy-and-open fallback where they don't (Instagram, Facebook)
- **Scope guardrail** — the AI only generates SRC/campus-related content; off-topic requests are politely redirected rather than answered
- **Calendar view** of upcoming events and their related generated content
- **Responsible AI disclaimer** on every page, reminding members that outputs are drafts to be reviewed, not final copy

## Roles & What They Generate

| Role | Content Types |
|---|---|
| President | Formal emails |
| Deputy President | Emails, event announcements, general announcements |
| Secretary | Formal emails, meeting agendas, meeting minutes |
| Treasury | Budget drafts, bookkeeping summaries |
| Community Engagement | Promotional posters/messages (logistics/outreach tone), event idea generator |
| Social & Culture | Promotional posters/messages (playful/fun tone), event idea generator |
| Internal Communications | Promotional posters/messages, event write-ups, social media captions |

Community Engagement and Social & Culture share overlapping content types but use deliberately different prompt tones — one practical and impact-focused, the other energetic and campus-fun.

## Prompt Engineering Approach

Every role has its own system prompt (persona, tone constraints, and output structure), built around a shared scope guardrail so no role can be used to generate off-topic content. Fields like emails and posters return labeled, structured output (`SUBJECT:`/`BODY:`, `HEADLINE:`/`SUBTEXT:`/`CTA:`) rather than free text, so the app can reliably parse and route content into exports, email clients, and poster templates.

The prompt library went through several rounds of iteration based on real testing:
1. Free-text generation per content type
2. Structured, labeled output to support exports and integrations
3. Refinement after testing showed plain poster output and a rigid (non-ideation) event planning flow — reworked into layered poster templates and a genuine event idea generator

## Tech Stack

- Frontend/backend prototyped and built with [Base44](https://base44.com) (AI app builder)
- Supabase for auth, database, and generation edge functions
- Client-side libraries for Word (`docx`) and poster (PNG/PDF via canvas/`html-to-image`) export

## Project Status

Active prototype — built iteratively through AI-assisted development, with the prompt library and feature set refined based on real output testing.

