'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonthData } from '@/types';
import { UserSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateInitialMonths } from '@/utils/calculations';

// Type for database row
interface ExpenseDataRow {
  id: string;
  user_id: string;
  period1_months: MonthData[];
  period2_months: MonthData[];
  created_at: string;
  updated_at: string;
}

interface UseExpenseDataReturn {
  period1Months: MonthData[];
  period2Months: MonthData[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
  useDatabase: boolean;
  hasUnsavedChanges: boolean;
  setPeriod1Months: (months: MonthData[] | ((prev: MonthData[]) => MonthData[])) => void;
  setPeriod2Months: (months: MonthData[] | ((prev: MonthData[]) => MonthData[])) => void;
  saveData: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
  resetToSettings: () => void;
}

export function useExpenseData(userId?: string, settings?: UserSettings): UseExpenseDataReturn {
  const s = settings || DEFAULT_SETTINGS;

  const [period1Months, setPeriod1MonthsState] = useState<MonthData[]>(() =>
    generateInitialMonths(s.startMonth, s.startYear, s.monthsPerPeriod, s.period1Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
  );
  const [period2Months, setPeriod2MonthsState] = useState<MonthData[]>(() =>
    generateInitialMonths(s.startMonth + s.monthsPerPeriod, s.startYear, s.monthsPerPeriod, s.period2Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [useDatabase, setUseDatabase] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if database is available (client-side only)
  useEffect(() => {
    setUseDatabase(isSupabaseConfigured() && !!userId);
  }, [userId]);

  // Load data on mount or when userId changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dbConfigured = isSupabaseConfigured();
        const supabase = getSupabase();

        if (dbConfigured && supabase && userId) {
          // Load from Supabase using authenticated user ID
          const { data, error: fetchError } = await supabase
            .from('expense_data')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }

          if (data) {
            const row = data as ExpenseDataRow;
            setPeriod1MonthsState(row.period1_months);
            setPeriod2MonthsState(row.period2_months);
            setLastSaved(new Date(row.updated_at));
          } else {
            // No data exists, generate from settings
            setPeriod1MonthsState(
              generateInitialMonths(s.startMonth, s.startYear, s.monthsPerPeriod, s.period1Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
            );
            setPeriod2MonthsState(
              generateInitialMonths(s.startMonth + s.monthsPerPeriod, s.startYear, s.monthsPerPeriod, s.period2Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
            );
          }
        } else {
          // Load from localStorage (fallback for non-authenticated users)
          const stored1 = localStorage.getItem('expense-period1-v2');
          const stored2 = localStorage.getItem('expense-period2-v2');

          if (stored1) {
            setPeriod1MonthsState(JSON.parse(stored1));
          }
          if (stored2) {
            setPeriod2MonthsState(JSON.parse(stored2));
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Using local storage as fallback.');

        // Fallback to localStorage
        const stored1 = localStorage.getItem('expense-period1-v2');
        const stored2 = localStorage.getItem('expense-period2-v2');
        if (stored1) setPeriod1MonthsState(JSON.parse(stored1));
        if (stored2) setPeriod2MonthsState(JSON.parse(stored2));
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    loadData();
  }, [userId, s.startMonth, s.startYear, s.monthsPerPeriod, s.period1Salary, s.period2Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget]);

  // Reset data to match current settings
  const resetToSettings = useCallback(() => {
    setPeriod1MonthsState(
      generateInitialMonths(s.startMonth, s.startYear, s.monthsPerPeriod, s.period1Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
    );
    setPeriod2MonthsState(
      generateInitialMonths(s.startMonth + s.monthsPerPeriod, s.startYear, s.monthsPerPeriod, s.period2Salary, s.fixedExpenses, s.longTermSavingsTarget, s.shortTermSavingsTarget)
    );
    setHasUnsavedChanges(true);
  }, [s]);

  // Save data (to localStorage always, to database if authenticated)
  const saveData = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Always save to localStorage as backup
      localStorage.setItem('expense-period1-v2', JSON.stringify(period1Months));
      localStorage.setItem('expense-period2-v2', JSON.stringify(period2Months));

      // Save to database if authenticated
      const supabase = getSupabase();
      if (supabase && userId) {
        const { error: upsertError } = await supabase
          .from('expense_data')
          .upsert({
            user_id: userId,
            period1_months: period1Months,
            period2_months: period2Months,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (upsertError) throw upsertError;
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Error saving data:', err);
      setError('Failed to save to database. Data saved locally.');
      // Still mark as saved since localStorage worked
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  }, [period1Months, period2Months, userId]);

  // Load from database (manual refresh)
  const loadFromDatabase = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('expense_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        const row = data as ExpenseDataRow;
        setPeriod1MonthsState(row.period1_months);
        setPeriod2MonthsState(row.period2_months);
        setLastSaved(new Date(row.updated_at));
      }
    } catch (err) {
      console.error('Error loading from database:', err);
      setError('Failed to load from database.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Track unsaved changes when data changes
  useEffect(() => {
    if (!initialized) return;
    setHasUnsavedChanges(true);
  }, [period1Months, period2Months, initialized]);

  // Setters
  const setPeriod1Months = useCallback((value: MonthData[] | ((prev: MonthData[]) => MonthData[])) => {
    setPeriod1MonthsState((prev) => typeof value === 'function' ? value(prev) : value);
  }, []);

  const setPeriod2Months = useCallback((value: MonthData[] | ((prev: MonthData[]) => MonthData[])) => {
    setPeriod2MonthsState((prev) => typeof value === 'function' ? value(prev) : value);
  }, []);

  return {
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
    loadFromDatabase,
    resetToSettings,
  };
}
