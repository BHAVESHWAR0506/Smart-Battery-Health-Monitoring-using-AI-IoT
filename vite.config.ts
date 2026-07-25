import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { GoogleGenAI } from '@google/genai';

function batteryAiApiPlugin() {
  return {
    name: 'battery-ai-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/battery-diagnostic' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY environment variable is not configured' }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build'
                  }
                }
              });

              const prompt = `You are ION-SHIELD AI, an expert Battery Management System (BMS) and Electrochemistry Diagnostic AI.
Analyze the following real-time IoT battery telemetry data from an ESP32 monitoring unit:
- Battery Pack: ${data.packName || 'ESP32-TX-4490 (NMC 12S)'}
- State of Charge (SoC): ${data.soc}%
- State of Health (SoH): ${data.soh}%
- Pack Voltage: ${data.voltage}V
- Current Draw: ${data.current}A (${data.current >= 0 ? 'Discharging' : 'Charging'})
- Temperature: ${data.temperature}°C
- Internal Resistance: ${data.internalResistance} mΩ
- Max Cell Delta: ${data.cellDelta} mV (Cell #${data.highestCell} = ${data.maxCellV}V, Cell #${data.lowestCell} = ${data.minCellV}V)
- Recent System Alerts: ${JSON.stringify(data.activeAlerts || [])}
- User Query / Concern: ${data.userQuery || 'Perform a full electrochemical diagnostic assessment and remaining useful life (RUL) advisory.'}

Please provide a structured, high-density diagnostic assessment with:
1. Executive Health Summary (Overall condition & risk status)
2. Anomaly & Thermal/Cell Imbalance Risk Analysis
3. Actionable Maintenance & BMS Control Recommendations
4. Estimated Remaining Useful Life (RUL) & Degradation Prevention Advice`;

              const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
                config: {
                  systemInstruction: 'You are an advanced Battery Management System AI Specialist. Provide precise, technical yet accessible electrochemistry and safety analysis in clear Markdown format with bullet points and risk badges.'
                }
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ text: response.text }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Gemini API execution error' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), batteryAiApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
