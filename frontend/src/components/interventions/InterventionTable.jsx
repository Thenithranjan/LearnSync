import React from 'react';
import { Search, ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';
import InterventionStatus from './InterventionStatus';

const InterventionTable = ({
  interventions = [],
  pagination = {},
  onPageChange,
  onReview,
  loading
}) => {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Intervention</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  Loading interventions...
                </td>
              </tr>
            ) : interventions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-500">
                  No interventions found matching filter criteria.
                </td>
              </tr>
            ) : (
              interventions.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <p className="font-bold text-slate-200">{item.title}</p>
                      <p className="text-[10px] text-slate-400">{item.courseId?.title}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-[10px]">
                        {item.studentId?.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-medium text-slate-300">{item.studentId?.name || 'N/A'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">{item.topic}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        item.priority === 'CRITICAL'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : item.priority === 'HIGH'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <InterventionStatus status={item.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onReview && onReview(item)}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Page <strong className="text-slate-200">{pagination.page}</strong> of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterventionTable;
