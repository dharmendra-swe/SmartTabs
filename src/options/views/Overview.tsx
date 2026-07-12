import React from 'react';
import { Play, Plus, ArrowRight, Activity, BarChart3, FolderKanban, Star } from 'lucide-react';
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Good Morning 👋</h1>
                    <p className="text-[#64748B]">Here is your workspace overview for today.</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => onNavigate('workspaces')}
                >
                    New Workspace
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#E0E7FF] text-[#4F46E5] rounded-[14px] flex items-center justify-center">
                        <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[#0F172A]">{workspaces.length}</p>
                        <p className="text-sm text-[#64748B]">Active Workspaces</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#DCFCE7] text-[#16A34A] rounded-[14px] flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-[#0F172A]">{totalWebsites}</p>
                        <p className="text-sm text-[#64748B]">Saved Websites</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center justify-between hoverable cursor-pointer group" onClick={() => onNavigate('analytics')}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F1F5F9] text-[#475569] rounded-[14px] flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#0F172A]">View detailed</p>
                            <p className="text-sm text-[#64748B]">Launch statistics</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                </Card>
            </div>

            {/* Favorites Section (if present) */}
            {favoriteWorkspaces.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-[#EAB308] fill-current" />
                        <h2 className="text-lg font-semibold text-[#0F172A]">Favorites</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {favoriteWorkspaces.map((workspace) => (
                            <Card key={`fav-${workspace.id}`} hoverable className="p-4 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                                        style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                                    >
                                        <span className="text-lg">{workspace.emoji}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#F1F5F9]"
                                        onClick={() => handleLaunch(workspace.id)}
                                    >
                                        <Play className="w-4 h-4 text-[#2563EB]" />
                                    </Button>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-semibold text-[#0F172A] truncate mb-1">{workspace.name}</h3>
                                    <p className="text-xs text-[#64748B]">{workspace.websites.filter(w => w.enabled).length} websites</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Launch (Recent) */}
            <div>
                <h2 className="text-lg font-semibold text-[#0F172A] mb-4">Recent Workspaces</h2>
                {workspaces.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 bg-transparent">
                        <h3 className="text-lg font-medium text-[#0F172A] mb-2">No workspaces yet</h3>
                        <p className="text-[#64748B] mb-6">Create your first workspace to start organizing your workflow.</p>
                        <Button onClick={() => onNavigate('workspaces')}>Create Workspace</Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recentWorkspaces.map((workspace) => (
                            <Card key={workspace.id} hoverable className="p-4 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                                        style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                                    >
                                        <span className="text-lg">{workspace.emoji}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#F1F5F9]"
                                        onClick={() => handleLaunch(workspace.id)}
                                    >
                                        <Play className="w-4 h-4 text-[#2563EB]" />
                                    </Button>
                                </div>
                                <div className="mt-auto">
                                    <h3 className="font-semibold text-[#0F172A] truncate mb-1">{workspace.name}</h3>
                                    <p className="text-xs text-[#64748B]">{workspace.websites.filter(w => w.enabled).length} websites</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};