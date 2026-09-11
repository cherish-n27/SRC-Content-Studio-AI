import { useState } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { AuthScreen } from '@/components/AuthScreen';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { Generator } from '@/components/Generator';
import type { RoleId, ContentType, Generation, EventIdea } from '@/types';

type View =
  | { name: 'welcome' }
  | { name: 'dashboard'; roleId: RoleId }
  | { name: 'generator'; roleId: RoleId; contentType: ContentType; existingGeneration?: Generation | null }
  | { name: 'develop_idea'; roleId: RoleId; idea: EventIdea };

function AppInner() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>({ name: 'welcome' });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  if (view.name === 'welcome') {
    return (
      <WelcomeScreen
        onSelectRole={(roleId) => setView({ name: 'dashboard', roleId })}
      />
    );
  }

  if (view.name === 'dashboard') {
    return (
      <Dashboard
        roleId={view.roleId}
        onSelectContentType={(ct) =>
          setView({ name: 'generator', roleId: view.roleId, contentType: ct })
        }
        onBack={() => setView({ name: 'welcome' })}
        onOpenGeneration={(gen) =>
          setView({
            name: 'generator',
            roleId: gen.role,
            contentType: gen.content_type,
            existingGeneration: gen,
          })
        }
      />
    );
  }

  if (view.name === 'generator') {
    return (
      <Generator
        roleId={view.roleId}
        contentType={view.contentType}
        existingGeneration={view.existingGeneration}
        onBack={() => setView({ name: 'dashboard', roleId: view.roleId })}
        onDevelopIdea={(_roleId, idea) =>
          setView({ name: 'develop_idea', roleId: view.roleId, idea })
        }
      />
    );
  }

  if (view.name === 'develop_idea') {
    return (
      <Generator
        roleId={view.roleId}
        contentType="promo_poster"
        onBack={() => setView({ name: 'generator', roleId: view.roleId, contentType: 'event_ideas' })}
        onDevelopIdea={(_roleId, idea) =>
          setView({ name: 'develop_idea', roleId: view.roleId, idea })
        }
        prefill={{ event_name: view.idea.name, key_info: view.idea.concept }}
      />
    );
  }

  return <WelcomeScreen onSelectRole={(roleId) => setView({ name: 'dashboard', roleId })} />;
}

function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
