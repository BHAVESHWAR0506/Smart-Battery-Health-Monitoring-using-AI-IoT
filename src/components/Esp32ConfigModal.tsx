import React, { useState } from 'react';
import { Code, Copy, Check, X, Cpu, Wifi, Download } from 'lucide-react';

interface Esp32ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Esp32ConfigModal: React.FC<Esp32ConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [wifiSsid, setWifiSsid] = useState('IoT_Battery_Net');
  const [mqttServer, setMqttServer] = useState('mqtt.ionshield.io');

  if (!isOpen) return null;

  const esp32Code = `/*
 * ION-SHIELD AI - ESP32 IoT Battery Telemetry Firmware
 * Target: ESP32-WROOM-32
 * Sensors: ADS1115 (16-bit 4-Ch ADC for Cell Voltages), INA219 (Current/Power)
 * Protocol: MQTT over TLS 1.3
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <Adafruit_ADS1X15.h>

const char* ssid = "${wifiSsid}";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "${mqttServer}";
const int mqtt_port = 8883;

WiFiClientSecure espClient;
PubSubClient client(espClient);
Adafruit_ADS1115 ads;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA = GPIO 21, SCL = GPIO 22
  ads.begin();
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected. IP: " + WiFi.localIP().toString());
  
  espClient.setInsecure(); // Replace with root CA cert for production
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Read cell voltages from ADS1115
  int16_t adc0 = ads.readADC_SingleEnded(0);
  int16_t adc1 = ads.readADC_SingleEnded(1);
  float cell1_volts = ads.computeVolts(adc0) * 1.0; 
  float cell2_volts = ads.computeVolts(adc1) * 2.0;

  // Construct JSON Telemetry Payload
  String payload = "{\\"node\\":\\"ESP32-TX-4490\\",\\"cell1\\":" + String(cell1_volts, 3) + 
                   ",\\"cell2\\":" + String(cell2_volts, 3) + "}";
                   
  client.publish("ionshield/telemetry/ESP32-TX-4490", payload.c_str());
  delay(1000); // 1Hz sampling rate
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32_BMS_Node")) {
      Serial.println("MQTT Connected to ION-SHIELD Cloud");
    } else {
      delay(2000);
    }
  }
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(esp32Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-slate-100">ESP32 Hardware Sensor Firmware Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">WiFi SSID Network</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">MQTT Gateway Server</label>
              <input
                type="text"
                value={mqttServer}
                onChange={(e) => setMqttServer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800 text-[10px] text-slate-500">
              <span>FIRMWARE_SOURCE: ESP32_BMS_NODE.INO</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-sans text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-emerald-400 leading-relaxed font-mono">{esp32Code}</pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Compatible with Arduino IDE 2.0+ & PlatformIO</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
