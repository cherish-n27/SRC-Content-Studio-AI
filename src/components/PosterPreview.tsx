import { forwardRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { PosterOutput } from '@/types';

export type PosterTemplateId = 'bold_block' | 'photo_feature' | 'layered_cutout' | 'minimal_editorial' | 'countdown_card';

export interface PosterTemplateDef {
  id: PosterTemplateId;
  name: string;
  description: string;
  supportsPhoto?: boolean;
}

export const POSTER_TEMPLATES: PosterTemplateDef[] = [
  { id: 'bold_block', name: 'Bold Block', description: 'Full-bleed color, oversized headline, floating card' },
  { id: 'photo_feature', name: 'Photo Feature', description: 'Background photo with gradient overlay', supportsPhoto: true },
  { id: 'layered_cutout', name: 'Layered Cutout', description: 'Diagonal split, decorative shapes, QR code' },
  { id: 'minimal_editorial', name: 'Minimal Editorial', description: 'Whitespace, oversized focal element, thin rules' },
  { id: 'countdown_card', name: 'Countdown Card', description: 'Dark background, date as hero, dot-grid texture' },
];

interface Props {
  templateId: PosterTemplateId;
  data: PosterOutput;
  accentColor: string;
  rsvpUrl?: string;
  backgroundImage?: string | null;
  editable?: boolean;
  onChange?: (data: PosterOutput) => void;
}

export const PosterPreview = forwardRef<HTMLDivElement, Props>(function PosterPreview(
  { templateId, data, accentColor, rsvpUrl, backgroundImage, editable, onChange },
  ref
) {
  const [localData, setLocalData] = useState(data);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  useEffect(() => {
    if (rsvpUrl) {
      QRCode.toDataURL(rsvpUrl, { width: 120, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
  }, [rsvpUrl]);

  const update = (key: keyof PosterOutput, value: string) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onChange?.(updated);
  };

  const editableProps = (key: keyof PosterOutput) =>
    editable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
            update(key, e.currentTarget.textContent || '');
          },
          style: { cursor: 'text', outline: 'none' },
          title: 'Click to edit',
        }
      : {};

  const QrBlock = ({ size = 'w-16 h-16', label = true }: { size?: string; label?: boolean }) => {
    if (!qrDataUrl) return null;
    return (
      <div className="flex flex-col items-center gap-0.5">
        <img src={qrDataUrl} alt="QR Code" className={`${size} rounded-lg`} />
        {label && <span className="text-[7px] font-semibold text-slate-500 uppercase tracking-wide">Scan to RSVP</span>}
      </div>
    );
  };

  const HashtagRow = ({ color, bg }: { color?: string; bg?: string }) => {
    if (!localData.hashtags || localData.hashtags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1">
        {localData.hashtags.map((tag, i) => (
          <span
            key={i}
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: bg || `${accentColor}20`,
              color: color || accentColor,
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  const W = 'w-[400px]';
  const H = 'h-[566px]';

  // ─── Template A: Bold Block ──────────────────────────────────────
  if (templateId === 'bold_block') {
    return (
      <div
        ref={ref}
        className={`${W} ${H} rounded-2xl overflow-hidden relative flex flex-col shadow-2xl`}
        style={{ backgroundColor: accentColor }}
      >
        {/* Decorative blobs behind headline */}
        <div
          className="absolute rounded-full opacity-20"
          style={{ width: 180, height: 180, top: -40, right: -30, backgroundColor: 'white' }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{ width: 120, height: 120, top: 80, left: 200, backgroundColor: 'white' }}
        />
        <div
          className="absolute rounded-full opacity-15"
          style={{ width: 90, height: 90, top: 160, right: 60, backgroundColor: 'white' }}
        />

        {/* Top section: headline overflowing left */}
        <div className="relative z-10 pt-8 px-7 flex-1 flex flex-col">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-3">
            SRC Presents
          </div>
          <h1
            className="text-[2.7rem] font-black leading-[1.05] text-white"
            style={{ fontFamily: 'system-ui, sans-serif', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            {...editableProps('headline')}
          >
            {localData.headline}
          </h1>
          <p
            className="text-sm text-white/80 mt-3 leading-relaxed max-w-[90%]"
            {...editableProps('subtext')}
          >
            {localData.subtext}
          </p>
        </div>

        {/* Floating white card in lower third */}
        <div
          className="relative z-10 mx-5 mb-3 bg-white rounded-2xl p-4 shadow-xl"
          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
        >
          <div
            className="font-mono text-xs text-slate-700 leading-relaxed"
            {...editableProps('details')}
          >
            {localData.details}
          </div>
          <div className="flex items-center justify-between mt-3">
            <HashtagRow />
            {qrDataUrl && <QrBlock size="w-12 h-12" label={false} />}
          </div>
        </div>

        {/* Footer ribbon */}
        <div className="relative z-10 bg-black/25 px-5 py-2.5 flex items-center justify-between">
          <span
            className="text-sm font-bold text-white"
            {...editableProps('cta')}
          >
            {localData.cta}
          </span>
          <span className="text-[8px] font-semibold text-white/50 uppercase tracking-wider">
            Hosted by SRC
          </span>
        </div>
      </div>
    );
  }

  // ─── Template B: Photo Feature ────────────────────────────────────
  if (templateId === 'photo_feature') {
    return (
      <div
        ref={ref}
        className={`${W} ${H} rounded-2xl overflow-hidden relative flex flex-col shadow-2xl`}
      >
        {/* Full-bleed photo or gradient fallback */}
        {backgroundImage ? (
          <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}
          />
        )}

        {/* Dark gradient overlay from bottom third upward */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)',
          }}
        />

        {/* Category pill top-left */}
        <div className="absolute top-5 left-5 z-10">
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white"
            style={{ backgroundColor: accentColor }}
          >
            SRC Event
          </span>
        </div>

        {/* Bottom-left headline */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
          <h1
            className="text-[2.2rem] font-black leading-[1.1] text-white mb-2"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            {...editableProps('headline')}
          >
            {localData.headline}
          </h1>
          <p
            className="text-sm text-white/85 mb-3 leading-relaxed"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
            {...editableProps('subtext')}
          >
            {localData.subtext}
          </p>
          <div
            className="font-mono text-xs text-white/90 mb-3"
            {...editableProps('details')}
          >
            {localData.details}
          </div>
          <div className="flex items-center justify-between">
            <HashtagRow color="#fff" bg="rgba(255,255,255,0.2)" />
            <div className="flex items-center gap-2">
              {qrDataUrl && <QrBlock size="w-12 h-12" label={false} />}
              <span
                className="text-xs font-bold px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: accentColor, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                {...editableProps('cta')}
              >
                {localData.cta}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Template C: Layered Cutout ───────────────────────────────────
  if (templateId === 'layered_cutout') {
    return (
      <div
        ref={ref}
        className={`${W} ${H} rounded-2xl overflow-hidden relative shadow-2xl`}
        style={{ backgroundColor: '#f8fafc' }}
      >
        {/* Diagonal two-tone split */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor} 50%, #f8fafc 50%, #f8fafc 100%)`,
          }}
        />

        {/* Decorative shapes */}
        <div
          className="absolute rounded-full opacity-30"
          style={{ width: 100, height: 100, top: 40, right: 30, backgroundColor: accentColor }}
        />
        <div
          className="absolute rounded-full opacity-20"
          style={{ width: 70, height: 70, bottom: 100, left: 20, border: `3px solid ${accentColor}` }}
        />
        <div
          className="absolute opacity-10"
          style={{
            width: 60, height: 60, top: 200, right: 60,
            borderRadius: '50% 0 50% 0',
            backgroundColor: accentColor,
          }}
        />

        {/* SRC wordmark top */}
        <div className="absolute top-5 left-5 z-10">
          <span
            className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80"
          >
            SRC
          </span>
        </div>

        {/* Headline across the diagonal seam */}
        <div className="absolute top-1/2 left-5 right-5 z-10 -translate-y-1/2">
          <h1
            className="text-[2.4rem] font-black leading-[1.05] text-slate-900"
            style={{ textShadow: '0 3px 12px rgba(255,255,255,0.5)' }}
            {...editableProps('headline')}
          >
            {localData.headline}
          </h1>
          <p
            className="text-sm text-slate-600 mt-2 max-w-[80%]"
            {...editableProps('subtext')}
          >
            {localData.subtext}
          </p>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
          <div
            className="bg-white rounded-xl p-3 shadow-lg"
            style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}
          >
            <div className="font-mono text-xs text-slate-700 mb-2" {...editableProps('details')}>
              {localData.details}
            </div>
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-bold px-4 py-2 rounded-full text-white"
                style={{ backgroundColor: accentColor }}
                {...editableProps('cta')}
              >
                {localData.cta}
              </span>
              {qrDataUrl && <QrBlock size="w-12 h-12" label={false} />}
            </div>
            <div className="mt-2">
              <HashtagRow />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Template D: Minimal Editorial ────────────────────────────────
  if (templateId === 'minimal_editorial') {
    return (
      <div
        ref={ref}
        className={`${W} ${H} rounded-2xl overflow-hidden relative flex flex-col shadow-2xl bg-white`}
      >
        {/* Thin top rule */}
        <div className="h-px bg-slate-200 mt-5 mx-8" />

        {/* SRC wordmark */}
        <div className="px-8 pt-3">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Student Representative Council
          </span>
        </div>

        {/* Oversized focal element */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
            style={{ backgroundColor: accentColor }}
          >
            <span className="text-3xl font-black text-white">!</span>
          </div>

          <h1
            className="text-[2.2rem] font-bold leading-tight text-slate-900 text-center"
            {...editableProps('headline')}
          >
            {localData.headline}
          </h1>
          {/* Accent underline */}
          <div
            className="h-1 w-16 rounded-full mt-3"
            style={{ backgroundColor: accentColor }}
          />
          <p
            className="text-sm text-slate-500 mt-4 text-center leading-relaxed max-w-[85%]"
            {...editableProps('subtext')}
          >
            {localData.subtext}
          </p>
        </div>

        {/* Footer details in small caps monospace */}
        <div className="px-8 pb-6">
          <div className="h-px bg-slate-200 mb-3" />
          <div
            className="font-mono text-[10px] uppercase tracking-wide text-slate-600 text-center leading-relaxed"
            {...editableProps('details')}
          >
            {localData.details}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span
              className="text-xs font-semibold"
              style={{ color: accentColor }}
              {...editableProps('cta')}
            >
              {localData.cta}
            </span>
            {qrDataUrl && <QrBlock size="w-12 h-12" label={false} />}
          </div>
          <div className="mt-2 flex justify-center">
            <HashtagRow />
          </div>
        </div>
      </div>
    );
  }

  // ─── Template E: Countdown Card ────────────────────────────────────
  if (templateId === 'countdown_card') {
    // Try to extract a day number from details
    const detailsStr = localData.details || '';
    const dayMatch = detailsStr.match(/\b(\d{1,2})\b/);
    const dayNum = dayMatch ? dayMatch[1] : '??';
    const monthMatch = detailsStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/i);
    const monthStr = monthMatch ? monthMatch[1] : '';

    return (
      <div
        ref={ref}
        className={`${W} ${H} rounded-2xl overflow-hidden relative flex flex-col shadow-2xl`}
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Accent shape */}
        <div
          className="absolute rounded-full opacity-20 blur-2xl"
          style={{ width: 200, height: 200, top: -60, right: -60, backgroundColor: accentColor }}
        />

        {/* Top: Save the Date label */}
        <div className="relative z-10 pt-7 px-7">
          <div className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: accentColor }}>
            Save the Date
          </div>
        </div>

        {/* Hero: oversized day number */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-7">
          <div
            className="text-[6rem] font-black leading-none"
            style={{ color: accentColor }}
          >
            {dayNum}
          </div>
          {monthStr && (
            <div className="text-lg font-bold text-white/70 uppercase tracking-widest mt-1">
              {monthStr}
            </div>
          )}

          {/* Headline in bright accent color */}
          <h1
            className="text-2xl font-black text-white text-center mt-5 leading-tight"
            {...editableProps('headline')}
          >
            {localData.headline}
          </h1>
          <p
            className="text-sm text-white/60 text-center mt-2 max-w-[85%]"
            {...editableProps('subtext')}
          >
            {localData.subtext}
          </p>
        </div>

        {/* Bottom: venue and time as pill tags */}
        <div className="relative z-10 px-6 pb-5 space-y-3">
          <div className="flex gap-2 justify-center">
            <span
              className="text-xs font-semibold px-4 py-1.5 rounded-full text-white"
              style={{ backgroundColor: `${accentColor}40`, border: `1px solid ${accentColor}60` }}
              {...editableProps('details')}
            >
              {localData.details}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-bold px-5 py-2 rounded-full text-white"
              style={{ backgroundColor: accentColor }}
              {...editableProps('cta')}
            >
              {localData.cta}
            </span>
            {qrDataUrl && <QrBlock size="w-12 h-12" label={false} />}
          </div>
          <div className="flex justify-center">
            <HashtagRow color="#fff" bg="rgba(255,255,255,0.15)" />
          </div>
        </div>
      </div>
    );
  }

  return null;
});
