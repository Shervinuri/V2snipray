import React from 'react';
import type { ApiKeys } from '../types';

interface SettingsPanelProps {
    apiKeys: ApiKeys;
    onApiKeysChange: (keys: ApiKeys) => void;
    disabled: boolean;
}

const ApiKeyInputGroup: React.FC<{
    label: string;
    keys: string[];
    onKeysChange: (keys: string[]) => void;
    disabled: boolean;
}> = ({ label, keys, onKeysChange, disabled }) => {
    
    const handleKeyChange = (index: number, value: string) => {
        const newKeys = [...keys];
        newKeys[index] = value;
        onKeysChange(newKeys);
    };

    const addKeyInput = () => {
        onKeysChange([...keys, '']);
    };

    const removeKeyInput = (index: number) => {
        if (keys.length > 1) {
            const newKeys = keys.filter((_, i) => i !== index);
            onKeysChange(newKeys);
        } else {
            // Clear the last remaining input instead of removing it
            onKeysChange(['']);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <div className="flex flex-col gap-2">
                {keys.map((key, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => handleKeyChange(index, e.target.value)}
                            disabled={disabled}
                            placeholder={`API Key #${index + 1}`}
                            className="flex-grow bg-gray-900/50 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition disabled:opacity-50"
                        />
                        <button
                            onClick={() => removeKeyInput(index)}
                            disabled={disabled}
                            className="p-1.5 rounded-md bg-red-600/80 hover:bg-red-600 disabled:opacity-50 transition-colors"
                            aria-label="Remove key"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                    </div>
                ))}
                 <button
                    onClick={addKeyInput}
                    disabled={disabled}
                    className="mt-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 self-start"
                >
                    + Add another key
                </button>
            </div>
        </div>
    );
};


const SettingsPanel: React.FC<SettingsPanelProps> = ({ apiKeys, onApiKeysChange, disabled }) => {
    const handleKeysChange = (service: keyof ApiKeys, keys: string[]) => {
        onApiKeysChange({ ...apiKeys, [service]: keys });
    };

    return (
        <div className="border-t border-gray-700/70 pt-4">
            <h2 className="text-lg font-semibold text-white mb-3">API Keys</h2>
            <div className="flex flex-col gap-4">
                <ApiKeyInputGroup
                    label="GitHub Keys"
                    keys={apiKeys.github}
                    onKeysChange={(keys) => handleKeysChange('github', keys)}
                    disabled={disabled}
                />
                <ApiKeyInputGroup
                    label="Gemini Keys"
                    keys={apiKeys.gemini}
                    onKeysChange={(keys) => handleKeysChange('gemini', keys)}
                    disabled={disabled}
                />
                 <ApiKeyInputGroup
                    label="GPT Keys"
                    keys={apiKeys.gpt}
                    onKeysChange={(keys) => handleKeysChange('gpt', keys)}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default SettingsPanel;
