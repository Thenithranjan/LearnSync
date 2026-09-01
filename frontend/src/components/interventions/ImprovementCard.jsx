import React from 'react';
import { TrendingUp, Award, CheckCircle2, Clock, HelpCircle } from 'lucide-react';

const ImprovementCard = ({ outcome }) => {
  const isPositive = outcome.improvement > 0;
  const isDeclined = outcome.improvement < 0;

  const getClassificationBadge = (cls) => {
    switch (cls) {
      case 'SIGNIFICANT_IMPROVEMENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MODERATE_IMPROVEMENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DECLINE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concept Area</span>
          <h4 className="text-sm font-bold text-slate-100">{outcome.topic}</h4>
          <p className="text-xs text-slate-400">{outcome.courseId?.title}</p>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getClassificationBadge(outcome.classification)}`}>
          {outcome.classification?.replace('_', ' ')}
        </span>
      </div>

      {/* Score gain comparison */}
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Baseline Score</span>
          <p className="text-sm font-bold text-slate-300">{outcome.beforeScore}%</p>
        </div>

        <ArrowRightIcon className="w-4 h-4 text-slate-600" />

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Post-Action Score</span>
          <p className="text-sm font-bold text-slate-100">{outcome.afterScore}%</p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Net Gain</span>
          <p className={`text-sm font-extrabold ${isPositive ? 'text-emerald-400' : isDeclined ? 'text-rose-400' : 'text-slate-400'}`}>
            {isPositive ? `+${outcome.improvement}%` : `${outcome.improvement}%`}
          </p>
        </div>
      </div>
    </div>
  );
};

const ArrowRightIcon = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default ImprovementCard;
