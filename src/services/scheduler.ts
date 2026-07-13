export class SchedulerService {
    static async createDailySchedule(workspaceId: string, timeString: string): Promise<void> {
        if (!chrome.alarms) return;

        // 1. सुरक्षित तरीके से नंबर एक्सट्रेक्ट करें
        const parts = timeString.split(':');
        const hour = parseInt(parts[0] || '0', 10);
        const minute = parseInt(parts[1] || '0', 10);

        const scheduledTime = new Date();

        // 2. अब hour और minute हमेशा 'number' होंगे
        scheduledTime.setHours(hour, minute, 0, 0);

        // If the specified time has already passed today, schedule it for tomorrow
        if (scheduledTime.getTime() <= Date.now()) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const alarmName = `schedule_launch_${workspaceId}`;

        await chrome.alarms.clear(alarmName);
        chrome.alarms.create(alarmName, {
            when: scheduledTime.getTime(),
            periodInMinutes: 24 * 60 // Repeat exactly every 24 hours
        });
    }

    static async removeSchedule(workspaceId: string): Promise<void> {
        if (chrome.alarms) {
            await chrome.alarms.clear(`schedule_launch_${workspaceId}`);
        }
    }

    static async getAllSchedules(): Promise<chrome.alarms.Alarm[]> {
        if (!chrome.alarms) return [];
        const alarms = await chrome.alarms.getAll();
        return alarms.filter(a => a.name.startsWith('schedule_launch_'));
    }
}