import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Code2, History, Sliders } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({ isOpen }) {
  const navItems = [
    { to: '/analyze', icon: Code2, label: 'Analyze Code', badge: 'Live' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/settings', icon: Sliders, label: 'Settings' },
  ];

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white text-slate-700 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col border-r border-slate-200/80 shadow-xs',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Brand Header - Clicking takes back to Home */}
      <Link
        to="/"
        className="flex items-center px-6 h-16 border-b border-slate-100 group hover:bg-slate-50/60 transition-colors cursor-pointer"
        title="Go to Home"
      >
        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs mr-3 shrink-0 group-hover:scale-105 transition-transform">
          <Code2 className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900 tracking-tight block group-hover:text-black transition-colors">
            Code Analyzer
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            AST & ML Platform
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer',
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/70'
              )
            }
          >
            <div className="flex items-center">
              <item.icon className="w-4 h-4 mr-3 shrink-0 transition-transform duration-200 group-hover:scale-105" />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/20">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
