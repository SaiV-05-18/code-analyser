import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, ExternalLink, Code2, CheckCircle2, X, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

export default function History() {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const loadHistory = () => {
    try {
      const data = JSON.parse(localStorage.getItem('analyzer_history') || '[]');
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire analysis history?')) {
      localStorage.removeItem('analyzer_history');
      setHistory([]);
      setSelectedItem(null);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/15 text-rose-700 border-rose-300';
      case 'medium':
        return 'bg-amber-500/15 text-amber-700 border-amber-300';
      default:
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-300';
    }
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = (item.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.language || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || item.defectRisk?.toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header & Clear Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analysis History</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {history.length} Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review previous scans, defect estimations, and extracted AST metrics saved in your session.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full transition-all self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      {history.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by filename or language..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Risk Filter:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-full px-4 py-2 outline-hidden focus:ring-2 focus:ring-black cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
          </div>
        </div>
      )}

      {/* History Table or Empty State */}
      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-black text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-black/10">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No History Recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Analyses you run will automatically be logged here with timestamps and snapshot metrics.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">File Name</th>
                  <th className="py-3.5 px-4">Language</th>
                  <th className="py-3.5 px-4">Defect Risk</th>
                  <th className="py-3.5 px-4">Complexity</th>
                  <th className="py-3.5 px-4">Maintainability</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Code2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.filename || 'snippet.py'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px] border border-slate-200">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={clsx('px-2.5 py-0.5 rounded-full font-bold border text-[11px] inline-flex items-center gap-1', getRiskColor(item.defectRisk))}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                        {item.defectRisk} ({item.defectProbability}%)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {item.complexity}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.maintainability}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-emerald-600 gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {item.status || 'Success'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        className="text-slate-900 hover:text-black font-semibold text-xs inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Snapshot Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedItem.filename}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">Scan Snapshot Details</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Target Language</span>
                  <p className="font-bold text-slate-800 mt-1">{selectedItem.language}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Scan Timestamp</span>
                  <p className="font-bold text-slate-800 mt-1">{selectedItem.date}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Defect Risk</span>
                  <p className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <span className={clsx('px-2.5 py-0.5 rounded-full border text-[11px] font-semibold', getRiskColor(selectedItem.defectRisk))}>
                      {selectedItem.defectRisk} ({selectedItem.defectProbability}%)
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block">Complexity</span>
                  <p className="font-bold text-slate-800 mt-1 font-mono">{selectedItem.complexity}</p>
                </div>
              </div>

              {selectedItem.codeSnippet && (
                <div>
                  <span className="text-slate-500 block mb-1.5 font-bold text-xs">Code Snippet Snapshot:</span>
                  <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800">
                    {selectedItem.codeSnippet}...
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-semibold rounded-full text-xs shadow-xs transition-colors cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
