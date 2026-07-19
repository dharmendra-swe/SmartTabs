export type DuplicateStrategy = 'focus_existing' | 'open_new' | 'ignore';  
export type OpenMode = 'current_window' | 'new_window' | 'new_tab';
export type ThemePreference = 'system' | 'light' | 'dark'; 

export interface Website {
    id: string;
    title: string;
    url: string;
    category: string;
    icon?: string;
    delay: number; // in milliseconds
    pinned: boolean;
    enabled: boolean;
    duplicateRule: DuplicateStrategy;
    openMode: OpenMode;
    notes: string;
    tags: string[];
    order: number;
}

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    color: string;
    emoji: string;
    websites: Website[];
    isFavorite: boolean;
    isHidden: boolean;
    createdAt: number;
    updatedAt: number;
    version: number;
}

export interface Settings {
    theme: ThemePreference;
    animationsEnabled: boolean;
    globalDelay: number;
    defaultDuplicateStrategy: DuplicateStrategy;
    notificationsEnabled: boolean;
    startupWorkspaceId: string | null;
    language: string;
}

export interface AnalyticsRecord {
    date: string; // YYYY-MM-DD
    tabsOpened: number;
    workspaceLaunches: Record<string, number>; // workspaceId -> count
    totalLaunchTimeMs: number;
}
export type CreateWebsiteDTO = Omit<Website, 'id' | 'order'>;