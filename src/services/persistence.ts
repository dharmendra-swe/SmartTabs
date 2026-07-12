import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { StorageService } from './storage';

/**
 * Initializes the auto-persistence bridge.
 * This should be called once in the root of the Options and Popup applications.
 */
export const initializePersistenceBridge = () => {
    // Subscribe to Workspace Store
    useWorkspaceStore.subscribe((state) => {
        StorageService.set('workspace-storage', JSON.stringify({ state }));
    });

    // Subscribe to Settings Store
    useSettingsStore.subscribe((state) => {
        StorageService.set('settings-storage', JSON.stringify({ state }));
    });

    // Subscribe to Analytics Store
    useAnalyticsStore.subscribe((state) => {
        StorageService.set('analytics-storage', JSON.stringify({ state }));
    });
};