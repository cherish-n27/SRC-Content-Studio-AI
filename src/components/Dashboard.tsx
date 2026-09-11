import { useEffect, useState } from 'react';
import { getRole, CONTENT_TYPES } from '@/lib/roles';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { RoleId, ContentType, Generation } from '@/types';
import {
  ArrowLeft, Clock, Mail, Bell, ListOrdered, ClipboardList, Banknote, Calculator,
  Image, ClipboardCheck, PenLine, Share2, CalendarPlus, FileText, Settings,
  Lightbulb, Calendar,
} from 'lucide-react';
import { AIDisclaimer } from '@/components/AIDisclaimer';

const CT_ICONS: Record<string, typeof Mail> = {
  Mail, Bell, CalendarPlus, ListOrdered, ClipboardList, Banknote, Calculator,
  Image, ClipboardCheck, PenLine, Share2, FileText, Lightbulb,
};

interface Props {
  roleId: RoleId;
  onSelectContentType: (ct: ContentType) => void;
  onBack: () => void;
  onOpenGeneration: (gen: Generation) => void;
}

type TabView = 'create' | 'calendar';

export function Dashboard({ roleId, onSelectContentType, onBack, onOpenGeneration }: Props) {
  const role = getRole(roleId)!;
  const { profile, updateProfile } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingGens, setLoadingGens] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [brandColor, setBrandColor] = useState(profile?.brand_color || role.accent);
  const [tab, setTab] = useState<TabView>('create');

  useEffect(() => {
    setBrandColor(profile?.brand_color || role.accent);
  }, [profile, role.accent]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('generations')
        .select('*')
        .eq('role', roleId)
        .order('created_at', { ascending: false })
        .limit(20);
      setGenerations((data || []) as Generation[]);
      setLoadingGens(false);
    })();
  }, [roleId]);

  const handleSaveBrandColor = () => {
    updateProfile({ brand_color: brandColor });
    setShowSettings(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  // Calendar logic: group generations by date
  const calendarDays = (() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    // Map generations to day numbers
    const genByDay: Record<number, Generation[]> = {};
    for (const gen of generations) {
      const genDate = new Date(gen.created_at);
      if (genDate.getMonth() === month && genDate.getFullYear() === year) {
        const day = genDate.getDate();
        if (!genByDay[day]) genByDay[day] = [];
        genByDay[day].push(gen);
      }
    }

    return { cells, genByDay, today: today.getDate() };
  })();

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Upcoming events: generations from the last 7 days that look like events
  const upcomingEvents = generations.filter((g) => {
    const ct = CONTENT_TYPES[g.content_type as ContentType];
    return ct && (ct.isPoster || ct.isIdeas || g.content_type === 'event_announcement' || g.content_type === 'event_writeup');
  }).slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: role.accentLight }}>
              {(() => {
                const Icon = CT_ICONS[role.icon] || Mail;
                return <Icon className="w-5 h-5" style={{ color: role.accent }} />;
              })()}
            </div>
            <div>
              <h1 className="font-bold text-slate-900">{role.label}</h1>
              <p className="text-xs text-slate-500">{role.description}</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setTab('create')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'create' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <SparklesSmall /> Create
            </button>
            <button
              onClick={() => setTab('calendar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Calendar className="w-4 h-4" /> Calendar
            </button>
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-3">Brand Kit</h3>
            <p className="text-sm text-slate-500 mb-4">Set your SRC's accent color. It appears on all generated posters and documents.</p>
            <div className="flex items-center gap-4">
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-slate-200" />
              <span className="text-sm font-mono text-slate-600">{brandColor}</span>
              <button onClick={handleSaveBrandColor} className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: brandColor }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            What do you need to create?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {role.contentTypes.map((ctId) => {
              const ct = CONTENT_TYPES[ctId];
              const Icon = CT_ICONS[ct.icon] || Mail;
              return (
                <button
                  key={ctId}
                  onClick={() => onSelectContentType(ctId)}
                  className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 transition-all hover:shadow-lg"
                  style={{ borderLeft: `4px solid ${brandColor}` }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                    <Icon className="w-6 h-6" style={{ color: brandColor }} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-slate-900">{ct.label}</h3>
                    {ct.isPoster && <p className="text-xs text-slate-400 mt-0.5">Visual poster with templates</p>}
                    {ct.isEmail && <p className="text-xs text-slate-400 mt-0.5">Email with Gmail/Outlook shortcuts</p>}
                    {ct.isDocument && <p className="text-xs text-slate-400 mt-0.5">Document with Word export</p>}
                    {ct.isSocial && <p className="text-xs text-slate-400 mt-0.5">Multi-platform captions</p>}
                    {ct.isIdeas && <p className="text-xs text-slate-400 mt-0.5">Brainstorm event ideas, then develop them</p>}
                  </div>
                  <ChevronRightSmall />
                </button>
              );
            })}
          </div>

          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Recent Activity
          </h2>
          {loadingGens ? (
            <div className="text-sm text-slate-400">Loading...</div>
          ) : generations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No generations yet. Create something to see it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {generations.slice(0, 5).map((gen) => {
                const ct = CONTENT_TYPES[gen.content_type as ContentType];
                if (!ct) return null;
                const Icon = CT_ICONS[ct.icon] || Mail;
                return (
                  <button
                    key={gen.id}
                    onClick={() => onOpenGeneration(gen)}
                    className="w-full flex items-center gap-3 bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-300 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${brandColor}15` }}>
                      <Icon className="w-5 h-5" style={{ color: brandColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{ct.label}</p>
                      <p className="text-xs text-slate-400">{formatDate(gen.created_at)}</p>
                    </div>
                    <ChevronRightSmall />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-900">{monthName}</h2>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((wd) => (
                    <div key={wd} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1">
                      {wd}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.cells.map((day, i) => {
                    if (day === null) {
                      return <div key={i} className="aspect-square rounded-lg" />;
                    }
                    const dayGens = calendarDays.genByDay[day] || [];
                    const isToday = day === calendarDays.today;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                          isToday
                            ? 'bg-slate-900 text-white font-bold'
                            : dayGens.length > 0
                            ? 'bg-slate-100 text-slate-900 font-semibold hover:bg-slate-200 cursor-pointer'
                            : 'text-slate-400 hover:bg-slate-50'
                        }`}
                        style={
                          dayGens.length > 0 && !isToday
                            ? { backgroundColor: `${brandColor}15`, color: brandColor }
                            : undefined
                        }
                      >
                        <span>{day}</span>
                        {dayGens.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {dayGens.slice(0, 3).map((_, gi) => (
                              <div
                                key={gi}
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: isToday ? 'white' : brandColor }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                    <span className="text-[10px] text-slate-500">Content created</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-900" />
                    <span className="text-[10px] text-slate-500">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming events sidebar */}
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Event Content
              </h3>
              {upcomingEvents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                  <Calendar className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No event-related content yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((gen) => {
                    const ct = CONTENT_TYPES[gen.content_type as ContentType];
                    if (!ct) return null;
                    const Icon = CT_ICONS[ct.icon] || Mail;
                    const genDate = new Date(gen.created_at);
                    const dayStr = genDate.getDate();
                    const monthStr = genDate.toLocaleDateString('en-US', { month: 'short' });
                    return (
                      <button
                        key={gen.id}
                        onClick={() => onOpenGeneration(gen)}
                        className="w-full flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100 hover:border-slate-300 transition-all text-left"
                      >
                        <div
                          className="flex flex-col items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${brandColor}15` }}
                        >
                          <span className="text-base font-bold" style={{ color: brandColor }}>{dayStr}</span>
                          <span className="text-[8px] uppercase font-semibold text-slate-400">{monthStr}</span>
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: brandColor }} />
                            <p className="font-medium text-slate-900 text-xs truncate">{ct.label}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {genDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AIDisclaimer />
    </div>
  );
}

function ChevronRightSmall() {
  return (
    <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SparklesSmall() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
