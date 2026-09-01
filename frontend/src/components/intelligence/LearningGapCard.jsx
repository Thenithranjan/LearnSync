import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

const LearningGapCard = ({ gap }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{gap.topic}</h4>
            <p className="text-xs text-slate-400">
              Concept Accuracy: <strong className="text-slate-200">{gap.accuracy}%</strong> ({gap.questionsAttempted} questions evaluated)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(gap.severity)}`}>
            {gap.severity} Priority
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="View evidence details"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Evidence View */}
      {expanded && gap.evidence && gap.evidence.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-indigo-400" /> Evidence Attribution:
          </span>
          <ul className="space-y-1.5 pl-2">
            {gap.evidence.map((ev, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>{ev.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LearningGapCard;
