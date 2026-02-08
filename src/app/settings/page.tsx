'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { CURRENCY_OPTIONS, MONTH_NAMES, DEFAULT_SETTINGS } from '@/types/settings';
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Loader2,
  Calendar,
  Wallet,
  Target,
  DollarSign,
  Settings as SettingsIcon,
  CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    settings,
    updateSettings,
    saveSettings,
    resetToDefaults,
    isLoading,
    isSaving,
    hasUnsavedChanges
  } = useSettings();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    router.push('/');
    return null;
  }

  const handleSave = async () => {
    try {
      await saveSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default values?')) {
      resetToDefaults();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <SettingsIcon size={20} className="text-primary-500" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Settings
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                <span className="hidden sm:inline">Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  hasUnsavedChanges
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Customize your expense tracker settings. Changes will apply to your data calculations.
          </p>
        </div>

        {/* Currency Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Currency</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CURRENCY_OPTIONS.map((currency) => (
              <button
                key={currency.code}
                onClick={() => updateSettings({
                  currencySymbol: currency.symbol,
                  currencyCode: currency.code
                })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  settings.currencyCode === currency.code
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="text-xl font-bold text-gray-900 dark:text-white">{currency.symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{currency.code}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Period Configuration */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Period Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period 1 Name
                </label>
                <input
                  type="text"
                  value={settings.period1Name}
                  onChange={(e) => updateSettings({ period1Name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., First 6 Months, Year 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period 2 Name
                </label>
                <input
                  type="text"
                  value={settings.period2Name}
                  onChange={(e) => updateSettings({ period2Name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Next 6 Months, Year 2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Months per Period
                </label>
                <select
                  value={settings.monthsPerPeriod}
                  onChange={(e) => updateSettings({ monthsPerPeriod: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Month
                </label>
                <select
                  value={settings.startMonth}
                  onChange={(e) => updateSettings({ startMonth: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {MONTH_NAMES.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  value={settings.startYear}
                  onChange={(e) => updateSettings({ startYear: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min={2020}
                  max={2100}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Income Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Income</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {settings.period1Name} Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.period1Salary}
                  onChange={(e) => updateSettings({ period1Salary: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {settings.period2Name} Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.period2Salary}
                  onChange={(e) => updateSettings({ period2Salary: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Savings Targets */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Targets</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fixed Expenses
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.fixedExpenses}
                  onChange={(e) => updateSettings({ fixedExpenses: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Rent, bills, etc.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Long-term Savings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.longTermSavingsTarget}
                  onChange={(e) => updateSettings({ longTermSavingsTarget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Monthly target</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Short-term Savings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.shortTermSavingsTarget}
                  onChange={(e) => updateSettings({ shortTermSavingsTarget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Monthly target</p>
            </div>
          </div>
        </section>

        {/* Goal Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Annual Goal</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Extra savings goal for special expenses like trips, phone, moving costs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={settings.goalName}
                onChange={(e) => updateSettings({ goalName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Annual Goal, Trip Fund"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{settings.currencySymbol}</span>
                <input
                  type="number"
                  value={settings.goalTarget}
                  onChange={(e) => updateSettings({ goalTarget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Summary Preview */}
        <section className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-5 sm:p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="opacity-75">Monthly Income:</span>
              <p className="font-semibold">{settings.currencySymbol}{settings.period1Salary.toLocaleString()}</p>
            </div>
            <div>
              <span className="opacity-75">Total Savings Target:</span>
              <p className="font-semibold">{settings.currencySymbol}{(settings.longTermSavingsTarget + settings.shortTermSavingsTarget).toLocaleString()}/mo</p>
            </div>
            <div>
              <span className="opacity-75">After Expenses:</span>
              <p className="font-semibold">{settings.currencySymbol}{(settings.period1Salary - settings.fixedExpenses).toLocaleString()}</p>
            </div>
            <div>
              <span className="opacity-75">Annual Goal:</span>
              <p className="font-semibold">{settings.currencySymbol}{settings.goalTarget.toLocaleString()}</p>
            </div>
          </div>
        </section>

        {/* Footer padding */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
