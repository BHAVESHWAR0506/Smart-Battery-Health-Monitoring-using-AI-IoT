import React from 'react';
import { Wifi, ShieldAlert, Cpu, Server, CheckCircle2 } from 'lucide-react';
import { BatteryDevice } from '../types/battery';

interface FooterProps {
  activeDevice: BatteryDevice;
  isLive: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeDevice, isLive }) => {
  return (
    <footer className="px-6 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-wide">
      <div className="flex items-center space-x-6 overflow-x-auto">
        <span className="flex items-center space-x-1.5 text-slate-400">
          <Server className="w-3 h-3 text-blue-400" />
          <span>GATEWAY: AWS-US-EAST-1</span>
        </span>
        <span className="hidden sm:inline-block">|</span>
        <span className="flex items-center space-x-1.5 text-slate-400">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span>NODE: {activeDevice.id} ({activeDevice.chemistry})</span>
        </span>
        <span className="hidden md:inline-block">|</span>
        <span className="hidden md:flex items-center space-x-1.5 text-slate-400">
          <Wifi className="w-3 h-3 text-cyan-400" />
          <span>FIRMWARE: {activeDevice.firmwareVersion}</span>
        </span>
        <span className="hidden lg:inline-block">|</span>
        <span className="hidden lg:inline text-slate-500">
          ENCRYPTION: AES-256 BIT TLS 1.3
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500'}`} />
          <span className={isLive ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
            {isLive ? 'CLOUD SYNC SUCCESSFUL' : 'TELEMETRY PAUSED'}
          </span>
        </div>
      </div>
    </footer>
  );
};
