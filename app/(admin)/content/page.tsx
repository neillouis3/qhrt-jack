/**
 * Admin Content Management Hub
 * Sidebar navigation with grouped sections (Condition Library, Knowledge Models).
 * Modal-based editing for all forms. Error boundary around table content.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import ContentErrorBoundary from '@/components/admin/ContentErrorBoundary';
import AdminSidebar, { NavGroup, NavItem } from '@/components/admin/AdminSidebar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Condition {
  id: string;
  category_id: string;
  name: string;
  short_description: string | null;
  full_description: string | null;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Symptom {
  id: string;
  condition_id: string;
  symptom_name: string;
  display_order: number;
  is_active: boolean;
}

interface AssessmentQuestion {
  id: string;
  condition_id: string;
  question_text: string;
  scale_type: string;
  minimum_value: number;
  maximum_value: number;
  display_order: number;
  is_active: boolean;
}

interface ProgressMetric {
  id: string;
  condition_id: string;
  metric_name: string;
  metric_description: string | null;
  scale_type: string;
  minimum_value: number;
  maximum_value: number;
  display_order: number;
  is_active: boolean;
}

interface QHRTMapping {
  id: string;
  condition_id: string;
  primary_emotional_theme: string | null;
  secondary_emotional_theme: string | null;
  organ_system: string | null;
  gland_system: string | null;
  qhrt_focus: string | null;
  internal_notes: string | null;
}

interface SessionAssignment {
  id: string;
  condition_id: string;
  session_id: string;
  session_number: number;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

interface KnowledgeModel {
  id: string;
  name: string;
  description: string | null;
  version: string;
  is_active: boolean;
  created_at: string;
}

interface Prompt {
  id: string;
  knowledge_model_id: string;
  evidence_dimension_id: string | null;
  prompt_key: string;
  prompt_text: string;
  response_type: string;
  display_order: number;
  is_active: boolean;
}

interface BranchRule {
  id: string;
  prompt_id: string;
  condition_expression: any;
  target_prompt_id: string;
  priority: number;
  is_active: boolean;
}

interface EvidenceDimension {
  id: string;
  knowledge_model_id: string;
  name: string;
  description: string | null;
  priority: number;
  is_required: boolean;
  is_active: boolean;
}

interface CompletionRule {
  id: string;
  evidence_dimension_id: string;
  rule_expression: any;
  is_active: boolean;
}

type TabKey =
  | 'categories'
  | 'conditions'
  | 'symptoms'
  | 'assessments'
  | 'metrics'
  | 'mappings'
  | 'sessions'
  | 'seed'
  | 'knowledge-models'
  | 'evidence-dimensions'
  | 'prompts'
  | 'branch-rules'
  | 'completion-rules'
  | 'phase-templates'
  | 'functional-domains'
  | 'aee-catalog'
  | 'personal-programs'
  | 'therapeutic-engines';

// ---------------------------------------------------------------------------
// Sidebar configuration
// ---------------------------------------------------------------------------

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    key: 'condition-library',
    label: 'Condition Library',
    items: [
      {
        key: 'categories',
        label: 'Categories',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        ),
      },
      {
        key: 'conditions',
        label: 'Conditions',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.22-.1.484-.1.75v11.193c0 .214.034.46.1.75M9 18.75V9m0 0l-2.25-2.25M9 9l2.25-2.25"
            />
          </svg>
        ),
      },
      {
        key: 'symptoms',
        label: 'Symptoms',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        ),
      },
      {
        key: 'assessments',
        label: 'Assessments',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.143-5.143c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        ),
      },
      {
        key: 'metrics',
        label: 'Progress Metrics',
        icon: (
          <svg
            className="w-4 h-4"
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
      {
        key: 'mappings',
        label: 'QHRT Mappings',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H4.5a2.25 2.25 0 00-2.25 2.25v9A2.25 2.25 0 004.5 19.5h9a2.25 2.25 0 002.25-2.25V8.25A2.25 2.25 0 0013.5 6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 4.5a2.25 2.25 0 012.25 2.25v9A2.25 2.25 0 0118 18h-4.5m6.75-8.25l-3.375-3.375M12 15l3.375 3.375"
            />
          </svg>
        ),
      },
      {
        key: 'sessions',
        label: 'Session Assignments',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        ),
      },
      {
        key: 'seed',
        label: 'Seed Data',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 2.625a2.625 2.625 0 00-1.5-2.625M6 18v-3a2.25 2.25 0 012.25-2.25h.375c.621 0 1.25-.049 1.875-.145m-1.875 1.145V18"
            />
          </svg>
        ),
      },
    ],
  },
  {
    key: 'knowledge-models',
    label: 'Knowledge Models',
    items: [
      {
        key: 'knowledge-models',
        label: 'Models',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125V6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375"
            />
          </svg>
        ),
      },
      {
        key: 'evidence-dimensions',
        label: 'Evidence Dimensions',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15"
            />
          </svg>
        ),
      },
      {
        key: 'prompts',
        label: 'Prompts',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.156 2.215.156 3.302 0 1.584-.233 2.707-1.626 2.707-3.227V6.739a2.25 2.25 0 00-.659-1.591l-5.405-5.405a2.25 2.25 0 00-1.591-.659H9.719A2.25 2.25 0 007.469 2.281l-5.405 5.405a2.25 2.25 0 00-.659 1.591v.797zM9.75 15.75V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25"
            />
          </svg>
        ),
      },
      {
        key: 'branch-rules',
        label: 'Branch Rules',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
        ),
      },
      {
        key: 'completion-rules',
        label: 'Completion Rules',
        icon: (
          <svg
            className="w-4 h-4"
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
      },
    ],
  },
  {
    key: 'therapeutic-engine',
    label: 'Therapeutic Engine',
    items: [
      {
        key: 'phase-templates',
        label: 'Phase Templates',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z"
            />
          </svg>
        ),
      },
      {
        key: 'functional-domains',
        label: 'Functional Domains',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.059 1.533-.174 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.756-2.247M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        key: 'aee-catalog',
        label: 'AEE Catalog',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 5.227 5.97 9.75 12 9.75s12-4.523 12-9.75z"
            />
          </svg>
        ),
      },
      {
        key: 'personal-programs',
        label: 'Personal Programs',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        ),
      },
      {
        key: 'therapeutic-engines',
        label: 'Active Sessions',
        icon: (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 13.125zM6 7.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 016 7.875zM6 3a1.125 1.125 0 00-1.125 1.125v c0 .621.504 1.125 1.125 1.125h2.25C8.875 5.25 9.379 4.746 9.379 4.125v c0-.621-.504-1.125-1.125-1.125H6zM14.25 8.625c0-.621.504-1.125 1.125-1.125h2.25C18.246 7.5 18.75 8.004 18.75 8.625v c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125zM14.25 13.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125zM16.5 7.5a2.25 2.25 0 00-2.25 2.25v5.25a2.25 2.25 0 002.25 2.25h5.25a2.25 2.25 0 002.25-2.25v-5.25a2.25 2.25 0 00-2.25-2.25h-5.25z"
            />
          </svg>
        ),
      },
    ],
  },
];

const TAB_LABELS: Record<TabKey, string> = {
  categories: 'Categories',
  conditions: 'Conditions',
  symptoms: 'Symptoms',
  assessments: 'Assessment Questions',
  metrics: 'Progress Metrics',
  mappings: 'QHRT Mappings',
  sessions: 'Session Assignments',
  seed: 'Seed Data',
  'knowledge-models': 'Knowledge Models',
  'evidence-dimensions': 'Evidence Dimensions',
  prompts: 'Prompts',
  'branch-rules': 'Branch Rules',
  'completion-rules': 'Completion Rules',
  'phase-templates': 'Phase Templates',
  'functional-domains': 'Functional Domain Protocols',
  'aee-catalog': 'AEE Catalog',
  'personal-programs': 'Personal Implementation Programs',
  'therapeutic-engines': 'Active Therapeutic Sessions',
};

// ---------------------------------------------------------------------------
// Toast notification
// ---------------------------------------------------------------------------

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[2000] flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 ${
        type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-300'
          : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-300'
      }`}
    >
      {type === 'success' ? (
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      )}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-colors">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Modal
// ---------------------------------------------------------------------------

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors dark:border-navy"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary hover:bg-primary-dark'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Toggle Switch
// ---------------------------------------------------------------------------

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0px)' }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Shared: load conditions list (used by child-resource tabs)
// ---------------------------------------------------------------------------

async function loadConditions(): Promise<Condition[]> {
  try {
    const res = await fetch('/api/admin/conditions');
    const json = await res.json();
    return json.conditions ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Categories Tab (Modal-based editing)
// ---------------------------------------------------------------------------

function CategoriesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      setCategories(json.categories ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setFormOrder(categories.length);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setFormName(cat.name);
    setFormDesc(cat.description ?? '');
    setFormOrder(cat.display_order);
    setEditingId(cat.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return;
    try {
      if (editingId) {
        await fetch('/api/admin/categories', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formName,
            description: formDesc || null,
            display_order: formOrder,
          }),
        });
      } else {
        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDesc || null,
            display_order: formOrder,
          }),
        });
      }
      showToast(editingId ? 'Category updated' : 'Category created', 'success');
      setModalOpen(false);
      fetchCategories();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !categories.find((c) => c.id === id)?.is_active }),
      });
      fetchCategories();
    } catch {
      showToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <ContentErrorBoundary fallbackTitle="Categories failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Condition Categories</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Order</th>
                  <th className="text-left py-2.5 px-3 font-medium">Name</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">Active</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-muted">{cat.display_order}</td>
                    <td className="py-2.5 px-3 font-medium">{cat.name}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Toggle checked={cat.is_active} onChange={() => handleToggleActive(cat.id)} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(cat)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cat.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No categories yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Category' : 'New Category'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Category name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Display Order</label>
              <input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          message="Are you sure you want to delete this category? This cannot be undone."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Conditions Tab (Modal-based editing)
// ---------------------------------------------------------------------------

function ConditionsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formOrder, setFormOrder] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [condRes, catRes] = await Promise.all([
        fetch('/api/admin/conditions'),
        fetch('/api/admin/categories?activeOnly=false'),
      ]);
      setConditions((await condRes.json()).conditions ?? []);
      setCategories((await catRes.json()).categories ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormName('');
    setFormCategoryId('');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormFeatured(false);
    setFormOrder(conditions.length);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (c: Condition) => {
    setFormName(c.name);
    setFormCategoryId(c.category_id);
    setFormShortDesc(c.short_description ?? '');
    setFormFullDesc(c.full_description ?? '');
    setFormFeatured(c.is_featured);
    setFormOrder(c.display_order);
    setEditingId(c.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim() || !formCategoryId) return;
    try {
      if (editingId) {
        await fetch('/api/admin/conditions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formName,
            category_id: formCategoryId,
            short_description: formShortDesc || null,
            full_description: formFullDesc || null,
            is_featured: formFeatured,
            display_order: formOrder,
          }),
        });
      } else {
        await fetch('/api/admin/conditions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            category_id: formCategoryId,
            short_description: formShortDesc || null,
            full_description: formFullDesc || null,
            is_featured: formFeatured,
            display_order: formOrder,
          }),
        });
      }
      showToast(editingId ? 'Condition updated' : 'Condition created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await fetch('/api/admin/conditions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !conditions.find((c) => c.id === id)?.is_active }),
      });
      fetchData();
    } catch {
      showToast('Failed to update condition', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/conditions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Condition deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete condition', 'error');
    }
    setConfirmDelete(null);
  };

  const catNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Conditions failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Conditions</h3>
          <button
            onClick={openCreate}
            disabled={categories.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Condition
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Order</th>
                  <th className="text-left py-2.5 px-3 font-medium">Name</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">Featured</th>
                  <th className="text-center py-2.5 px-3 font-medium">Active</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {conditions.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-muted">{c.display_order}</td>
                    <td className="py-2.5 px-3 font-medium">{c.name}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell">
                      {catNameMap[c.category_id] || c.category_id}
                    </td>
                    <td className="py-2.5 px-3 text-center">{c.is_featured ? '⭐' : '—'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <Toggle checked={c.is_active} onChange={() => handleToggleActive(c.id)} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {conditions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">
                      No conditions yet. Use the seed button or add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Condition' : 'New Condition'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Condition name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Short Description</label>
              <input
                type="text"
                value={formShortDesc}
                onChange={(e) => setFormShortDesc(e.target.value)}
                placeholder="Brief description"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Description</label>
              <textarea
                value={formFullDesc}
                onChange={(e) => setFormFullDesc(e.target.value)}
                placeholder="Detailed description"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded border-border"
                />
                Featured
              </label>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formName.trim() || !formCategoryId}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Condition"
          message="Are you sure you want to delete this condition? This cannot be undone."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Generic Child Resource Tab (Modal-based) - Symptoms, Assessments, Metrics
// ---------------------------------------------------------------------------

function ChildResourceTab({
  title,
  endpoint,
  dataKey,
  nameField,
  namePlaceholder,
  extraFields,
  showToast,
}: {
  title: string;
  endpoint: string;
  dataKey: string;
  nameField: string;
  namePlaceholder: string;
  extraFields?: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'textarea';
    placeholder?: string;
  }>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConditionId, setFilterConditionId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId ? `${endpoint}?conditionId=${filterConditionId}` : endpoint;
      const [res, condRes] = await Promise.all([fetch(url), loadConditions()]);
      setItems((await res.json())[dataKey] ?? []);
      setConditions(condRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, dataKey, filterConditionId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    const vals: Record<string, string | number | boolean> = {};
    vals[nameField] = item[nameField];
    vals.condition_id = item.condition_id;
    if (extraFields) {
      for (const f of extraFields) {
        vals[f.key] = item[f.key] ?? '';
      }
    }
    setFormValues(vals);
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!String(formValues[nameField] ?? '').trim() || !formValues.condition_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      if (editingId) {
        body.id = editingId;
        await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast(editingId ? 'Updated' : 'Created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));
  const formFields = [
    { key: nameField, label: 'Name', type: 'text' as const, placeholder: namePlaceholder },
    ...(extraFields ?? []),
  ];

  return (
    <ContentErrorBoundary fallbackTitle={`${title} failed to load`}>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={openCreate}
            disabled={conditions.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add {title.slice(-1) === 's' ? title.slice(0, -1) : title}
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterConditionId}
            onChange={(e) => setFilterConditionId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All conditions</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Name</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Condition
                  </th>
                  {extraFields?.map((f) => (
                    <th
                      key={f.key}
                      className="text-left py-2.5 px-3 font-medium hidden lg:table-cell"
                    >
                      {f.label}
                    </th>
                  ))}
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium max-w-xs truncate">{item[nameField]}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell">
                      {condNameMap[item.condition_id] || item.condition_id}
                    </td>
                    {extraFields?.map((f) => (
                      <td
                        key={f.key}
                        className="py-2.5 px-3 text-muted hidden lg:table-cell max-w-xs truncate"
                      >
                        {String(item[f.key] ?? '')}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(item.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4 + (extraFields?.length || 0)}
                      className="py-8 text-center text-muted"
                    >
                      No items yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            editingId
              ? `Edit ${title.slice(-1) === 's' ? title.slice(0, -1) : title}`
              : `New ${title.slice(-1) === 's' ? title.slice(0, -1) : title}`
          }
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.condition_id ?? '')}
                onChange={(e) => setFormValues({ ...formValues, condition_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select condition</option>
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {formFields
              .filter((f) => f.key !== 'condition_id')
              .map((f) =>
                f.type === 'textarea' ? (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                    <textarea
                      value={String(formValues[f.key] ?? '')}
                      onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                      placeholder={f.placeholder || f.label}
                      rows={2}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                ) : (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={String(formValues[f.key] ?? '')}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                        })
                      }
                      placeholder={f.placeholder || f.label}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                )
              )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!String(formValues[nameField] ?? '').trim() || !formValues.condition_id}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Item"
          message="Are you sure you want to delete this item? This cannot be undone."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// QHRT Mappings Tab (Modal-based)
// ---------------------------------------------------------------------------

function QHRTMappingsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [mappings, setMappings] = useState<any[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConditionId, setFilterConditionId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId
        ? `/api/admin/qhrt-mappings?conditionId=${filterConditionId}`
        : '/api/admin/qhrt-mappings';
      const [res, condRes] = await Promise.all([fetch(url), loadConditions()]);
      setMappings((await res.json()).mappings ?? []);
      setConditions(condRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterConditionId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openEdit = (m: any) => {
    setFormValues({
      condition_id: m.condition_id,
      primary_emotional_theme: m.primary_emotional_theme ?? '',
      secondary_emotional_theme: m.secondary_emotional_theme ?? '',
      organ_system: m.organ_system ?? '',
      gland_system: m.gland_system ?? '',
      qhrt_focus: m.qhrt_focus ?? '',
      internal_notes: m.internal_notes ?? '',
    });
    setEditingId(m.id);
    setModalOpen(true);
  };

  const openCreateForCondition = (conditionId: string) => {
    const existing = mappings.find((m) => m.condition_id === conditionId);
    if (existing) {
      openEdit(existing);
      return;
    }
    setFormValues({
      condition_id: conditionId,
      primary_emotional_theme: '',
      secondary_emotional_theme: '',
      organ_system: '',
      gland_system: '',
      qhrt_focus: '',
      internal_notes: '',
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.condition_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      for (const key of Object.keys(body)) {
        if (body[key] === '') body[key] = null;
      }
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/qhrt-mappings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/qhrt-mappings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast('QHRT mapping saved', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Failed to save mapping', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/qhrt-mappings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Mapping deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete mapping', 'error');
    }
    setConfirmDelete(null);
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  return (
    <ContentErrorBoundary fallbackTitle="QHRT Mappings failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">QHRT Mappings</h3>
            <p className="text-sm text-muted mt-0.5">
              Internal clinical framework data — not visible to users.
            </p>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <select
            value={filterConditionId}
            onChange={(e) => setFilterConditionId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All conditions</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => {
              if (e.target.value) openCreateForCondition(e.target.value);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Quick-edit condition...</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Condition</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Primary Theme
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell">
                    Organ System
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell">
                    QHRT Focus
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">
                      {condNameMap[m.condition_id] || m.condition_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell max-w-xs truncate">
                      {m.primary_emotional_theme || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden lg:table-cell max-w-xs truncate">
                      {m.organ_system || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden lg:table-cell max-w-xs truncate">
                      {m.qhrt_focus || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {mappings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No mappings yet. Select a condition above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setFormValues({});
            setEditingId(null);
          }}
          title={editingId ? 'Edit QHRT Mapping' : 'New QHRT Mapping'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Condition</label>
              <select
                value={formValues.condition_id}
                onChange={(e) => setFormValues({ ...formValues, condition_id: e.target.value })}
                disabled={!!editingId}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select condition</option>
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Primary Emotional Theme</label>
                <input
                  type="text"
                  value={formValues.primary_emotional_theme}
                  onChange={(e) =>
                    setFormValues({ ...formValues, primary_emotional_theme: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Secondary Emotional Theme
                </label>
                <input
                  type="text"
                  value={formValues.secondary_emotional_theme}
                  onChange={(e) =>
                    setFormValues({ ...formValues, secondary_emotional_theme: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Organ System</label>
                <input
                  type="text"
                  value={formValues.organ_system}
                  onChange={(e) => setFormValues({ ...formValues, organ_system: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Gland System</label>
                <input
                  type="text"
                  value={formValues.gland_system}
                  onChange={(e) => setFormValues({ ...formValues, gland_system: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">QHRT Focus</label>
              <input
                type="text"
                value={formValues.qhrt_focus}
                onChange={(e) => setFormValues({ ...formValues, qhrt_focus: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Internal Notes</label>
              <textarea
                value={formValues.internal_notes}
                onChange={(e) => setFormValues({ ...formValues, internal_notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setModalOpen(false);
                setFormValues({});
                setEditingId(null);
              }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Mapping"
          message="Are you sure you want to delete this mapping? This cannot be undone."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Session Assignments Tab (Modal-based)
// ---------------------------------------------------------------------------

function SessionAssignmentsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConditionId, setFilterConditionId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId
        ? `/api/admin/session-assignments?conditionId=${filterConditionId}`
        : '/api/admin/session-assignments';
      const [res, condRes] = await Promise.all([fetch(url), loadConditions()]);
      setAssignments((await res.json()).assignments ?? []);
      setConditions(condRes);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterConditionId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormValues({
      condition_id: item.condition_id,
      session_id: item.session_id,
      session_number: item.session_number,
      is_required: item.is_required,
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.condition_id || !formValues.session_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/session-assignments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/session-assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast('Session assignment saved', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Failed to save', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/session-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Assignment deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Session Assignments failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Session Assignments</h3>
          <button
            onClick={openCreate}
            disabled={conditions.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Assignment
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterConditionId}
            onChange={(e) => setFilterConditionId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All conditions</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Condition</th>
                  <th className="text-left py-2.5 px-3 font-medium">Session ID</th>
                  <th className="text-center py-2.5 px-3 font-medium">#</th>
                  <th className="text-center py-2.5 px-3 font-medium">Required</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">
                      {condNameMap[a.condition_id] || a.condition_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted">{a.session_id}</td>
                    <td className="py-2.5 px-3 text-center">{a.session_number}</td>
                    <td className="py-2.5 px-3 text-center">{a.is_required ? '✓' : '—'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(a)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(a.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No session assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Assignment' : 'New Assignment'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.condition_id ?? '')}
                onChange={(e) => setFormValues({ ...formValues, condition_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select condition</option>
                {conditions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Session ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={String(formValues.session_id ?? '')}
                onChange={(e) => setFormValues({ ...formValues, session_id: e.target.value })}
                placeholder="Session identifier"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Session Number</label>
                <input
                  type="number"
                  value={String(formValues.session_number ?? 0)}
                  onChange={(e) =>
                    setFormValues({ ...formValues, session_number: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(formValues.is_required)}
                    onChange={(e) =>
                      setFormValues({ ...formValues, is_required: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  Required
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formValues.condition_id || !formValues.session_id}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Assignment"
          message="Are you sure you want to delete this assignment? This cannot be undone."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Seed Data Tab
// ---------------------------------------------------------------------------

function SeedDataTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/seed-data', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Seed failed');
      setResult(`${json.message} Categories: ${json.categoriesSeeded}`);
      showToast('Seed data loaded successfully', 'success');
    } catch (err: any) {
      setResult('Error: ' + (err.message ?? 'Unknown error'));
      showToast('Seed failed', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ContentErrorBoundary fallbackTitle="Seed Data failed to load">
      <div>
        <h3 className="text-lg font-semibold mb-4">Seed Data</h3>
        <p className="text-sm text-muted mb-6">
          Populate the condition library with the initial 7 categories and 60 conditions. This
          operation is idempotent — safe to re-run (existing records are preserved).
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-6 py-3 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {seeding ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Seeding...
            </>
          ) : (
            '🌱 Seed 7 Categories + 60 Conditions'
          )}
        </button>
        {result && (
          <div
            className={`mt-4 p-4 rounded-xl border text-sm ${result.startsWith('Error') ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300' : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'}`}
          >
            {result}
          </div>
        )}
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Knowledge Models Tab (Modal-based)
// ---------------------------------------------------------------------------

function KnowledgeModelsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [models, setModels] = useState<KnowledgeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formVersion, setFormVersion] = useState('1.0');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/knowledge-models');
      const json = await res.json();
      setModels(json.knowledge_models ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load knowledge models', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setFormVersion('1.0');
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (m: KnowledgeModel) => {
    setFormName(m.name);
    setFormDesc(m.description ?? '');
    setFormVersion(m.version);
    setEditingId(m.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formName.trim()) return;
    try {
      if (editingId) {
        await fetch('/api/admin/knowledge-models', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formName,
            description: formDesc || null,
            version: formVersion,
          }),
        });
      } else {
        await fetch('/api/admin/knowledge-models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formName,
            description: formDesc || null,
            version: formVersion,
          }),
        });
      }
      showToast(editingId ? 'Model updated' : 'Model created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await fetch('/api/admin/knowledge-models', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !models.find((m) => m.id === id)?.is_active }),
      });
      fetchData();
    } catch {
      showToast('Failed to update model', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/knowledge-models', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Model deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete model', 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <ContentErrorBoundary fallbackTitle="Knowledge Models failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Knowledge Models</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Model
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Name</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">Version</th>
                  <th className="text-center py-2.5 px-3 font-medium">Active</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">{m.name}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell max-w-xs truncate">
                      {m.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {m.version}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Toggle checked={m.is_active} onChange={() => handleToggleActive(m.id)} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(m)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(m.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No knowledge models yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Model' : 'New Knowledge Model'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Model name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Version</label>
              <input
                type="text"
                value={formVersion}
                onChange={(e) => setFormVersion(e.target.value)}
                placeholder="e.g. 1.0"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formName.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Model"
          message="Are you sure? This will also delete associated dimensions, prompts, and rules."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Evidence Dimensions Tab (Modal-based)
// ---------------------------------------------------------------------------

function EvidenceDimensionsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [dimensions, setDimensions] = useState<EvidenceDimension[]>([]);
  const [models, setModels] = useState<KnowledgeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModelId, setFilterModelId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterModelId
        ? `/api/admin/evidence-dimensions?knowledge_model_id=${filterModelId}`
        : '/api/admin/evidence-dimensions';
      const [res, modelRes] = await Promise.all([fetch(url), fetch('/api/admin/knowledge-models')]);
      setDimensions((await res.json()).evidence_dimensions ?? []);
      setModels((await modelRes.json()).knowledge_models ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterModelId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: EvidenceDimension) => {
    setFormValues({
      knowledge_model_id: item.knowledge_model_id,
      name: item.name,
      description: item.description ?? '',
      priority: item.priority,
      is_required: item.is_required,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!String(formValues.name ?? '').trim() || !formValues.knowledge_model_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      if (body.description === '') body.description = null;
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/evidence-dimensions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/evidence-dimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast(editingId ? 'Updated' : 'Created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch('/api/admin/evidence-dimensions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: confirmDelete }),
      });
      showToast('Deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const modelNameMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Evidence Dimensions failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Evidence Dimensions</h3>
          <button
            onClick={openCreate}
            disabled={models.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Dimension
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterModelId}
            onChange={(e) => setFilterModelId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All models</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Name</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">Model</th>
                  <th className="text-center py-2.5 px-3 font-medium">Priority</th>
                  <th className="text-center py-2.5 px-3 font-medium">Required</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dimensions.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">{d.name}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell">
                      {modelNameMap[d.knowledge_model_id] || d.knowledge_model_id}
                    </td>
                    <td className="py-2.5 px-3 text-center">{d.priority}</td>
                    <td className="py-2.5 px-3 text-center">{d.is_required ? '✓' : '—'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(d)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(d.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {dimensions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No evidence dimensions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Dimension' : 'New Evidence Dimension'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Knowledge Model <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.knowledge_model_id ?? '')}
                onChange={(e) =>
                  setFormValues({ ...formValues, knowledge_model_id: e.target.value })
                }
                disabled={!!editingId}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={String(formValues.name ?? '')}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="Dimension name"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                value={String(formValues.description ?? '')}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                placeholder="Optional"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Priority</label>
                <input
                  type="number"
                  value={String(formValues.priority ?? 0)}
                  onChange={(e) =>
                    setFormValues({ ...formValues, priority: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(formValues.is_required)}
                    onChange={(e) =>
                      setFormValues({ ...formValues, is_required: e.target.checked })
                    }
                    className="rounded border-border"
                  />
                  Required
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!String(formValues.name ?? '').trim() || !formValues.knowledge_model_id}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Dimension"
          message="Are you sure? This will also delete associated prompts and rules."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Prompts Tab (Modal-based)
// ---------------------------------------------------------------------------

function PromptsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [models, setModels] = useState<KnowledgeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModelId, setFilterModelId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterModelId
        ? `/api/admin/prompts?knowledge_model_id=${filterModelId}`
        : '/api/admin/prompts';
      const [res, modelRes] = await Promise.all([fetch(url), fetch('/api/admin/knowledge-models')]);
      setPrompts((await res.json()).prompts ?? []);
      setModels((await modelRes.json()).knowledge_models ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterModelId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: Prompt) => {
    setFormValues({
      knowledge_model_id: item.knowledge_model_id,
      prompt_key: item.prompt_key,
      prompt_text: item.prompt_text,
      response_type: item.response_type,
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (
      !String(formValues.prompt_key ?? '').trim() ||
      !String(formValues.prompt_text ?? '').trim() ||
      !formValues.knowledge_model_id
    )
      return;
    try {
      const body: Record<string, any> = { ...formValues };
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/prompts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast(editingId ? 'Updated' : 'Created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/admin/prompts?id=${confirmDelete}`, { method: 'DELETE' });
      showToast('Deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const modelNameMap = Object.fromEntries(models.map((m) => [m.id, m.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Prompts failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Prompts</h3>
          <button
            onClick={openCreate}
            disabled={models.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Prompt
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterModelId}
            onChange={(e) => setFilterModelId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All models</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Key</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">Model</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell">
                    Response Type
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">Order</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium max-w-xs truncate">{p.prompt_key}</td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell">
                      {modelNameMap[p.knowledge_model_id] || p.knowledge_model_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden lg:table-cell">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                        {p.response_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">{p.display_order}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(p.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {prompts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No prompts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Prompt' : 'New Prompt'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Knowledge Model <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.knowledge_model_id ?? '')}
                onChange={(e) =>
                  setFormValues({ ...formValues, knowledge_model_id: e.target.value })
                }
                disabled={!!editingId}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Prompt Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={String(formValues.prompt_key ?? '')}
                onChange={(e) => setFormValues({ ...formValues, prompt_key: e.target.value })}
                placeholder="e.g. opening_question"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Prompt Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={String(formValues.prompt_text ?? '')}
                onChange={(e) => setFormValues({ ...formValues, prompt_text: e.target.value })}
                placeholder="The actual prompt text"
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Response Type</label>
                <select
                  value={String(formValues.response_type ?? 'free_text')}
                  onChange={(e) => setFormValues({ ...formValues, response_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="free_text">Free Text</option>
                  <option value="scale">Scale</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="yes_no">Yes / No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={String(formValues.display_order ?? 0)}
                  onChange={(e) =>
                    setFormValues({ ...formValues, display_order: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !String(formValues.prompt_key ?? '').trim() ||
                !String(formValues.prompt_text ?? '').trim() ||
                !formValues.knowledge_model_id
              }
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Prompt"
          message="Are you sure? This will also delete associated branch rules."
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Branch Rules Tab (Modal-based)
// ---------------------------------------------------------------------------

function BranchRulesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [rules, setRules] = useState<BranchRule[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPromptId, setFilterPromptId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterPromptId
        ? `/api/admin/branch-rules?prompt_id=${filterPromptId}`
        : '/api/admin/branch-rules';
      const [res, promptRes] = await Promise.all([fetch(url), fetch('/api/admin/prompts')]);
      setRules((await res.json()).branch_rules ?? []);
      setPrompts((await promptRes.json()).prompts ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterPromptId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: BranchRule) => {
    setFormValues({
      prompt_id: item.prompt_id,
      condition_expression:
        typeof item.condition_expression === 'string'
          ? item.condition_expression
          : JSON.stringify(item.condition_expression),
      target_prompt_id: item.target_prompt_id,
      priority: item.priority,
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.prompt_id || !formValues.target_prompt_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      // Try to parse condition_expression as JSON, fall back to string
      try {
        body.condition_expression = JSON.parse(String(formValues.condition_expression));
      } catch {
        /* keep as string */
      }
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/branch-rules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/branch-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast(editingId ? 'Updated' : 'Created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/admin/branch-rules?id=${confirmDelete}`, { method: 'DELETE' });
      showToast('Deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const promptKeyMap = Object.fromEntries(prompts.map((p) => [p.id, p.prompt_key]));

  return (
    <ContentErrorBoundary fallbackTitle="Branch Rules failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Branch Rules</h3>
          <button
            onClick={openCreate}
            disabled={prompts.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Rule
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterPromptId}
            onChange={(e) => setFilterPromptId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All prompts</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.prompt_key}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Source Prompt</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell">
                    Target Prompt
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium hidden lg:table-cell max-w-xs">
                    Condition
                  </th>
                  <th className="text-center py-2.5 px-3 font-medium">Priority</th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">
                      {promptKeyMap[r.prompt_id] || r.prompt_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell">
                      {promptKeyMap[r.target_prompt_id] || r.target_prompt_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden lg:table-cell max-w-xs truncate">
                      {typeof r.condition_expression === 'string'
                        ? r.condition_expression
                        : JSON.stringify(r.condition_expression)}
                    </td>
                    <td className="py-2.5 px-3 text-center">{r.priority}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(r.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">
                      No branch rules yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Branch Rule' : 'New Branch Rule'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Source Prompt <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.prompt_id ?? '')}
                onChange={(e) => setFormValues({ ...formValues, prompt_id: e.target.value })}
                disabled={!!editingId}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select source prompt</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prompt_key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Target Prompt <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.target_prompt_id ?? '')}
                onChange={(e) => setFormValues({ ...formValues, target_prompt_id: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select target prompt</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.prompt_key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Condition Expression</label>
              <textarea
                value={String(formValues.condition_expression ?? '')}
                onChange={(e) =>
                  setFormValues({ ...formValues, condition_expression: e.target.value })
                }
                placeholder="JSON or string expression"
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <input
                type="number"
                value={String(formValues.priority ?? 0)}
                onChange={(e) => setFormValues({ ...formValues, priority: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formValues.prompt_id || !formValues.target_prompt_id}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Branch Rule"
          message="Are you sure you want to delete this rule?"
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Completion Rules Tab (Modal-based)
// ---------------------------------------------------------------------------

function CompletionRulesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [rules, setRules] = useState<CompletionRule[]>([]);
  const [dimensions, setDimensions] = useState<EvidenceDimension[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDimId, setFilterDimId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterDimId
        ? `/api/admin/completion-rules?evidence_dimension_id=${filterDimId}`
        : '/api/admin/completion-rules';
      const [res, dimRes] = await Promise.all([
        fetch(url),
        fetch('/api/admin/evidence-dimensions'),
      ]);
      setRules((await res.json()).completion_rules ?? []);
      setDimensions((await dimRes.json()).evidence_dimensions ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterDimId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: CompletionRule) => {
    setFormValues({
      evidence_dimension_id: item.evidence_dimension_id,
      rule_expression:
        typeof item.rule_expression === 'string'
          ? item.rule_expression
          : JSON.stringify(item.rule_expression),
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formValues.evidence_dimension_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      try {
        body.rule_expression = JSON.parse(String(formValues.rule_expression));
      } catch {
        /* keep as string */
      }
      if (editingId) {
        body.id = editingId;
        await fetch('/api/admin/completion-rules', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/completion-rules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      showToast(editingId ? 'Updated' : 'Created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/admin/completion-rules?id=${confirmDelete}`, { method: 'DELETE' });
      showToast('Deleted', 'success');
      fetchData();
    } catch {
      showToast('Failed to delete', 'error');
    }
    setConfirmDelete(null);
  };

  const dimNameMap = Object.fromEntries(dimensions.map((d) => [d.id, d.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Completion Rules failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Completion Rules</h3>
          <button
            onClick={openCreate}
            disabled={dimensions.length === 0}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Rule
          </button>
        </div>

        <div className="mb-3">
          <select
            value={filterDimId}
            onChange={(e) => setFilterDimId(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All dimensions</option>
            {dimensions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted bg-muted/3 dark:bg-navy-light/5">
                  <th className="text-left py-2.5 px-3 font-medium">Dimension</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden md:table-cell max-w-xs">
                    Rule Expression
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-medium">
                      {dimNameMap[r.evidence_dimension_id] || r.evidence_dimension_id}
                    </td>
                    <td className="py-2.5 px-3 text-muted hidden md:table-cell max-w-xs truncate font-mono text-xs">
                      {typeof r.rule_expression === 'string'
                        ? r.rule_expression
                        : JSON.stringify(r.rule_expression)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEdit(r)}
                        className="text-primary hover:underline text-xs mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(r.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rules.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted">
                      No completion rules yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Completion Rule' : 'New Completion Rule'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Evidence Dimension <span className="text-red-500">*</span>
              </label>
              <select
                value={String(formValues.evidence_dimension_id ?? '')}
                onChange={(e) =>
                  setFormValues({ ...formValues, evidence_dimension_id: e.target.value })
                }
                disabled={!!editingId}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              >
                <option value="">Select dimension</option>
                {dimensions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Rule Expression</label>
              <textarea
                value={String(formValues.rule_expression ?? '')}
                onChange={(e) => setFormValues({ ...formValues, rule_expression: e.target.value })}
                placeholder="JSON expression defining completion criteria"
                rows={4}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formValues.evidence_dimension_id}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={handleDelete}
          title="Delete Completion Rule"
          message="Are you sure you want to delete this rule?"
          confirmLabel="Delete"
        />
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Phase Templates Tab
// ---------------------------------------------------------------------------

function PhaseTemplatesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/phase-templates');
      setTemplates((await res.json()).phase_templates ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load phase templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormValues({
      id: item.id,
      phase_order: String(item.phase_order),
      phase_key: item.phase_key || '',
      name: item.name || '',
      description: item.description || '',
      client_script: item.client_script || '',
      practitioner_protocol: item.practitioner_protocol || '',
      transition_rule_description: item.transition_rule_description || '',
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const body: Record<string, any> = { ...formValues };
      if (body.phase_order) body.phase_order = parseInt(body.phase_order, 10);
      await fetch('/api/admin/phase-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast(editingId ? 'Phase template updated' : 'Phase template created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  return (
    <ContentErrorBoundary fallbackTitle="Phase Templates failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Phase Templates</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Phase Template
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
            <p className="text-muted dark:text-gray-400">No phase templates configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 dark:bg-navy-light">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Key</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Client Script</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t border-border dark:border-gray-700">
                    <td className="px-4 py-3">{t.phase_order}</td>
                    <td className="px-4 py-3 font-mono text-xs">{t.phase_key}</td>
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted dark:text-gray-400">
                      {t.client_script || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(t)}
                        className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Phase Template' : 'Add Phase Template'}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            {!editingId && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted dark:text-gray-400">
                    Phase Order
                  </label>
                  <input
                    type="number"
                    value={formValues.phase_order || ''}
                    onChange={(e) => setFormValues({ ...formValues, phase_order: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                    placeholder="1–8"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-muted dark:text-gray-400">
                    Phase Key
                  </label>
                  <input
                    type="text"
                    value={formValues.phase_key || ''}
                    onChange={(e) => setFormValues({ ...formValues, phase_key: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                    placeholder="e.g. conscious_regulatory_activation"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">Name</label>
              <input
                type="text"
                value={formValues.name || ''}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                placeholder="Phase display name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Description
              </label>
              <textarea
                value={formValues.description || ''}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Client Script (streamlined prompt)
              </label>
              <textarea
                value={formValues.client_script || ''}
                onChange={(e) => setFormValues({ ...formValues, client_script: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Practitioner Protocol (admin-only)
              </label>
              <textarea
                value={formValues.practitioner_protocol || ''}
                onChange={(e) =>
                  setFormValues({ ...formValues, practitioner_protocol: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Transition Rule Description
              </label>
              <textarea
                value={formValues.transition_rule_description || ''}
                onChange={(e) =>
                  setFormValues({ ...formValues, transition_rule_description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Functional Domains Tab
// ---------------------------------------------------------------------------

function FunctionalDomainsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/domain-protocols');
      setDomains((await res.json()).functional_domain_protocols ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load functional domains', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormValues({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      delivery_content:
        typeof item.delivery_content === 'string'
          ? item.delivery_content
          : JSON.stringify(item.delivery_content || {}),
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const body: Record<string, any> = { ...formValues };
      try {
        body.delivery_content = JSON.parse(String(formValues.delivery_content));
      } catch {
        body.delivery_content = {};
      }
      if (editingId) {
        body.id = editingId;
      }
      await fetch('/api/admin/domain-protocols', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast(editingId ? 'Domain updated' : 'Domain created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  return (
    <ContentErrorBoundary fallbackTitle="Functional Domains failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Functional Domain Protocols</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Domain
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : domains.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
            <p className="text-muted dark:text-gray-400">No functional domains configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 dark:bg-navy-light">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-center font-medium">Active</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d.id} className="border-t border-border dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted dark:text-gray-400">
                      {d.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${d.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}
                      >
                        {d.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(d)}
                        className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Functional Domain' : 'Add Functional Domain'}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">Name</label>
              <input
                type="text"
                value={formValues.name || ''}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                placeholder="e.g. Body Composition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Description
              </label>
              <textarea
                value={formValues.description || ''}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Delivery Content (JSON)
              </label>
              <textarea
                value={formValues.delivery_content || '{}'}
                onChange={(e) => setFormValues({ ...formValues, delivery_content: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono dark:bg-navy dark:text-white"
                placeholder='{"phase_key": {"client_script": "..."}}'
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// AEE Catalog Tab
// ---------------------------------------------------------------------------

function AeeCatalogTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/aee');
      setEntries((await res.json()).aee_entries ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load AEE entries', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormValues({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      resolution_prompts:
        typeof item.resolution_prompts === 'string'
          ? item.resolution_prompts
          : JSON.stringify(item.resolution_prompts || {}),
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const body: Record<string, any> = { ...formValues };
      try {
        body.resolution_prompts = JSON.parse(String(formValues.resolution_prompts));
      } catch {
        body.resolution_prompts = {};
      }
      if (editingId) body.id = editingId;
      await fetch('/api/admin/aee', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast(editingId ? 'AEE entry updated' : 'AEE entry created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  return (
    <ContentErrorBoundary fallbackTitle="AEE Catalog failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Archetypal Emotional Energetics</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add AEE Entry
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
            <p className="text-muted dark:text-gray-400">No AEE entries configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 dark:bg-navy-light">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-center font-medium">Active</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-border dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{e.name}</td>
                    <td className="px-4 py-3 max-w-xs truncate text-muted dark:text-gray-400">
                      {e.description || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${e.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}
                      >
                        {e.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(e)}
                        className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit AEE Entry' : 'Add AEE Entry'}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">Name</label>
              <input
                type="text"
                value={formValues.name || ''}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                placeholder="e.g. Grief / Loss"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Description
              </label>
              <textarea
                value={formValues.description || ''}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Resolution Prompts (JSON)
              </label>
              <textarea
                value={formValues.resolution_prompts || '{}'}
                onChange={(e) =>
                  setFormValues({ ...formValues, resolution_prompts: e.target.value })
                }
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono dark:bg-navy dark:text-white"
                placeholder='{"resolution_intro": "...", "resolution_prompts": [...]}'
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Personal Programs Tab
// ---------------------------------------------------------------------------

function PersonalProgramsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [progRes, domRes] = await Promise.all([
        fetch('/api/admin/personal-programs'),
        fetch('/api/admin/domain-protocols'),
      ]);
      setPrograms((await progRes.json()).personal_programs ?? []);
      setDomains((await domRes.json()).functional_domain_protocols ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load personal programs', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setFormValues({});
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormValues({
      id: item.id,
      name: item.name || '',
      description: item.description || '',
      functional_domain_id: item.functional_domain_id || '',
      delivery_content:
        typeof item.delivery_content === 'string'
          ? item.delivery_content
          : JSON.stringify(item.delivery_content || {}),
    });
    setEditingId(item.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const body: Record<string, any> = { ...formValues };
      if (!body.functional_domain_id) delete body.functional_domain_id;
      try {
        body.delivery_content = JSON.parse(String(formValues.delivery_content));
      } catch {
        body.delivery_content = {};
      }
      if (editingId) body.id = editingId;
      await fetch('/api/admin/personal-programs', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      showToast(editingId ? 'Program updated' : 'Program created', 'success');
      setModalOpen(false);
      fetchData();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const domainNameMap = Object.fromEntries(domains.map((d) => [d.id, d.name]));

  return (
    <ContentErrorBoundary fallbackTitle="Personal Programs failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Personal Implementation Programs</h3>
          <button
            onClick={openCreate}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Program
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : programs.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
            <p className="text-muted dark:text-gray-400">No personal programs configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 dark:bg-navy-light">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Functional Domain</th>
                  <th className="px-4 py-3 text-center font-medium">Active</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {programs.map((p) => (
                  <tr key={p.id} className="border-t border-border dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted dark:text-gray-400">
                      {domainNameMap[p.functional_domain_id] || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-2 py-1 text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? 'Edit Personal Program' : 'Add Personal Program'}
          size="lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">Name</label>
              <input
                type="text"
                value={formValues.name || ''}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
                placeholder="Program name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Description
              </label>
              <textarea
                value={formValues.description || ''}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Functional Domain (optional)
              </label>
              <select
                value={formValues.functional_domain_id || ''}
                onChange={(e) =>
                  setFormValues({ ...formValues, functional_domain_id: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm dark:bg-navy dark:text-white"
              >
                <option value="">None</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted dark:text-gray-400">
                Delivery Content (JSON)
              </label>
              <textarea
                value={formValues.delivery_content || '{}'}
                onChange={(e) => setFormValues({ ...formValues, delivery_content: e.target.value })}
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono dark:bg-navy dark:text-white"
              />
            </div>
            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Therapeutic Engines (Active Sessions) Tab
// ---------------------------------------------------------------------------

function TherapeuticEnginesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [engines, setEngines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/therapeutic-engines');
      setEngines((await res.json()).therapeutic_engines ?? []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load therapeutic engines', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'running':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <ContentErrorBoundary fallbackTitle="Active Sessions failed to load">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Active Therapeutic Sessions</h3>
          <button
            onClick={fetchData}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted hover:text-foreground transition-colors dark:border-gray-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : engines.length === 0 ? (
          <div className="rounded-xl border border-border bg-background p-8 text-center dark:bg-navy">
            <p className="text-muted dark:text-gray-400">No therapeutic engine sessions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 dark:bg-navy-light">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">User ID</th>
                  <th className="px-4 py-3 text-left font-medium">Current Phase</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Started</th>
                </tr>
              </thead>
              <tbody>
                {engines.map((e) => (
                  <tr key={e.id} className="border-t border-border dark:border-gray-700">
                    <td className="px-4 py-3 font-mono text-xs">{e.user_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">Phase {e.current_phase_order}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(e.status)}`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-gray-400">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ContentErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Find current group label for display
  const currentGroupLabel = SIDEBAR_GROUPS.find((g) =>
    g.items.some((i) => i.key === activeTab)
  )?.label;

  return (
    <div className="w-full flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <AdminSidebar
        groups={SIDEBAR_GROUPS}
        activeKey={activeTab}
        onNavigate={(key) => setActiveTab(key as TabKey)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header with toggle (mobile) and breadcrumb */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-muted/5 transition-colors lg:hidden"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <nav className="text-sm text-muted">
            <span>Content</span>
            {currentGroupLabel && (
              <>
                <span className="mx-1">/</span>
                <span>{currentGroupLabel}</span>
              </>
            )}
            <span className="mx-1">/</span>
            <span className="font-medium text-foreground">{TAB_LABELS[activeTab]}</span>
          </nav>
        </div>

        {/* Render active tab */}
        <div className="mt-4">
          {activeTab === 'categories' && <CategoriesTab showToast={showToast} />}
          {activeTab === 'conditions' && <ConditionsTab showToast={showToast} />}
          {activeTab === 'symptoms' && (
            <ChildResourceTab
              title="Symptoms"
              endpoint="/api/admin/symptoms"
              dataKey="symptoms"
              nameField="symptom_name"
              namePlaceholder="Symptom name"
              showToast={showToast}
            />
          )}
          {activeTab === 'assessments' && (
            <ChildResourceTab
              title="Assessment Questions"
              endpoint="/api/admin/assessment-questions"
              dataKey="questions"
              nameField="question_text"
              namePlaceholder="Question text"
              extraFields={[
                { key: 'scale_type', label: 'Scale Type', placeholder: 'e.g. 0-10' },
                { key: 'minimum_value', label: 'Min Value', type: 'number', placeholder: '0' },
                { key: 'maximum_value', label: 'Max Value', type: 'number', placeholder: '10' },
              ]}
              showToast={showToast}
            />
          )}
          {activeTab === 'metrics' && (
            <ChildResourceTab
              title="Progress Metrics"
              endpoint="/api/admin/progress-metrics"
              dataKey="metrics"
              nameField="metric_name"
              namePlaceholder="Metric name"
              extraFields={[
                {
                  key: 'metric_description',
                  label: 'Description',
                  type: 'textarea',
                  placeholder: 'What does this measure?',
                },
                { key: 'scale_type', label: 'Scale Type', placeholder: 'e.g. 0-10' },
                { key: 'minimum_value', label: 'Min Value', type: 'number', placeholder: '0' },
                { key: 'maximum_value', label: 'Max Value', type: 'number', placeholder: '10' },
              ]}
              showToast={showToast}
            />
          )}
          {activeTab === 'mappings' && <QHRTMappingsTab showToast={showToast} />}
          {activeTab === 'sessions' && <SessionAssignmentsTab showToast={showToast} />}
          {activeTab === 'seed' && <SeedDataTab showToast={showToast} />}
          {activeTab === 'knowledge-models' && <KnowledgeModelsTab showToast={showToast} />}
          {activeTab === 'evidence-dimensions' && <EvidenceDimensionsTab showToast={showToast} />}
          {activeTab === 'prompts' && <PromptsTab showToast={showToast} />}
          {activeTab === 'branch-rules' && <BranchRulesTab showToast={showToast} />}
          {activeTab === 'completion-rules' && <CompletionRulesTab showToast={showToast} />}
          {activeTab === 'phase-templates' && <PhaseTemplatesTab showToast={showToast} />}
          {activeTab === 'functional-domains' && <FunctionalDomainsTab showToast={showToast} />}
          {activeTab === 'aee-catalog' && <AeeCatalogTab showToast={showToast} />}
          {activeTab === 'personal-programs' && <PersonalProgramsTab showToast={showToast} />}
          {activeTab === 'therapeutic-engines' && <TherapeuticEnginesTab showToast={showToast} />}
        </div>

        {/* Toast */}
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </main>
    </div>
  );
}
