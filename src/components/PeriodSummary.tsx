'use client';

import { CalculatedMonth } from '@/types';
import { formatCurrency, PLANNED_LONG_TERM_SAVINGS, PLANNED_SHORT_TERM_SAVINGS } from '@/utils/calculations';
import { Wallet, PiggyBank, TrendingUp, Target } from 'lucide-react';

interface PeriodSummaryProps {
  months: CalculatedMonth[];
  periodName: string;
  salary: number;
}

export default function PeriodSummary({ months, periodName, salary }: PeriodSummaryProps) {
  const totalSalary = months.reduce((sum, m) => sum + m.salary, 0);
  const totalAdditionalIncome = months.reduce((sum, m) => sum + m.additionalIncome, 0);

  const totalLongTermSavings = months.reduce((sum, m) => sum + m.actualLongTermSavings, 0);
  const totalTargetLongTerm = PLANNED_LONG_TERM_SAVINGS * months.length;
  const longTermDiff = totalLongTermSavings - totalTargetLongTerm;

  const totalShortTermSavings = months.reduce((sum, m) => sum + m.actualShortTermSavings, 0);
  const totalTargetShortTerm = PLANNED_SHORT_TERM_SAVINGS * months.length;
  const shortTermDiff = totalShortTermSavings - totalTargetShortTerm;

  const totalGoalContribution = months.reduce((sum, m) => sum + m.goalContribution, 0);
  const totalSurplus = months.reduce((sum, m) => sum + m.surplus, 0);

  const stats = [
    {
      icon: Wallet,
      label: 'Total Income',
      value: formatCurrency(totalSalary + totalAdditionalIncome),
      detail: `${months.length} months @ ${formatCurrency(salary)}/mo`,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      icon: PiggyBank,
      label: 'Long-term Savings',
      value: formatCurrency(totalLongTermSavings),
      detail: `${longTermDiff >= 0 ? '+' : ''}${formatCurrency(longTermDiff)} vs target`,
      color: longTermDiff >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: TrendingUp,
      label: 'Short-term Savings',
      value: formatCurrency(totalShortTermSavings),
      detail: `${shortTermDiff >= 0 ? '+' : ''}${formatCurrency(shortTermDiff)} vs target`,
      color: shortTermDiff >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Target,
      label: 'Goal Fund',
      value: formatCurrency(totalGoalContribution),
      detail: totalSurplus >= 0 ? `Surplus: ${formatCurrency(totalSurplus)}` : `Deficit: ${formatCurrency(Math.abs(totalSurplus))}`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {periodName} Summary
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-4 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
