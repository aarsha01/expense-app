'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  isSaving: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  saveSettings: () => Promise<void>;
  resetToDefaults: () => void;
  hasUnsavedChanges: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  userId?: string;
}

export function SettingsProvider({ children, userId }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);

      try {
        const supabase = getSupabase();

        if (supabase && userId && isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!error && data) {
            const loadedSettings: UserSettings = {
              period1Name: data.period1_name || DEFAULT_SETTINGS.period1Name,
              period2Name: data.period2_name || DEFAULT_SETTINGS.period2Name,
              monthsPerPeriod: data.months_per_period || DEFAULT_SETTINGS.monthsPerPeriod,
              startMonth: data.start_month ?? DEFAULT_SETTINGS.startMonth,
              startYear: data.start_year || DEFAULT_SETTINGS.startYear,
              period1Salary: data.period1_salary || DEFAULT_SETTINGS.period1Salary,
              period2Salary: data.period2_salary || DEFAULT_SETTINGS.period2Salary,
              longTermSavingsTarget: data.long_term_savings_target || DEFAULT_SETTINGS.longTermSavingsTarget,
              shortTermSavingsTarget: data.short_term_savings_target || DEFAULT_SETTINGS.shortTermSavingsTarget,
              fixedExpenses: data.fixed_expenses || DEFAULT_SETTINGS.fixedExpenses,
              goalTarget: data.goal_target || DEFAULT_SETTINGS.goalTarget,
              goalName: data.goal_name || DEFAULT_SETTINGS.goalName,
              currencySymbol: data.currency_symbol || DEFAULT_SETTINGS.currencySymbol,
              currencyCode: data.currency_code || DEFAULT_SETTINGS.currencyCode,
            };
            setSettings(loadedSettings);
            setSavedSettings(loadedSettings);
          }
        } else {
          // Load from localStorage
          const stored = localStorage.getItem('expense-settings');
          if (stored) {
            const loadedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            setSettings(loadedSettings);
            setSavedSettings(loadedSettings);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const saveSettings = useCallback(async () => {
    setIsSaving(true);

    try {
      // Always save to localStorage
      localStorage.setItem('expense-settings', JSON.stringify(settings));

      const supabase = getSupabase();
      if (supabase && userId && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: userId,
            period1_name: settings.period1Name,
            period2_name: settings.period2Name,
            months_per_period: settings.monthsPerPeriod,
            start_month: settings.startMonth,
            start_year: settings.startYear,
            period1_salary: settings.period1Salary,
            period2_salary: settings.period2Salary,
            long_term_savings_target: settings.longTermSavingsTarget,
            short_term_savings_target: settings.shortTermSavingsTarget,
            fixed_expenses: settings.fixedExpenses,
            goal_target: settings.goalTarget,
            goal_name: settings.goalName,
            currency_symbol: settings.currencySymbol,
            currency_code: settings.currencyCode,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (error) throw error;
      }

      setSavedSettings(settings);
    } catch (err) {
      console.error('Error saving settings:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settings, userId]);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      isLoading,
      isSaving,
      updateSettings,
      saveSettings,
      resetToDefaults,
      hasUnsavedChanges,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
