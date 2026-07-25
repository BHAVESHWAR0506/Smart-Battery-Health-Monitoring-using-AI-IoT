import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TelemetryData } from '../types/battery';
import { Activity, Maximize2 } from 'lucide-react';

interface WaveformChartProps {
  history: TelemetryData[];
}

export const WaveformChart: React.FC<WaveformChartProps> = ({ history }) => {
  const [activeMetric, setActiveMetric] = useState<'soc' | 'voltage' | 'current' | 'temperature' | 'power'>('soc');

  const metricConfig = {
    soc: { label: 'State of Charge (%)', key: 'soc', color: '#3b82f6', unit: '%', domain: [0, 100] },
    voltage: { label: 'Pack Voltage (V)', key: 'voltage', color: '#8b5cf6', unit: 'V', domain: ['auto', 'auto'] },
    current: { label: 'Current Draw (A)', key: 'current', color: '#06b6d4', unit: 'A', domain: ['auto', 'auto'] },
    temperature: { label: 'Temperature (°C)', key: 'temperature', color: '#f59e0b', unit: '°C', domain: [20, 60] },
    power: { label: 'Power Output (W)', key: 'power', color: '#10b981', unit: 'W', domain: ['auto', 'auto'] }
  };

  const selectedConfig = metricConfig[activeMetric];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl relative shadow-2xl flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Real-Time Waveform Analytics</h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {(Object.keys(metricConfig) as Array<keyof typeof metricConfig>).map((key) => {
            const cfg = metricConfig[key];
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] border border-blue-400/40'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-[280px] mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={selectedConfig.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={selectedConfig.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              domain={selectedConfig.domain as any}
              axisLine={{ stroke: '#334155' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data: TelemetryData = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
                      <p className="text-slate-400 border-b border-slate-800 pb-1 font-bold">{data.timestamp}</p>
                      <p className="text-blue-400 font-bold">SoC: {data.soc}%</p>
                      <p className="text-emerald-400 font-bold">SoH: {data.soh}%</p>
                      <p className="text-purple-400">Voltage: {data.voltage} V</p>
                      <p className="text-cyan-400">Current: {data.current} A</p>
                      <p className="text-amber-400">Temp: {data.temperature} °C</p>
                      <p className="text-slate-300">Cell Delta: {data.cellDelta} mV</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={selectedConfig.key}
              stroke={selectedConfig.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#metricGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Live Cursor Footnote */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
        <span>SAMPLING FREQUENCY: 1.0 HZ (ESP32 ADC)</span>
        <span className="text-blue-400 font-semibold uppercase">
          LATEST {selectedConfig.label}: {history[history.length - 1]?.[selectedConfig.key as keyof TelemetryData]} {selectedConfig.unit}
        </span>
      </div>
    </div>
  );
};
