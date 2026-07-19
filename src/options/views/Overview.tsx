import React from 'react';
import { Rocket, Plus, ArrowRight, Activity, BarChart3, FolderKanban, Star, FolderOpenDot } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { WorkspaceEngine } from '@/services/workspaceEngine';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OverviewProps {
    onNavigate: (view: 'workspaces' | 'schedules' | 'analytics' | 'settings') => void;
}

export const Overview: React.FC<OverviewProps> = ({ onNavigate }) => {
    const { workspaces } = useWorkspaceStore();
    const { settings } = useSettingsStore();

    const totalWebsites = workspaces.reduce((acc, ws) => acc + ws.websites.length, 0);
    const favoriteWorkspaces = workspaces.filter(ws => ws.isFavorite);
    const recentWorkspaces = [...workspaces].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);

    const handleLaunch = async (workspaceId: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            await WorkspaceEngine.launchWorkspace(workspace, settings);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Good Morning 👋</h1>
                    <p className="text-[var(--text-secondary)]">Here is your workspace overview for today.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-app)] text-[var(--color-accent)] rounded-[14px] flex items-center justify-center border border-[var(--border-subtle)]">
                        <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{workspaces.length}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Active Workspaces</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-app)] text-[var(--color-success)] rounded-[14px] flex items-center justify-center border border-[var(--border-subtle)]">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">{totalWebsites}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Saved Websites</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center justify-between hoverable cursor-pointer group" onClick={() => onNavigate('analytics')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[var(--bg-app)] text-[var(--text-secondary)] rounded-[14px] flex items-center justify-center border border-[var(--border-subtle)]">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">View detailed</p>
                            <p className="text-sm text-[var(--text-secondary)]">Launch statistics</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                </Card>
            </div>

            {/* Favorites Section */}
            {favoriteWorkspaces.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-[var(--color-warning)] fill-current" />
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Favorites</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {favoriteWorkspaces.map((workspace) => (
                            <Card key={`fav-${workspace.id}`} hoverable className="p-4 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-[12px] flex items-center justify-center font-sans"
                                        style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                                    >
                                        <span className="text-lg">{workspace.emoji}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-hover)]"
                                        onClick={() => handleLaunch(workspace.id)}
                                    >
                                        <Rocket className="w-4 h-4 text-[var(--color-primary)] fill-current" />
                                    </Button>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-semibold text-[var(--text-primary)] truncate mb-1">{workspace.name}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">{workspace.websites.filter(w => w.enabled).length} websites</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Launch (Recent) */}
            <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Workspaces</h2>
                {workspaces.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 border-[var(--border-main)] bg-[var(--bg-hover)]">
                        <FolderOpenDot className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No workspaces found.</h3>
                        <p className="text-[var(--text-secondary)] mb-6">Create your first workspace to start organizing your workflow.</p>
                        <Button onClick={() => onNavigate('workspaces')}> <Plus className="w-4 h-4 mr-2" />Create Workspace</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentWorkspaces.map((workspace) => (
                            <Card key={workspace.id} hoverable className="p-4 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-[12px] flex items-center justify-center font-sans"
                                        style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                                    >
                                        <span className="text-lg">{workspace.emoji}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-hover)]"
                                        onClick={() => handleLaunch(workspace.id)}
                                    >
                                        <Rocket className="w-4 h-4 text-[var(--color-primary)] fill-current" />
                                    </Button>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-semibold text-[var(--text-primary)] truncate mb-1">{workspace.name}</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">{workspace.websites.filter(w => w.enabled).length} websites</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};