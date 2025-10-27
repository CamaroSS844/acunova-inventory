
import React from 'react';
import { LucideProps } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ElementType<LucideProps>;
  format?: 'currency' | 'number';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, format = 'number' }) => {
  const formattedValue = format === 'currency'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : new Intl.NumberFormat('en-US').format(value);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{formattedValue}</p>
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
