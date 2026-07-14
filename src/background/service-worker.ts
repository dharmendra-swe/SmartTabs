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
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "save-to-workspace",
            title: "Save Current Tab to Workspace",
            contexts: ["page", "tab"]
        });
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-workspace" && tab?.url) {
        try {
            const storageData = await chrome.storage.local.get('workspace-storage');
            const rawData = storageData['workspace-storage'];

            // Safe fallback parsing keeping the internal store structure intact
            const parsedContainer = JSON.parse(typeof rawData === 'string' ? rawData : '{"state":{"workspaces":[]},"version":1}');
            const workspaces = parsedContainer?.state?.workspaces || [];
            const currentVersion = parsedContainer?.version ?? 1;

            if (workspaces.length > 0) {
                const targetWorkspace = workspaces[0];

                // Construct a production-grade Website item mapping ALL strictly required fields
                const newWebsiteItem = {
                    id: crypto.randomUUID(),
                    title: tab.title || "New Tab",
                    url: tab.url,
                    category: 'General',
                    delay: 200,
                    pinned: false,
                    enabled: true,
                    duplicateRule: 'focus_existing',
                    openMode: 'new_tab',
                    notes: '',
                    tags: [],
                    order: targetWorkspace.websites ? targetWorkspace.websites.length : 0
                };

                const updatedWorkspaces = workspaces.map((ws: any, index: number) => {
                    if (index === 0) {
                        return {
                            ...ws,
                            websites: [...(ws.websites || []), newWebsiteItem],
                            updatedAt: Date.now(),
                            version: (ws.version || 1) + 1
                        };
                    }
                    return ws;
                });

                // Save back ensuring version framework is strictly preserved
                await chrome.storage.local.set({
                    'workspace-storage': JSON.stringify({
                        state: { workspaces: updatedWorkspaces },
                        version: currentVersion
                    })
                });

                // Notify cross-context windows (Options/Popup) to immediately re-sync reactive states
                chrome.runtime.sendMessage({ type: 'STORAGE_MUTATED_BACKGROUND' }).catch(() => {
                    // Fail-silent if no active UI ports are listening right now
                });

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'SmartTabs Workspace OS',
                    message: `Saved "${newWebsiteItem.title}" to ${targetWorkspace.name} successfully.`
                });
            } else {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'SmartTabs Alert',
                    message: 'No workspaces available. Open Options and create one first.'
                });
            }
        } catch (error) {
            console.error('[SmartTabs ContextMenu Engine] Critical storage save failure:', error);
        }
    }
});