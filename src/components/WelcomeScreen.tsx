import { useState } from 'react';
import { ROLES } from '@/lib/roles';
import { useAuth } from '@/lib/auth';
import type { RoleId } from '@/types';
import {
  Crown, Shield, FileText, Wallet, HeartHandshake, PartyPopper, Megaphone,
  GraduationCap, LogOut, ChevronRight,
} from 'lucide-react';
import { AIDisclaimer } from '@/components/AIDisclaimer';

const ICONS: Record<string, typeof Crown> = {
  Crown, Shield, FileText, Wallet, HeartHandshake, PartyPopper, Megaphone,
};

interface Props {
  onSelectRole: (roleId: RoleId) => void;
}

export function WelcomeScreen({ onSelectRole }: Props) {
  const { profile, signOut, updateProfile } = useAuth();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleSelect = (roleId: RoleId) => {
    if (profile && profile.role !== roleId) {
      updateProfile({ role: roleId });
    }
    onSelectRole(roleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 text-lg">SRC Content Studio</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Hey SRC member
          </h1>
          <p className="text-lg text-slate-500 mt-3">
            Let's get your content sorted. Pick your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLES.map((role) => {
            const Icon = ICONS[role.icon] || Crown;
            const isHovered = hovered === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                onMouseEnter={() => setHovered(role.id)}
                onMouseLeave={() => setHovered(null)}
                className="group relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{
                  backgroundColor: 'white',
                  boxShadow: isHovered
                    ? `0 20px 40px -12px ${role.accent}40`
                    : '0 1px 3px rgba(0,0,0,0.08)',
                  border: `1px solid ${role.accentLight}`,
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all duration-300"
                  style={{
                    backgroundColor: role.accent,
                    opacity: isHovered ? 1 : 0.6,
                  }}
                />
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: role.accentLight }}
                >
                  <Icon className="w-7 h-7" style={{ color: role.accent }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{role.label}</h3>
                <p className="text-sm text-slate-500 mb-4">{role.description}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: role.accent }}>
                  <span>Get started</span>
                  <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <AIDisclaimer />
    </div>
  );
}
