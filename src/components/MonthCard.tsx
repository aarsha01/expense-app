'use client';

import { CalculatedMonth, MonthData } from '@/types';
import { formatCurrency } from '@/utils/calculations';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, PiggyBank, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MonthCardProps {
  month: CalculatedMonth;
  onUpdate: (updates: Partial<MonthData>) => void;
}

// Custom input component that handles backspace properly
function NumberInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Sync when external value changes
  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty string and only digits
    if (inputValue === '' || /^\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);

      // Update parent with 0 if empty, otherwise the number
      const numValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    // On blur, if empty show 0
    if (displayValue === '') {
      setDisplayValue('0');
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default function MonthCard({ month, onUpdate }: MonthCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const longTermStatus = month.longTermSavingsDiff >= 0 ? 'positive' : 'negative';
  const shortTermStatus = month.shortTermSavingsDiff >= 0 ? 'positive' : 'negative';
  const surplusStatus = month.surplus >= 0 ? 'positive' : 'negative';

  const StatusIcon = ({ status }: { status: 'positive' | 'negative' }) => {
    if (status === 'positive') {
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const inputClass = "w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {month.monthName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{month.year}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salary</p>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(month.salary)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Two Savings Types */}
      <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-gray-100 dark:border-gray-700">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <PiggyBank className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Long-term</p>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(month.actualLongTermSavings)}
          </p>
          <p className={`text-xs ${longTermStatus === 'positive' ? 'text-emerald-600' : 'text-red-500'}`}>
            {month.longTermSavingsDiff >= 0 ? '+' : ''}{formatCurrency(month.longTermSavingsDiff)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Short-term</p>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatCurrency(month.actualShortTermSavings)}
          </p>
          <p className={`text-xs ${shortTermStatus === 'positive' ? 'text-emerald-600' : 'text-red-500'}`}>
            {month.shortTermSavingsDiff >= 0 ? '+' : ''}{formatCurrency(month.shortTermSavingsDiff)}
          </p>
        </div>
      </div>

      {/* Surplus Row */}
      <div className="px-5 py-3 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <StatusIcon status={surplusStatus} />
            <span className={`text-sm font-medium ${surplusStatus === 'positive' ? 'text-emerald-600' : 'text-red-600'}`}>
              {surplusStatus === 'positive' ? 'Surplus' : 'Deficit'}: {formatCurrency(Math.abs(month.surplus))}
            </span>
          </div>
          {month.goalContribution > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              Goal: {formatCurrency(month.goalContribution)}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          {isExpanded ? 'Less' : 'Edit'}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expanded Edit Section */}
      {isExpanded && (
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 space-y-4">
          {/* Fixed Info */}
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fixed Expenses (Rent, Bills, etc.)</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(month.fixedExpenses)}
            </p>
          </div>

          {/* Editable Savings Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-600 dark:text-blue-400 mb-1.5">
                Long-term Savings
              </label>
              <NumberInput
                value={month.actualLongTermSavings}
                onChange={(value) => onUpdate({ actualLongTermSavings: value })}
                className={inputClass}
                placeholder="120000"
              />
              <p className="mt-1 text-xs text-gray-400">Target: {formatCurrency(month.plannedLongTermSavings)}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-600 dark:text-purple-400 mb-1.5">
                Short-term Savings
              </label>
              <NumberInput
                value={month.actualShortTermSavings}
                onChange={(value) => onUpdate({ actualShortTermSavings: value })}
                className={inputClass}
                placeholder="30000"
              />
              <p className="mt-1 text-xs text-gray-400">Target: {formatCurrency(month.plannedShortTermSavings)}</p>
            </div>
          </div>

          {/* Goal Contribution */}
          <div>
            <label className="block text-xs font-medium text-amber-600 dark:text-amber-400 mb-1.5">
              Goal Contribution (Phone, India Trip, Moving)
            </label>
            <NumberInput
              value={month.goalContribution}
              onChange={(value) => onUpdate({ goalContribution: value })}
              className={inputClass}
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-400">Extra savings towards your 3 lakh goal</p>
          </div>

          {/* Additional Income/Expense */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1.5">
                Additional Income
              </label>
              <NumberInput
                value={month.additionalIncome}
                onChange={(value) => onUpdate({ additionalIncome: value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1.5">
                Additional Expense
              </label>
              <NumberInput
                value={month.additionalExpense}
                onChange={(value) => onUpdate({ additionalExpense: value })}
                className={inputClass}
                placeholder="0"
              />
            </div>
          </div>

          {/* Carryover Info */}
          {month.carryoverFromPrevious > 0 && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Carryover from previous: {formatCurrency(month.carryoverFromPrevious)}
              </p>
            </div>
          )}

          {month.carryoverToNext > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Carryover to next month: {formatCurrency(month.carryoverToNext)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
