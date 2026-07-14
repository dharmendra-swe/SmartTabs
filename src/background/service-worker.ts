import { WorkspaceEngine } from '@/services/workspaceEngine';
import { setupAlarmListeners } from './alarms';
import { initializeCommands } from './commands';
import { initializeStartup } from './startup';

console.log('[SmartTabs] Service Worker Initializing...');
setupAlarmListeners();
initializeCommands();
initializeStartup();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'PING') {
        sendResponse({ status: 'ALIVE', version: chrome.runtime.getManifest().version });
    }

    if (message.type === 'LAUNCH_WORKSPACE_ASYNC') {
        (async () => {
            try {
                const stateStr = await chrome.storage.local.get('workspace-storage');
                const settingsStr = await chrome.storage.local.get('settings-storage');

                const rawState = stateStr['workspace-storage'];
                const rawSettings = settingsStr['settings-storage'];

                const state = JSON.parse(typeof rawState === 'string' ? rawState : '{"state":{"workspaces":[]}}');
                const settingsState = JSON.parse(typeof rawSettings === 'string' ? rawSettings : '{"state":{"settings":{}}}');

                const workspaces = state?.state?.workspaces || [];
                const settings = settingsState?.state?.settings;

                const targetWorkspace = workspaces.find((ws: any) => ws.id === message.workspaceId);

                if (targetWorkspace && settings) {
                    await WorkspaceEngine.launchWorkspace(targetWorkspace, settings);
                }
            } catch (err) {
                console.error('[SmartTabs Background Sync] Popup launch failed:', err);
            }
        })();
    }

    return true; // Keeps the messaging channel open for asynchronous responses
});
 
chrome.runtime.onInstalled.addListener((details) => { 
    if (details.reason === 'install') {
        chrome.runtime.openOptionsPage();
    }
 
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "save-to-workspace",
            title: "Save Current Tab to Workspace",
            contexts: ["page", "tab"]
        });
    });
});

// --- 3. CONTEXT MENU ACTION HANDLER ---
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "save-to-workspace" && tab?.url) {
        try {
            const storageData = await chrome.storage.local.get('workspace-storage');
            const rawData = storageData['workspace-storage'];

            const parsedContainer = JSON.parse(typeof rawData === 'string' ? rawData : '{"state":{"workspaces":[]},"version":1}');
            const workspaces = parsedContainer?.state?.workspaces || [];
            const currentVersion = parsedContainer?.version ?? 1;

            if (workspaces.length > 0) {
                const targetWorkspace = workspaces[0];

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

                await chrome.storage.local.set({
                    'workspace-storage': JSON.stringify({
                        state: { workspaces: updatedWorkspaces },
                        version: currentVersion
                    })
                });

                chrome.runtime.sendMessage({ type: 'STORAGE_MUTATED_BACKGROUND' }).catch(() => {
                    // Fail-silent when no UI context is listening
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