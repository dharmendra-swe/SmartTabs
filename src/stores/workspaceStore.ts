import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Workspace, Website, CreateWebsiteDTO } from '@/types';
import { generateId } from '@/utils/helpers';


const chromeStorageAdapter: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        const result = await chrome.storage.local.get(name);
        const value = result[name];

        // Safely verify it is a string to satisfy strict TypeScript rules
        if (typeof value === 'string') {
            return value;
        }
        return null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await chrome.storage.local.set({ [name]: value });
    },
    removeItem: async (name: string): Promise<void> => {
        await chrome.storage.local.remove(name);
    },
};

// --- 2. TYPES ---
interface WorkspaceState {
    workspaces: Workspace[];
    isLoading: boolean;
    error: string | null;

    setWorkspaces: (workspaces: Workspace[]) => void;
    addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
    updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
    deleteWorkspace: (id: string) => void;
    duplicateWorkspace: (id: string) => void;
    toggleFavorite: (id: string) => void;

    addWebsiteToWorkspace: (workspaceId: string, website: Omit<Website, 'id'>) => void;
    updateWebsiteInWorkspace: (workspaceId: string, websiteId: string, updates: Partial<Website>) => void;
    removeWebsiteFromWorkspace: (workspaceId: string, websiteId: string) => void;
    reorderWebsites: (workspaceId: string, startIndex: number, endIndex: number) => void;
}

// --- 3. PERSISTED STORE ---
export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set) => ({
            workspaces: [],
            isLoading: false, // Set false because persist handles loading automatically
            error: null,

            setWorkspaces: (workspaces) => set({ workspaces }),

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
            }), false),

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
             
            addWebsiteToWorkspace: (workspaceId: string, websiteData: CreateWebsiteDTO) => set((state) => ({
                workspaces: state.workspaces.map((ws) => {
                    if (ws.id !== workspaceId) return ws;
                    const newWebsite: Website = {
                        ...websiteData,
                        id: generateId(),
                        order: ws.websites.length // आर्डर यहाँ हैंडल करें
                    };
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
                    if (!removed) return ws;
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
        }),
        {
            name: 'workspace-storage', // The exact key used in chrome.storage
            storage: createJSONStorage(() => chromeStorageAdapter),
        }
    )
);