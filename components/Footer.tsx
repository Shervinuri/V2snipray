
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full text-center py-4 mt-8 border-t border-gray-800">
            <a 
                href="https://t.me/shervini" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm transition-opacity hover:opacity-80"
                style={{ fontFamily: 'Arimo, sans-serif' }}
            >
                <span className="shen-gradient-text font-bold">Exclusive SHΞN™ made</span>
            </a>
        </footer>
    );
};

export default Footer;
