import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Config, ScanResult, ApiKeys } from './types';
import { runSniperProcess } from './services/apiService';
import Header from './components/Header';
import Controls from './components/Controls';
import LogPanel from './components/LogPanel';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';

const App: React.FC = () => {
    const [logMessages, setLogMessages] = useState<string[]>(['Welcome to Config Sniper SHΞN™. Configure API keys and click "Start Sniper" to begin.']);
    const [configs, setConfigs] = useState<Config[]>([]);
    const [scanResults, setScanResults] = useState<Map<string, ScanResult>>(new Map());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [apiKeys, setApiKeys] = useState<ApiKeys>({
        github: [''],
        gemini: [''],
        gpt: [''],
    });

    const addLog = useCallback((message: string) => {
        setLogMessages(prev => [...prev, message]);
    }, []);
    
    const handleStartSniper = useCallback(async () => {
        setIsLoading(true);
        setConfigs([]);
        setScanResults(new Map());
        setLogMessages(['Attempting to connect to the sniper backend...']);

        const updateCallback = (result: ScanResult) => {
            // New configs might come from the backend, so we add them if they don't exist
            setConfigs(prev => {
                const hasConfig = prev.some(c => c.url === result.config.url);
                return hasConfig ? prev : [...prev, result.config];
            });
            setScanResults(prev => new Map(prev).set(result.config.url, result));
        };

        try {
            await runSniperProcess(apiKeys, addLog, updateCallback);
            // The final summary log is now sent from the backend via the logCallback
        } catch (error) {
            addLog(`❌ Critical error during sniper run: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    }, [apiKeys, addLog]);
    
    const summary = useMemo(() => {
        const total = configs.length;
        const scanned = scanResults.size;
        const active = Array.from(scanResults.values()).filter((r: ScanResult) => r.status === 'active').length;
        const protocols = configs.reduce<Record<string, number>>((acc, config) => {
            acc[config.type] = (acc[config.type] || 0) + 1;
            return acc;
        }, {});

        return { total, scanned, active, protocols };
    }, [configs, scanResults]);


    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
                    <Controls 
                        onStart={handleStartSniper}
                        results={Array.from(scanResults.values())}
                        isLoading={isLoading}
                        apiKeys={apiKeys}
                        onApiKeysChange={setApiKeys}
                    />
                    <LogPanel messages={logMessages} />
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <ResultsPanel 
                        configs={configs}
                        scanResults={scanResults}
                        summary={summary}
                        isLoading={isLoading}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;