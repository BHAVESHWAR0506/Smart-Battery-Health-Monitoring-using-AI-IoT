import { CellData, TelemetryData, SystemAlert, BatteryDevice, SimulationConfig } from '../types/battery';

export const INITIAL_DEVICE: BatteryDevice = {
  id: 'ESP32-TX-4490',
  name: 'ESP32 Battery Node Alpha',
  type: 'EV Pack',
  chemistry: 'NMC',
  ipAddress: '192.168.1.142',
  signalStrength: -42,
  latencyMs: 14,
  uptimeHours: 142.2,
  firmwareVersion: 'V2.4.1-STABLE',
  soc: 82.4,
  soh: 94.1,
  status: 'optimal',
  location: 'Rack 04 - Sector B',
  nominalVoltage: 48.0,
  cellCount: 12
};

export const INITIAL_FLEET: BatteryDevice[] = [
  INITIAL_DEVICE,
  {
    id: 'ESP32-SOLAR-02',
    name: 'Solar Storage Microgrid Pack B',
    type: 'Solar ESS',
    chemistry: 'LFP',
    ipAddress: '192.168.1.189',
    signalStrength: -58,
    latencyMs: 18,
    uptimeHours: 856.0,
    firmwareVersion: 'V2.4.1-STABLE',
    soc: 91.5,
    soh: 98.2,
    status: 'optimal',
    location: 'Solar Substation Ground',
    nominalVoltage: 51.2,
    cellCount: 16
  },
  {
    id: 'ESP32-DRONE-88',
    name: 'Heavy Lift Drone Module X',
    type: 'Drone Module',
    chemistry: 'NMC',
    ipAddress: '192.168.1.201',
    signalStrength: -38,
    latencyMs: 8,
    uptimeHours: 24.5,
    firmwareVersion: 'V2.4.0-FAST',
    soc: 45.0,
    soh: 88.7,
    status: 'warning',
    location: 'Hangar Bay 01',
    nominalVoltage: 22.2,
    cellCount: 6
  },
  {
    id: 'ESP32-UPS-MAIN',
    name: 'Data Center Industrial UPS Pack',
    type: 'UPS Industrial',
    chemistry: 'LTO',
    ipAddress: '192.168.1.110',
    signalStrength: -40,
    latencyMs: 11,
    uptimeHours: 3420.0,
    firmwareVersion: 'V2.4.1-STABLE',
    soc: 99.8,
    soh: 99.4,
    status: 'optimal',
    location: 'Server Room Vault',
    nominalVoltage: 96.0,
    cellCount: 24
  }
];

export const INITIAL_CELLS: CellData[] = Array.from({ length: 12 }, (_, i) => {
  // Nominal 4.02V per cell (12S = ~48.2V)
  const baseVoltage = 4.02 + (Math.random() * 0.03 - 0.015);
  return {
    id: i + 1,
    voltage: Number(baseVoltage.toFixed(3)),
    temperature: Number((34.2 + (i % 3) * 0.4 + Math.random() * 0.3).toFixed(1)),
    resistance: Number((11.8 + (i === 3 ? 1.8 : Math.random() * 0.6)).toFixed(1)), // Cell #4 slightly higher IR
    balancingActive: i === 3, // Balancing cell #4
    healthScore: i === 3 ? 91.5 : Number((95 + Math.random() * 3).toFixed(1))
  };
});

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'ALT-1001',
    title: 'Voltage Fluctuation',
    description: 'Detected cell impedance mismatch in Cell #4 during discharge pulse.',
    level: 'warning',
    timestamp: '2m ago',
    cellId: 4
  },
  {
    id: 'ALT-1002',
    title: 'High Ambient Temp Warning',
    description: 'Thermal enclosure ambient temperature reached 38.5°C.',
    level: 'warning',
    timestamp: '14m ago'
  },
  {
    id: 'ALT-1003',
    title: 'AI Degradation Prediction',
    description: 'XGBoost model detects 0.02% accelerated SOH decay trend under elevated load.',
    level: 'info',
    timestamp: '1h ago'
  }
];

export function generateInitialHistory(count = 30): TelemetryData[] {
  const history: TelemetryData[] = [];
  let baseSoc = 85.0;
  let baseSoh = 94.2;
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const timeOffset = i * 2; // 2 seconds apart
    const timeDate = new Date(now - timeOffset * 1000);
    const timeStr = timeDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Slight drain over time
    baseSoc -= 0.02 + (Math.random() * 0.01 - 0.005);
    if (baseSoc < 10) baseSoc = 85;

    const current = Number((4.2 + Math.sin(i / 3) * 1.5 + Math.random() * 0.3).toFixed(2));
    const packVoltage = Number(((baseSoc / 100) * 12 + 38.0 + (Math.random() * 0.2 - 0.1)).toFixed(2));
    const power = Number((packVoltage * current).toFixed(1));
    const temp = Number((34.0 + Math.sin(i / 5) * 1.2 + Math.random() * 0.3).toFixed(1));

    history.push({
      timestamp: timeStr,
      timeSeconds: timeOffset,
      soc: Number(baseSoc.toFixed(1)),
      soh: Number(baseSoh.toFixed(1)),
      voltage: packVoltage,
      current: current,
      power: power,
      temperature: temp,
      ambientTemp: 28.5,
      internalResistance: 12.4,
      cellDelta: 18, // 18 mV
      capacityAh: Number(((baseSoc / 100) * 100).toFixed(1)),
      totalCapacityAh: 100,
      energyKwh: Number(((packVoltage * 100) / 1000 * (baseSoc / 100)).toFixed(2)),
      cycleCount: 428,
      rulCycles: 2482
    });
  }

  return history.reverse(); // Earliest to latest
}

export function computeNextTelemetry(
  currentTelemetry: TelemetryData,
  cells: CellData[],
  config: SimulationConfig
): { nextTelemetry: TelemetryData; updatedCells: CellData[]; newAlerts: SystemAlert[] } {
  const newAlerts: SystemAlert[] = [];
  const currentDraw = config.isCharging ? -Math.abs(config.loadCurrent) : Math.abs(config.loadCurrent);

  // Coulomb counting SOC adjust
  // Ah capacity = 100 Ah. 1 sec step = currentDraw / 3600 Ah
  const deltaAh = (currentDraw / 3600) * config.simulationSpeed;
  let nextSoc = currentTelemetry.soc - (deltaAh / currentTelemetry.totalCapacityAh) * 100;
  if (nextSoc > 100) nextSoc = 100;
  if (nextSoc < 0) nextSoc = 0;

  // Thermal physics: current squared * internal resistance produces Joule heating
  const jouleHeat = (Math.pow(currentDraw, 2) * 0.012) * 0.05;
  const tempDissipation = (currentTelemetry.temperature - config.ambientTemp) * 0.03;
  let thermalSurgeOffset = config.thermalSurgeInjected ? 8.5 : 0;
  let nextTemp = currentTelemetry.temperature + jouleHeat - tempDissipation + thermalSurgeOffset * 0.1;
  nextTemp = Math.max(config.ambientTemp, Math.min(85, nextTemp));

  // Cell voltages simulation (12 cells)
  const cellVoltages: number[] = [];
  const updatedCells: CellData[] = cells.map((cell) => {
    // Base cell OCV from SOC
    const ocv = 3.2 + (nextSoc / 100) * 1.0; // 3.2V to 4.2V
    // IR voltage drop under load: V_cell = OCV - I * R_cell
    const iRdrop = (currentDraw / 12) * (cell.resistance / 1000);
    let cellV = ocv - iRdrop + (Math.random() * 0.004 - 0.002);

    // If cell defect injected into cell #4 or #8
    if (config.cellDefectInjected && (cell.id === 4 || cell.id === 8)) {
      cellV -= 0.18; // Voltage sag on defective cell
    }

    cellV = Math.max(2.5, Math.min(4.35, cellV));
    cellVoltages.push(cellV);

    // Passive balancing reduces higher voltage cell slowly
    let balancing = cell.balancingActive;
    if (config.passiveBalancingEnabled && cell.voltage > 4.10) {
      balancing = true;
    }

    return {
      ...cell,
      voltage: Number(cellV.toFixed(3)),
      temperature: Number((nextTemp + (cell.id % 4) * 0.3 + (cell.id === 4 && config.cellDefectInjected ? 5.2 : 0)).toFixed(1)),
      resistance: Number((cell.resistance + (config.cellDefectInjected && cell.id === 4 ? 0.05 : 0)).toFixed(1)),
      balancingActive: balancing
    };
  });

  const maxCell = Math.max(...cellVoltages);
  const minCell = Math.min(...cellVoltages);
  const cellDeltaMv = Math.round((maxCell - minCell) * 1000);

  const packVoltage = Number((cellVoltages.reduce((a, b) => a + b, 0)).toFixed(2));
  const power = Number((packVoltage * Math.abs(currentDraw)).toFixed(1));

  // SOH slight degradation physics over heavy loads/high temp
  let sohDegradation = 0.00001;
  if (nextTemp > 45) sohDegradation += 0.0001;
  if (Math.abs(currentDraw) > 20) sohDegradation += 0.00008;
  const nextSoh = Math.max(60, Number((currentTelemetry.soh - sohDegradation).toFixed(4)));

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Generate automated alerts on thresholds
  if (cellDeltaMv > 120 && Math.random() < 0.3) {
    newAlerts.push({
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: 'Cell Imbalance Triggered',
      description: `Max cell delta expanded to ${cellDeltaMv} mV (Threshold 100mV).`,
      level: cellDeltaMv > 200 ? 'critical' : 'warning',
      timestamp: 'Just now'
    });
  }

  if (nextTemp > 50 && Math.random() < 0.4) {
    newAlerts.push({
      id: `ALT-${Date.now().toString().slice(-4)}`,
      title: 'High Thermal Runaway Risk',
      description: `Pack core temperature surged to ${nextTemp.toFixed(1)}°C! Cooling initiated.`,
      level: 'critical',
      timestamp: 'Just now'
    });
  }

  const nextTelemetry: TelemetryData = {
    timestamp: timeStr,
    timeSeconds: currentTelemetry.timeSeconds + 1,
    soc: Number(nextSoc.toFixed(1)),
    soh: Number(nextSoh.toFixed(2)),
    voltage: packVoltage,
    current: Number(currentDraw.toFixed(2)),
    power: power,
    temperature: Number(nextTemp.toFixed(1)),
    ambientTemp: config.ambientTemp,
    internalResistance: Number((12.4 + (config.cellDefectInjected ? 2.8 : 0)).toFixed(1)),
    cellDelta: cellDeltaMv,
    capacityAh: Number(((nextSoc / 100) * 100).toFixed(1)),
    totalCapacityAh: 100,
    energyKwh: Number(((packVoltage * 100) / 1000 * (nextSoc / 100)).toFixed(2)),
    cycleCount: currentTelemetry.cycleCount,
    rulCycles: Math.max(500, Math.round(2482 * (nextSoh / 100)))
  };

  return { nextTelemetry, updatedCells, newAlerts };
}
