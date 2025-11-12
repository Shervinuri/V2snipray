
import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
    messages: string[];
}

const LogPanel: React.FC<LogPanelProps> = ({ messages }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col flex-grow shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-2 flex-shrink-0">Activity Log</h2>
            <div ref={logContainerRef} className="text-sm text-gray-300 font-mono overflow-y-auto h-64 md:h-auto flex-grow bg-black/30 rounded p-2">
                {messages.map((msg, index) => (
                    <p key={index} className="whitespace-pre-wrap animate-fade-in">&gt; {msg}</p>
                ))}
            </div>
        </div>
    );
};

export default LogPanel;
