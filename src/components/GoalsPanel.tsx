'use client';

import { CalculatedMonth, MonthData } from '@/types';
import { formatCurrency, GOAL_TARGET } from '@/utils/calculations';
import { Target, Smartphone, Plane, Package, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface GoalsPanelProps {
  period1Months: CalculatedMonth[];
  period2Months: CalculatedMonth[];
  onUpdatePeriod1: (index: number, updates: Partial<MonthData>) => void;
  onUpdatePeriod2: (index: number, updates: Partial<MonthData>) => void;
}

interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  icon: React.ReactNode;
  color: string;
}

const GOALS: GoalItem[] = [
  {
    id: 'smartphone',
    name: 'Smartphone',
    targetAmount: 100000,
    icon: <Smartphone className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'india-trip',
    name: 'Trip to India',
    targetAmount: 100000,
    icon: <Plane className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'moving',
    name: 'Moving Expenses',
    targetAmount: 100000,
    icon: <Package className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
  },
];

// Number input component
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

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '' || /^\d*$/.test(inputValue)) {
      setDisplayValue(inputValue);
      const numValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
      onChange(numValue);
    }
  };

  const handleBlur = () => {
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

export default function GoalsPanel({ period1Months, period2Months, onUpdatePeriod1, onUpdatePeriod2 }: GoalsPanelProps) {
  const allMonths = [...period1Months, ...period2Months];
  const totalContributed = allMonths.reduce((sum, m) => sum + m.goalContribution, 0);
  const remaining = Math.max(0, GOAL_TARGET - totalContributed);
  const percentComplete = Math.min(100, (totalContributed / GOAL_TARGET) * 100);

  // Calculate months with contributions
  const monthsWithContribution = allMonths.filter(m => m.goalContribution > 0).length;
  const avgContribution = monthsWithContribution > 0
    ? totalContributed / monthsWithContribution
    : 0;

  // Calculate how many more months needed at current rate
  const monthsRemaining = 12 - monthsWithContribution;
  const monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : 0;

  // Calculate surplus that could go to goals
  const totalSurplus = allMonths.reduce((sum, m) => sum + Math.max(0, m.surplus), 0);

  // Month-by-month contributions with update handlers
  const monthsWithHandlers = [
    ...period1Months.map((m, idx) => ({
      month: m,
      label: `${m.monthName.slice(0, 3)} ${m.year}`,
      onUpdate: (value: number) => onUpdatePeriod1(idx, { goalContribution: value }),
      period: 1 as const,
    })),
    ...period2Months.map((m, idx) => ({
      month: m,
      label: `${m.monthName.slice(0, 3)} ${m.year}`,
      onUpdate: (value: number) => onUpdatePeriod2(idx, { goalContribution: value }),
      period: 2 as const,
    })),
  ];

  const inputClass = "w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-right";

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-sm border border-amber-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Goal: Save 3 Lakh</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">For smartphone, India trip & moving</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(totalContributed)} saved
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(GOAL_TARGET)}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="mt-2 text-center text-lg font-bold text-amber-600 dark:text-amber-400">
            {percentComplete.toFixed(1)}% Complete
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(remaining)}</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Needed</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(Math.ceil(monthlyNeeded))}</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Contribution</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(Math.round(avgContribution))}</p>
          </div>
          <div className="bg-white/60 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Surplus</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSurplus)}</p>
          </div>
        </div>

        {/* Tips */}
        {remaining > 0 && totalSurplus > 0 && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              You have <strong>{formatCurrency(totalSurplus)}</strong> in surplus that could be allocated to your goal!
              Use the input fields below to add contributions.
            </p>
          </div>
        )}

        {remaining > 0 && monthlyNeeded > 25000 && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              To reach your goal within 1 year, you need to save about <strong>{formatCurrency(Math.ceil(monthlyNeeded))}</strong> per month.
            </p>
          </div>
        )}
      </div>

      {/* Add Goal Contribution - INPUT SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Plus className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Goal Contributions</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter how much you want to contribute each month</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {monthsWithHandlers.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                {item.label}
              </label>
              <NumberInput
                value={item.month.goalContribution}
                onChange={item.onUpdate}
                className={inputClass}
                placeholder="0"
              />
              {item.month.surplus > 0 && item.month.goalContribution === 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Surplus: {formatCurrency(item.month.surplus)}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Tip:</strong> Add any extra income or surplus from each month to your goal fund.
            Even small contributions add up over time!
          </p>
        </div>
      </div>

      {/* Goal Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Breakdown</h3>
        <div className="space-y-4">
          {GOALS.map((goal) => {
            const goalPercent = Math.min(100, (totalContributed / 3) / goal.targetAmount * 100);
            return (
              <div key={goal.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${goal.color}`}>
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${goalPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(Math.round(totalContributed / 3))} / {formatCurrency(goal.targetAmount)} ({goalPercent.toFixed(0)}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-3">Month</th>
                <th className="pb-3 text-right">Contribution</th>
                <th className="pb-3 text-right">Surplus</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {monthsWithHandlers.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{item.label}</td>
                  <td className="py-3 text-sm text-right font-medium text-amber-600 dark:text-amber-400">
                    {item.month.goalContribution > 0 ? formatCurrency(item.month.goalContribution) : '-'}
                  </td>
                  <td className={`py-3 text-sm text-right ${item.month.surplus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formatCurrency(item.month.surplus)}
                  </td>
                  <td className="py-3 text-right">
                    {item.month.goalContribution > 0 ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full">
                        Added
                      </span>
                    ) : item.month.surplus > 0 ? (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                        No Surplus
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 dark:border-gray-600">
              <tr>
                <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                <td className="pt-3 text-sm text-right font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalContributed)}
                </td>
                <td className="pt-3 text-sm text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalSurplus)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
