export interface UserSettings {
  // Period configuration
  period1Name: string;
  period2Name: string;
  monthsPerPeriod: number;
  startMonth: number; // 0-11 (January-December)
  startYear: number;

  // Income
  period1Salary: number;
  period2Salary: number;

  // Savings targets
  longTermSavingsTarget: number;
  shortTermSavingsTarget: number;
  fixedExpenses: number;

  // Goal
  goalTarget: number;
  goalName: string;

  // Currency
  currencySymbol: string;
  currencyCode: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
  period1Name: 'First 6 Months',
  period2Name: 'Next 6 Months',
  monthsPerPeriod: 6,
  startMonth: 1, // February
  startYear: new Date().getFullYear(),

  period1Salary: 190000,
  period2Salary: 180000,

  longTermSavingsTarget: 120000,
  shortTermSavingsTarget: 30000,
  fixedExpenses: 40000,

  goalTarget: 300000,
  goalName: 'Annual Goal (Phone, Travel, Moving)',

  currencySymbol: '¥',
  currencyCode: 'JPY',
};

export const CURRENCY_OPTIONS = [
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '₩', code: 'KRW', name: 'Korean Won' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
