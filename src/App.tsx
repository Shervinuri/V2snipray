
import React, { useState, useCallback, useMemo } from 'react';
import type { Config, ScanResult } from './types';
import { huntForConfigs, scanConfigs } from './services/mockApiService';
import Header from './components/Header';
import Controls from './components/Controls';
import LogPanel from './components/LogPanel';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';

const App: React.FC = () => {
    const [logMessages, setLogMessages] = useState<string[]>(['Welcome to Config Hunter SHΞN™. Click "Start Hunt" to begin.']);
    const [configs, setConfigs] = useState<Config[]>([]);
    const [scanResults, setScanResults] = useState<Map<string, ScanResult>>(new Map());
    const [isHunting, setIsHunting] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);

    const addLog = useCallback((message: string) => {
        setLogMessages(prev => [...prev, message]);
    }, []);

    const handleHunt = useCallback(async () => {
        setIsHunting(true);
        setConfigs([]);
        setScanResults(new Map());
        setLogMessages(['🚀 Starting comprehensive config hunt...']);

        try {
            const foundConfigs = await huntForConfigs(addLog);
            setConfigs(foundConfigs);
            addLog(`✅ Hunt complete. Found ${foundConfigs.length} unique configurations.`);
            addLog('Ready to scan. Click "Start Scan" to test configurations.');
        } catch (error) {
            addLog(`❌ Error during hunt: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsHunting(false);
        }
    }, [addLog]);

    const handleScan = useCallback(async () => {
        if (configs.length === 0) {
            addLog('⚠️ No configurations to scan. Please run a hunt first.');
            return;
        }
        setIsScanning(true);
        setScanResults(new Map());
        addLog(`🔍 Starting scan of ${configs.length} configurations...`);

        const updateCallback = (result: ScanResult) => {
            setScanResults(prev => new Map(prev).set(result.config.url, result));
        };
        
        try {
            await scanConfigs(configs, addLog, updateCallback);
            addLog('📊 Scan complete. All configurations have been tested.');
        } catch (error) {
             addLog(`❌ Error during scan: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
             setIsScanning(false);
        }
    }, [configs, addLog]);
    
    const summary = useMemo(() => {
        const total = configs.length;
        const scanned = scanResults.size;
        // FIX: Explicitly type 'r' to resolve TypeScript inference issue.
        const active = Array.from(scanResults.values()).filter((r: ScanResult) => r.status === 'active').length;
        // FIX: Replaced type assertion on initial value with a generic on the reduce function for better type safety.
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
                        onHunt={handleHunt}
                        onScan={handleScan}
                        configs={configs}
                        results={Array.from(scanResults.values())}
                        isHunting={isHunting}
                        isScanning={isScanning}
                    />
                    <LogPanel messages={logMessages} />
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4">
                    <ResultsPanel 
                        configs={configs}
                        scanResults={scanResults}
                        summary={summary}
                        isLoading={isScanning || isHunting}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;