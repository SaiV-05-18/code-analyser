import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';

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
      </div>

      {/* Right Status */}
      <div className="flex items-center space-x-3 ml-auto">
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-medium text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
          <span>AST + ML Security</span>
        </div>
      </div>
    </header>
  );
}
