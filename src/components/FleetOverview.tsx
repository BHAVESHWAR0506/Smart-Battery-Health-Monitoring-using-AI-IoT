import React from 'react';
import { BatteryDevice } from '../types/battery';
import { Zap, Cpu, MapPin, ShieldCheck, AlertCircle } from 'lucide-react';

interface FleetOverviewProps {
  fleet: BatteryDevice[];
  activeDevice: BatteryDevice;
  onSelectDevice: (device: BatteryDevice) => void;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({
  fleet,
  activeDevice,
  onSelectDevice
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide">
              Global Fleet Battery Telemetry Network
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Distributed IoT battery systems monitored across industrial, EV, solar, and drone deployments
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{fleet.length} Connected Nodes</span>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fleet.map((dev) => {
          const isSelected = dev.id === activeDevice.id;
          const isWarning = dev.status === 'warning';
          const isCritical = dev.status === 'critical';

          return (
            <div
              key={dev.id}
              onClick={() => onSelectDevice(dev)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-slate-800 rounded-lg text-blue-400 border border-slate-700">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{dev.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{dev.id} • {dev.chemistry}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                    isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : isWarning
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {dev.status}
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-center font-mono">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">SoC</p>
                  <p className="text-sm font-bold text-blue-400">{dev.soc}%</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">SoH</p>
                  <p className="text-sm font-bold text-emerald-400">{dev.soh}%</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase">Pack</p>
                  <p className="text-sm font-bold text-slate-200">{dev.nominalVoltage}V</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{dev.location}</span>
                </span>
                <span className="font-mono text-slate-500">{dev.ipAddress}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
