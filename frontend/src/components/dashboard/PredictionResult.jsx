import React from 'react';
import { Bot, Cpu } from 'lucide-react';
import clsx from 'clsx';

export default function PredictionResult({ prediction }) {
  if (!prediction) return null;

  const isHighRisk = prediction.risk === 'High';
  const isMedRisk = prediction.risk === 'Medium';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs text-slate-900 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start space-x-4 max-w-xl">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                ML Defect Risk Prediction
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Model Inference
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              The dual-engine pipeline estimates a{' '}
              <strong
                className={clsx(
                  'font-bold px-2 py-0.5 rounded-full text-xs border inline-block',
                  isHighRisk
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isMedRisk
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                )}
              >
                {prediction.risk} Defect Risk
              </strong>{' '}
              based on normalized structural branch depth, cyclomatic complexity, and static vulnerability markers.
            </p>
            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>Pipeline: AST Extractor → Feature Normalizer → Pre-trained Classifier</span>
            </div>
          </div>
        </div>

        {/* Progress & Class Status Box */}
        <div className="w-full lg:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600">Defect Probability</span>
            <span
              className={clsx(
                'text-base font-extrabold',
                isHighRisk ? 'text-rose-600' : isMedRisk ? 'text-amber-600' : 'text-emerald-600'
              )}
            >
              {prediction.probability}%
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-700 ease-out',
                isHighRisk
                  ? 'bg-rose-500'
                  : isMedRisk
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              )}
              style={{ width: `${prediction.probability}%` }}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Predicted Class:</span>
            <span
              className={clsx(
                'font-extrabold px-2.5 py-0.5 rounded-full border text-[11px]',
                isHighRisk
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isMedRisk
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              )}
            >
              {prediction.class}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
