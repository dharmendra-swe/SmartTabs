import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FolderKanban, Calendar, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { StorageService } from '@/services/storage';

// Views (We will build these next)
import { Overview } from './views/Overview';
import { WorkspacesManager } from './views/WorkspacesManager';
import { SettingsView } from './views/SettingsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SchedulesView } from './views/SchedulesView';
import { WorkspaceEditor } from './views/WorkspaceEditor';

type ViewType = 'dashboard' | 'workspaces' | 'schedules' | 'analytics' | 'settings';

export const DashboardLayout: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>('dashboard');
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    const { setWorkspaces } = useWorkspaceStore();
    const { hydrateSettings } = useSettingsStore();
    const { hydrateAnalytics } = useAnalyticsStore();

    // Master Hydration Cycle
    useEffect(() => {
        const bootstrapOS = async () => {
            const [workspaceStr, settingsStr, analyticsStr] = await Promise.all([
                StorageService.get<string>('workspace-storage', '{}'),
                StorageService.get<string>('settings-storage', '{}'),
                StorageService.get<string>('analytics-storage', '{}')
            ]);

            const parsedWorkspaces = JSON.parse(workspaceStr);
            const parsedSettings = JSON.parse(settingsStr);
            const parsedAnalytics = JSON.parse(analyticsStr);

            if (parsedWorkspaces?.state?.workspaces) setWorkspaces(parsedWorkspaces.state.workspaces);
            if (parsedSettings?.state?.settings) hydrateSettings(parsedSettings.state.settings);
            if (parsedAnalytics?.state?.records) hydrateAnalytics(parsedAnalytics.state.records);

            setIsHydrated(true);
        };

        bootstrapOS();
    }, [setWorkspaces, hydrateSettings, hydrateAnalytics]);

    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'workspaces', label: 'Workspaces', icon: FolderKanban },
        { id: 'schedules', label: 'Schedules', icon: Calendar },
        { id: 'analytics', label: 'Statistics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ] as const;

    if (!isHydrated) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#F8FAFC]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#2563EB] rounded-[14px] mb-4 opacity-50"></div>
                    <div className="text-[#0F172A] font-medium text-sm">Initializing SmartTabs OS...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#2563EB] rounded-[10px] flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-[#0F172A] text-lg tracking-tight">SmartTabs</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all ${activeView === item.id
                                ? 'bg-[#F1F5F9] text-[#2563EB]'
                                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${activeView === item.id ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#E5E7EB]">
                    <div className="bg-[#F8FAFC] p-4 rounded-[14px] border border-[#E5E7EB]">
                        <p className="text-xs font-medium text-[#0F172A] mb-1">SmartTabs Pro</p>
                        <p className="text-[11px] text-[#64748B] mb-3">Cloud Sync & Team Spaces</p>
                        <button className="w-full bg-white border border-[#E5E7EB] text-[#0F172A] text-xs font-medium py-1.5 rounded-[10px] hover:bg-[#F1F5F9] transition-colors">
                            Coming 2026
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8"> 
                    {activeView === 'dashboard' && <Overview onNavigate={setActiveView} />}
                    {activeView === 'workspaces' && !activeWorkspaceId && (
                        <WorkspacesManager onEdit={(id) => setActiveWorkspaceId(id)} />
                    )}
                    {activeWorkspaceId && (
                        <WorkspaceEditor workspaceId={activeWorkspaceId} onClose={() => setActiveWorkspaceId(null)} />
                    )}
                    {activeView === 'schedules' && <SchedulesView />}
                    {activeView === 'analytics' && <AnalyticsView />}
                    {activeView === 'settings' && <SettingsView />} 
                </div>
            </main>
        </div>
    );
};