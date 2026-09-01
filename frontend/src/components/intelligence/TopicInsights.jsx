import React from 'react';
import { Award, Zap, AlertCircle } from 'lucide-react';

const TopicInsights = ({ strongTopics = [], developingTopics = [], attentionTopics = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Strong Topics */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Award className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Strong Mastery (≥75%)</h4>
        </div>
        {strongTopics.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No strong topics recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {strongTopics.map((t, i) => (
              <li key={i} className="p-2 rounded-lg bg-slate-800/40 flex items-center justify-between">
                <span className="text-xs text-slate-200 font-medium">{t.topic}</span>
                <span className="text-xs font-bold text-emerald-400">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Developing Topics */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400">
          <Zap className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Developing (60–74%)</h4>
        </div>
        {developingTopics.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No developing topics recorded.</p>
        ) : (
          <ul className="space-y-2">
            {developingTopics.map((t, i) => (
              <li key={i} className="p-2 rounded-lg bg-slate-800/40 flex items-center justify-between">
                <span className="text-xs text-slate-200 font-medium">{t.topic}</span>
                <span className="text-xs font-bold text-amber-400">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attention Topics */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertCircle className="w-4 h-4" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Needs Attention (&lt;60%)</h4>
        </div>
        {attentionTopics.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No critical attention areas flagged.</p>
        ) : (
          <ul className="space-y-2">
            {attentionTopics.map((t, i) => (
              <li key={i} className="p-2 rounded-lg bg-slate-800/40 flex items-center justify-between">
                <span className="text-xs text-slate-200 font-medium">{t.topic}</span>
                <span className="text-xs font-bold text-rose-400">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TopicInsights;
