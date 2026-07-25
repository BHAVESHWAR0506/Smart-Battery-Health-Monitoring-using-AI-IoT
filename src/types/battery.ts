export interface CellData {
  id: number;
  voltage: number; // in Volts (e.g. 3.2V - 4.2V for Li-ion)
  temperature: number; // in °C
  resistance: number; // in mΩ
  balancingActive: boolean;
  healthScore: number; // 0 - 100%
}

export interface TelemetryData {
  timestamp: string;
  timeSeconds: number;
  soc: number; // State of Charge (%)
  soh: number; // State of Health (%)
  voltage: number; // Pack total Voltage (V)
  current: number; // Pack Current (A), positive = discharge, negative = charge
  power: number; // Power Output (W)
  temperature: number; // Average Pack Temp (°C)
  ambientTemp: number; // Ambient Temp (°C)
  internalResistance: number; // Total Pack IR (mΩ)
  cellDelta: number; // Difference between max and min cell voltage in mV
  capacityAh: number; // Current Ah remaining
  totalCapacityAh: number; // Nominal Ah capacity
  energyKwh: number; // Energy delivered (kWh)
  cycleCount: number; // Total charge/discharge cycles
  rulCycles: number; // Estimated Remaining Useful Life in cycles
}

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  level: 'info' | 'warning' | 'critical';
  timestamp: string;
  cellId?: number;
  acknowledged?: boolean;
}

export interface BatteryDevice {
  id: string;
  name: string;
  type: 'EV Pack' | 'Solar ESS' | 'Drone Module' | 'UPS Industrial';
  chemistry: 'NMC' | 'LFP' | 'LTO';
  ipAddress: string;
  signalStrength: number; // dBm
  latencyMs: number;
  uptimeHours: number;
  firmwareVersion: string;
  soc: number;
  soh: number;
  status: 'optimal' | 'warning' | 'critical' | 'charging';
  location: string;
  nominalVoltage: number;
  cellCount: number;
}

export interface SimulationConfig {
  loadCurrent: number; // Amperes (+ discharge, - charge)
  ambientTemp: number; // °C
  isCharging: boolean;
  cellDefectInjected: boolean;
  thermalSurgeInjected: boolean;
  passiveBalancingEnabled: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
}

export interface AiDiagnosticResult {
  riskScore: number; // 0-100
  summary: string;
  findings: string[];
  recommendations: string[];
  rawText: string;
  timestamp: string;
}
