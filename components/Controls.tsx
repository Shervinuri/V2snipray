import React, { useCallback } from 'react';
import type { ScanResult, ApiKeys, Protocol } from '../types';
import SettingsPanel from './SettingsPanel';

interface ControlsProps {
    onStart: () => void;
    results: ScanResult[];
    isLoading: boolean;
    apiKeys: ApiKeys;
    onApiKeysChange: (keys: ApiKeys) => void;
}

const Button: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-4 py-3 text-base font-bold text-white rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = ({ onStart, results, isLoading, apiKeys, onApiKeysChange }) => {

    const downloadFile = (filename: string, content: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleExportSubscription = useCallback(() => {
        const activeConfigs = results.filter(r => r.status === 'active').map(r => r.config.url);
        if (activeConfigs.length === 0) {
            alert("No active configurations to export.");
            return;
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const fullContent = activeConfigs.join('\n');
        downloadFile(`SHEN_Sniper_Sub_${timestamp}.txt`, btoa(fullContent));
    }, [results]);

    const handleExportRaw = useCallback(() => {
        const activeConfigs = results.filter(r => r.status === 'active').map(r => r.config);
         if (activeConfigs.length === 0) {
            alert("No active configurations to export.");
            return;
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        
        const protocols: Protocol[] = ['vless', 'vmess', 'tuic', 'hysteria', 'hysteria2'];
        let exported = false;
        protocols.forEach(proto => {
            const protocolConfigs = activeConfigs.filter(c => c.type === proto);
            if (protocolConfigs.length > 0) {
                const protocolContent = protocolConfigs.map(c => c.url).join('\n');
                downloadFile(`${proto.toUpperCase()}_SHEN_Sniper_${timestamp}.txt`, protocolContent);
                exported = true;
            }
        });
        if (!exported) {
             alert("No active configurations found for individual export.");
        }
    }, [results]);


    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 shadow-lg">
            <div>
                <h2 className="text-lg font-semibold text-white mb-3">Sniper Control</h2>
                <Button onClick={onStart} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500">
                    {isLoading ? 'Sniping...' : 'Start Sniper'}
                </Button>
            </div>

            <SettingsPanel 
                apiKeys={apiKeys}
                onApiKeysChange={onApiKeysChange}
                disabled={isLoading}
            />
            
            <div>
                <h2 className="text-lg font-semibold text-white mb-2">Export Results</h2>
                 <div className="flex flex-col gap-3">
                    <Button 
                        onClick={handleExportSubscription} 
                        disabled={isLoading || results.filter(r => r.status === 'active').length === 0} 
                        className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-sm py-2"
                    >
                        Export Base64 Subscription
                    </Button>
                     <Button 
                        onClick={handleExportRaw} 
                        disabled={isLoading || results.filter(r => r.status === 'active').length === 0} 
                        className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-sm py-2"
                    >
                        Export Raw Configs by Protocol
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Controls;