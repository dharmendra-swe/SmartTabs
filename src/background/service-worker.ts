import { setupAlarmListeners } from './alarms';
import { initializeCommands } from './commands';
import { initializeStartup } from './startup';

console.log('[SmartTabs] Service Worker Initializing...');
// Initialize Event Listeners
setupAlarmListeners();
initializeCommands();
initializeStartup();
 
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') { 
        chrome.runtime.openOptionsPage();
    }
});
 
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ status: 'ALIVE', version: chrome.runtime.getManifest().version });
    } 
    return true;
});
 
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "save-to-workspace",
        title: "Save Current Tab to Workspace",
        contexts: ["page", "tab"]
    });
});
 
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-workspace" && tab?.url) {
        const storageData = await chrome.storage.local.get('workspace-storage');

        // --- FIX STARTS HERE ---
        // Ensure we explicitly extract the value and handle undefined/null
        const rawData = storageData['workspace-storage'];
        const state = JSON.parse(typeof rawData === 'string' ? rawData : '{}');
        // --- FIX ENDS HERE ---

        const workspaces = state?.state?.workspaces || [];

        if (workspaces.length > 0) {
            const updatedWorkspaces = workspaces.map((ws: any, index: number) => {
                if (index === 0) {
                    return {
                        ...ws,
                        websites: [...ws.websites, {
                            id: crypto.randomUUID(),
                            title: tab.title || "New Tab",
                            url: tab.url,
                            enabled: true,
                            pinned: false,
                            order: ws.websites.length
                        }]
                    };
                }
                return ws;
            });

            await chrome.storage.local.set({
                'workspace-storage': JSON.stringify({ state: { workspaces: updatedWorkspaces } })
            });

            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'SmartTabs',
                message: `Saved "${tab.title}" to ${workspaces[0].name}`
            });
        }
    }
});