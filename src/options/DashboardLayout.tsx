import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FolderKanban, Calendar, BarChart3, Menu, X, Settings as SettingsIcon  } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { StorageService } from '@/services/storage';
import { Overview } from './views/Overview';
import { WorkspacesManager } from './views/WorkspacesManager';
import { SettingsView } from './views/SettingsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SchedulesView } from './views/SchedulesView';
import { WorkspaceEditor } from './views/WorkspaceEditor';
import { useTheme } from '@/hooks/useTheme';

type ViewType = 'dashboard' | 'workspaces' | 'schedules' | 'analytics' | 'settings';

export const DashboardLayout: React.FC = () => {
    useTheme();
    const [activeView, setActiveView] = useState<ViewType>('dashboard');
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <div className="flex items-center justify-center h-screen bg-[var(--bg-app)]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-[14px] mb-4 opacity-50"></div>
                    <div className="text-[var(--text-primary)] font-medium text-sm">Initializing SmartTabs OS...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 overflow-hidden relative">

            {/* Mobile Backdrop Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}>
                </div>
            )}

            {/* Sidebar Navigation Framework (Desktop & Responsive Mobile Slide Layout) */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col z-50 lg:z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-4 py-3 border-b border-[var(--border-main)] mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={"/icons/logo.png"} alt="SmartTabs Logo" className="w-7 h-7" />
                        <span className="font-semibold text-[var(--text-primary)] text-lg tracking-tight">SmartTabs</span>
                    </div>
                    {/* Close button inside mobile menu */}
                    <button className="p-1.5 rounded-lg lg:hidden hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                        onClick={() => setIsMobileMenuOpen(false)}  >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto hide-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveView(item.id);
                                setActiveWorkspaceId(null);
                                setIsMobileMenuOpen(false); // Close responsive drawer on action click
                            }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all ${activeView === item.id && !activeWorkspaceId
                                ? 'bg-[var(--bg-hover)] text-[var(--color-primary)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-app)] hover:text-[var(--text-primary)]'
                                }`} >
                            <item.icon className={`w-4 h-4 ${activeView === item.id && !activeWorkspaceId ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Footer Component Promo Frame */}
                <div className="p-4 border-t border-[var(--border-main)]">
                    <div className="bg-[var(--bg-app)] p-4 rounded-[14px] border border-[var(--border-main)]">
                        <p className="text-xs font-medium text-[var(--text-primary)] mb-1">Explore New Tools</p>
                        <p className="text-[10px] text-[var(--text-secondary)]">Less friction. More focus.Chrome extensions designed for the way you work.</p>
                        {/* <button className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-primary)] text-xs font-medium py-1.5 rounded-[10px] hover:bg-[var(--bg-hover)] transition-colors cursor-default">
                            Discover Extensions
                        </button> */}
                    </div>
                </div>
            </aside>

            {/* Main Content Area Container Node */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* Responsive Floating Context TopBar (Triggers on smaller breakpoints)  */}
                <header className="h-14 border-b border-[var(--border-main)] bg-[var(--bg-card)] px-4 flex items-center justify-between lg:hidden shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 -ml-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-primary)] shrink-0"
                            onClick={() => setIsMobileMenuOpen(true)} >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            <img src={"/icons/logo.png"} alt="SmartTabs Logo" className="w-6 h-6" />
                            <span className="font-semibold text-[var(--text-primary)] text-lg tracking-tight">SmartTabs</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable viewport view context wrapper  */}
                <main className="flex-1 overflow-y-auto bg-[var(--bg-app)] transition-colors duration-200">
                    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
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
        </div>
    );
};