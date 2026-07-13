import { Workspace } from '@/types';
import { generateId } from '@/utils/helpers';

export class WorkspaceManager {
    /**
     * Validates and cleans a URL before saving
     */
    static formatUrl(url: string): string {
        let cleanUrl = url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `https://${cleanUrl}`;
        }
        return cleanUrl;
    }

    /**
     * Generates a complete JSON backup of all workspaces
     */
    static exportToJSON(workspaces: Workspace[]): string {
        const payload = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: workspaces
        };
        return JSON.stringify(payload, null, 2);
    }

    /**
     * Parses and validates an imported JSON backup
     */
    static importFromJSON(jsonString: string): Workspace[] {
        try {
            const parsed = JSON.parse(jsonString);

            // Basic validation to ensure it's a SmartTabs backup
            if (!parsed.data || !Array.isArray(parsed.data)) {
                throw new Error('Invalid backup format');
            }

            // Regenerate IDs to prevent conflicts with existing data
            const importedWorkspaces: Workspace[] = parsed.data.map((ws: any) => ({
                id: generateId(),
                name: ws.name || 'Imported Workspace',
                emoji: ws.emoji || '📦',
                color: ws.color || '#2563EB',
                isFavorite: !!ws.isFavorite,
                isHidden: !!ws.isHidden,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                version: 1,
                websites: (ws.websites || []).map((site: any, index: number) => ({
                    id: generateId(),
                    title: site.title || site.url,
                    url: this.formatUrl(site.url),
                    delayOverride: site.delayOverride || null,
                    duplicateRule: site.duplicateRule || 'focus',
                    openMode: site.openMode || 'new_tab',
                    pinned: !!site.pinned,
                    enabled: site.enabled !== false,
                    order: index
                }))
            }));

            return importedWorkspaces;
        } catch (error) {
            console.error('[SmartTabs] Failed to import JSON:', error);
            throw new Error('Failed to read backup file. Please ensure it is a valid SmartTabs export.');
        }
    }
}