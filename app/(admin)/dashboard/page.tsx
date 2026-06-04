'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  intakeCompleted: number;
  sessionsCompleted: number;
  pendingReview: number;
}

interface RecentUser {
  id: string;
  email: string;
  role: string;
  intake_completed: boolean;
  sessions_completed: number;
  created_at: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    intakeCompleted: 0,
    sessionsCompleted: 0,
    pendingReview: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch session
        const sessionRes = await fetch('/api/auth/session');
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setUser(sessionData.user);
        }

        // Fetch admin stats (TODO: Implement API route.)
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent users (TODO: Implement API route.)
        const usersRes = await fetch('/api/admin/users?limit=5');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setRecentUsers(usersData);
        }
      } catch (err) {
        console.error('[AdminDashboard] Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
      color: 'from-primary to-primary-light',
    },
    {
      label: 'Intake Completed',
      value: `${stats.intakeCompleted}`,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'from-accent to-emerald-400',
    },
    {
      label: 'Sessions Completed',
      value: stats.sessionsCompleted,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-500',
    },
    {
      label: 'Pending Review',
      value: stats.pendingReview,
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
      color: 'from-amber-400 to-orange-400',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-navy">
        <div className="flex flex-col items-center gap-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-navy">
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary-light" />

      <div className="flex flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="w-full">
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-navy dark:text-white tracking-tight">
                {greeting}, {displayName}
              </h1>
              <p className="mt-1 text-muted">
                QHRT Admin Dashboard — Overview &amp; user management
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 text-sm font-medium text-muted transition-all hover:border-primary hover:text-primary dark:border-navy dark:bg-navy-light/30 dark:text-muted dark:hover:border-primary/60 dark:hover:text-primary-light"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Logout
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 dark:border-navy/50 dark:bg-navy-light/20 dark:hover:border-primary/40"
              >
                {/* Gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-4xl font-bold text-navy dark:text-white tracking-tight">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users Table */}
            <div className="lg:col-span-2 rounded-2xl border border-border bg-white shadow-sm dark:border-navy/50 dark:bg-navy-light/20">
              <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-navy">
                <h2 className="text-lg font-semibold text-navy dark:text-white">Recent Users</h2>
                <Link
                  href="/admin/content"
                  className="text-sm font-medium text-primary hover:text-primary-light dark:text-primary-light dark:hover:text-primary transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-navy">
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                        Role
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                        Intake
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                        Sessions
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border dark:divide-navy">
                    {recentUsers.length > 0 ? (
                      recentUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-accent-lighter/30 dark:hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-navy dark:text-white">
                            {u.email}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                u.role === 'admin'
                                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
                                  : 'bg-muted/10 text-muted dark:bg-navy dark:text-muted'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {u.intake_completed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Done
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400">Pending</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-muted dark:text-muted">
                            {u.sessions_completed}
                          </td>
                          <td className="px-6 py-4 text-muted dark:text-muted">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-border bg-white shadow-sm dark:border-navy/50 dark:bg-navy-light/20">
              <div className="px-6 py-5 border-b border-border dark:border-navy">
                <h2 className="text-lg font-semibold text-navy dark:text-white">Quick Actions</h2>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {[
                  {
                    label: 'Manage Users',
                    href: '/admin/content',
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'View Sessions',
                    href: '/sessions',
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'System Settings',
                    href: '/admin/settings',
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.431.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ),
                  },
                  {
                    label: 'View Analytics',
                    href: '/admin/analytics',
                    icon: (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                        />
                      </svg>
                    ),
                  },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 rounded-xl border border-border bg-accent-lighter/20 px-4 py-3.5 text-sm font-medium text-navy transition-all hover:border-primary hover:bg-accent-lighter hover:text-primary dark:border-navy dark:text-white dark:hover:border-primary/60 dark:hover:bg-primary/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-white shadow-sm">
                      {action.icon}
                    </span>
                    {action.label}
                  </Link>
                ))}
              </div>

              {/* System status */}
              <div className="mx-6 mb-6 mt-2 rounded-xl border border-border bg-accent-lighter/40 p-4 dark:border-navy dark:bg-primary/5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    System Operational
                  </span>
                </div>
                <p className="mt-1 ml-[14px] text-xs text-muted">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pb-6 text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} QHRT Admin Panel — Built with Next.js &amp; Supabase
          </div>
        </div>
      </div>
    </div>
  );
}
