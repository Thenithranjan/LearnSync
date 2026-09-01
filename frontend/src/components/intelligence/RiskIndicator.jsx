import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RiskIndicator = ({ riskScore, riskLevel, trend, size = 'md' }) => {
  const getRiskConfig = (level) => {
    switch (level) {
      case 'LOW':
        return {
          label: 'Low Academic Risk',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: ShieldCheck,
          badgeColor: 'bg-emerald-500/20 text-emerald-300'
        };
      case 'MODERATE':
        return {
          label: 'Moderate Academic Risk',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          icon: AlertTriangle,
          badgeColor: 'bg-amber-500/20 text-amber-300'
        };
      case 'HIGH':
        return {
          label: 'High Academic Risk',
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/20',
          icon: ShieldAlert,
          badgeColor: 'bg-rose-500/20 text-rose-300'
        };
      case 'CRITICAL':
        return {
          label: 'Critical Attention Recommended',
          color: 'text-rose-500',
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/40',
          icon: ShieldAlert,
          badgeColor: 'bg-rose-600 text-white'
        };
      default:
        return {
          label: 'Insufficient Activity Data',
          color: 'text-slate-400',
          bg: 'bg-slate-800/40',
          border: 'border-slate-700/50',
          icon: HelpCircle,
          badgeColor: 'bg-slate-800 text-slate-400'
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const Icon = config.icon;

  const renderTrendIcon = () => {
    if (trend === 'IMPROVING') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" /> Improving
        </span>
      );
    }
    if (trend === 'DECLINING') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400">
          <TrendingDown className="w-3.5 h-3.5" /> Declining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
        <Minus className="w-3.5 h-3.5" /> Stable
      </span>
    );
  };

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color} ${config.border}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div className={`p-5 rounded-2xl border ${config.border} ${config.bg} backdrop-blur-xl space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-slate-900 border ${config.border} ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{config.label}</h3>
            <p className="text-xs text-slate-400">Explainable academic risk indicator</p>
          </div>
        </div>
        {renderTrendIcon()}
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-3xl font-extrabold text-slate-100">
            {riskScore !== null && riskScore !== undefined ? `${riskScore}/100` : 'N/A'}
          </span>
          <span className="ml-2 text-xs text-slate-400 font-medium">Risk Index</span>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${config.badgeColor}`}>
          {riskLevel || 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default RiskIndicator;
