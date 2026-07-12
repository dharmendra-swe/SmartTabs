import { StorageService } from '@/services/storage';
import { WorkspaceEngine } from '@/services/workspaceEngine';
import { NotificationService } from '@/services/notifications';
import { Workspace, Settings } from '@/types';

export const initializeCommands = () => {
    chrome.commands.onCommand.addListener(async (command) => {
        try {
            // 1. Load context directly from Chrome Storage (Store isn't available in SW directly without sync)
            const stateStr = await StorageService.get<string>('workspace-storage', '{}');
            const settingsStr = await StorageService.get<string>('settings-storage', '{}');

            const state = JSON.parse(stateStr);
            const settingsState = JSON.parse(settingsStr);

            const workspaces: Workspace[] = state?.state?.workspaces || [];
            const settings: Settings = settingsState?.state?.settings;

            if (!workspaces.length || !settings) return;

            let targetWorkspace: Workspace | undefined;

            // 2. Route commands based on manifest.json keys
            if (command === 'open-development') {
                targetWorkspace = workspaces.find(ws => ws.name.toLowerCase().includes('development'));
            } else if (command === 'open-ai') {
                targetWorkspace = workspaces.find(ws => ws.name.toLowerCase().includes('ai'));
            }

            // 3. Execute
            if (targetWorkspace) {
                const result = await WorkspaceEngine.launchWorkspace(targetWorkspace, settings);

                if (settings.notificationsEnabled) {
                    NotificationService.show(
                        targetWorkspace.name,
                        `Opened ${result.openedCount} tabs. Skipped ${result.skippedCount} duplicates.`
                    );
                }
            }
        } catch (error) {
            console.error('[SmartTabs] Command execution failed:', error);
        }
    });
};