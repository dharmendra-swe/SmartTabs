import { Workspace } from '@/types';

export interface BackupPayload {
    version: number;
    exportedAt: number;
    workspaces: Workspace[];
}

export class BackupService {
    private static CURRENT_VERSION = 1;

    /**
     * Transforms structural store data into an externalized JSON configuration string.
     */
    static exportData(workspaces: Workspace[]): string {
        const payload: BackupPayload = {
            version: this.CURRENT_VERSION,
            exportedAt: Date.now(),
            workspaces
        };
        return JSON.stringify(payload, null, 2);
    }

    /**
     * Parses and securely filters data structural payloads.
     * Throws explicit validation errors if corruption or parsing failure occurs.
     */
    static validateAndImport(jsonString: string): Workspace[] {
        try {
            const parsed = JSON.parse(jsonString) as Partial<BackupPayload>;

            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Data payload must be a valid JSON object.');
            }

            if (!Array.isArray(parsed.workspaces)) {
                throw new Error('Missing top-level workspaces configuration tree.');
            }

            // Deep Sanitation Loop
            const verifiedWorkspaces: Workspace[] = parsed.workspaces.map((ws: any, index) => {
                if (!ws.name || typeof ws.name !== 'string') {
                    throw new Error(`Workspace at track index [${index}] contains an unreadable name string.`);
                }

                return {
                    id: ws.id || Math.random().toString(36).substring(2, 15),
                    name: ws.name,
                    description: ws.description || '',
                    color: ws.color || '#2563EB',
                    emoji: ws.emoji || '📂',
                    websites: Array.isArray(ws.websites) ? ws.websites.map((site: any) => ({
                        id: site.id || Math.random().toString(36).substring(2, 15),
                        title: site.title || 'Untitled Site',
                        url: site.url || '',
                        category: site.category || 'General',
                        delay: typeof site.delay === 'number' ? site.delay : 200,
                        pinned: Boolean(site.pinned),
                        enabled: site.enabled !== false,
                        duplicateRule: site.duplicateRule || 'focus_existing',
                        openMode: site.openMode || 'current_window',
                        notes: site.notes || '',
                        tags: Array.isArray(site.tags) ? site.tags : [],
                        order: typeof site.order === 'number' ? site.order : 0
                    })) : [],
                    isFavorite: Boolean(ws.isFavorite),
                    isHidden: Boolean(ws.isHidden),
                    createdAt: typeof ws.createdAt === 'number' ? ws.createdAt : Date.now(),
                    updatedAt: Date.now(),
                    version: typeof ws.version === 'number' ? ws.version : 1
                };
            });

            return verifiedWorkspaces;
        } catch (error: any) {
            throw new Error(`Verification Failure: ${error.message || 'Malformed schema parameters syntax.'}`);
        }
    }
}