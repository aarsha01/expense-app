'use client';

import { useState, useEffect, useCallback } from 'react';
import { MonthData } from '@/types';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  generateInitialMonths,
  PERIOD_1_SALARY,
  PERIOD_2_SALARY,
} from '@/utils/calculations';

const CURRENT_YEAR = new Date().getFullYear();
const START_MONTH = 1; // February

// Generate a simple user ID for localStorage users (anonymous)
const getOrCreateUserId = (): string => {
  if (typeof window === 'undefined') return 'server';

  let userId = localStorage.getItem('expense-user-id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('expense-user-id', userId);
  }
  return userId;
};

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
}

export function useExpenseData(): UseExpenseDataReturn {
  const [period1Months, setPeriod1MonthsState] = useState<MonthData[]>(
    generateInitialMonths(START_MONTH, CURRENT_YEAR, 6, PERIOD_1_SALARY)
  );
  const [period2Months, setPeriod2MonthsState] = useState<MonthData[]>(
    generateInitialMonths(START_MONTH + 6, CURRENT_YEAR, 6, PERIOD_2_SALARY)
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
    setUseDatabase(isSupabaseConfigured());
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const dbConfigured = isSupabaseConfigured();
        const supabase = getSupabase();

        if (dbConfigured && supabase) {
          // Load from Supabase
          const userId = getOrCreateUserId();
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
        } else {
          // Load from localStorage
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
  }, []);

  // Save data (to localStorage always, to database if configured)
  const saveData = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Always save to localStorage
      localStorage.setItem('expense-period1-v2', JSON.stringify(period1Months));
      localStorage.setItem('expense-period2-v2', JSON.stringify(period2Months));

      // Save to database if configured
      const supabase = getSupabase();
      if (supabase) {
        const userId = getOrCreateUserId();

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
  }, [period1Months, period2Months]);

  // Load from database (manual refresh)
  const loadFromDatabase = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    setIsLoading(true);
    setError(null);

    try {
      const userId = getOrCreateUserId();
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
  }, []);

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
  };
}
