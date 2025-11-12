import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
                    Config Sniper <span className="text-purple-400">SHΞN™</span>
                </h1>
                <p className="text-sm text-gray-400 mt-1">AI-Powered V2Ray Config Discovery Engine</p>
            </div>
        </header>
    );
};

export default Header;