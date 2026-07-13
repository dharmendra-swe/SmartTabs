import { Workspace, Settings } from '@/types';
import { TabsService } from './tabs';
import { DuplicateService } from './duplicate';
import { sleep } from '@/utils/helpers';

export interface LaunchResult {
    success: boolean;
    openedCount: number;
    skippedCount: number;
    totalTimeMs: number;
    error?: string;
}

export class WorkspaceEngine {
    /**
     * Validates if a string is a properly formatted URL.
     */
    private static isValidUrl(urlString: string): boolean {
        try {
            new URL(urlString);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Ensures the URL has a protocol to prevent browser routing errors.
     */
    private static enforceProtocol(url: string): string {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    }

    /**
     * Executes the sequential launch sequence for a specific workspace.
     */
    static async launchWorkspace(
        workspace: Workspace,
        settings: Settings
    ): Promise<LaunchResult> {
        const startTime = performance.now();
        let openedCount = 0;
        let skippedCount = 0;

        try {
            // 1. Filter and sort active websites
            const activeWebsites = workspace.websites
                .filter((site) => site.enabled)
                .sort((a, b) => a.order - b.order);

            if (activeWebsites.length === 0) {
                return { success: true, openedCount: 0, skippedCount: 0, totalTimeMs: 0 };
            }

            // 2. Sequential Processing Engine
            for (let i = 0; i < activeWebsites.length; i++) {
                const site = activeWebsites[i];

                // Guard clause satisfying noUncheckedIndexedAccess: true
                if (!site) {
                    continue;
                }

                const targetUrl = this.enforceProtocol(site.url);

                if (!this.isValidUrl(targetUrl)) {
                    console.warn(`[SmartTabs] Invalid URL skipped: ${targetUrl}`);
                    skippedCount++;
                    continue;
                }

                // Apply delay BEFORE opening (except for the first tab)
                if (i > 0) {
                    const delayMs = site.delay > 0 ? site.delay : settings.globalDelay;
                    await sleep(delayMs);
                }

                // Duplicate Strategy Resolution
                const strategy = site.duplicateRule || settings.defaultDuplicateStrategy;
                const shouldSkip = await DuplicateService.handleDuplicateCheck(targetUrl, strategy);

                if (shouldSkip) {
                    skippedCount++;
                    continue;
                }

                // Open the tab based on the specified open mode
                if ((site.openMode as string) === 'new_window') {
                    await TabsService.createTabInNewWindow(targetUrl, site.pinned);
                } else {
                    const isActive = i === 0;
                    await TabsService.createTab(targetUrl, site.pinned, isActive);
                }

                openedCount++;
            }

            const endTime = performance.now();

            return {
                success: true,
                openedCount,
                skippedCount,
                totalTimeMs: Math.round(endTime - startTime)
            };

        } catch (error: any) {
            console.error('[SmartTabs] Workspace launch failed:', error);
            return {
                success: false,
                openedCount,
                skippedCount,
                totalTimeMs: Math.round(performance.now() - startTime),
                error: error.message || 'Unknown launch error'
            };
        }
    }
}