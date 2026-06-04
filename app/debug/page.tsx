'use client';

import { useState } from 'react';

type Palette =
  | 'current'
  | 'forest-lavender'
  | 'navy-lavender'
  | 'navy-green'
  | 'navy-amber'
  | 'navy-teal'
  | 'navy-violet';

const palettes: Record<
  Palette,
  {
    name: string;
    description: string;
    colors: { label: string; hex: string; tailwind: string }[];
    preview: {
      bg: string;
      text: string;
      accent: string;
      accentText: string;
      muted: string;
      border: string;
    };
  }
> = {
  current: {
    name: 'Current — Emerald & Stone',
    description:
      'White/black background, emerald green primary, amber accents. Clean and professional.',
    colors: [
      { label: 'Emerald 700', hex: '#047857', tailwind: 'bg-emerald-700' },
      { label: 'Emerald 600', hex: '#059669', tailwind: 'bg-emerald-600' },
      { label: 'Emerald 500', hex: '#10b981', tailwind: 'bg-emerald-500' },
      { label: 'Emerald 100', hex: '#d1fae5', tailwind: 'bg-emerald-100' },
      { label: 'Emerald 50', hex: '#ecfdf5', tailwind: 'bg-emerald-50' },
      { label: 'Amber 400', hex: '#fbbf24', tailwind: 'bg-amber-400' },
      { label: 'Amber 100', hex: '#fef3c7', tailwind: 'bg-amber-100' },
      { label: 'Stone 900', hex: '#1c1917', tailwind: 'bg-stone-900' },
      { label: 'Stone 50', hex: '#fafaf9', tailwind: 'bg-stone-50' },
      { label: 'Stone 100', hex: '#f5f5f4', tailwind: 'bg-stone-100' },
      { label: 'Stone 400', hex: '#a8a29e', tailwind: 'bg-stone-400' },
      { label: 'White', hex: '#ffffff', tailwind: 'bg-white' },
      { label: 'Black', hex: '#000000', tailwind: 'bg-black' },
    ],
    preview: {
      bg: 'bg-white dark:bg-black',
      text: 'text-stone-900 dark:text-stone-50',
      accent: 'bg-emerald-700 hover:bg-emerald-800',
      accentText: 'text-emerald-700 dark:text-emerald-400',
      muted: 'text-stone-500 dark:text-stone-400',
      border: 'border-stone-200 dark:border-stone-800',
    },
  },
  'forest-lavender': {
    name: 'Forest & Lavender',
    description: 'Deep forest green base with soft lavender accents. Warm, organic, and calming.',
    colors: [
      { label: 'Forest 800', hex: '#1a3c34', tailwind: 'bg-[#1a3c34]' },
      { label: 'Forest 700', hex: '#234e43', tailwind: 'bg-[#234e43]' },
      { label: 'Forest 600', hex: '#2d6354', tailwind: 'bg-[#2d6354]' },
      { label: 'Forest 500', hex: '#3a7d6a', tailwind: 'bg-[#3a7d6a]' },
      { label: 'Lavender 500', hex: '#a78bfa', tailwind: 'bg-[#a78bfa]' },
      { label: 'Lavender 400', hex: '#c4b5fd', tailwind: 'bg-[#c4b5fd]' },
      { label: 'Lavender 100', hex: '#ede9fe', tailwind: 'bg-[#ede9fe]' },
      { label: 'Lavender 50', hex: '#f5f3ff', tailwind: 'bg-[#f5f3ff]' },
      { label: 'Sage 200', hex: '#c9dbb3', tailwind: 'bg-[#c9dbb3]' },
      { label: 'Sage 100', hex: '#e4efda', tailwind: 'bg-[#e4efda]' },
      { label: 'Cream', hex: '#faf9f6', tailwind: 'bg-[#faf9f6]' },
      { label: 'Charcoal', hex: '#1f2937', tailwind: 'bg-[#1f2937]' },
      { label: 'Warm Gray', hex: '#6b7280', tailwind: 'bg-[#6b7280]' },
    ],
    preview: {
      bg: 'bg-[#faf9f6] dark:bg-[#0f1a17]',
      text: 'text-[#1f2937] dark:text-[#e8e4df]',
      accent: 'bg-[#2d6354] hover:bg-[#1a3c34]',
      accentText: 'text-[#2d6354] dark:text-[#c4b5fd]',
      muted: 'text-[#6b7280] dark:text-[#9ca3af]',
      border: 'border-[#e4efda] dark:border-[#1a3c34]',
    },
  },
  'navy-lavender': {
    name: 'Navy & Lavender',
    description:
      'Rich navy blue base with lavender highlights. Sophisticated, trustworthy, and serene.',
    colors: [
      { label: 'Navy 900', hex: '#0f172a', tailwind: 'bg-[#0f172a]' },
      { label: 'Navy 800', hex: '#1e293b', tailwind: 'bg-[#1e293b]' },
      { label: 'Navy 700', hex: '#334155', tailwind: 'bg-[#334155]' },
      { label: 'Navy 600', hex: '#475569', tailwind: 'bg-[#475569]' },
      { label: 'Lavender 500', hex: '#a78bfa', tailwind: 'bg-[#a78bfa]' },
      { label: 'Lavender 400', hex: '#c4b5fd', tailwind: 'bg-[#c4b5fd]' },
      { label: 'Lavender 100', hex: '#ede9fe', tailwind: 'bg-[#ede9fe]' },
      { label: 'Lavender 50', hex: '#f5f3ff', tailwind: 'bg-[#f5f3ff]' },
      { label: 'Rose Quartz', hex: '#fecdd3', tailwind: 'bg-[#fecdd3]' },
      { label: 'Mint', hex: '#d1fae5', tailwind: 'bg-[#d1fae5]' },
      { label: 'Off-White', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 50', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 400', hex: '#94a3b8', tailwind: 'bg-[#94a3b8]' },
    ],
    preview: {
      bg: 'bg-[#f8fafc] dark:bg-[#0f172a]',
      text: 'text-[#1e293b] dark:text-[#e2e8f0]',
      accent: 'bg-[#475569] hover:bg-[#334155]',
      accentText: 'text-[#7c3aed] dark:text-[#c4b5fd]',
      muted: 'text-[#64748b] dark:text-[#94a3b8]',
      border: 'border-[#e2e8f0] dark:border-[#1e293b]',
    },
  },
  'navy-green': {
    name: 'Navy & Deep Green',
    description:
      'Navy blue base with deep forest green secondary and mint accents. Cool, grounded, and refreshing.',
    colors: [
      { label: 'Navy 900', hex: '#0f172a', tailwind: 'bg-[#0f172a]' },
      { label: 'Navy 800', hex: '#1e293b', tailwind: 'bg-[#1e293b]' },
      { label: 'Navy 700', hex: '#334155', tailwind: 'bg-[#334155]' },
      { label: 'Navy 600', hex: '#475569', tailwind: 'bg-[#475569]' },
      { label: 'Forest 700', hex: '#1a3c34', tailwind: 'bg-[#1a3c34]' },
      { label: 'Forest 600', hex: '#2d6354', tailwind: 'bg-[#2d6354]' },
      { label: 'Forest 500', hex: '#3a7d6a', tailwind: 'bg-[#3a7d6a]' },
      { label: 'Mint', hex: '#6ee7b7', tailwind: 'bg-[#6ee7b7]' },
      { label: 'Mint 100', hex: '#d1fae5', tailwind: 'bg-[#d1fae5]' },
      { label: 'Mint 50', hex: '#ecfdf5', tailwind: 'bg-[#ecfdf5]' },
      { label: 'Off-White', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 400', hex: '#94a3b8', tailwind: 'bg-[#94a3b8]' },
      { label: 'Slate 500', hex: '#64748b', tailwind: 'bg-[#64748b]' },
    ],
    preview: {
      bg: 'bg-[#f8fafc] dark:bg-[#0f172a]',
      text: 'text-[#1e293b] dark:text-[#e2e8f0]',
      accent: 'bg-[#1a3c34] hover:bg-[#0f172a]',
      accentText: 'text-[#2d6354] dark:text-[#6ee7b7]',
      muted: 'text-[#64748b] dark:text-[#94a3b8]',
      border: 'border-[#e2e8f0] dark:border-[#1e293b]',
    },
  },
  'navy-amber': {
    name: 'Navy & Amber',
    description:
      'Navy blue base with warm amber highlights. Bold, confident, and inviting — replaces lavender with golden warmth.',
    colors: [
      { label: 'Navy 900', hex: '#0f172a', tailwind: 'bg-[#0f172a]' },
      { label: 'Navy 800', hex: '#1e293b', tailwind: 'bg-[#1e293b]' },
      { label: 'Navy 700', hex: '#334155', tailwind: 'bg-[#334155]' },
      { label: 'Navy 600', hex: '#475569', tailwind: 'bg-[#475569]' },
      { label: 'Amber 500', hex: '#f59e0b', tailwind: 'bg-[#f59e0b]' },
      { label: 'Amber 400', hex: '#fbbf24', tailwind: 'bg-[#fbbf24]' },
      { label: 'Amber 100', hex: '#fef3c7', tailwind: 'bg-[#fef3c7]' },
      { label: 'Amber 50', hex: '#fffbeb', tailwind: 'bg-[#fffbeb]' },
      { label: 'Rose Quartz', hex: '#fecdd3', tailwind: 'bg-[#fecdd3]' },
      { label: 'Mint', hex: '#d1fae5', tailwind: 'bg-[#d1fae5]' },
      { label: 'Off-White', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 50', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 400', hex: '#94a3b8', tailwind: 'bg-[#94a3b8]' },
    ],
    preview: {
      bg: 'bg-[#f8fafc] dark:bg-[#0f172a]',
      text: 'text-[#1e293b] dark:text-[#e2e8f0]',
      accent: 'bg-[#475569] hover:bg-[#334155]',
      accentText: 'text-[#f59e0b] dark:text-[#fbbf24]',
      muted: 'text-[#64748b] dark:text-[#94a3b8]',
      border: 'border-[#e2e8f0] dark:border-[#1e293b]',
    },
  },
  'navy-teal': {
    name: 'Navy & Muted Teal',
    description:
      'Navy blue base with muted teal/seafoam secondary. Subtle, calming, and understated — less saturated than pure green.',
    colors: [
      { label: 'Navy 900', hex: '#0f172a', tailwind: 'bg-[#0f172a]' },
      { label: 'Navy 800', hex: '#1e293b', tailwind: 'bg-[#1e293b]' },
      { label: 'Navy 700', hex: '#334155', tailwind: 'bg-[#334155]' },
      { label: 'Navy 600', hex: '#475569', tailwind: 'bg-[#475569]' },
      { label: 'Teal 600', hex: '#0d9488', tailwind: 'bg-[#0d9488]' },
      { label: 'Teal 500', hex: '#14b8a6', tailwind: 'bg-[#14b8a6]' },
      { label: 'Teal 400', hex: '#2dd4bf', tailwind: 'bg-[#2dd4bf]' },
      { label: 'Teal 200', hex: '#99f6e4', tailwind: 'bg-[#99f6e4]' },
      { label: 'Teal 50', hex: '#f0fdfa', tailwind: 'bg-[#f0fdfa]' },
      { label: 'Seafoam', hex: '#ccfbf1', tailwind: 'bg-[#ccfbf1]' },
      { label: 'Off-White', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 400', hex: '#94a3b8', tailwind: 'bg-[#94a3b8]' },
      { label: 'Slate 500', hex: '#64748b', tailwind: 'bg-[#64748b]' },
    ],
    preview: {
      bg: 'bg-[#f8fafc] dark:bg-[#0f172a]',
      text: 'text-[#1e293b] dark:text-[#e2e8f0]',
      accent: 'bg-[#0d9488] hover:bg-[#14b8a6]',
      accentText: 'text-[#0d9488] dark:text-[#2dd4bf]',
      muted: 'text-[#64748b] dark:text-[#94a3b8]',
      border: 'border-[#e2e8f0] dark:border-[#1e293b]',
    },
  },
  'navy-violet': {
    name: 'Navy & Strong Violet',
    description:
      'Navy blue base with a richer, more saturated violet/purple accent. More vibrant and expressive than the softer lavender.',
    colors: [
      { label: 'Navy 900', hex: '#0f172a', tailwind: 'bg-[#0f172a]' },
      { label: 'Navy 800', hex: '#1e293b', tailwind: 'bg-[#1e293b]' },
      { label: 'Navy 700', hex: '#334155', tailwind: 'bg-[#334155]' },
      { label: 'Navy 600', hex: '#475569', tailwind: 'bg-[#475569]' },
      { label: 'Violet 600', hex: '#7c3aed', tailwind: 'bg-[#7c3aed]' },
      { label: 'Violet 500', hex: '#8b5cf6', tailwind: 'bg-[#8b5cf6]' },
      { label: 'Violet 400', hex: '#a78bfa', tailwind: 'bg-[#a78bfa]' },
      { label: 'Violet 300', hex: '#c4b5fd', tailwind: 'bg-[#c4b5fd]' },
      { label: 'Violet 100', hex: '#ede9fe', tailwind: 'bg-[#ede9fe]' },
      { label: 'Violet 50', hex: '#f5f3ff', tailwind: 'bg-[#f5f3ff]' },
      { label: 'Rose Quartz', hex: '#fecdd3', tailwind: 'bg-[#fecdd3]' },
      { label: 'Off-White', hex: '#f8fafc', tailwind: 'bg-[#f8fafc]' },
      { label: 'Slate 400', hex: '#94a3b8', tailwind: 'bg-[#94a3b8]' },
    ],
    preview: {
      bg: 'bg-[#f8fafc] dark:bg-[#0f172a]',
      text: 'text-[#1e293b] dark:text-[#e2e8f0]',
      accent: 'bg-[#475569] hover:bg-[#334155]',
      accentText: 'text-[#7c3aed] dark:text-[#a78bfa]',
      muted: 'text-[#64748b] dark:text-[#94a3b8]',
      border: 'border-[#e2e8f0] dark:border-[#1e293b]',
    },
  },
};

function ColorSwatch({ color }: { color: { label: string; hex: string; tailwind: string } }) {
  return (
    <div className="group relative flex flex-col items-center gap-2">
      <div
        className="h-20 w-20 rounded-xl border border-black/5 shadow-sm transition-transform duration-200 group-hover:scale-110 dark:border-white/10"
        style={{ backgroundColor: color.hex }}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-stone-700 dark:text-stone-300">{color.label}</p>
        <p className="text-[10px] font-mono text-stone-400 dark:text-stone-500">{color.hex}</p>
      </div>
    </div>
  );
}

function PreviewCard({
  preview,
}: {
  preview: {
    bg: string;
    text: string;
    accent: string;
    accentText: string;
    muted: string;
    border: string;
  };
}) {
  return (
    <div className={`rounded-2xl border p-8 ${preview.bg} ${preview.border}`}>
      <div className="flex flex-col gap-6">
        {/* Badge */}
        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${preview.accentText} ${preview.border} ${preview.bg}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Therapy, on your terms
        </div>

        {/* Headings */}
        <div>
          <h3 className={`text-2xl font-semibold leading-tight ${preview.text}`}>
            Therapy that meets you
            <span className={`block ${preview.accentText}`}>where you are</span>
          </h3>
          <p className={`mt-3 text-base leading-relaxed ${preview.muted}`}>
            Connect with licensed therapists through secure video sessions. Get the support you
            deserve — from the comfort and privacy of your own space.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-7 text-sm font-semibold text-white shadow-sm transition-all ${preview.accent}`}
          >
            Get started
          </button>
          <button
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-7 text-sm font-semibold transition-all ${preview.border} ${preview.text} ${preview.bg} hover:opacity-80`}
          >
            Learn more
          </button>
        </div>

        {/* Trust indicators */}
        <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-sm ${preview.muted}`}>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            <span>HIPAA compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.201 16.25c-.505-.44-.938-.95-1.287-1.518A12.318 12.318 0 013 10.875C3 6.041 6.904 2 11.75 2c3.438 0 6.426 1.87 8.018 4.598"
              />
            </svg>
            <span>Licensed therapists</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
            <span>Available nationwide</span>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'Flexible scheduling', desc: 'Book sessions at times that work for you.' },
            { title: 'Private & secure', desc: 'Your conversations are encrypted and protected.' },
          ].map((f) => (
            <div
              key={f.title}
              className={`rounded-xl border p-5 transition-all hover:shadow-md ${preview.border} ${preview.bg}`}
            >
              <h4 className={`text-sm font-semibold ${preview.text}`}>{f.title}</h4>
              <p className={`mt-1 text-xs leading-relaxed ${preview.muted}`}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA bar */}
        <div className="rounded-xl bg-emerald-800 p-6 dark:bg-emerald-950">
          <p className="text-lg font-semibold text-white">Take the first step today</p>
          <p className="mt-1 text-sm text-emerald-100/80">You don&apos;t have to do this alone.</p>
          <button className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50">
            Start your journey
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DebugPage() {
  const [activePalette, setActivePalette] = useState<Palette>('current');

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-6 dark:border-stone-800 dark:bg-black">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            🎨 Theme & Palette Debug
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Compare color palettes for the QHRT therapy platform. Toggle dark mode in VS Code to
            preview both light and dark variants.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Palette selector */}
        <div className="mb-10 flex flex-wrap gap-3">
          {(Object.keys(palettes) as Palette[]).map((key) => (
            <button
              key={key}
              onClick={() => setActivePalette(key)}
              className={`rounded-lg border px-5 py-2.5 text-sm font-medium transition-all ${
                activePalette === key
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:bg-stone-800'
              }`}
            >
              {palettes[key].name}
            </button>
          ))}
        </div>

        {/* Active palette info */}
        {(() => {
          const p = palettes[activePalette];
          return (
            <>
              <div className="mb-8 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/50">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {p.name}
                </h2>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{p.description}</p>
              </div>

              {/* Color swatches */}
              <div className="mb-10">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Color Swatches
                </h3>
                <div className="flex flex-wrap gap-6">
                  {p.colors.map((color) => (
                    <ColorSwatch key={color.label} color={color} />
                  ))}
                </div>
              </div>

              {/* UI Preview */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  UI Preview
                </h3>
                <PreviewCard preview={p.preview} />
              </div>
            </>
          );
        })()}

        {/* Side-by-side comparison */}
        <div className="mt-16 border-t border-stone-200 pt-10 dark:border-stone-800">
          <h3 className="mb-6 text-lg font-semibold text-stone-900 dark:text-stone-50">
            Side-by-side comparison
          </h3>
          <div className="grid gap-8 lg:grid-cols-3">
            {(Object.keys(palettes) as Palette[]).map((key) => (
              <div key={key} className="flex flex-col">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${activePalette === key ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`}
                  >
                    {palettes[key].name}
                  </span>
                  {activePalette === key && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <PreviewCard preview={palettes[key].preview} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
