import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Upload, Check, RefreshCw, AlertTriangle, FileCode } from 'lucide-react';
import CodeEditor from '../components/editor/CodeEditor';
import RiskCards from '../components/dashboard/RiskCard';
import MetricsGrid from '../components/dashboard/MetricsGrid';
import StaticIssues from '../components/dashboard/StaticIssues';
import Recommendations from '../components/dashboard/Recommendations';
import PredictionResult from '../components/dashboard/PredictionResult';
import { analyzeCode } from '../services/analysisService';

const SAMPLE_CODES = {
  Python: `import os

def read_file(filename):
    with open(filename, "r") as file:
        return file.read()

def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item)
    return result

def main():
    filename = input("Enter file name: ")
    data = read_file(filename)
    processed = process_data([int(x) for x in data.split()])
    print("Processed data:", processed)

if __name__ == "__main__":
    main()`,

  Java: `import java.util.Scanner;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter threshold: ");
        int threshold = scanner.nextInt();
        
        ArrayList<Integer> numbers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            if (i > threshold) {
                numbers.add(i);
            }
        }
        System.out.println("Result: " + numbers);
    }
}`,

  C: `#include <stdio.h>
#include <stdlib.h>

int process_array(int *arr, int size) {
    int sum = 0;
    for (int i = 0; i < size; i++) {
        if (arr[i] > 0) {
            sum += arr[i];
        }
    }
    return sum;
}

int main() {
    int data[] = {1, -2, 3, 4, -5, 6};
    int total = process_array(data, 6);
    printf("Total sum: %d\\n", total);
    return 0;
}`,

  'C++': `#include <iostream>
#include <vector>
#include <algorithm>

class DataProcessor {
public:
    std::vector<int> filterPositive(const std::vector<int>& input) {
        std::vector<int> result;
        for (const auto& val : input) {
            if (val > 0) {
                result.push_back(val);
            }
        }
        return result;
    }
};

int main() {
    DataProcessor processor;
    std::vector<int> values = {10, -5, 20, -1, 30};
    auto filtered = processor.filterPositive(values);
    std::cout << "Filtered count: " << filtered.size() << std::endl;
    return 0;
}`
};

export default function Analyze() {
  const location = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState(() => location.state?.code || SAMPLE_CODES.Python);
  const [language, setLanguage] = useState(() => location.state?.language || 'Python');
  const [filename, setFilename] = useState(() => location.state?.filename || 'main.py');
  const [status, setStatus] = useState('initial'); // 'initial' | 'analyzing' | 'completed'
  const [result, setResult] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const extMap = { Python: 'main.py', Java: 'Main.java', C: 'main.c', 'C++': 'main.cpp' };
    setFilename(extMap[newLang] || 'main.txt');
    setCode(SAMPLE_CODES[newLang] || '');
    setResult(null);
    setIsStale(false);
    setError(null);
  };

  const handleResetSample = () => {
    setCode(SAMPLE_CODES[language] || '');
    setResult(null);
    setIsStale(false);
    setError(null);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (result) {
      setIsStale(true);
    }
    if (error) {
      setError(null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    setFilename(fileName);

    // Detect language from extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    let detectedLang = language;
    if (ext === 'py') detectedLang = 'Python';
    else if (ext === 'java') detectedLang = 'Java';
    else if (ext === 'c') detectedLang = 'C';
    else if (ext === 'cpp' || ext === 'cc' || ext === 'cxx') detectedLang = 'C++';

    setLanguage(detectedLang);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        setResult(null);
        setIsStale(false);
        setStatus('initial');
      }
    };
    reader.readAsText(file);
  };

  const saveToHistory = useCallback((entry) => {
    try {
      const existing = JSON.parse(localStorage.getItem('analyzer_history') || '[]');
      const updated = [entry, ...existing].slice(0, 50);
      localStorage.setItem('analyzer_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }, []);

  const triggerAnalysis = useCallback(async (codeToAnalyze = code, langToAnalyze = language, fileToSave = filename) => {
    setStatus('analyzing');
    setIsStale(false);
    setError(null);

    try {
      const analysisResult = await analyzeCode(codeToAnalyze, langToAnalyze);
      setResult(analysisResult);
      setStatus('completed');

      setTimeout(() => {
        setStatus('initial');
      }, 1800);

      // Save to localStorage history
      saveToHistory({
        filename: fileToSave,
        language: langToAnalyze,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        defectRisk: analysisResult.prediction.risk,
        defectProbability: analysisResult.prediction.probability,
        complexity: analysisResult.metrics.cyclomaticComplexity,
        maintainability: `${analysisResult.metrics.maintainabilityGrade} (${analysisResult.metrics.maintainabilityIndex})`,
        status: 'Success',
        codeSnippet: codeToAnalyze.slice(0, 150),
        code: codeToAnalyze,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Analysis failed.');
      setStatus('initial');
    }
  }, [code, language, filename, saveToHistory]);

  // Handle rerunning or loading code snippet from history navigation
  useEffect(() => {
    if (location.state?.code) {
      const incomingCode = location.state.code;
      const incomingLang = location.state.language || 'Python';
      const incomingFile = location.state.filename || (incomingLang === 'Python' ? 'main.py' : 'snippet.txt');
      const shouldAutoRun = location.state.autoRun;

      setCode(incomingCode);
      setLanguage(incomingLang);
      setFilename(incomingFile);
      setResult(null);
      setIsStale(false);
      setError(null);

      // Clear the navigation state so reload doesn't repeatedly retrigger
      navigate(location.pathname, { replace: true, state: {} });

      if (shouldAutoRun) {
        triggerAnalysis(incomingCode, incomingLang, incomingFile);
      }
    }
  }, [location.state, location.pathname, navigate, triggerAnalysis]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analyze Source Code</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              AST & ML Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Edit code directly or upload source files to trigger comprehensive quality scans and defect predictions.
          </p>
        </div>
      </div>

      {/* Control bar: Language, File Upload, Run Analysis */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="language-select" className="text-xs font-bold text-slate-600">
              Language:
            </label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-full px-4 py-2 outline-hidden focus:ring-2 focus:ring-black cursor-pointer shadow-2xs"
            >
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
            </select>
          </div>

          {/* File Upload Button */}
          <div>
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-full transition-all border border-slate-200 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload File</span>
              <input
                type="file"
                accept=".py,.java,.c,.cpp,.h,.hpp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Run Analysis Action Button */}
        <div>
          <button
            onClick={() => triggerAnalysis()}
            disabled={status === 'analyzing'}
            className={`inline-flex items-center space-x-2 px-7 py-3 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-black/10 transition-all duration-200 cursor-pointer ${
              status === 'analyzing'
                ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
                : status === 'completed'
                ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                : 'bg-black hover:bg-slate-800 text-white hover:-translate-y-0.5'
            }`}
          >
            {status === 'analyzing' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Scan...</span>
              </>
            ) : status === 'completed' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Analysis Complete</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between p-3.5 bg-rose-500/10 border border-rose-300 text-rose-900 text-xs rounded-2xl animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stale Warning Indicator */}
      {isStale && (
        <div className="flex items-center space-x-2.5 p-3.5 bg-amber-500/10 border border-amber-300/80 text-amber-900 text-xs rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Code was modified after the last run. The results below reflect the prior snapshot until you click <strong>Run Analysis</strong> again.
          </span>
        </div>
      )}

      {/* Code Editor Surface */}
      <CodeEditor
        code={code}
        onChange={handleCodeChange}
        language={language}
        filename={filename}
        onResetSample={handleResetSample}
      />

      {/* Results Section */}
      {result ? (
        <div className="space-y-6 pt-2 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Analysis Dashboard</h2>
              <p className="text-xs text-slate-500">Comprehensive inspection findings for {filename}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Scanned Successfully
            </span>
          </div>

          {/* Top 4 Result Cards */}
          <RiskCards result={result} />

          {/* Detailed Metric Badges */}
          <MetricsGrid metrics={result.metrics} />

          {/* Static Findings Grid */}
          <StaticIssues
            securityIssues={result.securityIssues}
            styleIssues={result.styleIssues}
          />

          {/* AI Refactoring Recommendations */}
          <Recommendations recommendations={result.recommendations} />

          {/* ML Defect Prediction Section */}
          <PredictionResult prediction={result.prediction} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-black text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-black/10">
            <FileCode className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Ready to Analyze</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            Click the <strong className="text-slate-900 font-bold">Run Analysis</strong> button above to extract code metrics, detect vulnerabilities, and compute ML defect risk.
          </p>
        </div>
      )}
    </div>
  );
}
