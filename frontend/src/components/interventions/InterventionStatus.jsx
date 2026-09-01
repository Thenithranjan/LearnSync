import React from 'react';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, HelpCircle, FileCheck, XCircle } from 'lucide-react';

const InterventionStatus = ({ status, size = 'md' }) => {
  const getConfig = (st) => {
    switch (st) {
      case 'PENDING':
        return {
          label: 'Pending Assignment',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: Clock
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: AlertCircle
        };
      case 'ACKNOWLEDGED':
        return {
          label: 'Acknowledged',
          badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: HelpCircle
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
          icon: PlayCircle
        };
      case 'COMPLETED':
        return {
          label: 'Action Completed',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: CheckCircle2
        };
      case 'REVIEWED':
        return {
          label: 'Faculty Reviewed',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: FileCheck
        };
      case 'OVERDUE':
        return {
          label: 'Overdue',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: AlertCircle
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: XCircle
        };
      default:
        return {
          label: st,
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: HelpCircle
        };
    }
  };

  const config = getConfig(status);
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${sizeClasses} ${config.badge}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export default InterventionStatus;
