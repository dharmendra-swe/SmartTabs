import { StorageService } from '@/services/storage';
import { WorkspaceEngine } from '@/services/workspaceEngine';
import { Workspace, Settings } from '@/types';

export const initializeStartup = () => {
    chrome.runtime.onStartup.addListener(async () => {
        try {
            const settingsStr = await StorageService.get<string>('settings-storage', '{}');
            const settingsState = JSON.parse(settingsStr);
            const settings: Settings = settingsState?.state?.settings;

            if (!settings || !settings.startupWorkspaceId) return;

            const stateStr = await StorageService.get<string>('workspace-storage', '{}');
            const state = JSON.parse(stateStr);
            const workspaces: Workspace[] = state?.state?.workspaces || [];

            const startupWorkspace = workspaces.find(ws => ws.id === settings.startupWorkspaceId);

            if (startupWorkspace) {
                // Apply a small global delay before hijacking the browser on boot
                setTimeout(async () => {
                    await WorkspaceEngine.launchWorkspace(startupWorkspace, settings);
                }, 1500);
            }
        } catch (error) {
            console.error('[SmartTabs] Startup automation failed:', error);
        }
    });
};