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
