import React from 'react';
import { BarChart3, Clock, Flame, CalendarRange } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Card } from '@/components/ui/Card';

export const AnalyticsView: React.FC = () => {
    const { records } = useAnalyticsStore();
    const { workspaces } = useWorkspaceStore();

    // Aggregate Metrics over time
    const totalLaunches = Object.values(records).reduce((sum, record) => {
        return sum + Object.values(record.workspaceLaunches).reduce((a, b) => a + b, 0);
    }, 0);

    const totalTabsOpened = Object.values(records).reduce((sum, record) => sum + record.tabsOpened, 0);

    const totalTimeSpentMs = Object.values(records).reduce((sum, record) => sum + record.totalLaunchTimeMs, 0);
    const avgLaunchTimeSec = totalLaunches > 0 ? ((totalTimeSpentMs / totalLaunches) / 1000).toFixed(2) : "0.00";

    // Discover Top Workspace
    const workspaceLaunchTotals: Record<string, number> = {};
    Object.values(records).forEach(record => {
        Object.entries(record.workspaceLaunches).forEach(([id, count]) => {
            workspaceLaunchTotals[id] = (workspaceLaunchTotals[id] || 0) + count;
        });
    });

    const topWorkspaceId = Object.entries(workspaceLaunchTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topWorkspaceName = workspaces.find(w => w.id === topWorkspaceId)?.name || "None Yet";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Productivity Insights</h1>
                <p className="text-[var(--text-secondary)]">Real-time statistics for your sequential workspace launches.</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Total Openings</span>
                        <BarChart3 className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{totalLaunches}</p>
                        <p className="text-xs text-[var(--color-success)] font-medium mt-1">⚡ Active OS Engine</p>
                    </div>
                </Card>

                <Card className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Tabs Optimized</span>
                        <Flame className="w-5 h-5 text-[var(--color-danger)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{totalTabsOpened}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Processed sequentially</p>
                    </div>
                </Card>

                <Card className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Avg Launch Velocity</span>
                        <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{avgLaunchTimeSec}s</p>
                        <p className="text-xs text-[var(--color-success)] font-medium mt-1">🚀 Zero UI blocking</p>
                    </div>
                </Card>

                <Card className="p-5 flex flex-col justify-between h-32">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Primary Space</span>
                        <CalendarRange className="w-5 h-5 text-[var(--color-warning)]" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-[var(--text-primary)] truncate tracking-tight">{topWorkspaceName}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Most triggered environment</p>
                    </div>
                </Card>
            </div>

            {/* Raw Data List Matrix */}
            <Card className="p-6">
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">Historical Operations Log</h3>
                {Object.keys(records).length === 0 ? (
                    <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                        No launch execution histories detected in current chrome node.
                    </div>
                ) : (
                        <div className="divide-y divide-[var(--border-upload)]">
                        {Object.values(records).map(record => (
                            <div key={record.date} className="py-3.5 flex justify-between text-sm">
                                <span className="font-medium text-[var(--text-primary)]">{record.date}</span>
                                <span className="text-[var(--text-secondary)]">{record.tabsOpened} browser tabs requested</span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};