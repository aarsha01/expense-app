'use client';

import { CalculatedMonth } from '@/types';
import { PLANNED_LONG_TERM_SAVINGS, PLANNED_SHORT_TERM_SAVINGS, formatCurrency } from '@/utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface SavingsChartProps {
  months: CalculatedMonth[];
  title: string;
}

export default function SavingsChart({ months, title }: SavingsChartProps) {
  const data = months.map((month) => ({
    name: month.monthName.slice(0, 3),
    longTerm: month.actualLongTermSavings,
    shortTerm: month.actualShortTermSavings,
    goal: month.goalContribution,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine
              y={PLANNED_LONG_TERM_SAVINGS}
              stroke="#3B82F6"
              strokeDasharray="5 5"
              label={{
                value: 'LT Target',
                position: 'right',
                fill: '#3B82F6',
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={PLANNED_SHORT_TERM_SAVINGS}
              stroke="#A855F7"
              strokeDasharray="5 5"
              label={{
                value: 'ST Target',
                position: 'right',
                fill: '#A855F7',
                fontSize: 10,
              }}
            />
            <Bar dataKey="longTerm" name="Long-term" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="shortTerm" name="Short-term" fill="#A855F7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="goal" name="Goal Fund" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
