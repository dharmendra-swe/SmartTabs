import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Calendar } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { SchedulerService } from '@/services/scheduler';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const SchedulesView: React.FC = () => {
    const { workspaces } = useWorkspaceStore();
    const [alarms, setAlarms] = useState<chrome.alarms.Alarm[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState('');
    const [time, setTime] = useState('09:00');

    const loadAlarms = async () => {
        const activeAlarms = await SchedulerService.getAllSchedules();
        setAlarms(activeAlarms);
    };

    useEffect(() => {
        loadAlarms();
    }, []);

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWorkspace || !time) return;

        await SchedulerService.createDailySchedule(selectedWorkspace, time);
        await loadAlarms();
    };

    const handleDelete = async (workspaceId: string) => {
        await SchedulerService.removeSchedule(workspaceId);
        await loadAlarms();
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">Automated Schedules</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Set your workspaces to open automatically at specific times.</p>
            </div>

            <Card className="p-6 bg-[var(--bg-card)] border-[var(--border-main)] mb-8 shadow-sm">
                <form onSubmit={handleCreateSchedule} className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Workspace</label>
                        <select
                            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[12px] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                            value={selectedWorkspace}
                            onChange={(e) => setSelectedWorkspace(e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Workspace...</option>
                            {workspaces.map(ws => (
                                <option key={ws.id} value={ws.id}>{ws.emoji} {ws.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Time (Daily)</label>
                        <input
                            type="time"
                            className="bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[12px] p-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" variant="primary" className="h-10 px-6">
                        <Plus className="w-4 h-4 mr-2" /> Add Schedule
                    </Button>
                </form>
            </Card> 

            <div className="space-y-3">
                {alarms.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-[var(--border-main)] rounded-[18px] bg-[var(--bg-card)]">
                        <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-[var(--text-secondary)]">No schedules active.</p>
                    </div>
                ) : (
                    alarms.map(alarm => {
                        const wsId = alarm.name.replace('schedule_launch_', '');
                        const workspace = workspaces.find(w => w.id === wsId);
                        const triggerTime = new Date(alarm.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        if (!workspace) return null;

                        return (
                            <Card key={alarm.name} className="p-4 flex items-center justify-between bg-[var(--bg-card)] border-[var(--border-main)] group">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-[12px] bg-[var(--bg-hover)] flex items-center justify-center text-lg">
                                        <Clock className="w-5 h-5 text-[var(--border-focus)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{workspace.name}</h3>
                                        <p className="text-xs text-[var(--text-secondary)]">Opens daily at {triggerTime}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(wsId)}
                                    className="opacity-0 group-hover:opacity-100 text-[var(--brand-danger)] hover:bg-[var(--bg-app)]"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};