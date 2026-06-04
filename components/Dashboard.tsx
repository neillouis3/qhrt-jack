'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface DashboardProps {
  userName?: string;
  userEmail?: string;
  onIntakeComplete: boolean;
}

interface UserProgress {
  intake_completed: boolean;
  sessions_completed: number;
  last_session_date: string | null;
  avg_stress_before: number | null;
  avg_stress_after: number | null;
}

const sessionCards = [
  {
    id: 1,
    title: 'Session 1: Grounding and Nervous System Reset',
    description:
      'A calming, structured first experience focused on settling physiological activation and building confidence.',
    duration: '12-15 minutes',
    status: 'available',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    id: 2,
    title: 'Session 2: Releasing Physical Tension',
    description: 'Body tension awareness, controlled release, and increased somatic safety.',
    duration: '15-20 minutes',
    status: 'locked',
    color: 'from-blue-500 to-indigo-500',
  },
];

export default function Dashboard({ userName, userEmail, onIntakeComplete }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setProgress(data);
    } catch {
      // Silently fail — dashboard still works
    } finally {
      setLoading(false);
    }
  };

  const displayName = userName ? userName.split('@')[0] : (userEmail?.split('@')[0] ?? 'there');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-foreground dark:text-white">
          {greeting}, {displayName}
        </h1>
        <p className="mt-1 text-muted dark:text-muted">
          Your space for grounding and nervous system regulation.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted">Loading your progress...</p>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="rounded-xl border border-border bg-background p-5 dark:bg-navy">
              <p className="text-xs text-muted uppercase tracking-wider">Sessions completed</p>
              <p className="mt-1 text-2xl font-semibold text-foreground dark:text-white">
                {progress?.sessions_completed ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 dark:bg-navy">
              <p className="text-xs text-muted uppercase tracking-wider">Avg stress (before)</p>
              <p className="mt-1 text-2xl font-semibold text-foreground dark:text-white">
                {progress?.avg_stress_before != null ? progress.avg_stress_before.toFixed(1) : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-5 dark:bg-navy">
              <p className="text-xs text-muted uppercase tracking-wider">Avg stress (after)</p>
              <p className="mt-1 text-2xl font-semibold text-foreground dark:text-white">
                {progress?.avg_stress_after != null ? progress.avg_stress_after.toFixed(1) : '—'}
              </p>
            </div>
          </div>

          {/* Available sessions */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
              Your sessions
            </h2>
            <div className="space-y-4">
              {sessionCards.map((session) => (
                <div
                  key={session.id}
                  className={`
                    relative overflow-hidden rounded-xl border border-border p-6 transition-colors
                    ${
                      session.status === 'locked'
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-primary/30 cursor-pointer bg-background dark:bg-navy'
                    }
                  `}
                >
                  {session.status === 'locked' && (
                    <div className="absolute inset-0 bg-background/60 dark:bg-navy/60 flex items-center justify-center z-10">
                      <span className="px-3 py-1 rounded-full bg-border text-xs font-medium text-muted">
                        Complete Session 1 first
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${session.color} flex-shrink-0`}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground dark:text-white">
                        {session.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted dark:text-muted">
                        {session.description}
                      </p>
                      <p className="mt-2 text-xs text-muted">Duration: {session.duration}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (session.status === 'available') {
                          // Navigate to session
                        }
                      }}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-lg transition-colors
                        ${
                          session.status === 'available'
                            ? 'bg-primary text-white hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary'
                            : 'bg-border text-muted cursor-not-allowed'
                        }
                      `}
                    >
                      {session.status === 'available' ? 'Start' : 'Locked'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">
              Quick actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted/5 dark:hover:bg-navy-light/20 transition-colors">
                View progress
              </button>
              <button className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted/5 dark:hover:bg-navy-light/20 transition-colors">
                Write a reflection
              </button>
              <button className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted/5 dark:hover:bg-navy-light/20 transition-colors">
                Breathing exercise
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
