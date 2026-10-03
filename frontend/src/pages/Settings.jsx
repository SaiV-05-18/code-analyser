import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Shield } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('analyzer_settings') || '{}');
    } catch {
      return {
        defaultLanguage: 'Python',
        autoRunOnUpload: false,
        showRecommendations: true,
        darkMode: false,
      };
    }
  });

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('analyzer_settings', JSON.stringify(settings));
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure default analysis behaviors, editor language bindings, and workspace preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Analysis Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-3 pb-4 mb-5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Analysis Options</h2>
              <p className="text-xs text-slate-400">Scanner runtime behavior and default triggers</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Default Language */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="font-bold text-slate-800 text-sm">Default Language</label>
                <p className="text-slate-500 text-xs mt-0.5">Pre-selected programming language for new workspace sessions</p>
              </div>
              <select
                value={settings.defaultLanguage || 'Python'}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-full px-4 py-2 outline-hidden focus:ring-2 focus:ring-black w-full sm:w-48 cursor-pointer shadow-2xs"
              >
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
              </select>
            </div>

            {/* Auto Run on Upload */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-800 text-sm">Auto-run Analysis on Upload</span>
                <p className="text-slate-500 text-xs mt-0.5">Automatically trigger scans immediately when a source file is selected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.autoRunOnUpload}
                  onChange={(e) => setSettings({ ...settings, autoRunOnUpload: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            {/* Show Recommendations */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-800 text-sm">Show AI Recommendations</span>
                <p className="text-slate-500 text-xs mt-0.5">Display contextual refactoring and quality improvement recommendations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRecommendations !== false}
                  onChange={(e) => setSettings({ ...settings, showRecommendations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Engine Pipeline Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Engine Configuration</h2>
              <p className="text-xs text-slate-400">Underlying ML models and AST parsing tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">AST Static Parser</span>
              <p className="font-bold text-slate-800 mt-1">Radon AST + Bandit Security</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Inference Engine</span>
              <p className="font-bold text-slate-800 mt-1">XGBoost & RandomForest Ensemble</p>
            </div>
          </div>
        </div>

        {/* Save & Feedback Toolbar */}
        <div className="flex items-center justify-between pt-2">
          {savedNotification ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-full border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Settings are persisted locally to your browser profile.</span>
          )}

          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-7 py-3 bg-black hover:bg-slate-800 text-white rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
