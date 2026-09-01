import React from 'react';

const PerformanceCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  weightBadge,
  suffix = '%'
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      text: 'text-indigo-400',
      gradient: 'from-indigo-500/20 to-transparent'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-transparent'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      gradient: 'from-amber-500/20 to-transparent'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      gradient: 'from-cyan-500/20 to-transparent'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      gradient: 'from-rose-500/20 to-transparent'
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
      gradient: 'from-violet-500/20 to-transparent'
    }
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-900/60 border ${scheme.border} p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/5`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-50`} />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-slate-100">
              {value !== null && value !== undefined ? `${value}${suffix}` : 'N/A'}
            </span>
            {weightBadge && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                {weightBadge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceCard;
