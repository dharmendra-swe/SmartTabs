import { create } from 'zustand';
import { Settings, ThemePreference } from '@/types';

interface SettingsState {
    settings: Settings;
    isLoading: boolean;

    // Actions
    updateSettings: (updates: Partial<Settings>) => void;
    setTheme: (theme: ThemePreference) => void;
    setGlobalDelay: (delay: number) => void;
    hydrateSettings: (initialSettings: Settings) => void;
}

const defaultSettings: Settings = {
    theme: 'system',
    animationsEnabled: true,
    globalDelay: 200,
    defaultDuplicateStrategy: 'focus_existing',
    notificationsEnabled: true,
    startupWorkspaceId: null,
    language: 'en',
};

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: defaultSettings,
    isLoading: true,

    updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
    })),

    setTheme: (theme) => set((state) => ({
        settings: { ...state.settings, theme }
    })),

    setGlobalDelay: (delay) => set((state) => ({
        settings: { ...state.settings, globalDelay: delay }
    })),

    hydrateSettings: (initialSettings) => set({
        settings: initialSettings,
        isLoading: false
    })
}));