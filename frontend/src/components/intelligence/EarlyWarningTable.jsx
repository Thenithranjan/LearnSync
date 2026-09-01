import React, { useState } from 'react';
import { ShieldAlert, TrendingDown, ChevronRight, User, Search } from 'lucide-react';

const EarlyWarningTable = ({ students = [], onSelectStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter at-risk students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-200">{filtered.length}</strong> flagged students
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Risk Level</th>
              <th className="py-3 px-4">Overall Score</th>
              <th className="py-3 px-4">Attendance</th>
              <th className="py-3 px-4">Flagged Reasons</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No students meet the early warning threshold criteria.
                </td>
              </tr>
            ) : (
              filtered.map((s, i) => (
                <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs">
                        {s.name?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        s.riskLevel === 'CRITICAL'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : s.riskLevel === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      <ShieldAlert className="w-3 h-3" />
                      {s.riskScore ? `${s.riskScore}/100` : s.riskLevel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {s.overallPerformance !== null ? `${s.overallPerformance}%` : 'N/A'}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {s.attendance !== null ? (
                      <span className={s.attendance < 75 ? 'text-rose-400' : 'text-slate-200'}>
                        {s.attendance}%
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {s.flags?.map((fl, flIdx) => (
                        <span
                          key={flIdx}
                          className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/80 text-[10px] text-slate-300"
                        >
                          {fl}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onSelectStudent && onSelectStudent(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-colors"
                    >
                      <span>Diagnose</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EarlyWarningTable;
