import React from 'react';
import { Cpu, Wifi, Activity, AlertTriangle, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { BatteryDevice, SystemAlert } from '../types/battery';

interface DeviceSidebarProps {
  activeDevice: BatteryDevice;
  fleet: BatteryDevice[];
  onSelectDevice: (device: BatteryDevice) => void;
  alerts: SystemAlert[];
  onClearAlert: (id: string) => void;
}

export const DeviceSidebar: React.FC<DeviceSidebarProps> = ({
  activeDevice,
  fleet,
  onSelectDevice,
  alerts,
  onClearAlert
}) => {
  return (
    <aside className="w-full lg:w-72 flex flex-col space-y-4 shrink-0">
      {/* Active Device Info Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active IoT Node</h3>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
            ESP32 Micro
          </span>
        </div>

        {/* Device Selection Dropdown or Mini Selector */}
        <div className="space-y-2 mb-3">
          <label className="text-[10px] font-semibold text-slate-400">Select Battery Unit:</label>
          <select
            value={activeDevice.id}
            onChange={(e) => {
              const dev = fleet.find((f) => f.id === e.target.value);
              if (dev) onSelectDevice(dev);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-500 transition-colors"
          >
            {fleet.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.id} - {dev.name} ({dev.chemistry})
              </option>
            ))}
          </select>
        </div>

        {/* Active Node Detail Box */}
        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5 shadow-inner">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-100">{activeDevice.id}</p>
            <p className="text-[10px] text-slate-400 font-mono">IP: {activeDevice.ipAddress}</p>
            <p className="text-[10px] text-blue-400 font-medium">{activeDevice.type} • {activeDevice.cellCount} Cells</p>
          </div>
        </div>

        {/* Telemetry Specs */}
        <div className="mt-4 space-y-2 border-t border-white/5 pt-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Signal Strength</span>
            <span className="text-emerald-400 font-mono font-bold">{activeDevice.signalStrength} dBm</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Cloud Latency</span>
            <span className="text-slate-300 font-mono">{activeDevice.latencyMs}ms</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Uptime</span>
            <span className="text-slate-300 font-mono">{activeDevice.uptimeHours}h</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Nominal Pack</span>
            <span className="text-slate-200 font-bold">{activeDevice.nominalVoltage}V {activeDevice.chemistry}</span>
          </div>
        </div>
      </div>

      {/* System Alerts Feed Card */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl flex flex-col min-h-[320px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Alerts</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">
            {alerts.length} Active
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 flex-1 scrollbar-thin">
          {alerts.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl">
              <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-400">All Systems Nominal</p>
              <p className="text-[10px] text-slate-500">No active anomalies detected.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCritical = alert.level === 'critical';
              const isWarning = alert.level === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : isWarning
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold">{alert.title}</p>
                    <button
                      onClick={() => onClearAlert(alert.id)}
                      className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40"
                      title="Dismiss alert"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-[11px] leading-snug opacity-90">{alert.description}</p>
                  <p className="text-[9px] font-mono mt-1 opacity-60 text-right">{alert.timestamp}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
