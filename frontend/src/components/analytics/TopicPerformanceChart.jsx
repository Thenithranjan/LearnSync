import React from 'react';

const TopicPerformanceChart = ({ topics = [] }) => {
  if (!topics.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-sm">
        <p>No topic assessment data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {topics.map((t, idx) => {
        const accuracy = t.accuracy !== null && t.accuracy !== undefined ? t.accuracy : 0;
        const width = `${Math.min(100, Math.max(0, accuracy))}%`;

        let color = 'from-indigo-500 to-violet-500';
        let badgeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';

        if (accuracy >= 80) {
          color = 'from-emerald-500 to-teal-400';
          badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        } else if (accuracy >= 60) {
          color = 'from-indigo-500 to-cyan-400';
          badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        } else if (accuracy >= 40) {
          color = 'from-amber-500 to-yellow-400';
          badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        } else {
          color = 'from-rose-500 to-red-400';
          badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
        }

        return (
          <div key={t.topic || idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{t.topic}</span>
                <span className="text-[11px] text-slate-500">
                  ({t.correctAnswers}/{t.questionsAttempted} questions)
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
              >
                {accuracy}%
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TopicPerformanceChart;
