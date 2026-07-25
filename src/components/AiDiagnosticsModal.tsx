import React, { useState } from 'react';
import { TelemetryData, CellData, SystemAlert, AiDiagnosticResult } from '../types/battery';
import { requestAiDiagnostic } from '../services/geminiService';
import { ShieldCheck, Sparkles, X, RefreshCw, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  cells: CellData[];
  alerts: SystemAlert[];
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  cells,
  alerts
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiDiagnosticResult | null>(null);
  const [userQuery, setUserQuery] = useState('');

  if (!isOpen) return null;

  const handleRunDiagnostic = async (query?: string) => {
    setLoading(true);
    try {
      const diag = await requestAiDiagnostic(telemetry, cells, alerts, query || userQuery);
      setResult(diag);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">ION-SHIELD AI Diagnostics Center</h3>
              <p className="text-[10px] text-indigo-400 font-mono">Gemini-Powered Battery Health & Electrochemistry Analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Telemetry Bar */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center font-mono text-xs">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">SoC</span>
              <span className="font-bold text-blue-400">{telemetry.soc}%</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">SoH</span>
              <span className="font-bold text-emerald-400">{telemetry.soh}%</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Temp</span>
              <span className="font-bold text-amber-400">{telemetry.temperature}°C</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Cell Delta</span>
              <span className="font-bold text-purple-400">{telemetry.cellDelta} mV</span>
            </div>
          </div>

          {/* Action Trigger or AI Result */}
          {!result && !loading && (
            <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl p-6">
              <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-200">Run Real-Time AI Battery Health Audit</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Analyzes live voltage, current waveforms, cell delta, internal resistance, and active thermal trends using Gemini AI.
              </p>
              <button
                onClick={() => handleRunDiagnostic()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all"
              >
                Start AI Diagnostic Assessment
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-300">Evaluating Electrochemistry & Cell Degradation Vectors...</p>
              <p className="text-[10px] text-slate-500 font-mono">Server-side Gemini AI model processing telemetry packet</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Risk Score Header */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl font-mono text-xl font-black ${
                    result.riskScore > 50 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {result.riskScore}/100
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Health Risk Indicator Score</p>
                    <p className="text-[10px] text-slate-400">{result.summary}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRunDiagnostic()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-Audit</span>
                </button>
              </div>

              {/* AI Markdown Report Content */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2 whitespace-pre-line font-sans leading-relaxed">
                {result.rawText}
              </div>
            </div>
          )}

          {/* Ask Custom Question Input */}
          <div className="pt-2">
            <label className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
              Ask AI Assistant custom question about this pack:
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g. Is 18 mΩ internal resistance safe at 45°C ambient?"
                onKeyDown={(e) => e.key === 'Enter' && handleRunDiagnostic(userQuery)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleRunDiagnostic(userQuery)}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
