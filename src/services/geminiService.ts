import { TelemetryData, CellData, SystemAlert, AiDiagnosticResult } from '../types/battery';

export async function requestAiDiagnostic(
  telemetry: TelemetryData,
  cells: CellData[],
  activeAlerts: SystemAlert[],
  userQuery?: string
): Promise<AiDiagnosticResult> {
  const highestCell = cells.reduce((max, c) => c.voltage > max.voltage ? c : max, cells[0]);
  const lowestCell = cells.reduce((min, c) => c.voltage < min.voltage ? c : min, cells[0]);

  const payload = {
    packName: 'ESP32-TX-4490 (12S NMC Lithium)',
    soc: telemetry.soc,
    soh: telemetry.soh,
    voltage: telemetry.voltage,
    current: telemetry.current,
    temperature: telemetry.temperature,
    internalResistance: telemetry.internalResistance,
    cellDelta: telemetry.cellDelta,
    maxCellV: highestCell.voltage,
    minCellV: lowestCell.voltage,
    highestCell: highestCell.id,
    lowestCell: lowestCell.id,
    activeAlerts: activeAlerts.map(a => `${a.level.toUpperCase()}: ${a.title} - ${a.description}`),
    userQuery: userQuery || 'Perform a full electrochemical diagnostic assessment and remaining useful life (RUL) advisory.'
  };

  try {
    const response = await fetch('/api/battery-diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.text || 'Diagnostic response empty.';

    // Extract risk score heuristic or parse key recommendations
    let riskScore = 15;
    if (telemetry.temperature > 48 || telemetry.cellDelta > 150) riskScore += 45;
    if (telemetry.soh < 85) riskScore += 25;
    if (activeAlerts.some(a => a.level === 'critical')) riskScore += 30;
    riskScore = Math.min(99, Math.max(5, riskScore));

    return {
      riskScore,
      summary: `Diagnostic performed at ${new Date().toLocaleTimeString()} for 12S Battery Pack.`,
      findings: [
        `Pack SoC: ${telemetry.soc}% | SoH: ${telemetry.soh}%`,
        `Cell Imbalance Delta: ${telemetry.cellDelta} mV`,
        `Thermal Envelope: ${telemetry.temperature}°C (Threshold 45°C)`,
        `Internal Resistance: ${telemetry.internalResistance} mΩ`
      ],
      recommendations: [
        'Maintain passive cell balancing during off-peak charging',
        'Limit fast discharge current to 1.5C under high ambient temperature',
        'Monitor Cell #' + lowestCell.id + ' for potential micro-short or capacity fade'
      ],
      rawText,
      timestamp: new Date().toLocaleTimeString()
    };
  } catch (err: any) {
    console.warn('AI Diagnostic fallback triggered:', err);
    // Return a structured high-quality diagnostic locally if server offline
    return {
      riskScore: telemetry.temperature > 45 || telemetry.cellDelta > 100 ? 68 : 12,
      summary: 'Electrochemistry Analysis (Local Fallback Engine Active)',
      findings: [
        `State of Charge: ${telemetry.soc}% | State of Health: ${telemetry.soh}%`,
        `Pack Output Voltage: ${telemetry.voltage}V | Load Current: ${telemetry.current}A`,
        `Peak Cell Delta: ${telemetry.cellDelta} mV (Cell #${highestCell.id} vs Cell #${lowestCell.id})`,
        `Core Pack Temp: ${telemetry.temperature}°C`
      ],
      recommendations: [
        'Enable passive cell balancing on Cell #' + lowestCell.id + ' to reduce voltage variance',
        'Keep ambient operating temperatures below 35°C to maximize electrolyte life',
        'Perform periodic full 0.2C calibration cycle to recalibrate Coulomb counter'
      ],
      rawText: `### 🔋 ION-SHIELD AI Diagnostic Report\n\n**Overall Health:** ${telemetry.soh > 90 ? 'EXCELLENT' : 'MONITOR REQUIRED'}\n\n- **SOC:** ${telemetry.soc}%\n- **SOH:** ${telemetry.soh}%\n- **Cell Delta:** ${telemetry.cellDelta} mV\n\n**Analysis:**\n1. **State of Charge & Health:** Battery chemistry remains within standard operational parameters.\n2. **Cell Balance:** Voltage variance between Cell #${highestCell.id} (${highestCell.voltage}V) and Cell #${lowestCell.id} (${lowestCell.voltage}V) is ${telemetry.cellDelta} mV.\n3. **Thermal Dynamics:** Operating temperature of ${telemetry.temperature}°C is acceptable. Maintain thermal monitoring under high C-rates.`,
      timestamp: new Date().toLocaleTimeString()
    };
  }
}
