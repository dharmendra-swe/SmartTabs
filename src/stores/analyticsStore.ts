import { create } from 'zustand';
import { AnalyticsRecord } from '@/types';

interface AnalyticsState {
    records: Record<string, AnalyticsRecord>;

    // Actions
    hydrateAnalytics: (records: Record<string, AnalyticsRecord>) => void;
    logWorkspaceLaunch: (workspaceId: string, tabsCount: number, launchTimeMs: number) => void;
}

// Fixed: Added defensive fallback to satisfy noUncheckedIndexedAccess
const getTodayKey = (): string => new Date().toISOString().split('T')[0] || '';

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
    records: {},

    hydrateAnalytics: (records) => set({ records }),

    logWorkspaceLaunch: (workspaceId, tabsCount, launchTimeMs) => set((state) => {
        const today: string = getTodayKey();

        // Explicit lookup fallback honoring strict index rules
        const currentRecord: AnalyticsRecord = state.records[today] ?? {
            date: today,
            tabsOpened: 0,
            workspaceLaunches: {},
            totalLaunchTimeMs: 0
        };

        const currentWorkspaceLaunches = currentRecord.workspaceLaunches;
        const currentWorkspaceCount = currentWorkspaceLaunches[workspaceId] ?? 0;

        const updatedRecord: AnalyticsRecord = {
            ...currentRecord,
            tabsOpened: currentRecord.tabsOpened + tabsCount,
            totalLaunchTimeMs: currentRecord.totalLaunchTimeMs + launchTimeMs,
            workspaceLaunches: {
                ...currentWorkspaceLaunches,
                [workspaceId]: currentWorkspaceCount + 1
            }
        };

        return {
            records: {
                ...state.records,
                [today]: updatedRecord
            }
        };
    })
}));