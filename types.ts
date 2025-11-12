export type Protocol = 'vless' | 'vmess' | 'tuic' | 'hysteria' | 'hysteria2';

export interface Config {
    type: Protocol;
    url: string;
    host: string;
    name: string;
}

export type ScanStatus = 'pending' | 'active' | 'timeout' | 'failed';

export interface ScanResult {
    config: Config;
    status: ScanStatus;
    latency: number | null;
}

export interface ApiKeys {
    github: string[];
    gemini: string[];
    gpt: string[];
}
