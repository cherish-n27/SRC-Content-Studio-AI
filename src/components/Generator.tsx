import { useState, useRef, useEffect } from 'react';
import { getRole, getContentType } from '@/lib/roles';
import { generateContent } from '@/lib/generator';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PosterPreview, POSTER_TEMPLATES, type PosterTemplateId } from '@/components/PosterPreview';
import type { RoleId, ContentType, GenerationInput, Generation } from '@/types';
import type { EmailOutput, AnnouncementOutput, DocumentOutput, PosterOutput, SocialOutput, EventIdeasOutput, EventIdea } from '@/types';
import {
  ArrowLeft, Sparkles, Loader2, Download, FileText, Mail, Share2, Copy,
  MessageCircle, Twitter, Instagram, Facebook, Image as ImageIcon,
  Package, Check, Lightbulb, ArrowRight, ExternalLink,
} from 'lucide-react';
import { AIDisclaimer } from '@/components/AIDisclaimer';
import {
  downloadWord, downloadPNG, downloadPDF, downloadZip,
  buildMailto, buildGmailLink, buildOutlookLink, buildWhatsAppLink, buildTwitterLink,
  copyToClipboard,
} from '@/lib/export';
import { toPng } from 'html-to-image';

interface Props {
  roleId: RoleId;
  contentType: ContentType;
  onBack: () => void;
  existingGeneration?: Generation | null;
  onDevelopIdea?: (roleId: RoleId, idea: EventIdea) => void;
  prefill?: { event_name?: string; key_info?: string } | null;
}

type GenResult =
  | { type: 'email'; data: EmailOutput }
  | { type: 'announcement'; data: AnnouncementOutput }
  | { type: 'document'; data: DocumentOutput }
  | { type: 'poster'; data: PosterOutput }
  | { type: 'social'; data: SocialOutput }
  | { type: 'ideas'; data: EventIdeasOutput }
  | { type: 'redirect'; data: string };

export function Generator({ roleId, contentType, onBack, existingGeneration, onDevelopIdea, prefill }: Props) {
  const role = getRole(roleId)!;
  const ct = getContentType(contentType)!;
  const { profile } = useAuth();
  const brandColor = profile?.brand_color || role.accent;

  const [input, setInput] = useState<GenerationInput>({});
  const [tone, setTone] = useState<'formal' | 'casual'>('formal');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);

  // Poster state
  const [selectedTemplate, setSelectedTemplate] = useState<PosterTemplateId>('bold_block');
  const [posterData, setPosterData] = useState<PosterOutput | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // Social state
  const [editedHashtags, setEditedHashtags] = useState<Record<number, string[]>>({});

  useEffect(() => {
    if (prefill) {
      setInput({
        event_name: prefill.event_name || '',
        key_info: prefill.key_info || '',
      });
    }
  }, [prefill]);

  useEffect(() => {
    if (existingGeneration) {
      setInput(existingGeneration.input_data || {});
      const out = existingGeneration.output_data as PosterOutput | EmailOutput | DocumentOutput | AnnouncementOutput | SocialOutput | EventIdeasOutput;
      if (ct.isPoster) {
        setPosterData(out as PosterOutput);
        setResult({ type: 'poster', data: out as PosterOutput });
      } else if (ct.isIdeas) {
        setResult({ type: 'ideas', data: out as EventIdeasOutput });
      } else if (ct.isEmail) {
        setResult({ type: 'email', data: out as EmailOutput });
      } else if (ct.outputFormat === 'announcement') {
        setResult({ type: 'announcement', data: out as AnnouncementOutput });
      } else if (ct.isSocial) {
        setResult({ type: 'social', data: out as SocialOutput });
      } else {
        setResult({ type: 'document', data: out as DocumentOutput });
      }
    }
  }, [existingGeneration]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 600));

    const gen = generateContent(roleId, contentType, input, tone);
    setResult(gen);

    if (gen.type === 'poster') {
      setPosterData(gen.data);
    }

    // Save to database
    await supabase
      .from('generations')
      .insert({
        role: roleId,
        content_type: contentType,
        input_data: input,
        output_data: gen.type === 'redirect' ? { redirect: gen.data } : gen.data,
      })
      .select('*')
      .single();

    setGenerating(false);
  };

  const handleRegenerateWithTone = async (newTone: 'formal' | 'casual') => {
    setTone(newTone);
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 400));
    const gen = generateContent(roleId, contentType, input, newTone);
    setResult(gen);
    if (gen.type === 'poster') setPosterData(gen.data);
    setGenerating(false);
  };

  const handleDownloadWord = () => {
    if (!result || result.type === 'redirect' || result.type === 'poster' || result.type === 'social' || result.type === 'ideas') return;
    const title = ct.label;
    const filename = `${ct.label.replace(/\s+/g, '_').toLowerCase()}`;
    downloadWord(title, result.data, filename);
  };

  const handleDownloadPNG = async () => {
    if (!posterRef.current) return;
    await downloadPNG(posterRef.current, 'src_poster');
  };

  const handleDownloadPDF = async () => {
    if (!posterRef.current) return;
    await downloadPDF(posterRef.current, 'src_poster');
  };

  const handleExportKit = async () => {
    if (!posterRef.current || !posterData) return;
    const posterDataUrl = await toPng(posterRef.current, { pixelRatio: 2, backgroundColor: '#fff' });
    const files = [{ name: 'poster.png', dataUrl: posterDataUrl }];
    await downloadZip(files, 'src_export_kit');
  };

  const handleCopyCaption = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDevelopIdea = (idea: EventIdea) => {
    if (onDevelopIdea) {
      onDevelopIdea(roleId, idea);
    }
  };

  const allFieldsFilled = ct.fields.every((f) => !f.required || (input[f.key] && input[f.key].trim()));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}15` }}
          >
            <Sparkles className="w-5 h-5" style={{ color: brandColor }} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900">{ct.label}</h1>
            <p className="text-xs text-slate-500">{role.label}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Fill in the details
            </h2>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              {ct.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={input[field.key] || ''}
                      onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 text-sm resize-none"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={input[field.key] || ''}
                      onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 text-sm"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={input[field.key] || ''}
                      onChange={(e) => setInput({ ...input, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-slate-900 text-sm"
                    />
                  )}
                </div>
              ))}

              {/* Tone slider */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => handleRegenerateWithTone('formal')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tone === 'formal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    More Formal
                  </button>
                  <button
                    onClick={() => handleRegenerateWithTone('casual')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                      tone === 'casual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    More Casual
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!allFieldsFilled || generating}
                className="w-full py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                style={{ backgroundColor: brandColor, boxShadow: `0 10px 30px -10px ${brandColor}60` }}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Output
            </h2>

            {!result && !generating && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <Sparkles className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">
                  Fill in the form and click Generate to see your content here.
                </p>
              </div>
            )}

            {generating && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: brandColor }} />
                <p className="text-sm text-slate-400">Crafting your content...</p>
              </div>
            )}

            {result?.type === 'redirect' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <p className="text-sm text-amber-800 font-medium">{result.data}</p>
              </div>
            )}

            {result && result.type === 'email' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Subject</div>
                  <div className="text-sm font-semibold text-slate-900">{result.data.subject}</div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Body</div>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{result.data.body}</pre>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Open in email client</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={buildGmailLink(result.data.subject, result.data.body)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
                      <Mail className="w-4 h-4" /> Gmail
                    </a>
                    <a href={buildOutlookLink(result.data.subject, result.data.body)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors">
                      <Mail className="w-4 h-4" /> Outlook
                    </a>
                    <a href={buildMailto('', result.data.subject, result.data.body)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      <Mail className="w-4 h-4" /> Mail app
                    </a>
                  </div>
                </div>
                <ExportButtons onWord={handleDownloadWord} />
              </div>
            )}

            {result && result.type === 'announcement' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Headline</div>
                  <div className="text-lg font-bold text-slate-900">{result.data.headline}</div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Body</div>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{result.data.body}</pre>
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Share</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={buildWhatsAppLink(`${result.data.headline}\n\n${result.data.body}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-semibold hover:bg-green-100 transition-colors">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a href={buildTwitterLink(`${result.data.headline}\n\n${result.data.body}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-600 text-sm font-semibold hover:bg-sky-100 transition-colors">
                      <Twitter className="w-4 h-4" /> X/Twitter
                    </a>
                    <button onClick={() => handleCopyCaption(`${result.data.headline}\n\n${result.data.body}`)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <ExportButtons onWord={handleDownloadWord} />
              </div>
            )}

            {result && result.type === 'document' && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">{result.data.title}</h3>
                {result.data.sections.map((section, i) => (
                  <div key={i} className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: brandColor }}>
                      {section.heading}
                    </div>
                    <ul className="space-y-1">
                      {section.items.map((item, j) => (
                        <li key={j} className="text-sm text-slate-700 leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <ExportButtons onWord={handleDownloadWord} />
              </div>
            )}

            {result && result.type === 'poster' && posterData && (
              <div className="space-y-4">
                {/* Template selector */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-3">Choose a template</div>
                  <div className="grid grid-cols-3 gap-2">
                    {POSTER_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedTemplate === tpl.id
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo upload for photo_feature */}
                {selectedTemplate === 'photo_feature' && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <ImageIcon className="w-4 h-4" />
                      Upload background photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {bgImage && (
                      <button onClick={() => setBgImage(null)} className="ml-3 text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                )}

                {/* Poster preview */}
                <div className="flex justify-center">
                  <PosterPreview
                    ref={posterRef}
                    templateId={selectedTemplate}
                    data={posterData}
                    accentColor={brandColor}
                    rsvpUrl={input.rsvp_url}
                    backgroundImage={bgImage}
                    editable
                    onChange={setPosterData}
                  />
                </div>

                {/* Export buttons */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Download</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleDownloadPNG} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      <Download className="w-4 h-4" /> PNG
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button onClick={handleExportKit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: `${brandColor}15`, color: brandColor }}>
                      <Package className="w-4 h-4" /> Export Kit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={buildWhatsAppLink(`${posterData.headline}\n${posterData.subtext}\n${posterData.details}\n${posterData.cta}\n${posterData.hashtags.join(' ')}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-semibold hover:bg-green-100 transition-colors">
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                    <a href={buildTwitterLink(`${posterData.headline} ${posterData.hashtags.join(' ')}`)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 text-sky-600 text-sm font-semibold hover:bg-sky-100 transition-colors">
                      <Twitter className="w-4 h-4" /> X/Twitter
                    </a>
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Edit further</div>
                    <a
                      href="https://www.canva.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" /> Open in Canva
                    </a>
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Download the poster as PNG above, then upload it to Canva to edit further with their full design tools.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result && result.type === 'ideas' && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" style={{ color: brandColor }} />
                  <p className="text-sm text-slate-600">
                    {result.data.ideas.length} event ideas based on your inputs. Pick one to develop into a poster or promo.
                  </p>
                </div>
                {result.data.ideas.map((idea, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-900">{idea.name}</h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            idea.effort === 'Low' ? '#dcfce7'
                            : idea.effort === 'Medium' ? '#fef9c3'
                            : '#fee2e2',
                          color:
                            idea.effort === 'Low' ? '#16a34a'
                            : idea.effort === 'Medium' ? '#ca8a04'
                            : '#dc2626',
                        }}
                      >
                        {idea.effort} effort
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{idea.concept}</p>
                    <p className="text-xs text-slate-500 italic">{idea.whyItFits}</p>
                    <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                      <span className="font-semibold text-slate-700">How it works: </span>
                      {idea.format}
                    </div>
                    <button
                      onClick={() => handleDevelopIdea(idea)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                    >
                      Develop this idea
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {result && result.type === 'social' && (
              <div className="space-y-4">
                {result.data.platforms.map((p, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {p.platform === 'Instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                        {p.platform === 'WhatsApp' && <MessageCircle className="w-4 h-4 text-green-500" />}
                        {p.platform === 'Email' && <Mail className="w-4 h-4 text-blue-500" />}
                        {p.platform === 'X/Twitter' && <Twitter className="w-4 h-4 text-sky-500" />}
                        {p.platform === 'Facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                        {p.platform === 'Poster' && <ImageIcon className="w-4 h-4 text-slate-500" />}
                        {p.platform === 'General' && <Share2 className="w-4 h-4 text-slate-500" />}
                        <span className="font-semibold text-slate-900 text-sm">{p.platform}</span>
                      </div>
                    </div>
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{p.caption}</pre>

                    {/* Hashtag editor */}
                    <div className="flex flex-wrap gap-1.5">
                      {(editedHashtags[idx] ?? p.hashtags).map((tag, hi) => (
                        <span
                          key={hi}
                          contentEditable
                          suppressContentEditableWarning
                          className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 cursor-text"
                          style={{ outline: 'none' }}
                          onBlur={(e) => {
                            const tags = [...(editedHashtags[idx] ?? p.hashtags)];
                            tags[hi] = e.currentTarget.textContent || tag;
                            setEditedHashtags({ ...editedHashtags, [idx]: tags });
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Share buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.platform === 'WhatsApp' && (
                        <a href={buildWhatsAppLink(p.caption)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> Open WhatsApp
                        </a>
                      )}
                      {(p.platform === 'X/Twitter' || p.platform === 'Twitter') && (
                        <a href={buildTwitterLink(p.caption)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-semibold hover:bg-sky-100 transition-colors">
                          <Twitter className="w-3.5 h-3.5" /> Post on X
                        </a>
                      )}
                      {p.platform === 'Instagram' && (
                        <>
                          <button onClick={() => handleCopyCaption(`${p.caption}\n${(editedHashtags[idx] ?? p.hashtags).join(' ')}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-pink-600 text-xs font-semibold hover:bg-pink-100 transition-colors">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy caption'}
                          </button>
                          <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors">
                            <Instagram className="w-3.5 h-3.5" /> Open Instagram
                          </a>
                          <p className="text-[10px] text-slate-400 w-full">Instagram doesn't allow auto-filled captions — we've copied it, just paste it in!</p>
                        </>
                      )}
                      {p.platform === 'Facebook' && (
                        <>
                          <button onClick={() => handleCopyCaption(`${p.caption}\n${(editedHashtags[idx] ?? p.hashtags).join(' ')}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy caption'}
                          </button>
                          <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors">
                            <Facebook className="w-3.5 h-3.5" /> Open Facebook
                          </a>
                          <p className="text-[10px] text-slate-400 w-full">Facebook doesn't allow auto-filled post text — we've copied it, just paste it in!</p>
                        </>
                      )}
                      {p.platform === 'Email' && (
                        <a href={buildMailto('', 'SRC Update', p.caption)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors">
                          <Mail className="w-3.5 h-3.5" /> Open Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                <ExportButtons onWord={handleDownloadWord} />
              </div>
            )}
          </div>
        </div>
      </div>
      <AIDisclaimer />
    </div>
  );
}

function ExportButtons({ onWord }: { onWord?: () => void }) {
  if (!onWord) return null;
  return (
    <div className="border-t border-slate-100 pt-4">
      <button onClick={onWord} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
        <FileText className="w-4 h-4" /> Download as Word
      </button>
    </div>
  );
}
