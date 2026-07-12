import { create } from 'zustand';
import { Workspace, Website } from '@/types';
import { generateId } from '@/utils/helpers';

interface WorkspaceState {
    workspaces: Workspace[];
    isLoading: boolean;
    error: string | null;

    // Workspace Actions
    setWorkspaces: (workspaces: Workspace[]) => void;
    addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
    updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
    deleteWorkspace: (id: string) => void;
    duplicateWorkspace: (id: string) => void;
    toggleFavorite: (id: string) => void;

    // Website Actions
    addWebsiteToWorkspace: (workspaceId: string, website: Omit<Website, 'id'>) => void;
    updateWebsiteInWorkspace: (workspaceId: string, websiteId: string, updates: Partial<Website>) => void;
    removeWebsiteFromWorkspace: (workspaceId: string, websiteId: string) => void;
    reorderWebsites: (workspaceId: string, startIndex: number, endIndex: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    workspaces: [],
    isLoading: true,
    error: null,

    setWorkspaces: (workspaces) => set({ workspaces, isLoading: false }),

    addWorkspace: (workspaceData) => set((state) => {
        const newWorkspace: Workspace = {
            ...workspaceData,
            id: generateId(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
        };
        return { workspaces: [...state.workspaces, newWorkspace] };
    }),

    updateWorkspace: (id, updates) => set((state) => ({
        workspaces: state.workspaces.map((ws) =>
            ws.id === id
                ? { ...ws, ...updates, updatedAt: Date.now(), version: ws.version + 1 }
                : ws
        ),
    })),

    deleteWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter((ws) => ws.id !== id),
    })),

    duplicateWorkspace: (id) => set((state) => {
        const workspaceToCopy = state.workspaces.find((ws) => ws.id === id);
        if (!workspaceToCopy) return state;

        const duplicated: Workspace = {
            ...workspaceToCopy,
            id: generateId(),
            name: `${workspaceToCopy.name} (Copy)`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
            websites: workspaceToCopy.websites.map(site => ({ ...site, id: generateId() }))
        };

        return { workspaces: [...state.workspaces, duplicated] };
    }),

    toggleFavorite: (id) => set((state) => ({
        workspaces: state.workspaces.map((ws) =>
            ws.id === id
                ? { ...ws, isFavorite: !ws.isFavorite, updatedAt: Date.now() }
                : ws
        ),
    })),

    addWebsiteToWorkspace: (workspaceId, websiteData) => set((state) => ({
        workspaces: state.workspaces.map((ws) => {
            if (ws.id !== workspaceId) return ws;
            const newWebsite: Website = { ...websiteData, id: generateId() };
            return {
                ...ws,
                websites: [...ws.websites, newWebsite],
                updatedAt: Date.now(),
                version: ws.version + 1
            };
        })
    })),

    updateWebsiteInWorkspace: (workspaceId, websiteId, updates) => set((state) => ({
        workspaces: state.workspaces.map((ws) => {
            if (ws.id !== workspaceId) return ws;
            return {
                ...ws,
                websites: ws.websites.map((site) =>
                    site.id === websiteId ? { ...site, ...updates } : site
                ),
                updatedAt: Date.now(),
                version: ws.version + 1
            };
        })
    })),

    removeWebsiteFromWorkspace: (workspaceId, websiteId) => set((state) => ({
        workspaces: state.workspaces.map((ws) => {
            if (ws.id !== workspaceId) return ws;
            return {
                ...ws,
                websites: ws.websites.filter((site) => site.id !== websiteId),
                updatedAt: Date.now(),
                version: ws.version + 1
            };
        })
    })),

    reorderWebsites: (workspaceId, startIndex, endIndex) => set((state) => ({
        workspaces: state.workspaces.map((ws) => {
            if (ws.id !== workspaceId) return ws;
            const result = Array.from(ws.websites);
            const [removed] = result.splice(startIndex, 1);

            if (!removed) return ws; // Safe fallback if index is out of bounds

            result.splice(endIndex, 0, removed);

            const orderedResult = result.map((site, index) => ({ ...site, order: index }));

            return {
                ...ws,
                websites: orderedResult,
                updatedAt: Date.now(),
                version: ws.version + 1
            };
        })
    }))
}));