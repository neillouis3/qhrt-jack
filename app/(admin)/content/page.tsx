/**
 * Admin Content Management - Condition Library Hub
 * Tabbed interface for managing categories, conditions, symptoms,
 * assessments, progress metrics, QHRT mappings, session assignments, and seed data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/Modal';

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
  condition_categories?: { id: string; name: string };
}

interface Symptom {
  id: string;
  condition_id: string;
  symptom_name: string;
  display_order: number;
  is_active: boolean;
  conditions?: { id: string; name: string };
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
  conditions?: { id: string; name: string };
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
  conditions?: { id: string; name: string };
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
  conditions?: { id: string; name: string };
}

interface SessionAssignment {
  id: string;
  condition_id: string;
  session_id: string;
  session_number: number;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  conditions?: { id: string; name: string };
}

type TabKey =
  | 'categories'
  | 'conditions'
  | 'symptoms'
  | 'assessments'
  | 'metrics'
  | 'mappings'
  | 'sessions'
  | 'seed';

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
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 ${
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
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
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
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-${checked ? '4' : '0'}`}
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0px)' }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Categories Tab
// ---------------------------------------------------------------------------

function CategoriesTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrder, setFormOrder] = useState(0);

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

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormOrder(categories.length);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (cat: Category) => {
    setFormName(cat.name);
    setFormDesc(cat.description ?? '');
    setFormOrder(cat.display_order);
    setEditingId(cat.id);
    setShowForm(true);
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
        showToast('Category updated', 'success');
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
        showToast('Category created', 'success');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });
      fetchCategories();
    } catch (err) {
      showToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Condition Categories</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
        >
          + Add Category
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-background dark:bg-navy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Category name *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Description"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Order"
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                className="w-24 px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={resetForm}
                className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left py-2 px-3">Order</th>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3 hidden md:table-cell">Description</th>
                <th className="text-center py-2 px-3">Active</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                >
                  <td className="py-2 px-3 text-muted">{cat.display_order}</td>
                  <td className="py-2 px-3 font-medium">{cat.name}</td>
                  <td className="py-2 px-3 text-muted hidden md:table-cell max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Toggle
                      checked={cat.is_active}
                      onChange={(v) => handleToggleActive(cat.id, cat.is_active)}
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-primary hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conditions Tab
// ---------------------------------------------------------------------------

function ConditionsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formOrder, setFormOrder] = useState(0);

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

  const resetForm = () => {
    setFormName('');
    setFormCategoryId('');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormFeatured(false);
    setFormOrder(conditions.length);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (c: Condition) => {
    setFormName(c.name);
    setFormCategoryId(c.category_id);
    setFormShortDesc(c.short_description ?? '');
    setFormFullDesc(c.full_description ?? '');
    setFormFeatured(c.is_featured);
    setFormOrder(c.display_order);
    setEditingId(c.id);
    setShowForm(true);
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
        showToast('Condition updated', 'success');
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
        showToast('Condition created', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/conditions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !current }),
      });
      fetchData();
    } catch (err) {
      showToast('Failed to update condition', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/conditions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Condition deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete condition', 'error');
    }
  };

  const catNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Conditions</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={categories.length === 0}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          + Add Condition
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-background dark:bg-navy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Condition name *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select category *</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Short description"
              value={formShortDesc}
              onChange={(e) => setFormShortDesc(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <textarea
              placeholder="Full description"
              value={formFullDesc}
              onChange={(e) => setFormFullDesc(e.target.value)}
              rows={2}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formFeatured}
                onChange={(e) => setFormFeatured(e.target.checked)}
                className="rounded border-border"
              />
              Featured
            </label>
            <input
              type="number"
              placeholder="Order"
              value={formOrder}
              onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left py-2 px-3">Order</th>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3 hidden md:table-cell">Category</th>
                <th className="text-center py-2 px-3">Featured</th>
                <th className="text-center py-2 px-3">Active</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                >
                  <td className="py-2 px-3 text-muted">{c.display_order}</td>
                  <td className="py-2 px-3 font-medium">{c.name}</td>
                  <td className="py-2 px-3 text-muted hidden md:table-cell">
                    {catNameMap[c.category_id] || c.category_id}
                  </td>
                  <td className="py-2 px-3 text-center">{c.is_featured ? '⭐' : '—'}</td>
                  <td className="py-2 px-3 text-center">
                    <Toggle
                      checked={c.is_active}
                      onChange={(v) => handleToggleActive(c.id, c.is_active)}
                    />
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleEdit(c)}
                      className="text-primary hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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
                    No conditions yet. Use the seed button below or add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic child-resource tab (symptoms, assessments, metrics)
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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId ? `${endpoint}?conditionId=${filterConditionId}` : endpoint;
      const [res, condRes] = await Promise.all([fetch(url), fetch('/api/admin/conditions')]);
      setItems((await res.json())[dataKey] ?? []);
      setConditions((await condRes.json()).conditions ?? []);
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

  const resetForm = () => {
    setFormValues({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: any) => {
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
    setShowForm(true);
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
        showToast('Updated', 'success');
      } else {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        showToast('Created', 'success');
      }
      resetForm();
      fetchData();
    } catch (err) {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  const formFields = [
    { key: nameField, label: 'Name', type: 'text' as const, placeholder: namePlaceholder },
    ...(extraFields ?? []),
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={conditions.length === 0}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          + Add {title.slice(-1) === 's' ? title.slice(0, -1) : title}
        </button>
      </div>

      {/* Filter by condition */}
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

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-background dark:bg-navy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={String(formValues.condition_id ?? '')}
              onChange={(e) => setFormValues({ ...formValues, condition_id: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select condition *</option>
              {conditions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formFields
              .filter((f) => f.key !== 'condition_id')
              .map((f) =>
                f.type === 'textarea' ? (
                  <textarea
                    key={f.key}
                    placeholder={f.placeholder || f.label}
                    value={String(formValues[f.key] ?? '')}
                    onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                    rows={2}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <input
                    key={f.key}
                    type={f.type || 'text'}
                    placeholder={f.placeholder || f.label}
                    value={String(formValues[f.key] ?? '')}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                      })
                    }
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                )
              )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3 hidden md:table-cell">Condition</th>
                {extraFields
                  ?.filter((f) => f.key !== 'condition_id')
                  .map((f) => (
                    <th key={f.key} className="text-left py-2 px-3 hidden lg:table-cell">
                      {f.label}
                    </th>
                  ))}
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr
                  key={item.id}
                  className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                >
                  <td className="py-2 px-3 font-medium max-w-xs truncate">{item[nameField]}</td>
                  <td className="py-2 px-3 text-muted hidden md:table-cell">
                    {condNameMap[item.condition_id] || item.condition_id}
                  </td>
                  {extraFields
                    ?.filter((f) => f.key !== 'condition_id')
                    .map((f) => (
                      <td
                        key={f.key}
                        className="py-2 px-3 text-muted hidden lg:table-cell max-w-xs truncate"
                      >
                        {String(item[f.key] ?? '')}
                      </td>
                    ))}
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-primary hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted">
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QHRT Mappings Tab
// ---------------------------------------------------------------------------

function QHRTMappingsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [mappings, setMappings] = useState<QHRTMapping[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConditionId, setFilterConditionId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId
        ? `/api/admin/qhrt-mappings?conditionId=${filterConditionId}`
        : '/api/admin/qhrt-mappings';
      const [res, condRes] = await Promise.all([fetch(url), fetch('/api/admin/conditions')]);
      setMappings((await res.json()).mappings ?? []);
      setConditions((await condRes.json()).conditions ?? []);
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

  const handleEdit = (m: QHRTMapping) => {
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
  };

  const handleCreateForCondition = (conditionId: string) => {
    // Check if mapping already exists
    const existing = mappings.find((m) => m.condition_id === conditionId);
    if (existing) {
      handleEdit(existing);
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
  };

  const handleSubmit = async () => {
    if (!formValues.condition_id) return;
    try {
      const body: Record<string, any> = { ...formValues };
      // Clear empty strings to null
      for (const key of Object.keys(body)) {
        if (body[key] === '') (body as Record<string, any>)[key] = null;
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
      setFormValues({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      showToast('Failed to save mapping', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/qhrt-mappings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Mapping deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete mapping', 'error');
    }
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">QHRT Mappings</h3>
      <p className="text-sm text-muted mb-4">
        Internal clinical framework data — not visible to users.
      </p>

      {/* Condition selector */}
      <div className="mb-4">
        <select
          value={filterConditionId}
          onChange={(e) => setFilterConditionId(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50 mr-3"
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
            if (e.target.value) handleCreateForCondition(e.target.value);
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

      {/* Edit form */}
      {Object.keys(formValues).length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-background dark:bg-navy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Primary emotional theme"
              value={formValues.primary_emotional_theme ?? ''}
              onChange={(e) =>
                setFormValues({ ...formValues, primary_emotional_theme: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Secondary emotional theme"
              value={formValues.secondary_emotional_theme ?? ''}
              onChange={(e) =>
                setFormValues({ ...formValues, secondary_emotional_theme: e.target.value })
              }
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Organ system"
              value={formValues.organ_system ?? ''}
              onChange={(e) => setFormValues({ ...formValues, organ_system: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Gland system"
              value={formValues.gland_system ?? ''}
              onChange={(e) => setFormValues({ ...formValues, gland_system: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="QHRT focus"
              value={formValues.qhrt_focus ?? ''}
              onChange={(e) => setFormValues({ ...formValues, qhrt_focus: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <textarea
              placeholder="Internal notes"
              value={formValues.internal_notes ?? ''}
              onChange={(e) => setFormValues({ ...formValues, internal_notes: e.target.value })}
              rows={2}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={() => {
                setFormValues({});
                setEditingId(null);
              }}
              className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left py-2 px-3">Condition</th>
                <th className="text-left py-2 px-3 hidden md:table-cell">Primary Theme</th>
                <th className="text-left py-2 px-3 hidden lg:table-cell">Organ System</th>
                <th className="text-left py-2 px-3 hidden lg:table-cell">QHRT Focus</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                >
                  <td className="py-2 px-3 font-medium">
                    {condNameMap[m.condition_id] || m.condition_id}
                  </td>
                  <td className="py-2 px-3 text-muted hidden md:table-cell max-w-xs truncate">
                    {m.primary_emotional_theme || '—'}
                  </td>
                  <td className="py-2 px-3 text-muted hidden lg:table-cell max-w-xs truncate">
                    {m.organ_system || '—'}
                  </td>
                  <td className="py-2 px-3 text-muted hidden lg:table-cell max-w-xs truncate">
                    {m.qhrt_focus || '—'}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleEdit(m)}
                      className="text-primary hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session Assignments Tab
// ---------------------------------------------------------------------------

function SessionAssignmentsTab({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [assignments, setAssignments] = useState<SessionAssignment[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConditionId, setFilterConditionId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number | boolean>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterConditionId
        ? `/api/admin/session-assignments?conditionId=${filterConditionId}`
        : '/api/admin/session-assignments';
      const [res, condRes] = await Promise.all([fetch(url), fetch('/api/admin/conditions')]);
      setAssignments((await res.json()).assignments ?? []);
      setConditions((await condRes.json()).conditions ?? []);
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

  const resetForm = () => {
    setFormValues({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: SessionAssignment) => {
    setFormValues({
      condition_id: item.condition_id,
      session_id: item.session_id,
      session_number: item.session_number,
      is_required: item.is_required,
      display_order: item.display_order,
    });
    setEditingId(item.id);
    setShowForm(true);
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
      resetForm();
      fetchData();
    } catch (err) {
      showToast('Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/admin/session-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      showToast('Assignment deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const condNameMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Session Assignments</h3>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          disabled={conditions.length === 0}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          + Add Assignment
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

      {showForm && (
        <div className="mb-4 p-4 rounded-xl border border-border bg-background dark:bg-navy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <select
              value={String(formValues.condition_id ?? '')}
              onChange={(e) => setFormValues({ ...formValues, condition_id: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select condition *</option>
              {conditions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Session ID *"
              value={String(formValues.session_id ?? '')}
              onChange={(e) => setFormValues({ ...formValues, session_id: e.target.value })}
              className="px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Session #"
                value={String(formValues.session_number ?? 0)}
                onChange={(e) =>
                  setFormValues({ ...formValues, session_number: Number(e.target.value) })
                }
                className="w-24 px-3 py-2 text-sm rounded-lg border border-border bg-background dark:bg-navy dark:border-navy focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(formValues.is_required)}
                  onChange={(e) => setFormValues({ ...formValues, is_required: e.target.checked })}
                  className="rounded border-border"
                />
                Required
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={resetForm}
              className="px-3 py-2 text-sm rounded-lg border border-border hover:bg-muted/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left py-2 px-3">Condition</th>
                <th className="text-left py-2 px-3">Session ID</th>
                <th className="text-center py-2 px-3">#</th>
                <th className="text-center py-2 px-3">Required</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border/50 hover:bg-muted/3 transition-colors"
                >
                  <td className="py-2 px-3 font-medium">
                    {condNameMap[a.condition_id] || a.condition_id}
                  </td>
                  <td className="py-2 px-3 text-muted">{a.session_id}</td>
                  <td className="py-2 px-3 text-center">{a.session_number}</td>
                  <td className="py-2 px-3 text-center">{a.is_required ? '✓' : '—'}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleEdit(a)}
                      className="text-primary hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
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
    </div>
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
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'categories', label: 'Categories' },
  { key: 'conditions', label: 'Conditions' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'metrics', label: 'Progress Metrics' },
  { key: 'mappings', label: 'QHRT Mappings' },
  { key: 'sessions', label: 'Session Assignments' },
  { key: 'seed', label: 'Seed Data' },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('categories');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  return (
    <div className="w-full p-6">
      <h2 className="text-xl font-bold mb-1">Condition Library</h2>
      <p className="text-sm text-muted mb-5">
        Manage categories, conditions, symptoms, assessments, and more.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto border-b border-border pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary/10 text-primary border-b-2 border-primary'
                : 'text-muted hover:text-foreground hover:bg-muted/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
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
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
