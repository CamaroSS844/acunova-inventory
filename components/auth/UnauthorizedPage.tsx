import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full p-8 text-center">
      <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <ShieldAlert className="mx-auto h-20 w-20 text-red-500" />
        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          You do not have permission to view this page.
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-500 text-sm">
            Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-block px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:ring-offset-gray-800"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;