import { MonthData, CalculatedMonth } from '@/types';

export const FIXED_EXPENSES = 40000;
export const PLANNED_LONG_TERM_SAVINGS = 120000;
export const PLANNED_SHORT_TERM_SAVINGS = 30000;
export const PERIOD_1_SALARY = 190000;
export const PERIOD_2_SALARY = 180000;
export const GOAL_TARGET = 300000; // 3 lakh yen

export function calculateMonth(month: MonthData): CalculatedMonth {
  // Total available = salary + additional income + carryover from previous
  const totalAvailable = month.salary + month.additionalIncome + month.carryoverFromPrevious;

  // Remaining after fixed expenses
  const remainingAfterFixed = totalAvailable - month.fixedExpenses;

  // Long-term savings difference: positive means saved more than target
  const longTermSavingsDiff = month.actualLongTermSavings - month.plannedLongTermSavings;

  // Short-term savings difference: positive means saved more than target
  const shortTermSavingsDiff = month.actualShortTermSavings - month.plannedShortTermSavings;

  // Calculate surplus/deficit
  // Surplus = Total Available - Fixed - Long Term Savings - Short Term Savings - Goal Contribution - Additional Expenses
  const surplus = totalAvailable
    - month.fixedExpenses
    - month.actualLongTermSavings
    - month.actualShortTermSavings
    - month.goalContribution
    - month.additionalExpense;

  // Carryover to next month (surplus if positive)
  const carryoverToNext = Math.max(0, surplus);

  return {
    ...month,
    totalAvailable,
    remainingAfterFixed,
    longTermSavingsDiff,
    shortTermSavingsDiff,
    surplus,
    carryoverToNext,
  };
}

export function calculatePeriodMonths(months: MonthData[]): CalculatedMonth[] {
  const calculated: CalculatedMonth[] = [];

  for (let i = 0; i < months.length; i++) {
    const month = months[i];

    // Update carryover from previous month
    const updatedMonth: MonthData = {
      ...month,
      carryoverFromPrevious: i > 0 ? calculated[i - 1].carryoverToNext : month.carryoverFromPrevious,
    };

    calculated.push(calculateMonth(updatedMonth));
  }

  return calculated;
}

export function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex % 12];
}

export function generateInitialMonths(
  startMonth: number,
  startYear: number,
  count: number,
  salary: number,
  fixedExpenses: number = FIXED_EXPENSES,
  longTermSavingsTarget: number = PLANNED_LONG_TERM_SAVINGS,
  shortTermSavingsTarget: number = PLANNED_SHORT_TERM_SAVINGS
): MonthData[] {
  const months: MonthData[] = [];

  for (let i = 0; i < count; i++) {
    const monthIndex = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);

    months.push({
      id: `${year}-${monthIndex}`,
      monthName: getMonthName(monthIndex),
      year,
      salary,
      fixedExpenses: fixedExpenses,
      plannedLongTermSavings: longTermSavingsTarget,
      actualLongTermSavings: 0,
      plannedShortTermSavings: shortTermSavingsTarget,
      actualShortTermSavings: 0,
      additionalIncome: 0,
      additionalExpense: 0,
      goalContribution: 0,
      carryoverFromPrevious: 0,
    });
  }

  return months;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function exportToCSV(period1Months: CalculatedMonth[], period2Months: CalculatedMonth[]): string {
  const headers = [
    'Period',
    'Month',
    'Year',
    'Salary',
    'Fixed Expenses',
    'Planned Long-Term Savings',
    'Actual Long-Term Savings',
    'Planned Short-Term Savings',
    'Actual Short-Term Savings',
    'Goal Contribution',
    'Additional Income',
    'Additional Expense',
    'Carryover From Previous',
    'Total Available',
    'Long-Term Savings Diff',
    'Short-Term Savings Diff',
    'Surplus/Deficit',
    'Carryover To Next'
  ];

  const rows: string[][] = [];

  const addRows = (months: CalculatedMonth[], periodName: string) => {
    months.forEach(month => {
      rows.push([
        periodName,
        month.monthName,
        month.year.toString(),
        month.salary.toString(),
        month.fixedExpenses.toString(),
        month.plannedLongTermSavings.toString(),
        month.actualLongTermSavings.toString(),
        month.plannedShortTermSavings.toString(),
        month.actualShortTermSavings.toString(),
        month.goalContribution.toString(),
        month.additionalIncome.toString(),
        month.additionalExpense.toString(),
        month.carryoverFromPrevious.toString(),
        month.totalAvailable.toString(),
        month.longTermSavingsDiff.toString(),
        month.shortTermSavingsDiff.toString(),
        month.surplus.toString(),
        month.carryoverToNext.toString(),
      ]);
    });
  };

  addRows(period1Months, 'Period 1 (First 6 Months)');
  addRows(period2Months, 'Period 2 (Next 6 Months)');

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csvContent;
}

export function calculateGoalProgress(period1: CalculatedMonth[], period2: CalculatedMonth[]): {
  totalContributed: number;
  remaining: number;
  percentComplete: number;
  monthlyNeeded: number;
  projectedCompletion: string;
} {
  const allMonths = [...period1, ...period2];
  const totalContributed = allMonths.reduce((sum, m) => sum + m.goalContribution, 0);
  const remaining = Math.max(0, GOAL_TARGET - totalContributed);
  const percentComplete = Math.min(100, (totalContributed / GOAL_TARGET) * 100);

  // Calculate monthly needed to reach goal
  const monthsRemaining = 12 - allMonths.filter(m => m.goalContribution > 0).length;
  const monthlyNeeded = monthsRemaining > 0 ? remaining / monthsRemaining : 0;

  // Project completion based on average contribution
  const avgContribution = totalContributed / Math.max(1, allMonths.filter(m => m.goalContribution > 0).length);
  const monthsToComplete = avgContribution > 0 ? Math.ceil(remaining / avgContribution) : 12;

  const today = new Date();
  const completionDate = new Date(today.getFullYear(), today.getMonth() + monthsToComplete, 1);
  const projectedCompletion = completionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return {
    totalContributed,
    remaining,
    percentComplete,
    monthlyNeeded,
    projectedCompletion,
  };
}
