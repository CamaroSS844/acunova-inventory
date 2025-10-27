import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Package, Users, Banknote, BarChart3 } from 'lucide-react';

const ReportsPage: React.FC = () => {

    const handleDownload = (reportName: string) => {
        // In a real application, this would trigger a file download (e.g., CSV, PDF).
        // For this demo, we'll just show an alert.
        alert(`Generating and downloading the "${reportName}" report...`);
        console.log(`Report generation started for: ${reportName}`);
    };

    const reports = [
        { name: 'Stock Valuation Report', description: 'A detailed summary of current inventory value.', icon: Package, action: () => handleDownload('Stock Valuation Report'), link: false, buttonText: 'Download Report' },
        { name: 'Supplier Spend Analysis', description: 'Total spending broken down by each supplier.', icon: Users, action: () => handleDownload('Supplier Spend Analysis'), link: false, buttonText: 'Download Report' },
        { name: 'Full Transaction History', description: 'Complete log of all financial transactions.', icon: Banknote, action: () => handleDownload('Full Transaction History'), link: false, buttonText: 'Download Report' },
        { name: 'Sales Report', description: 'Tracks sales performance for each staff member.', icon: Users, action: null, link: true, path: '/reports/sales', buttonText: 'View Report' },
    ];

    const ReportCard: React.FC<{report: typeof reports[0]}> = ({ report }) => {
        const ButtonContent = () => (
            <>
                {report.link ? <BarChart3 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {report.buttonText}
            </>
        );

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div>
                    <div className="flex items-center mb-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full mr-4">
                            <report.icon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {report.description}
                    </p>
                </div>
                {report.link ? (
                    <Link to={report.path!} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <ButtonContent />
                    </Link>
                ) : (
                    <button onClick={report.action!} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        <ButtonContent />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                   <ReportCard key={report.name} report={report} />
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;
