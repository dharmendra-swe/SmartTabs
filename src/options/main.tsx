import React from 'react';
import { createRoot } from 'react-dom/client'; 
import '../globals.css';
import { DashboardLayout } from './DashboardLayout';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'STORAGE_MUTATED_BACKGROUND') { 
            window.location.reload();
        }
    });
}

root.render(
    <React.StrictMode>
        <DashboardLayout />
    </React.StrictMode>
);