export class StorageService {
    /**
     * Retrieves a value from Chrome local storage.
     */
    static async get<T>(key: string, defaultValue: T): Promise<T> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.warn('Chrome storage API not available, returning default value.');
            return defaultValue;
        }

        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                if (chrome.runtime.lastError) {
                    console.error(`Error reading ${key} from storage:`, chrome.runtime.lastError);
                    resolve(defaultValue);
                    return;
                }
                resolve(result[key] !== undefined ? (result[key] as T) : defaultValue);
            });
        });
    }

    /**
     * Saves a value to Chrome local storage.
     */
    static async set<T>(key: string, value: T): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.warn('Chrome storage API not available, ignoring save.');
            return;
        }

        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    console.error(`Error writing ${key} to storage:`, chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve();
            });
        });
    }

    /**
     * Removes a specific key from Chrome local storage.
     */
    static async remove(key: string): Promise<void> {
        if (typeof chrome === 'undefined' || !chrome.storage) return;

        return new Promise((resolve, reject) => {
            chrome.storage.local.remove([key], () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }
                resolve();
            });
        });
    }
}