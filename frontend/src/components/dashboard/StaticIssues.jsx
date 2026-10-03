import React from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function StaticIssues({ securityIssues = [], styleIssues = [] }) {
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/15 text-rose-700 border-rose-300';
      case 'high':
        return 'bg-red-500/15 text-red-700 border-red-300';
      case 'medium':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Static Analysis & Linting Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated rule-based security audits and formatting checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Issues Panel (Bandit / Static Security) */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Security Vulnerabilities</h3>
            </div>
            <span className={clsx(
              'text-xs font-bold px-2.5 py-0.5 rounded-full border',
              securityIssues.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            )}>
              {securityIssues.length} found
            </span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {securityIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600">No security vulnerabilities detected.</span>
                <span className="text-[11px] text-slate-400">Clean AST scan passed.</span>
              </div>
            ) : (
              securityIssues.map((issue, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-rose-200 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                      Line {issue.line}
                    </span>
                    <span className={clsx('px-2 py-0.5 rounded-full font-bold border text-[10px]', getSeverityBadge(issue.severity))}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs leading-relaxed">{issue.message || issue.description || issue.title}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Code Quality & Style Issues */}
        <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Quality & Style Warnings</h3>
            </div>
            <span className={clsx(
              'text-xs font-bold px-2.5 py-0.5 rounded-full border',
              styleIssues.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            )}>
              {styleIssues.length} found
            </span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {styleIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-slate-600">No style or quality violations detected.</span>
                <span className="text-[11px] text-slate-400">Conforms to standard coding conventions.</span>
              </div>
            ) : (
              styleIssues.map((issue, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-200 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                      Line {issue.line}
                    </span>
                    <span className={clsx('px-2 py-0.5 rounded-full font-bold border text-[10px]', getSeverityBadge(issue.severity))}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium text-xs leading-relaxed">{issue.message || issue.description || issue.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
