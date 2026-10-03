import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  AlertTriangle,
  Layers,
  Award,
  ShieldCheck,
  Cpu,
  GitBranch,
  Terminal,
  Sliders,
} from 'lucide-react';
import ArchitectureOverview from '../components/dashboard/ArchitectureOverview';

export default function Home() {
  const [stats] = useState(() => {
    try {
      const history = JSON.parse(localStorage.getItem('analyzer_history') || '[]');
      if (history.length > 0) {
        const total = history.length;
        const highRisk = history.filter((h) => h.defectRisk === 'High').length;
        const sumComplexity = history.reduce((acc, h) => acc + (parseInt(h.complexity) || 0), 0);

        let sumMaintainability = 0;
        let validMIs = 0;
        history.forEach((h) => {
          const match = h.maintainability?.match(/\d+/);
          if (match) {
            sumMaintainability += parseInt(match[0]);
            validMIs++;
          }
        });

        return {
          total,
          highRisk,
          avgComplexity: Math.round(sumComplexity / total),
          avgMaintainability: validMIs > 0 ? Math.round(sumMaintainability / validMIs) : 0,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      total: 0,
      highRisk: 0,
      avgComplexity: 0,
      avgMaintainability: 0,
    };
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 relative">
      {/* Corner Settings Action Button */}
      <div className="fixed top-6 right-6 z-50">
        <Link
          to="/settings"
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-black border border-slate-200/80 shadow-xs backdrop-blur-md text-xs font-semibold transition-all duration-200 hover:shadow-sm"
          title="Settings"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Centered App Icon (Uber-style rounded squircle) */}
        <div className="flex justify-center pt-20 pb-6 sm:pt-28 sm:pb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black text-white flex items-center justify-center shadow-xl shadow-slate-900/15 ring-1 ring-black/10 hover:scale-105 transition-all duration-300">
            <Terminal className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[2.2]" />
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
            Analyze code quality.
            <br />
            Predict defect risk.
          </h1>
          <p className="text-base sm:text-lg text-slate-500 font-normal max-w-2xl mx-auto mt-6 leading-relaxed">
            Featuring AST static parsing, security vulnerability scanning, and ML defect prediction —
            detect software defects before production.
          </p>

          {/* Centered Pill Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-black hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-black/10 hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Start Analyzing</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>

            <Link
              to="/history"
              className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs sm:text-sm shadow-2xs hover:border-slate-300 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View History</span>
              <ArrowRight className="w-4 h-4 ml-0.5 text-slate-400" />
            </Link>
          </div>

          {/* Subtitle / Tech stack chips */}
          <div className="mt-14 mb-16">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">
              Engineered for Developers & Teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Python', 'Java', 'C / C++', 'AST Radon', 'Bandit Security', 'XGBoost ML'].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/60 text-slate-600 text-[11px] font-medium"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Content Section: Summary Metrics */}
        <section className="space-y-8 pt-4 pb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              Workspace Analysis Summary
            </h2>
            <span className="text-[11px] text-slate-400">Real-time local metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Analyses */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Scans
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Code2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Scans recorded</p>
            </div>

            {/* High Risk Findings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  High Risk
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {stats.highRisk}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Critical attention needed</p>
            </div>

            {/* Avg Complexity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Avg Complexity
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.avgComplexity || '—'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Cyclomatic index</p>
            </div>

            {/* Avg Maintainability */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Avg Maintainability
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.avgMaintainability ? `${stats.avgMaintainability}/100` : '—'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Overall health score</p>
            </div>
          </div>

          {/* Feature Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <GitBranch className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AST & Metric Extraction</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Extracts AST nodes, lines of code, branch decision points, loop structures, and calculates cyclomatic complexity index.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Security & Static Linting</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Flags critical security vulnerabilities like hardcoded secrets, unsafe file operations, and code style violations in real-time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">ML Defect Prediction</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Uses trained machine learning classifiers to estimate defect probabilities, giving teams early warning before regressions happen.
              </p>
            </div>
          </div>

          {/* System Architecture Overview */}
          <div className="pt-4">
            <ArchitectureOverview />
          </div>

          {/* Minimalist Landing Footer */}
          <footer className="pt-12 pb-16 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Code Quality Analyzer</span>
              <span>•</span>
              <span>Dual-Engine Intelligence</span>
            </div>
            <span className="text-slate-400 font-medium">AST Parsing & ML Defect Prediction</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
