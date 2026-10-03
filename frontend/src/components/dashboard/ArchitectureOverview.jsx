import React from 'react';
import { Layers, ArrowRight, Cpu, GitBranch } from 'lucide-react';

export default function ArchitectureOverview() {
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Dual-Engine System Architecture
            </h3>
            <p className="text-[11px] text-slate-400">
              Integrated Static AST Analysis & Machine Learning Defect Classifier
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          FastAPI & ML Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Static Analysis Pipeline */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center space-x-2 mb-2.5 text-slate-900 font-bold">
            <GitBranch className="w-4 h-4 text-slate-800" />
            <h4>1. Static AST Analysis Pipeline</h4>
          </div>
          <p className="text-slate-500 mb-3 text-[11px] leading-relaxed">
            Deterministic syntax parsing, complexity calculation, and security audit:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              AST Parser
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Radon (Metrics)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Bandit (Security)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Flake8 / Pylint
            </span>
          </div>
        </div>

        {/* Machine Learning Pipeline */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all">
          <div className="flex items-center space-x-2 mb-2.5 text-slate-900 font-bold">
            <Cpu className="w-4 h-4 text-slate-800" />
            <h4>2. Machine Learning Pipeline</h4>
          </div>
          <p className="text-slate-500 mb-3 text-[11px] leading-relaxed">
            Statistical defect prediction through pre-trained inference models:
          </p>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Feature Vector
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Normalizer
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-2xs">
              Trained Model
            </span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="px-2.5 py-1 rounded-lg bg-black text-white font-bold font-mono text-[10px] shadow-xs">
              Defect %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
