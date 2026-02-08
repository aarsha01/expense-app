'use client';

import { CalculatedMonth } from '@/types';
import { formatCurrency, PLANNED_LONG_TERM_SAVINGS, PLANNED_SHORT_TERM_SAVINGS } from '@/utils/calculations';
import { Calendar, PiggyBank, Wallet, Target, TrendingUp, TrendingDown } from 'lucide-react';

interface CurrentMonthSummaryProps {
  month: CalculatedMonth;
}

export default function CurrentMonthSummary({ month }: CurrentMonthSummaryProps) {
  const longTermPercent = Math.min(100, (month.actualLongTermSavings / PLANNED_LONG_TERM_SAVINGS) * 100);
  const shortTermPercent = Math.min(100, (month.actualShortTermSavings / PLANNED_SHORT_TERM_SAVINGS) * 100);

  const getStatusColor = (percent: number) => {
    if (percent >= 100) return 'text-emerald-600 dark:text-emerald-400';
    if (percent >= 75) return 'text-blue-600 dark:text-blue-400';
    if (percent >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'from-emerald-400 to-emerald-600';
    if (percent >= 75) return 'from-blue-400 to-blue-600';
    if (percent >= 50) return 'from-amber-400 to-amber-600';
    return 'from-red-400 to-red-600';
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm border border-primary-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {month.monthName} {month.year} - Target Progress
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            How much you have reached your targets this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Long-term Savings Progress */}
        <div className="bg-white/70 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Long-term Savings</span>
            </div>
            <span className={`text-lg font-bold ${getStatusColor(longTermPercent)}`}>
              {longTermPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(longTermPercent)} rounded-full transition-all duration-500`}
              style={{ width: `${longTermPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatCurrency(month.actualLongTermSavings)}</span>
            <span>Target: {formatCurrency(PLANNED_LONG_TERM_SAVINGS)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {month.longTermSavingsDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${month.longTermSavingsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {month.longTermSavingsDiff >= 0 ? '+' : ''}{formatCurrency(month.longTermSavingsDiff)} vs target
            </span>
          </div>
        </div>

        {/* Short-term Savings Progress */}
        <div className="bg-white/70 dark:bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Short-term Savings</span>
            </div>
            <span className={`text-lg font-bold ${getStatusColor(shortTermPercent)}`}>
              {shortTermPercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full bg-gradient-to-r ${getProgressColor(shortTermPercent)} rounded-full transition-all duration-500`}
              style={{ width: `${shortTermPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatCurrency(month.actualShortTermSavings)}</span>
            <span>Target: {formatCurrency(PLANNED_SHORT_TERM_SAVINGS)}</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {month.shortTermSavingsDiff >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${month.shortTermSavingsDiff >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {month.shortTermSavingsDiff >= 0 ? '+' : ''}{formatCurrency(month.shortTermSavingsDiff)} vs target
            </span>
          </div>
        </div>
      </div>

      {/* Goal Contribution & Surplus */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-amber-50/70 dark:bg-amber-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Goal Contribution</span>
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(month.goalContribution)}
          </p>
        </div>
        <div className={`${month.surplus >= 0 ? 'bg-emerald-50/70 dark:bg-emerald-900/20' : 'bg-red-50/70 dark:bg-red-900/20'} rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-1">
            {month.surplus >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span className={`text-xs font-medium ${month.surplus >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
              {month.surplus >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <p className={`text-xl font-bold ${month.surplus >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatCurrency(Math.abs(month.surplus))}
          </p>
        </div>
      </div>
    </div>
  );
}
