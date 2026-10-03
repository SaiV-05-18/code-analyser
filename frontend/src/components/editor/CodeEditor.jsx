import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { FileCode, Loader2, Copy, Check, Trash2, RotateCcw } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  language = 'python',
  filename = 'main.py',
  onResetSample
}) {
  const [copied, setCopied] = useState(false);

  // Normalize language for Monaco
  const getMonacoLang = (lang) => {
    const l = lang?.toLowerCase() || 'python';
    if (l === 'c++') return 'cpp';
    if (l === 'c') return 'c';
    if (l === 'java') return 'java';
    return 'python';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    onChange('');
  };

  const lineCount = code ? code.split('\n').length : 0;
  const charCount = code ? code.length : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col transition-all">
      {/* Editor Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 text-xs gap-2">
        {/* Left Window Dots & Tab */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>

          <div className="flex items-center space-x-2 bg-white text-slate-800 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <FileCode className="w-3.5 h-3.5 text-slate-700" />
            <span className="font-mono text-xs font-semibold">{filename}</span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-mono px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            {language}
          </span>
        </div>

        {/* Right Action Buttons & Quick Stats */}
        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-400 font-mono mr-2">
            <span>{lineCount} lines</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>

          {onResetSample && (
            <button
              onClick={onResetSample}
              type="button"
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              title="Reset to default sample code"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            type="button"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            type="button"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[11px] font-medium border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Clear editor code"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="relative h-[420px] w-full bg-white">
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          value={code}
          theme="vs"
          onChange={(val) => onChange(val || '')}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 space-x-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
              <span>Initializing Monaco Editor...</span>
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            renderLineHighlight: 'all',
            padding: { top: 14, bottom: 14 },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on'
          }}
        />
      </div>
    </div>
  );
}
