'use client';

import { Moon, Sun, Download, Cloud, CloudOff, Loader2, Check, Save } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onExport: () => void;
  onSave: () => void;
  useDatabase?: boolean;
  isSaving?: boolean;
  lastSaved?: Date | null;
  error?: string | null;
  hasUnsavedChanges?: boolean;
}

export default function Header({
  darkMode,
  onToggleDarkMode,
  onExport,
  onSave,
  useDatabase = false,
  isSaving = false,
  lastSaved = null,
  error = null,
  hasUnsavedChanges = false,
}: HeaderProps) {
  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">¥</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Expense Calculator
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Track your salary, savings & expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
              {useDatabase ? (
                <>
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="text-blue-500 animate-spin" />
                      <span className="text-xs text-blue-500">Saving...</span>
                    </>
                  ) : error ? (
                    <>
                      <CloudOff size={14} className="text-amber-500" />
                      <span className="text-xs text-amber-500">Local only</span>
                    </>
                  ) : lastSaved ? (
                    <>
                      <Cloud size={14} className="text-emerald-500" />
                      <span className="text-xs text-emerald-500">{formatLastSaved(lastSaved)}</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Cloud</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Check size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Local</span>
                </>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={onSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'bg-primary-500 hover:bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
              </span>
            </button>

            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
