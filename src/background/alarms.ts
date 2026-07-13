import { WorkspaceEngine } from '../services/workspaceEngine';
import { Workspace, Settings } from '../types';

// ============================================================================
// 1. STORAGE UTILITY (Background Context)
// ============================================================================
/**
 * Safely extracts Zustand's persisted state from chrome.storage.local
 * since the background worker doesn't run React or Zustand directly.
 */
async function getZustandState<T>(storageKey: string): Promise<T | null> {
    try {
        const data = await chrome.storage.local.get(storageKey);

        // 1. Explicitly get the value and ensure it's a string
        const rawString = data[storageKey] as string;

        // 2. Add a guard clause to handle if data doesn't exist
        if (!rawString || typeof rawString !== 'string') {
            return null;
        }

        // 3. Now JSON.parse will be perfectly happy
        const parsed = JSON.parse(rawString);
        return parsed?.state as T;
    } catch (error) {
        console.error(`[SmartTabs Alarms] Failed to parse ${storageKey}:`, error);
        return null;
    }
}

// ============================================================================
// 2. CORE BACKGROUND LISTENER
// ============================================================================
/**
 * Must be called once in `service-worker.ts` to initialize the listeners.
 */
export function setupAlarmListeners() {
    if (typeof chrome === 'undefined' || !chrome.alarms) {
        console.warn('[SmartTabs] Chrome Alarms API not available.');
        return;
    }

    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name.startsWith('schedule_launch_')) {
            const workspaceId = alarm.name.replace('schedule_launch_', '');
            await executeScheduledLaunch(workspaceId);
        }
    });
}

/**
 * Handles the actual fetching, validation, and launching of the scheduled workspace.
 */
async function executeScheduledLaunch(workspaceId: string) {
    console.info(`[SmartTabs] Triggering scheduled launch for workspace: ${workspaceId}`);

    // Fetch live state from storage
    const workspaceState = await getZustandState<{ workspaces: Workspace[] }>('workspace-storage');
    const settingsState = await getZustandState<{ settings: Settings }>('settings-storage');

    if (!workspaceState || !workspaceState.workspaces) {
        console.error('[SmartTabs] No workspaces found in storage during scheduled launch.');
        return;
    }

    const targetWorkspace = workspaceState.workspaces.find(w => w.id === workspaceId);

    // Self-healing: If the user deleted the workspace but the alarm remained, clean it up.
    if (!targetWorkspace) {
        console.warn(`[SmartTabs] Scheduled workspace ${workspaceId} no longer exists. Clearing alarm.`);
        await new Promise<void>((resolve) => chrome.alarms.clear(`schedule_launch_${workspaceId}`, () => resolve()));
        return;
    }

    // Fallback settings if store is uninitialized
    const currentSettings: Settings = settingsState?.settings || {
        theme: 'system',
        globalDelay: 200,
        defaultDuplicateStrategy: 'focus_existing'
    } as Settings;

    // Execute via the engine
    const result = await WorkspaceEngine.launchWorkspace(targetWorkspace, currentSettings);

    // Dispatch Native Chrome Notification
    if (chrome.notifications) {
        const notificationId = `launch_success_${Date.now()}`;
        chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: 'icons/icon128.png', // Ensure this matches your manifest asset path
            title: 'SmartTabs Scheduler',
            message: result.success
                ? `Launched "${targetWorkspace.name}" successfully.\nOpened ${result.openedCount} tabs.`
                : `Failed to launch "${targetWorkspace.name}". Error encountered.`,
            priority: 1
        });
    }
}

// ============================================================================
// 3. SCHEDULER API (For UI Consumption)
// ============================================================================
export class AlarmManager {
    /**
     * Creates or updates a recurring daily alarm for a specific workspace.
     * @param workspaceId The ID of the workspace
     * @param hour 24-hour format (0-23)
     * @param minute (0-59)
     */
    static async createDailySchedule(workspaceId: string, hour: number, minute: number): Promise<void> {
        const now = new Date();
        const scheduledTime = new Date();

        scheduledTime.setHours(hour, minute, 0, 0);

        // If the specified time has already passed today, schedule it for tomorrow
        if (scheduledTime.getTime() <= now.getTime()) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const alarmName = `schedule_launch_${workspaceId}`;

        // Prevent duplicate alarms by clearing the old one first

        await new Promise<void>((resolve) => chrome.alarms.clear(alarmName, () => resolve()));

        chrome.alarms.create(alarmName, {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60 // Repeat exactly every 24 hours
        });

        console.info(`[SmartTabs] Scheduled ${alarmName} for ${scheduledTime.toLocaleString()}`);
    }

    /**
     * Removes an active schedule for a workspace.
     */
    static async removeSchedule(workspaceId: string): Promise<void> {
        const alarmName = `schedule_launch_${workspaceId}`;
       await new Promise<void>((resolve) => chrome.alarms.clear(alarmName, () => resolve()));
        console.info(`[SmartTabs] Removed schedule ${alarmName}`);
    }

    /**
     * Retrieves all currently active SmartTabs schedules.
     */
    static async getAllSchedules(): Promise<chrome.alarms.Alarm[]> {
        const alarms = await chrome.alarms.getAll();
        return alarms.filter(a => a.name.startsWith('schedule_launch_'));
    }
}