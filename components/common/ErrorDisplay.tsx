import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorDisplay: React.FC<{ title: string; message: string; children?: React.ReactNode }> = ({ title, message, children }) => (
  <div className="flex items-center justify-center h-full p-6">
    <div className="p-6 text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg max-w-lg">
      <AlertTriangle className="mx-auto h-8 w-8 mb-4" />
      <h3 className="font-bold text-lg">{title}</h3>
      <p className="text-sm mt-1">{message}</p>
      {children && <div className="text-xs mt-4 text-red-600 dark:text-red-400">{children}</div>}
    </div>
  </div>
);

export default ErrorDisplay;
