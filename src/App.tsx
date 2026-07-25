import React, { useState, useEffect, useRef } from 'react';
import {
  CellData,
  TelemetryData,
  SystemAlert,
  BatteryDevice,
  SimulationConfig
} from './types/battery';
import {
  INITIAL_DEVICE,
  INITIAL_FLEET,
  INITIAL_CELLS,
  INITIAL_ALERTS,
  generateInitialHistory,
  computeNextTelemetry
} from './services/batterySimulation';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DeviceSidebar } from './components/DeviceSidebar';
import { TopMetrics } from './components/TopMetrics';
import { WaveformChart } from './components/WaveformChart';
import { CellDiagnostics } from './components/CellDiagnostics';
import { DegradationForecast } from './components/DegradationForecast';
import { SimulationControls } from './components/SimulationControls';
import { FleetOverview } from './components/FleetOverview';
import { Esp32ConfigModal } from './components/Esp32ConfigModal';
import { AiDiagnosticsModal } from './components/AiDiagnosticsModal';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeDevice, setActiveDevice] = useState<BatteryDevice>(INITIAL_DEVICE);
  const [fleet, setFleet] = useState<BatteryDevice[]>(INITIAL_FLEET);
  const [cells, setCells] = useState<CellData[]>(INITIAL_CELLS);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [history, setHistory] = useState<TelemetryData[]>(() => generateInitialHistory(30));
  const [isLive, setIsLive] = useState<boolean>(true);

  // Simulation Config
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    loadCurrent: 8,
    ambientTemp: 28.5,
    isCharging: false,
    cellDefectInjected: false,
    thermalSurgeInjected: false,
    passiveBalancingEnabled: true,
    simulationSpeed: 1
  });

  // Modal Visibility
  const [isEsp32ModalOpen, setIsEsp32ModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Latest Telemetry item
  const currentTelemetry = history[history.length - 1];

  // Live Ticker Ref to avoid stale closure
  const stateRef = useRef({ currentTelemetry, cells, simConfig, isLive });
  useEffect(() => {
    stateRef.current = { currentTelemetry, cells, simConfig, isLive };
  }, [currentTelemetry, cells, simConfig, isLive]);

  // Real-time telemetry tick loop (1 second interval)
  useEffect(() => {
    const timer = setInterval(() => {
      const { currentTelemetry, cells, simConfig, isLive } = stateRef.current;
      if (!isLive || !currentTelemetry) return;

      const { nextTelemetry, updatedCells, newAlerts } = computeNextTelemetry(
        currentTelemetry,
        cells,
        simConfig
      );

      setCells(updatedCells);
      setHistory((prev) => [...prev.slice(-49), nextTelemetry]); // Keep last 50 data points

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
      }

      // Sync active device state
      setActiveDevice((prev) => ({
        ...prev,
        soc: nextTelemetry.soc,
        soh: nextTelemetry.soh
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClearAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetSimulation = () => {
    setSimConfig({
      loadCurrent: 8,
      ambientTemp: 28.5,
      isCharging: false,
      cellDefectInjected: false,
      thermalSurgeInjected: false,
      passiveBalancingEnabled: true,
      simulationSpeed: 1
    });
    setCells(INITIAL_CELLS);
    setHistory(generateInitialHistory(30));
    setAlerts(INITIAL_ALERTS);
  };

  const handleEmergencyIsolate = () => {
    setSimConfig((prev) => ({ ...prev, loadCurrent: 0, isCharging: false }));
    setAlerts((prev) => [
      {
        id: `ALT-EMG-${Date.now().toString().slice(-4)}`,
        title: 'EMERGENCY ISOLATE TRIGGERED',
        description: 'BMS Contactors opened. Main battery pack isolated from load bus.',
        level: 'critical',
        timestamp: 'Just now'
      },
      ...prev
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020617] text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDevice={activeDevice}
        alertCount={alerts.length}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenEsp32Code={() => setIsEsp32ModalOpen(true)}
        isLive={isLive}
        setIsLive={setIsLive}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden p-4 space-x-4">
        {/* Device Sidebar */}
        <DeviceSidebar
          activeDevice={activeDevice}
          fleet={fleet}
          onSelectDevice={setActiveDevice}
          alerts={alerts}
          onClearAlert={handleClearAlert}
        />

        {/* Central Workspace */}
        <main className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          {/* Top Key Metrics */}
          {currentTelemetry && <TopMetrics telemetry={currentTelemetry} />}

          {/* Active Tab Content Routing */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <WaveformChart history={history} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CellDiagnostics
                  cells={cells}
                  passiveBalancingEnabled={simConfig.passiveBalancingEnabled}
                  onToggleBalancing={() =>
                    setSimConfig((prev) => ({
                      ...prev,
                      passiveBalancingEnabled: !prev.passiveBalancingEnabled
                    }))
                  }
                />
                {currentTelemetry && <DegradationForecast telemetry={currentTelemetry} />}
              </div>
            </div>
          )}

          {activeTab === 'cells' && (
            <CellDiagnostics
              cells={cells}
              passiveBalancingEnabled={simConfig.passiveBalancingEnabled}
              onToggleBalancing={() =>
                setSimConfig((prev) => ({
                  ...prev,
                  passiveBalancingEnabled: !prev.passiveBalancingEnabled
                }))
              }
            />
          )}

          {activeTab === 'degradation' && currentTelemetry && (
            <DegradationForecast telemetry={currentTelemetry} />
          )}

          {activeTab === 'simulation' && (
            <SimulationControls
              config={simConfig}
              onChangeConfig={setSimConfig}
              onResetSimulation={handleResetSimulation}
              onTriggerEmergencyIsolate={handleEmergencyIsolate}
            />
          )}

          {activeTab === 'fleet' && (
            <FleetOverview
              fleet={fleet}
              activeDevice={activeDevice}
              onSelectDevice={setActiveDevice}
            />
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <Footer activeDevice={activeDevice} isLive={isLive} />

      {/* Modals */}
      <Esp32ConfigModal
        isOpen={isEsp32ModalOpen}
        onClose={() => setIsEsp32ModalOpen(false)}
      />

      {currentTelemetry && (
        <AiDiagnosticsModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          telemetry={currentTelemetry}
          cells={cells}
          alerts={alerts}
        />
      )}
    </div>
  );
}
