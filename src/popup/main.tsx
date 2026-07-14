import React from 'react';
import { createRoot } from 'react-dom/client';
import { Popup } from './Popup';
import '../globals.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'STORAGE_MUTATED_BACKGROUND') {
            // Forces the store to re-read what is physically inside chrome.storage right now
            window.location.reload();
        }
    });
}

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);