import React from 'react';
import { Zap, ShieldCheck, Activity, Cpu, Bell, Sliders, Code, RefreshCw } from 'lucide-react';
import { BatteryDevice } from '../types/battery';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDevice: BatteryDevice;
  alertCount: number;
  onOpenAiModal: () => void;
  onOpenEsp32Code: () => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeDevice,
  alertCount,
  onOpenAiModal,
  onOpenEsp32Code,
  isLive,
  setIsLive
}) => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-xl sticky top-0 z-40">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] border border-blue-400/40">
          <Zap className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-400">
              ION-SHIELD AI
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v2.4 IoT
            </span>
          </div>
          <p className="text-[10px] font-medium text-slate-400">
            Intelligent Battery Health & Degradation Monitor
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'cells', label: 'Cell Diagnostics', icon: Cpu },
          { id: 'degradation', label: 'AI RUL Forecast', icon: ShieldCheck },
          { id: 'simulation', label: 'IoT Testbench', icon: Sliders },
          { id: 'fleet', label: 'Fleet Overview', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)] border border-blue-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Controls & Indicators */}
      <div className="flex items-center space-x-3">
        {/* Live Stream Toggle */}
        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-all text-xs font-semibold ${
            isLive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle real-time IoT telemetry streaming"
        >
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="uppercase tracking-widest text-[10px]">{isLive ? 'SYSTEM LIVE' : 'PAUSED'}</span>
          <RefreshCw className={`w-3 h-3 ${isLive ? 'animate-spin' : ''}`} />
        </button>

        {/* ESP32 Firmware Code Generator */}
        <button
          onClick={onOpenEsp32Code}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all"
          title="View & Download ESP32 Sensor C++ Firmware Code"
        >
          <Code className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">ESP32 Firmware</span>
        </button>

        {/* Gemini AI Diagnostic Button */}
        <button
          onClick={onOpenAiModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400/30 transition-all transform hover:scale-105"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
          <span>AI Diagnostic</span>
        </button>
      </div>
    </nav>
  );
};
