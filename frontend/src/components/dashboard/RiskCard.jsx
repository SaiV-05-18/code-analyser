import React from 'react';
import { ShieldAlert, Cpu, Award, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function RiskCards({ result }) {
  if (!result) return null;

  const { prediction, metrics, securityIssues } = result;

  const riskBadgeColor = {
    Low: 'bg-emerald-500/15 text-emerald-700 border-emerald-300/80',
    Medium: 'bg-amber-500/15 text-amber-700 border-amber-300/80',
    High: 'bg-rose-500/15 text-rose-700 border-rose-300/80',
  }[prediction.risk] || 'bg-slate-100 text-slate-700 border-slate-200';

  const riskTextColor = {
    Low: 'text-emerald-600',
    Medium: 'text-amber-600',
    High: 'text-rose-600',
  }[prediction.risk] || 'text-slate-600';

  const riskBarGradient = {
    Low: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    Medium: 'bg-gradient-to-r from-amber-400 to-orange-500',
    High: 'bg-gradient-to-r from-rose-500 to-red-600',
  }[prediction.risk] || 'bg-slate-400';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Defect Risk Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Defect Risk
          </span>
          <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs', riskBadgeColor)}>
            {prediction.risk} Risk
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={clsx('text-3xl font-extrabold tracking-tight', riskTextColor)}>
            {prediction.probability}%
          </span>
          <span className="text-xs text-slate-500 font-medium">Probability</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className={clsx('h-2 rounded-full transition-all duration-700 ease-out', riskBarGradient)}
            style={{ width: `${prediction.probability}%` }}
          />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-400 font-medium flex items-center justify-between">
          <span>ML Confidence</span>
          <span className="font-semibold text-slate-600">{prediction.class}</span>
        </p>
      </div>

      {/* 2. Maintainability Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-slate-700" />
            Maintainability
          </span>
          <span className="w-7 h-7 rounded-xl bg-black text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            {metrics.maintainabilityGrade}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.maintainabilityIndex}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-black transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, metrics.maintainabilityIndex))}%` }}
          />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span>Status Rating</span>
          <span className="font-bold text-slate-900">{metrics.maintainabilityRating}</span>
        </p>
      </div>

      {/* 3. Complexity Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            Complexity
          </span>
          <span className={clsx(
            'text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs',
            metrics.complexityRating === 'High' ? 'bg-rose-500/15 text-rose-700 border-rose-300' :
              metrics.complexityRating === 'Medium' ? 'bg-amber-500/15 text-amber-700 border-amber-300' :
                'bg-emerald-500/15 text-emerald-700 border-emerald-300'
          )}>
            {metrics.complexityRating}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.cyclomaticComplexity}
          </span>
          <span className="text-xs text-slate-400 font-medium">Cyclomatic index</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-700 ease-out',
              metrics.complexityRating === 'High' ? 'bg-gradient-to-r from-rose-500 to-red-600' :
                metrics.complexityRating === 'Medium' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-emerald-400 to-teal-500'
            )}
            style={{ width: `${Math.min(100, (metrics.cyclomaticComplexity / 20) * 100)}%` }}
          />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span>Branch Points</span>
          <span className="font-semibold text-slate-700">{metrics.branchCount} branches • {metrics.loopCount} loops</span>
        </p>
      </div>

      {/* 4. Security Issues Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            Security Issues
          </span>
          <span className={clsx(
            'text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs',
            securityIssues.length > 0 ? 'bg-rose-500/15 text-rose-700 border-rose-300' : 'bg-emerald-500/15 text-emerald-700 border-emerald-300'
          )}>
            {securityIssues.length > 0 ? (securityIssues.some(s => s.severity === 'Critical' || s.severity === 'High') ? 'High Alert' : 'Moderate') : 'Clean'}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={clsx('text-3xl font-extrabold tracking-tight', securityIssues.length > 0 ? 'text-rose-600' : 'text-slate-900')}>
            {securityIssues.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">Vulnerabilities</span>
        </div>
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-700 ease-out',
              securityIssues.length > 0 ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
            )}
            style={{ width: securityIssues.length > 0 ? `${Math.min(100, securityIssues.length * 25)}%` : '100%' }}
          />
        </div>
        <p className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-between font-medium">
          <span>Static Check</span>
          <span className={securityIssues.length > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
            {securityIssues.length > 0 ? `${securityIssues.length} detected` : 'Passed all checks'}
          </span>
        </p>
      </div>
    </div>
  );
}
