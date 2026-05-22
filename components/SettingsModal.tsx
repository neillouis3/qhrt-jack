'use client';

import Modal from './Modal';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Profile Section */}
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Profile
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
            Appearance
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Dark Mode</span>
              <button
                type="button"
                className="relative w-11 h-6 rounded-full bg-zinc-200 dark:bg-indigo-600 transition-colors"
                role="switch"
                aria-checked="false"
              >
                <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform dark:translate-x-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
