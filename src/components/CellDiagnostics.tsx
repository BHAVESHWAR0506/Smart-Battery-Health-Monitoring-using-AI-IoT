import React from 'react';
import { CellData } from '../types/battery';
import { Cpu, Zap, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CellDiagnosticsProps {
  cells: CellData[];
  passiveBalancingEnabled: boolean;
  onToggleBalancing: () => void;
}

export const CellDiagnostics: React.FC<CellDiagnosticsProps> = ({
  cells,
  passiveBalancingEnabled,
  onToggleBalancing
}) => {
  const highestCell = cells.reduce((max, c) => c.voltage > max.voltage ? c : max, cells[0]);
  const lowestCell = cells.reduce((min, c) => c.voltage < min.voltage ? c : min, cells[0]);
  const deltaMv = Math.round((highestCell.voltage - lowestCell.voltage) * 1000);
  const avgVoltage = (cells.reduce((a, b) => a + b.voltage, 0) / cells.length).toFixed(3);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              12S Cell-Level Diagnostics Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time individual lithium cell monitoring via ESP32 ADS1115 ADC bus
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleBalancing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-2 ${
              passiveBalancingEnabled
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${passiveBalancingEnabled ? 'animate-spin' : ''}`} />
            <span>Passive Balancing: {passiveBalancingEnabled ? 'ACTIVE' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Delta Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Average Cell Voltage</p>
          <p className="text-xl font-mono font-bold text-blue-400 mt-1">{avgVoltage} V</p>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Max Cell Delta</p>
          <p className={`text-xl font-mono font-bold mt-1 ${deltaMv > 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {deltaMv} <span className="text-xs text-slate-400 font-normal">mV</span>
          </p>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Highest Cell</p>
          <p className="text-sm font-mono font-bold text-slate-200 mt-1">
            Cell #{highestCell.id} ({highestCell.voltage}V)
          </p>
        </div>

        <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Lowest Cell</p>
          <p className="text-sm font-mono font-bold text-amber-400 mt-1">
            Cell #{lowestCell.id} ({lowestCell.voltage}V)
          </p>
        </div>
      </div>

      {/* 12 Cells Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {cells.map((cell) => {
          const isHighest = cell.id === highestCell.id;
          const isLowest = cell.id === lowestCell.id;
          const percentage = ((cell.voltage - 3.0) / (4.2 - 3.0)) * 100;

          return (
            <div
              key={cell.id}
              className={`p-3 bg-slate-900/70 border rounded-xl transition-all relative overflow-hidden ${
                isLowest
                  ? 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : isHighest
                  ? 'border-blue-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-black font-mono text-slate-300">CELL #{cell.id}</span>
                {cell.balancingActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                    BAL
                  </span>
                )}
              </div>

              {/* Voltage Display */}
              <p className="text-lg font-black font-mono text-slate-100">{cell.voltage.toFixed(3)}V</p>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full my-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isLowest ? 'bg-amber-400' : isHighest ? 'bg-blue-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
                />
              </div>

              {/* Cell Stats */}
              <div className="space-y-0.5 text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Temp:</span>
                  <span className={cell.temperature > 40 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {cell.temperature}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IR:</span>
                  <span className="text-slate-300">{cell.resistance} mΩ</span>
                </div>
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span className="text-emerald-400">{cell.healthScore}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
