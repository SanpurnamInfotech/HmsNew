import React from 'react';
import { FaCube, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Dashboard = () => {
  // Mock data - replace with dynamic API calls as per your workflow
  const stats = [
    {
      title: "Total Modules",
      value: "12",
      icon: <FaCube />,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800"
    },
    {
      title: "Active Activities",
      value: "45",
      icon: <FaCheckCircle />,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800"
    },
    {
      title: "Pending Requests",
      value: "08",
      icon: <FaExclamationCircle />,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-100 dark:border-amber-800"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex justify-between align-center border-l-4 border-emerald-500 pl-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of system activities and performance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} transition-transform hover:scale-[1.02] cursor-default`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-black mt-2 text-slate-800 dark:text-white">
                  {stat.value}
                </h3>
              </div>
              <div className={`text-3xl ${stat.color} opacity-80`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Welcome back, <span className="text-emerald-500">Admin</span>
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Your system is running smoothly. Use the sidebar on the left to navigate through 
            different modules, manage your providers, or update subscription plans in the Masters section.
          </p>
          
          <div className="mt-6 flex gap-3">
            <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-emerald-100 dark:shadow-none">
              View Reports
            </button>
            <button className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-all">
              Quick Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;