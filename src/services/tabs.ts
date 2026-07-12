export class TabsService {
    /**
     * Opens a new tab with the given configuration.
     */
    static async createTab(url: string, pinned: boolean = false, active: boolean = false): Promise<chrome.tabs.Tab | null> {
        if (typeof chrome === 'undefined' || !chrome.tabs) return null;

        return new Promise((resolve) => {
            chrome.tabs.create({ url, pinned, active }, (tab) => {
                resolve(tab || null);
            });
        });
    }

    /**
     * Creates a tab in a completely new window.
     */
    static async createTabInNewWindow(url: string, pinned: boolean = false): Promise<chrome.tabs.Tab | null> {
        if (typeof chrome === 'undefined' || !chrome.windows) return null;

        return new Promise((resolve) => {
            chrome.windows.create({ url, focused: true }, (window) => {
                if (window && window.tabs && window.tabs.length > 0) {
                    const tab = window.tabs[0];

                    // Explicit Type Narrowing for strict compilation
                    if (tab === undefined) {
                        resolve(null);
                        return;
                    }

                    if (pinned && tab.id !== undefined) {
                        chrome.tabs.update(tab.id, { pinned: true }, (updatedTab) => {
                            resolve(updatedTab || null);
                        });
                    } else {
                        resolve(tab);
                    }
                } else {
                    resolve(null);
                }
            });
        });
    }

    /**
     * Focuses an existing tab, switching to its window if necessary.
     */
    static async focusTab(tabId: number, windowId: number): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.tabs) return;

        return new Promise((resolve) => {
            chrome.tabs.update(tabId, { active: true }, () => {
                chrome.windows.update(windowId, { focused: true }, () => {
                    resolve();
                });
            });
        });
    }

    /**
     * Queries all currently open tabs across all windows.
     */
    static async getAllOpenTabs(): Promise<chrome.tabs.Tab[]> {
        if (typeof chrome === 'undefined' || !chrome.tabs) return [];

        return new Promise((resolve) => {
            chrome.tabs.query({}, (tabs) => {
                resolve(tabs);
            });
        });
    }
}