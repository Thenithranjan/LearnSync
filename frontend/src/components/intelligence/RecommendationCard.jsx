import React, { useState } from 'react';
import { BookOpen, CheckCircle, X, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';

const RecommendationCard = ({ recommendation, onComplete, onDismiss }) => {
  const [loadingAction, setLoadingAction] = useState(false);

  const getPriorityBadge = (pri) => {
    switch (pri) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'MATERIAL':
        return BookOpen;
      case 'PRACTICE':
        return HelpCircle;
      default:
        return AlertCircle;
    }
  };

  const Icon = getTypeIcon(recommendation.type);

  const handleAction = async (actionFn) => {
    setLoadingAction(true);
    try {
      await actionFn(recommendation._id);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
            <Icon className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">{recommendation.title}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase ${getPriorityBadge(recommendation.priority)}`}>
                {recommendation.priority}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{recommendation.description}</p>
            <p className="text-[11px] text-slate-500 font-medium">🎯 Reason: {recommendation.reason}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {recommendation.targetUrl && (
            <a
              href={recommendation.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Open Target Resource"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {onComplete && (
            <button
              onClick={() => handleAction(onComplete)}
              disabled={loadingAction}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              title="Mark as Completed"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Done</span>
            </button>
          )}

          {onDismiss && (
            <button
              onClick={() => handleAction(onDismiss)}
              disabled={loadingAction}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
              title="Dismiss Recommendation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
