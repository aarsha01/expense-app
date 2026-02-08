'use client';

import { useEffect, useState } from 'react';
import { MonthData } from '@/types';
import {
  calculatePeriodMonths,
  exportToCSV,
} from '@/utils/calculations';
import { useExpenseData } from '@/hooks/useExpenseData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import Header from '@/components/Header';
import MonthCard from '@/components/MonthCard';
import PeriodSummary from '@/components/PeriodSummary';
import SavingsChart from '@/components/SavingsChart';
import GoalsPanel from '@/components/GoalsPanel';
import CurrentMonthSummary from '@/components/CurrentMonthSummary';
import AuthForm from '@/components/AuthForm';
import { Loader2 } from 'lucide-react';

const CURRENT_MONTH = new Date().getMonth(); // 0-indexed current month

type TabType = 'period1' | 'period2' | 'goals';

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { settings, isLoading: settingsLoading } = useSettings();

  // Use the expense data hook with authenticated user ID
  const {
    period1Months,
    period2Months,
    isLoading,
    isSaving,
    error,
    lastSaved,
    useDatabase,
    hasUnsavedChanges,
    setPeriod1Months,
    setPeriod2Months,
    saveData,
  } = useExpenseData(user?.id);

  // Dark mode
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('expense-darkmode', false);

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('period1');

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show auth loading state
  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // Calculate months with carryover
  const calculatedPeriod1 = calculatePeriodMonths(period1Months);
  const calculatedPeriod2WithCarryover = calculatePeriodMonths([
    {
      ...period2Months[0],
      carryoverFromPrevious: calculatedPeriod1[calculatedPeriod1.length - 1]?.carryoverToNext || 0,
    },
    ...period2Months.slice(1),
  ]);

  // Find current month in the data
  const getCurrentMonthData = () => {
    const period1StartMonth = settings.startMonth;
    const period1EndMonth = settings.startMonth + settings.monthsPerPeriod - 1;

    if (CURRENT_MONTH >= period1StartMonth && CURRENT_MONTH <= period1EndMonth) {
      const idx = CURRENT_MONTH - period1StartMonth;
      return { month: calculatedPeriod1[idx], period: 1 };
    } else if (CURRENT_MONTH > period1EndMonth || CURRENT_MONTH === 0) {
      let idx;
      if (CURRENT_MONTH === 0) {
        idx = 5;
      } else {
        idx = CURRENT_MONTH - (period1EndMonth + 1);
      }
      if (idx >= 0 && idx < calculatedPeriod2WithCarryover.length) {
        return { month: calculatedPeriod2WithCarryover[idx], period: 2 };
      }
    }
    return { month: calculatedPeriod1[0], period: 1 };
  };

  const currentMonthData = getCurrentMonthData();

  // Update a specific month in period 1
  const updatePeriod1Month = (index: number, updates: Partial<MonthData>) => {
    setPeriod1Months((prev) => {
      const newMonths = [...prev];
      newMonths[index] = { ...newMonths[index], ...updates };
      return newMonths;
    });
  };

  // Update a specific month in period 2
  const updatePeriod2Month = (index: number, updates: Partial<MonthData>) => {
    setPeriod2Months((prev) => {
      const newMonths = [...prev];
      newMonths[index] = { ...newMonths[index], ...updates };
      return newMonths;
    });
  };

  // Export to CSV
  const handleExport = () => {
    const csvContent = exportToCSV(calculatedPeriod1, calculatedPeriod2WithCarryover);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expense-tracker-${settings.startYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Calculate total goal contribution for badge
  const totalGoalContribution = [...calculatedPeriod1, ...calculatedPeriod2WithCarryover]
    .reduce((sum, m) => sum + m.goalContribution, 0);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onExport={handleExport}
        onSave={saveData}
        onSignOut={signOut}
        userEmail={user.email}
        useDatabase={useDatabase}
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={error}
        hasUnsavedChanges={hasUnsavedChanges}
        currencySymbol={settings.currencySymbol}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {/* Tab indicator */}
            <div
              className={`absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-lg shadow-sm transition-all duration-300 ease-out ${
                activeTab === 'period1'
                  ? 'left-1 w-[calc(33.333%-5px)]'
                  : activeTab === 'period2'
                  ? 'left-[calc(33.333%+1px)] w-[calc(33.333%-2px)]'
                  : 'left-[calc(66.666%+2px)] w-[calc(33.333%-5px)]'
              }`}
            />

            <button
              onClick={() => setActiveTab('period1')}
              className={`relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'period1'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm sm:text-base font-semibold">{settings.period1Name}</span>
                <span className="text-xs opacity-75 hidden sm:block">
                  {settings.currencySymbol}{settings.period1Salary.toLocaleString()}/mo
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('period2')}
              className={`relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'period2'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm sm:text-base font-semibold">{settings.period2Name}</span>
                <span className="text-xs opacity-75 hidden sm:block">
                  {settings.currencySymbol}{settings.period2Salary.toLocaleString()}/mo
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'goals'
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold">Goals</span>
                  {totalGoalContribution > 0 && (
                    <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {Math.round((totalGoalContribution / settings.goalTarget) * 100)}%
                    </span>
                  )}
                </div>
                <span className="text-xs opacity-75 hidden sm:block">
                  {settings.currencySymbol}{settings.goalTarget.toLocaleString()}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Period 1 Content */}
        {activeTab === 'period1' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Current Month Summary */}
            {currentMonthData.period === 1 && (
              <CurrentMonthSummary month={currentMonthData.month} />
            )}

            {/* Summary */}
            <PeriodSummary
              months={calculatedPeriod1}
              periodName={settings.period1Name}
              salary={settings.period1Salary}
              currencySymbol={settings.currencySymbol}
            />

            {/* Chart */}
            <SavingsChart
              months={calculatedPeriod1}
              title="Monthly Savings Breakdown"
            />

            {/* Month Cards */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Monthly Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {calculatedPeriod1.map((month, index) => (
                  <MonthCard
                    key={month.id}
                    month={month}
                    onUpdate={(updates) => updatePeriod1Month(index, updates)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Period 2 Content */}
        {activeTab === 'period2' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Current Month Summary */}
            {currentMonthData.period === 2 && (
              <CurrentMonthSummary month={currentMonthData.month} />
            )}

            {/* Carryover notice */}
            {calculatedPeriod1[calculatedPeriod1.length - 1]?.carryoverToNext > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Carryover from Period 1:</span>{' '}
                  ¥{calculatedPeriod1[calculatedPeriod1.length - 1].carryoverToNext.toLocaleString()}
                  has been added to August.
                </p>
              </div>
            )}

            {/* Salary Change Notice */}
            {settings.period1Salary !== settings.period2Salary && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-medium">Note:</span> Monthly salary changes to {settings.currencySymbol}{settings.period2Salary.toLocaleString()} (from {settings.currencySymbol}{settings.period1Salary.toLocaleString()}) in this period.
                </p>
              </div>
            )}

            {/* Summary */}
            <PeriodSummary
              months={calculatedPeriod2WithCarryover}
              periodName={settings.period2Name}
              salary={settings.period2Salary}
              currencySymbol={settings.currencySymbol}
            />

            {/* Chart */}
            <SavingsChart
              months={calculatedPeriod2WithCarryover}
              title="Monthly Savings Breakdown"
            />

            {/* Month Cards */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Monthly Breakdown
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {calculatedPeriod2WithCarryover.map((month, index) => (
                  <MonthCard
                    key={month.id}
                    month={month}
                    onUpdate={(updates) => updatePeriod2Month(index, updates)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goals Content */}
        {activeTab === 'goals' && (
          <div className="animate-in fade-in duration-300">
            <GoalsPanel
              period1Months={calculatedPeriod1}
              period2Months={calculatedPeriod2WithCarryover}
              onUpdatePeriod1={updatePeriod1Month}
              onUpdatePeriod2={updatePeriod2Month}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pb-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Signed in as {user.email}. Data synced to cloud.
          </p>
        </footer>
      </main>
    </div>
  );
}
