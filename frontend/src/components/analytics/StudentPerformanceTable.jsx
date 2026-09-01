import React, { useState } from 'react';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, User } from 'lucide-react';

const StudentPerformanceTable = ({ students = [], onSort, sortBy = 'overallScore', sortOrder = 'desc' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.department && s.department.toLowerCase().includes(term))
    );
  });

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
    );
  };

  const getScoreBadge = (score) => {
    if (score === null || score === undefined) {
      return <span className="text-slate-500 font-medium">N/A</span>;
    }
    let color = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (score >= 80) color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    else if (score >= 60) color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    else if (score >= 40) color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    else color = 'text-rose-400 bg-rose-500/10 border-rose-500/20';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
        {score}%
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing <strong className="text-slate-200">{filteredStudents.length}</strong> students
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left text-xs sm:text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th
                onClick={() => onSort && onSort('name')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200"
              >
                <div className="flex items-center gap-1.5">
                  <span>Student</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('overallScore')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Overall Score</span>
                  {renderSortIcon('overallScore')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('attendance')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Attendance</span>
                  {renderSortIcon('attendance')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('quizPerformance')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Quizzes</span>
                  {renderSortIcon('quizPerformance')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('assignmentPerformance')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Assignments</span>
                  {renderSortIcon('assignmentPerformance')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('learningProgress')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Progress</span>
                  {renderSortIcon('learningProgress')}
                </div>
              </th>
              <th
                onClick={() => onSort && onSort('engagement')}
                className="px-4 py-3 font-semibold cursor-pointer group hover:text-slate-200 text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Engagement</span>
                  {renderSortIcon('engagement')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => (
                <tr
                  key={s.studentId || idx}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {s.name ? s.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{s.name}</p>
                        <p className="text-[11px] text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.overallScore)}</td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.attendance)}</td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.quizPerformance)}</td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.assignmentPerformance)}</td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.learningProgress)}</td>
                  <td className="px-4 py-3 text-center">{getScoreBadge(s.engagement)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500 text-xs">
                  No student records matched your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentPerformanceTable;
