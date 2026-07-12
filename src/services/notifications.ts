export class NotificationService {
    static show(title: string, message: string, type: 'basic' = 'basic'): void {
        if (typeof chrome === 'undefined' || !chrome.notifications) return;

        chrome.notifications.create({
            type,
            iconUrl: chrome.runtime.getURL('icons/icon128.png'),
            title,
            message,
            silent: true // Premium feel, no aggressive sounds
        });
    }
}