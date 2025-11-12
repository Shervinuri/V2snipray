import React, { useState, useMemo } from 'react';
import type { Config, ScanResult, Protocol } from '../types';

type SortKey = 'protocol' | 'name' | 'status' | 'latency';
type SortDirection = 'asc' | 'desc';

const TABS: Protocol[] = ['vless', 'vmess', 'tuic', 'hysteria', 'hysteria2'];
const TAB_NAMES: { [key in Protocol | 'all']: string } = {
    all: 'All',
    vless: 'VLESS',
    vmess: 'VMESS',
    tuic: 'TUIC',
    hysteria: 'Hysteria',
    hysteria2: 'Hysteria2'
};


const SummaryCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-gray-800/60 p-4 rounded-lg flex items-center gap-4">
        <div className="text-purple-400">{icon}</div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </div>
    </div>
);

const StatusIndicator: React.FC<{ status: ScanResult['status'] }> = ({ status }) => {
    const statusClasses = {
        pending: 'bg-gray-500',
        active: 'bg-green-500',
        timeout: 'bg-yellow-500',
        failed: 'bg-red-500',
    };
    const statusText = {
        pending: 'Testing...',
        active: 'Active',
        timeout: 'Timeout',
        failed: 'Failed',
    };
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${statusClasses[status]} ${status === 'pending' ? 'animate-pulse' : ''}`}></span>
            <span className="capitalize">{statusText[status]}</span>
        </div>
    );
};


const ResultsPanel: React.FC<{
    configs: Config[];
    scanResults: Map<string, ScanResult>;
    summary: { total: number; scanned: number; active: number; protocols: Record<string, number> };
    isLoading: boolean;
}> = ({ configs, scanResults, summary, isLoading }) => {
    
    const [sortKey, setSortKey] = useState<SortKey>('latency');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [activeTab, setActiveTab] = useState<Protocol | 'all'>('all');

    const filteredConfigs = useMemo(() => {
        if (activeTab === 'all') {
            return configs;
        }
        return configs.filter(c => c.type === activeTab);
    }, [configs, activeTab]);

    const sortedConfigs = useMemo(() => {
        return [...filteredConfigs].sort((a, b) => {
            const resultA = scanResults.get(a.url);
            const resultB = scanResults.get(b.url);

            let valA: string | number | null = null;
            let valB: string | number | null = null;
            
            switch (sortKey) {
                case 'protocol':
                    valA = a.type;
                    valB = b.type;
                    break;
                case 'name':
                    valA = a.name;
                    valB = b.name;
                    break;
                case 'status':
                    valA = resultA?.status || 'pending';
                    valB = resultB?.status || 'pending';
                    break;
                case 'latency':
                    valA = resultA?.latency ?? Infinity;
                    valB = resultB?.latency ?? Infinity;
                    break;
            }

            if (valA === null || valB === null) return 0;
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredConfigs, scanResults, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const SortableHeader: React.FC<{ columnKey: SortKey, children: React.ReactNode; className?: string }> = ({ columnKey, children, className='' }) => {
      const isSorted = sortKey === columnKey;
      return (
          <th onClick={() => handleSort(columnKey)} className={`p-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer select-none ${className}`}>
              <div className="flex items-center gap-1">
                {children}
                {isSorted && (sortDirection === 'asc' ? '▲' : '▼')}
              </div>
          </th>
      );
    };

    const TabButton: React.FC<{ tabId: Protocol | 'all' }> = ({ tabId }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tabId 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700/60'
            }`}
        >
            {TAB_NAMES[tabId]}
        </button>
    );

    const NoResultsMessage = () => (
        <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No configurations found for this protocol.</p>
            <p className="text-sm">Try another category or start a new sniper run.</p>
        </div>
    );

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 md:p-6 shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                 <SummaryCard label="Total Found" value={summary.total} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>} />
                 <SummaryCard label="Tested" value={`${summary.scanned} / ${summary.total}`} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>} />
                 <SummaryCard label="Active" value={summary.active} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} />
                 <SummaryCard label="Success Rate" value={summary.total > 0 ? `${((summary.active / summary.scanned) * 100 || 0).toFixed(0)}%` : '0%'} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>} />
            </div>

            <div className="border-b border-gray-700 mb-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-px">
                   <TabButton tabId="all" />
                   {TABS.map(tab => <TabButton key={tab} tabId={tab} />)}
                </div>
            </div>

            <div className="overflow-y-auto flex-grow">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="sticky top-0 bg-gray-800/80 backdrop-blur-sm">
                        <tr>
                            <SortableHeader columnKey="name" className="w-2/5">Name</SortableHeader>
                            <SortableHeader columnKey="protocol" className="w-1/5">Protocol</SortableHeader>
                            <SortableHeader columnKey="status" className="w-1/5">Status</SortableHeader>
                            <SortableHeader columnKey="latency" className="w-1/5">Ping (ms)</SortableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedConfigs.length === 0 && !isLoading && (
                            <tr><td colSpan={4}><NoResultsMessage /></td></tr>
                        )}
                        {sortedConfigs.map(({ url, type, name }) => {
                            const result = scanResults.get(url) || { status: 'pending', latency: null };
                            return (
                                <tr key={url} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-3 font-mono font-semibold">{name}</td>
                                    <td className="p-3 uppercase">{type}</td>
                                    <td className="p-3"><StatusIndicator status={result.status} /></td>
                                    <td className="p-3 font-mono">{result.status === 'active' ? result.latency : '–'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                 {isLoading && sortedConfigs.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg animate-pulse">Sniper activated. Hunting for configurations...</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ResultsPanel;
