import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ScheduleEntry {
    id: string;
    workspaceId: string;
    time: string; // HH:MM
    enabled: boolean;
}

export const SchedulesView: React.FC = () => {
    const { workspaces } = useWorkspaceStore();
    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
    const [selectedTime, setSelectedTime] = useState('08:00');

    const addSchedule = () => {
        if (!selectedWorkspaceId) return;
        const newSchedule: ScheduleEntry = {
            id: Math.random().toString(36).substr(2, 9),
            workspaceId: selectedWorkspaceId,
            time: selectedTime,
            enabled: true
        };

        const updated = [...schedules, newSchedule];
        setSchedules(updated);

        // Register sync engine command to Chrome Alarm Engine
        if (typeof chrome !== 'undefined' && chrome.alarms) {
            chrome.alarms.create(`schedule-${newSchedule.id}`, {
                when: Date.now() + 60000, // Safe buffer runtime fallback
                periodInMinutes: 1440 // Triggers daily
            });
        }
    };

    const deleteSchedule = (id: string) => {
        setSchedules(schedules.filter(s => s.id !== id));
        if (typeof chrome !== 'undefined' && chrome.alarms) {
            chrome.alarms.clear(`schedule-${id}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Automated Schedules</h1>
                <p className="text-[#64748B]">Orchestrate background launches automatically based on time signatures.</p>
            </div>

            <Card className="p-5 flex flex-col md:flex-row items-end gap-4 bg-white">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Target Workspace</label>
                    <select
                        className="w-full bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[12px] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        value={selectedWorkspaceId}
                        onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                    >
                        <option value="">Select an environment...</option>
                        {workspaces.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Trigger Time</label>
                    <input
                        type="time"
                        className="bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[12px] p-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    />
                </div>

                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={addSchedule}>
                    Add Lock
                </Button>
            </Card>

            <div className="grid grid-cols-1 gap-4">
                {schedules.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 bg-transparent">
                        <Calendar className="w-8 h-8 text-[#94A3B8] mx-auto mb-3 opacity-60" />
                        <p className="text-sm text-[#64748B]">No autonomous execution configurations scheduled yet.</p>
                    </Card>
                ) : (
                    schedules.map(schedule => {
                        const workspace = workspaces.find(w => w.id === schedule.workspaceId);
                        return (
                            <Card key={schedule.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#F1F5F9] rounded-[10px] flex items-center justify-center text-[#2563EB]">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-[#0F172A]">{workspace?.name || 'Unknown Workspace'}</h4>
                                        <p className="text-xs text-[#64748B]">Triggers daily execution at {schedule.time}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteSchedule(schedule.id)}>
                                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                                </Button>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};