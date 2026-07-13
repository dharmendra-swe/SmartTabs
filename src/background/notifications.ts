export class NotificationEngine {
    /**
     * Triggers a native Chrome system notification
     */
    static show(title: string, message: string, id: string = `smarttabs_${Date.now()}`) {
        if (typeof chrome === 'undefined' || !chrome.notifications) return;

        chrome.notifications.create(id, {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: title,
            message: message,
            priority: 1
        });
    }

    /**
     * Shows a success notification
     */
    static success(message: string) {
        this.show('SmartTabs Success', message);
    }

    /**
     * Shows an error notification
     */
    static error(message: string) {
        this.show('SmartTabs Error', message);
    }
}