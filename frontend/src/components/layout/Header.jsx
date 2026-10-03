import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShieldCheck, Terminal } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-8 text-slate-900 z-10 relative">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 mr-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Tagline */}
        <Link to="/" className="flex items-center space-x-3 group text-inherit no-underline">
          <div className="hidden sm:flex w-8 h-8 rounded-xl bg-black text-white items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                Code Quality Analyzer
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Engine Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Detect • Analyze • Improve</p>
          </div>
        </Link>
      </div>

      {/* Right Status (No Sign In) */}
      <div className="flex items-center space-x-3 ml-auto">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-medium text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
          <span>AST + ML Security</span>
        </div>
      </div>
    </header>
  );
}
