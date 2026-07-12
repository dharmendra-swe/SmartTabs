import { initializeCommands } from './commands';
import { initializeStartup } from './startup';

console.log('[SmartTabs] Service Worker Initializing...');

// Initialize Event Listeners
initializeCommands();
initializeStartup();

// Installation Event Lifecycle
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open Options page on first install for onboarding
        chrome.runtime.openOptionsPage();
    }
});

// Listener for cross-context messaging (UI -> Background)
// Prefixing sender with an underscore to satisfy "noUnusedParameters: true"
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ status: 'ALIVE', version: chrome.runtime.getManifest().version });
    }

    // For async operations in SW to prevent port closing early
    return true;
});