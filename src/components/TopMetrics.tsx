import React from 'react';
import { TelemetryData } from '../types/battery';
import { Zap, Activity, Thermometer, ShieldCheck } from 'lucide-react';

interface TopMetricsProps {
  telemetry: TelemetryData;
}

export const TopMetrics: React.FC<TopMetricsProps> = ({ telemetry }) => {
  const isCharging = telemetry.current < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* State of Charge (SoC) Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center shadow-xl hover:border-blue-500/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">State of Charge</p>
          <Zap className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <p className="text-3xl font-black text-blue-400 mt-1 font-mono tracking-tight">
          {telemetry.soc.toFixed(1)}
          <span className="text-sm font-normal text-slate-500 ml-0.5">%</span>
        </p>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden p-0.5 border border-white/5">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#3b82f6]"
            style={{ width: `${Math.min(100, Math.max(0, telemetry.soc))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          Cap: {telemetry.capacityAh.toFixed(1)} / {telemetry.totalCapacityAh} Ah ({telemetry.energyKwh.toFixed(2)} kWh)
        </p>
      </div>

      {/* State of Health (SoH) Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center shadow-xl hover:border-emerald-500/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">State of Health</p>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <p className="text-3xl font-black text-emerald-400 mt-1 font-mono tracking-tight">
          {telemetry.soh.toFixed(1)}
          <span className="text-sm font-normal text-slate-500 ml-0.5">%</span>
        </p>
        <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-3 overflow-hidden p-0.5 border border-white/5">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_#10b981]"
            style={{ width: `${Math.min(100, Math.max(0, telemetry.soh))}%` }}
          />
        </div>
        <p className="text-[10px] text-emerald-400 mt-2 font-medium">
          {telemetry.soh > 90 ? 'Optimal Degradation Curve' : 'Moderate Cell Capacity Loss'}
        </p>
      </div>

      {/* Core Temperature Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center shadow-xl hover:border-amber-500/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Temperature</p>
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <p className={`text-3xl font-black mt-1 font-mono tracking-tight ${
          telemetry.temperature > 45 ? 'text-red-400' : telemetry.temperature > 38 ? 'text-amber-400' : 'text-slate-100'
        }`}>
          {telemetry.temperature.toFixed(1)}
          <span className="text-sm font-normal text-slate-500 ml-0.5">°C</span>
        </p>
        <p className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${
          telemetry.temperature > 45 ? 'text-red-400 animate-pulse' : 'text-emerald-400'
        }`}>
          {telemetry.temperature > 45 ? 'High Heat Risk' : 'Stable Thermal Range'}
        </p>
        <p className="text-[9px] text-slate-500 mt-0.5">
          Ambient: {telemetry.ambientTemp}°C | IR: {telemetry.internalResistance} mΩ
        </p>
      </div>

      {/* Voltage Output & Current Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl text-center shadow-xl hover:border-indigo-500/40 transition-all">
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pack Output</p>
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <p className="text-3xl font-black text-slate-100 mt-1 font-mono tracking-tight">
          {telemetry.voltage.toFixed(1)}
          <span className="text-sm font-normal text-slate-500 ml-0.5">V</span>
        </p>
        <p className="text-[10px] text-slate-300 mt-2 font-mono font-bold">
          Current: <span className={isCharging ? 'text-emerald-400' : 'text-blue-400'}>
            {Math.abs(telemetry.current).toFixed(1)}A {isCharging ? '(Charging)' : '(Load)'}
          </span>
        </p>
        <p className="text-[9px] text-slate-500 mt-0.5 font-mono">
          Power: {telemetry.power.toFixed(1)} Watts
        </p>
      </div>
    </div>
  );
};
