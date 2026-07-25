import React from 'react';
import { SimulationConfig } from '../types/battery';
import { Sliders, Flame, AlertTriangle, ShieldAlert, Zap, RefreshCw } from 'lucide-react';

interface SimulationControlsProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  onResetSimulation: () => void;
  onTriggerEmergencyIsolate: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  config,
  onChangeConfig,
  onResetSimulation,
  onTriggerEmergencyIsolate
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              IoT Hardware & Physics Testbench
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate real-world operational stress, thermal surges, and cell anomalies in real-time
          </p>
        </div>

        <button
          onClick={onResetSimulation}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Default State</span>
        </button>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Load & Current Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 uppercase">
              Load Current (C-Rate): <span className="text-blue-400 font-mono">{config.loadCurrent} Amps</span>
            </label>
            <button
              onClick={() => onChangeConfig({ ...config, isCharging: !config.isCharging })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                config.isCharging
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              Mode: {config.isCharging ? 'CHARGING' : 'DISCHARGING'}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="60"
            step="1"
            value={config.loadCurrent}
            onChange={(e) => onChangeConfig({ ...config, loadCurrent: Number(e.target.value) })}
            className="w-full accent-blue-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0A (Idle)</span>
            <span>15A (0.15C)</span>
            <span>30A (0.3C)</span>
            <span>60A (0.6C Fast)</span>
          </div>
        </div>

        {/* Ambient Temperature Control */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-300 uppercase">
              Ambient Environment Temp: <span className="text-amber-400 font-mono">{config.ambientTemp}°C</span>
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              config.ambientTemp > 40 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {config.ambientTemp > 40 ? 'Extreme Heat' : 'Normal Envelope'}
            </span>
          </div>

          <input
            type="range"
            min="10"
            max="55"
            step="1"
            value={config.ambientTemp}
            onChange={(e) => onChangeConfig({ ...config, ambientTemp: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>10°C (Cold)</span>
            <span>25°C (Ideal)</span>
            <span>40°C (Warm)</span>
            <span>55°C (Thermal Stress)</span>
          </div>
        </div>
      </div>

      {/* Fault Injection & Safety Stress Buttons */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Fault Injection & Emergency Safety Triggers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Inject Cell Defect */}
          <button
            onClick={() => onChangeConfig({ ...config, cellDefectInjected: !config.cellDefectInjected })}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
              config.cellDefectInjected
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Cell #4 Impedance Sag: {config.cellDefectInjected ? 'INJECTED' : 'OFF'}</span>
          </button>

          {/* Thermal Runaway Surge */}
          <button
            onClick={() => onChangeConfig({ ...config, thermalSurgeInjected: !config.thermalSurgeInjected })}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1.5 ${
              config.thermalSurgeInjected
                ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-5 h-5 text-red-400" />
            <span>Thermal Stress Surge: {config.thermalSurgeInjected ? 'ACTIVE' : 'OFF'}</span>
          </button>

          {/* Emergency Isolate Contactors */}
          <button
            onClick={onTriggerEmergencyIsolate}
            className="p-3 bg-red-600/90 hover:bg-red-600 border border-red-400 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex flex-col items-center justify-center space-y-1.5"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span>EMERGENCY BMS ISOLATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
