export interface MonthData {
  id: string;
  monthName: string;
  year: number;
  salary: number;
  fixedExpenses: number;
  // Long-term savings (strict - don't touch)
  plannedLongTermSavings: number;
  actualLongTermSavings: number;
  // Short-term savings (flexible)
  plannedShortTermSavings: number;
  actualShortTermSavings: number;
  // Additional
  additionalIncome: number;
  additionalExpense: number;
  // Contribution to goals (from surplus/additional income)
  goalContribution: number;
  carryoverFromPrevious: number;
}

export interface CalculatedMonth extends MonthData {
  totalAvailable: number;
  remainingAfterFixed: number;
  longTermSavingsDiff: number;
  shortTermSavingsDiff: number;
  surplus: number;
  carryoverToNext: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  icon: string;
}

export interface GoalsData {
  goals: Goal[];
  totalTarget: number;
}

export const DEFAULT_GOALS: Goal[] = [
  { id: 'smartphone', name: 'Smartphone', targetAmount: 100000, icon: '📱' },
  { id: 'india-trip', name: 'Trip to India', targetAmount: 100000, icon: '✈️' },
  { id: 'moving', name: 'Moving Expenses', targetAmount: 100000, icon: '📦' },
];
