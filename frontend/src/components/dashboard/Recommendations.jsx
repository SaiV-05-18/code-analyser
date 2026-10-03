import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export default function Recommendations({ recommendations = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-6">
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Refactoring & Optimization Tips</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Automated
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Contextual clean-code and architecture recommendations</p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <div className="flex items-center space-x-3 py-6 px-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Code meets best practice guidelines. No specific refactoring required.</span>
          </div>
        ) : (
          recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start space-x-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all group"
            >
              <div className="w-5 h-5 rounded-md bg-black text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {index + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {rec}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
