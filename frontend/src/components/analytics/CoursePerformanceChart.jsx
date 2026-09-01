import React from 'react';

const CoursePerformanceChart = ({ courses = [] }) => {
  if (!courses.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-sm">
        <p>No course performance records available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course, idx) => {
        const score = course.overallScore !== null && course.overallScore !== undefined
          ? course.overallScore
          : (course.averagePerformance !== null && course.averagePerformance !== undefined ? course.averagePerformance : null);

        const scoreText = score !== null ? `${score}%` : 'N/A';
        const progressWidth = score !== null ? `${Math.min(100, Math.max(0, score))}%` : '0%';

        let barColor = 'from-indigo-500 to-violet-500';
        if (score !== null) {
          if (score >= 80) barColor = 'from-emerald-500 to-teal-400';
          else if (score >= 65) barColor = 'from-indigo-500 to-cyan-400';
          else if (score >= 50) barColor = 'from-amber-500 to-yellow-400';
          else barColor = 'from-rose-500 to-red-400';
        }

        return (
          <div key={course.courseId || idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {course.title || course.name}
                </span>
                {course.code && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {course.code}
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-300">{scoreText}</span>
            </div>

            <div className="h-3 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
                style={{ width: progressWidth }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CoursePerformanceChart;
