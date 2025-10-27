
import React, { useEffect, useState } from 'react';
import { generateDashboardData } from '../../services/geminiService';
import { DashboardData } from '../../types';
import KpiCard from './KpiCard';
import LowStockAlerts from './LowStockAlerts';
import RecentMovements from './RecentMovements';
import SupplierChart from './SupplierChart';
import { DollarSign, Package, HandCoins, Banknote } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await generateDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Generating Dashboard with Gemini AI..." subMessage="This might take a moment." />;
  }

  if (error || !data) {
    return (
      <ErrorDisplay title="Error Loading Dashboard" message={error || 'Could not load dashboard data.'}>
          <p>This might be due to a missing or invalid Gemini API key. Please check the console for more details and ensure your environment variables are set up correctly.</p>
      </ErrorDisplay>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Stock Value" value={data.kpis.totalStockValue} icon={Package} format="currency" />
        <KpiCard title="Total Cash on Hand" value={data.kpis.totalCashOnHand} icon={DollarSign} format="currency" />
        <KpiCard title="Total Bank Balance" value={data.kpis.totalBankBalance} icon={Banknote} format="currency" />
        <KpiCard title="Outstanding Loans" value={data.kpis.outstandingLoans} icon={HandCoins} format="currency" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SupplierChart data={data.supplierPerformance} />
          <RecentMovements movements={data.recentMovements} />
        </div>
        <div className="lg:col-span-1">
          <LowStockAlerts components={data.lowStockComponents} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;