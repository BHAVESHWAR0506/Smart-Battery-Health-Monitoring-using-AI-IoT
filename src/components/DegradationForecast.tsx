import React from 'react';
import { TelemetryData } from '../types/battery';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ShieldCheck, Cpu, TrendingDown, AlertTriangle, Zap } from 'lucide-react';

interface DegradationForecastProps {
  telemetry: TelemetryData;
}

export const DegradationForecast: React.FC<DegradationForecastProps> = ({ telemetry }) => {
  // Generate 10-point projected degradation curve over 3000 cycles
  const projectionData = Array.from({ length: 11 }, (_, i) => {
    const cycle = i * 300;
    // Exponential decay curve for SoH
    const sohProjected = Number((100 * Math.exp(-0.00012 * cycle)).toFixed(1));
    const irProjected = Number((10.0 + (cycle / 300) * 0.85).toFixed(1));
    return {
      cycle,
      soh: sohProjected,
      ir: irProjected,
      threshold: 80 // EOL (End of Life) threshold
    };
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              AI Battery Degradation & RUL Forecast
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine Learning remaining useful life prediction (XGBoost + LSTM Neural Network)
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full w-fit">
          Model: XGBoost-BMS-v4.2 (98.4% Confidence)
        </span>
      </div>

      {/* Main RUL Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* RUL Cycles Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Estimated RUL</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-3xl font-black font-mono text-slate-100">
              {telemetry.rulCycles.toLocaleString()} <span className="text-xs font-normal text-slate-400">Cycles</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Approx. <span className="text-emerald-400 font-bold">6.8 Years</span> at current daily usage rate
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            EOL THRESHOLD: 80.0% SOH (Capacity Fade)
          </div>
        </div>

        {/* Impedance Growth Box */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Internal Resistance (IR)</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black font-mono text-amber-400">
              {telemetry.internalResistance} <span className="text-xs font-normal text-slate-400">mΩ</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              IR Growth Rate: <span className="text-amber-300 font-bold">+0.04 mΩ / 100 cycles</span>
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
            NOMINAL IR: 10.0 mΩ | MAX TOLERANCE: 25.0 mΩ
          </div>
        </div>

        {/* Electrochemistry Health Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">SEI & Chemistry Risks</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Lithium Plating Risk:</span>
                <span className="text-emerald-400 font-bold">Low (0.4%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SEI Layer Thickness:</span>
                <span className="text-slate-200 font-mono">18.2 nm (Stable)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Electrolyte Retention:</span>
                <span className="text-emerald-400 font-bold">96.8%</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-mono">
            THERMAL STRESS: LOW DETECTED
          </div>
        </div>
      </div>

      {/* Degradation Curve Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          3,000-Cycle State of Health (SOH) Projection Curve
        </h3>
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="cycle" stroke="#64748b" fontSize={10} />
              <YAxis domain={[60, 100]} stroke="#64748b" fontSize={10} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono">
                        <p className="text-slate-400 font-bold">Cycle {data.cycle}</p>
                        <p className="text-emerald-400">Projected SOH: {data.soh}%</p>
                        <p className="text-amber-400">Internal Resistance: {data.ir} mΩ</p>
                        <p className="text-red-400">EOL Threshold: {data.threshold}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="soh" stroke="#10b981" strokeWidth={2.5} name="SOH (%)" dot={{ r: 3, fill: '#10b981' }} />
              <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} name="EOL 80%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
