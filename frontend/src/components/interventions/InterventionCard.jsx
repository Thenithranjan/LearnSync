import React, { useState } from 'react';
import InterventionStatus from './InterventionStatus';
import { Calendar, User, BookOpen, ArrowRight, CheckCircle2, PlayCircle, MessageSquare } from 'lucide-react';

const InterventionCard = ({
  intervention,
  userRole,
  onAcknowledge,
  onStart,
  onComplete,
  onReview
}) => {
  const [responseInput, setResponseInput] = useState('');
  const [showResponseBox, setShowResponseBox] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPriorityBadge = (pri) => {
    switch (pri) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white';
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const formattedDueDate = intervention.dueDate
    ? new Date(intervention.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No Due Date';

  const handleAction = async (actionFn, param) => {
    setLoading(true);
    try {
      await actionFn(intervention._id, param);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 space-y-4 shadow-lg">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase tracking-wider">
              {intervention.actionType?.replace('_', ' ')}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge(intervention.priority)}`}>
              {intervention.priority} Priority
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100">{intervention.title}</h3>
          <p className="text-xs text-slate-400">
            Course: <strong className="text-slate-200">{intervention.courseId?.title || 'General'}</strong> ({intervention.courseId?.code})
          </p>
        </div>

        <InterventionStatus status={intervention.status} />
      </div>

      {/* Description / Task Reason */}
      {intervention.description && (
        <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          🎯 <strong className="text-slate-200 font-semibold">Objective & Reason:</strong> {intervention.description}
        </p>
      )}

      {/* Meta Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            Due: <strong className="text-slate-200">{formattedDueDate}</strong>
          </span>
          {userRole !== 'STUDENT' && (
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              Student: <strong className="text-slate-200">{intervention.studentId?.name}</strong>
            </span>
          )}
        </div>

        {/* Action Controls for Student */}
        {userRole === 'STUDENT' && (
          <div className="flex items-center gap-2">
            {intervention.status === 'ASSIGNED' && onAcknowledge && (
              <button
                onClick={() => handleAction(onAcknowledge)}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Acknowledge
              </button>
            )}

            {(intervention.status === 'ACKNOWLEDGED' || intervention.status === 'OVERDUE') && onStart && (
              <button
                onClick={() => handleAction(onStart)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Start Action</span>
              </button>
            )}

            {intervention.status === 'IN_PROGRESS' && onComplete && (
              <>
                {!showResponseBox ? (
                  <button
                    onClick={() => setShowResponseBox(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete & Submit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full mt-2">
                    <input
                      type="text"
                      placeholder="Optional notes or reflection..."
                      value={responseInput}
                      onChange={(e) => setResponseInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 flex-1"
                    />
                    <button
                      onClick={() => handleAction(onComplete, responseInput)}
                      disabled={loading}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-500 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Faculty Review Control */}
        {userRole !== 'STUDENT' && (intervention.status === 'COMPLETED' || intervention.status === 'REVIEWED') && onReview && (
          <button
            onClick={() => onReview(intervention)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{intervention.status === 'REVIEWED' ? 'Edit Review' : 'Review & Evaluate'}</span>
          </button>
        )}
      </div>

      {/* Student Reflection Response view */}
      {intervention.studentResponse && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Response / Reflection:</span>
          <p className="text-slate-200 italic">"{intervention.studentResponse}"</p>
        </div>
      )}

      {/* Faculty Outcome & Notes */}
      {intervention.facultyNotes && (
        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Faculty Notes:</span>
            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
              Outcome: {intervention.outcome}
            </span>
          </div>
          <p className="text-slate-200">{intervention.facultyNotes}</p>
        </div>
      )}
    </div>
  );
};

export default InterventionCard;
