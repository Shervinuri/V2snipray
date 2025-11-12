import type { ScanResult, ApiKeys } from '../types';

const WEBSOCKET_URL = 'ws://localhost:8000/ws/sniper';

export const runSniperProcess = (
    apiKeys: ApiKeys,
    logCallback: (message: string) => void,
    updateCallback: (result: ScanResult) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(WEBSOCKET_URL);
        let finalConfigsCount = 0;
        let activeConfigsCount = 0;

        ws.onopen = () => {
            logCallback('✅ Connection to sniper backend established. Sending API keys...');
            ws.send(JSON.stringify(apiKeys));
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'log') {
                    logCallback(message.data);
                } else if (message.type === 'result') {
                    const result: ScanResult = message.data;
                    updateCallback(result);
                    if (result.status === 'active') {
                        activeConfigsCount++;
                    }
                } else if (message.type === 'summary') {
                    finalConfigsCount = message.data.total;
                } else if (message.type === 'error') {
                     logCallback(`backend error: ${message.data}`);
                }
            } catch (error) {
                // Handle non-JSON log messages
                logCallback(event.data);
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            const errorMessage = `❌ Failed to connect to the sniper backend at ${WEBSOCKET_URL}. Make sure the Python server is running.`;
            logCallback(errorMessage);
            reject(new Error(errorMessage));
        };

        ws.onclose = (event) => {
            if (event.wasClean) {
                logCallback(`✅ Sniper run complete. Found ${finalConfigsCount} total, with ${activeConfigsCount} active configurations.`);
                resolve();
            } else {
                const errorMessage = '🔌 Connection to the backend was lost unexpectedly. Please check the server and try again.';
                logCallback(errorMessage);
                reject(new Error(errorMessage));
            }
        };
    });
};