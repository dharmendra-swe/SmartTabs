import React, { useState } from 'react';
import { Search, Settings, Rocket, ExternalLink, Command } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { WorkspaceEngine } from '@/services/workspaceEngine';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import '@/globals.css';  
import { useTheme } from '@/hooks/useTheme';

export const Popup: React.FC = () => {
    useTheme(); // Custom hook to apply theme based on settings
    // These now automatically sync with chrome.storage instantly
    const { workspaces } = useWorkspaceStore();
    const { settings } = useSettingsStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [isLaunching, setIsLaunching] = useState<string | null>(null);

    const handleLaunch = async (workspaceId: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (!workspace) return;

        setIsLaunching(workspaceId);
        await WorkspaceEngine.launchWorkspace(workspace, settings);
        setIsLaunching(null);
        window.close(); // Close popup after launching
    };

    const openOptions = () => {
        if (chrome?.runtime?.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    };

    const filteredWorkspaces = workspaces.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) && !w.isHidden
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-app)]">
            {/* Header */}
            <div className="px-4 py-4 bg-[var(--bg-card)] border-b border-[var(--border-main)] flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-base font-semibold text-[var(--text-primary)]">Good Morning 👋</h1>
                    <p className="text-xs text-[var(--text-secondary)]">Ready to start today?</p>
                </div>
                <Button variant="ghost" size="icon" onClick={openOptions} title="Open Settings">
                    <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
                </Button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search Workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[14px] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                        autoFocus
                    />
                </div> 
            </div>

            {/* Workspace List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 hide-scrollbar">
                {filteredWorkspaces.length === 0 ? (
                    <div className="text-center py-8">
                        <Rocket className="w-8 h-8 text-[var(--border-main)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--text-secondary)]">No workspaces found.</p>
                        {workspaces.length === 0 && (
                            <Button variant="primary" size="sm" className="mt-4" onClick={openOptions}>
                                Create Your First Workspace
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredWorkspaces.map(workspace => (
                        <Card
                            key={workspace.id}
                            className="p-3 flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <div
                                    className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                                >
                                    <span className="text-lg">{workspace.emoji}</span>
                                </div>
                                <div className="truncate">
                                    <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                                        {workspace.name}
                                    </h3>
                                    <p className="text-xs text-[var(--text-secondary)] truncate">
                                        {workspace.websites.filter(w => w.enabled).length} tabs
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant={isLaunching === workspace.id ? "primary" : "secondary"}
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleLaunch(workspace.id)}
                                isLoading={isLaunching === workspace.id}
                            >
                                {!isLaunching && <ExternalLink className="w-4 h-4" />}
                            </Button>
                        </Card>
                    ))
                )}
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex items-center justify-center space-x-2 text-xs text-[var(--text-muted)]">
                <Command className="w-3 h-3" />
                <span>Developed by DkUnstoppable</span>
            </div>
        </div>
    );
};