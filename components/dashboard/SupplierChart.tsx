
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Supplier } from '../../types';

interface SupplierChartProps {
  data: Supplier[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
          <p className="font-bold text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400">{`Total Spend: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
};


const SupplierChart: React.FC<SupplierChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Supplier Performance (Total Spend)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} className="text-xs dark:fill-gray-400" />
            <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fill: '#6b7280' }} className="text-xs dark:fill-gray-400" />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}/>
            <Legend />
            <Bar dataKey="totalSpend" name="Total Spend" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SupplierChart;
