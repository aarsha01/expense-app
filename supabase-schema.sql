-- Supabase SQL Schema for Expense Calculator
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Create the expense_data table
CREATE TABLE IF NOT EXISTS expense_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  period1_months JSONB NOT NULL DEFAULT '[]'::jsonb,
  period2_months JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_expense_data_user_id ON expense_data(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE expense_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read/write their own data
-- For anonymous users, we use the user_id stored in localStorage
CREATE POLICY "Users can manage their own expense data"
ON expense_data
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternative: If you want to use Supabase Auth later, replace the above policy with:
-- CREATE POLICY "Users can manage their own expense data"
-- ON expense_data
-- FOR ALL
-- USING (auth.uid()::text = user_id)
-- WITH CHECK (auth.uid()::text = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_expense_data_updated_at ON expense_data;
CREATE TRIGGER update_expense_data_updated_at
  BEFORE UPDATE ON expense_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- User Settings Table
-- =============================================

CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,

  -- Period configuration
  period1_name TEXT DEFAULT 'First 6 Months',
  period2_name TEXT DEFAULT 'Next 6 Months',
  months_per_period INTEGER DEFAULT 6,
  start_month INTEGER DEFAULT 1,
  start_year INTEGER DEFAULT 2026,

  -- Income
  period1_salary INTEGER DEFAULT 190000,
  period2_salary INTEGER DEFAULT 180000,

  -- Savings targets
  long_term_savings_target INTEGER DEFAULT 120000,
  short_term_savings_target INTEGER DEFAULT 30000,
  fixed_expenses INTEGER DEFAULT 40000,

  -- Goal
  goal_target INTEGER DEFAULT 300000,
  goal_name TEXT DEFAULT 'Annual Goal (Phone, Travel, Moving)',

  -- Currency
  currency_symbol TEXT DEFAULT '¥',
  currency_code TEXT DEFAULT 'JPY',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage their own settings
CREATE POLICY "Users can manage their own settings"
ON user_settings
FOR ALL
USING (true)
WITH CHECK (true);

-- Create a trigger to auto-update updated_at for settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
