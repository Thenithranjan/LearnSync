import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const RiskFactors = ({ factors = [], explanation }) => {
  if (!factors.length) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs text-center">
        No specific risk factors flagged. All indicators are performing satisfactorily.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {explanation && (
        <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
          💡 <strong className="text-slate-100 font-semibold">Diagnostic Insight:</strong> {explanation}
        </p>
      )}

      <div className="space-y-2.5">
        {factors.map((f, idx) => {
          let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          let StatusIcon = CheckCircle2;

          if (f.status === 'ATTENTION') {
            statusBadge = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            StatusIcon = AlertCircle;
          } else if (f.status === 'NEUTRAL') {
            statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            StatusIcon = HelpCircle;
          }

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <StatusIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${f.status === 'ATTENTION' ? 'text-rose-400' : f.status === 'NEUTRAL' ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{f.factor}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Weight: {f.weight}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.description}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusBadge}`}>
                  +{f.contribution} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskFactors;
