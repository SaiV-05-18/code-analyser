import React from 'react';
import { Code, GitBranch, MessageSquare, Gauge, Sparkles } from 'lucide-react';
import clsx from 'clsx';

export default function MetricsGrid({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Code Metrics & AST Measurements
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Syntactic tree inspection and static volume parameters</p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
          AST Extracted
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lines of Code */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Lines of Code</p>
              <p className="text-2xl font-extrabold text-slate-900">{metrics.loc}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Functions:</span>
            <span className="font-semibold text-slate-700">{metrics.functionCount}</span>
          </div>
        </div>

        {/* Cyclomatic Complexity */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
              metrics.complexityRating === 'High' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                metrics.complexityRating === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            )}>
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Cyclomatic Index</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{metrics.cyclomaticComplexity}</span>
                <span className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  metrics.complexityRating === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    metrics.complexityRating === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                )}>
                  {metrics.complexityRating}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Branches / Loops:</span>
            <span className="font-semibold text-slate-700">{metrics.branchCount} / {metrics.loopCount}</span>
          </div>
        </div>

        {/* Comment Density */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
              metrics.commentDensity < 10 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
            )}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Comment Ratio</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{metrics.commentDensity}%</span>
                <span className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  metrics.commentDensity < 10 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                )}>
                  {metrics.commentDensity < 10 ? 'Low' : 'Healthy'}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Doc Coverage:</span>
            <span className="font-semibold text-slate-700">{metrics.commentDensity >= 15 ? 'Good' : 'Needs Docs'}</span>
          </div>
        </div>

        {/* Maintainability Index */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Maintainability</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-slate-900">{metrics.maintainabilityIndex}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Grade {metrics.maintainabilityGrade}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Rating:</span>
            <span className="font-semibold text-indigo-700">{metrics.maintainabilityRating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
