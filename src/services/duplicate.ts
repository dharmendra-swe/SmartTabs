import { TabsService } from './tabs';
import { DuplicateStrategy } from '@/types';

export class DuplicateService {
    /**
     * Normalizes a URL for comparison.
     * Removes protocol (http/https), www, and trailing slashes.
     */
    private static normalizeUrl(url: string): string {
        try {
            const parsed = new URL(url);
            let normalized = parsed.hostname + parsed.pathname + parsed.search;
            normalized = normalized.replace(/^www\./, '');
            normalized = normalized.replace(/\/$/, '');
            return normalized.toLowerCase();
        } catch (e) {
            // Fallback for invalid URLs
            return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
        }
    }

    /**
     * Checks if a URL is already open in the browser and applies the requested strategy.
     * Returns a boolean indicating whether the open sequence should SKIP creating a new tab.
     */
    static async handleDuplicateCheck(
        targetUrl: string,
        strategy: DuplicateStrategy
    ): Promise<boolean> {
        if (strategy === 'open_new') {
            return false; // Never skip, always open new
        }

        const openTabs = await TabsService.getAllOpenTabs();
        const normalizedTarget = this.normalizeUrl(targetUrl);

        const existingTab = openTabs.find((tab) => {
            if (!tab.url) return false;
            return this.normalizeUrl(tab.url) === normalizedTarget;
        });

        if (!existingTab || !existingTab.id || !existingTab.windowId) {
            return false; // No duplicate found, do not skip
        }

        if (strategy === 'focus_existing') {
            await TabsService.focusTab(existingTab.id, existingTab.windowId);
            return true; // Skip creating a new tab
        }

        if (strategy === 'ignore') {
            return true; // Skip creating a new tab, but don't focus the existing one
        }

        return false;
    }
}