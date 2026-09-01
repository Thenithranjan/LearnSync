import React from 'react';

const PerformanceDistributionChart = ({ distribution = {}, totalStudents = 0 }) => {
  const buckets = [
    { label: '90-100%', count: distribution['90-100%'] || 0, color: 'bg-emerald-500', barColor: 'from-emerald-500 to-teal-400' },
    { label: '80-89%', count: distribution['80-89%'] || 0, color: 'bg-indigo-500', barColor: 'from-indigo-500 to-violet-500' },
    { label: '70-79%', count: distribution['70-79%'] || 0, color: 'bg-cyan-500', barColor: 'from-cyan-500 to-blue-500' },
    { label: '60-69%', count: distribution['60-69%'] || 0, color: 'bg-amber-500', barColor: 'from-amber-500 to-yellow-500' },
    { label: 'Below 60%', count: distribution['Below 60%'] || 0, color: 'bg-rose-500', barColor: 'from-rose-500 to-red-500' }
  ];

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-4 pb-2 items-end h-48 border-b border-slate-800">
        {buckets.map((b, idx) => {
          const heightPercent = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
          return (
            <div key={idx} className="flex flex-col items-center justify-end h-full group">
              <span className="text-xs font-bold text-slate-300 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                {b.count}
              </span>
              <div className="w-full max-w-[48px] bg-slate-800/40 rounded-t-lg overflow-hidden flex items-end h-32 p-0.5">
                <div
                  className={`w-full rounded-t-md bg-gradient-to-t ${b.barColor} transition-all duration-700 ease-out group-hover:brightness-110`}
                  style={{ height: `${Math.max(heightPercent, 6)}%` }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-slate-400 mt-2 text-center">
                {b.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>Evaluated Students: <strong className="text-slate-200">{totalStudents}</strong></span>
        <span>Grade Histogram</span>
      </div>
    </div>
  );
};

export default PerformanceDistributionChart;
