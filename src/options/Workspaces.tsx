import React, { useState } from 'react';
import { Plus, MoreVertical, Rocket,  FolderPlus } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';
import { WorkspaceEditor } from './views/WorkspaceEditor';
import { WorkspaceEngine } from '@/services/workspaceEngine';

export const Workspaces: React.FC = () => {
    const { workspaces, addWorkspace, deleteWorkspace } = useWorkspaceStore();
    const { settings } = useSettingsStore();

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceEmoji, setNewWorkspaceEmoji] = useState('🚀');
    const [isLaunching, setIsLaunching] = useState<string | null>(null);

    // If a workspace is selected, show the Editor instead of the Grid
    if (selectedWorkspaceId) {
        return <WorkspaceEditor workspaceId={selectedWorkspaceId} onClose={() => setSelectedWorkspaceId(null)} />;
    }

    const handleCreateWorkspace = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;

        addWorkspace({
            name: newWorkspaceName.trim(),
            emoji: newWorkspaceEmoji,
            color: '#2563EB', // Default Brand Color
            isFavorite: false,
            isHidden: false,
            websites: []
        });

        setNewWorkspaceName('');
        setNewWorkspaceEmoji('🚀');
        setIsCreateModalOpen(false);
    };

    const handleLaunch = async (workspaceId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the editor
        const target = workspaces.find(w => w.id === workspaceId);
        if (target) {
            setIsLaunching(workspaceId);
            await WorkspaceEngine.launchWorkspace(target, settings);
            setIsLaunching(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Your Workspaces</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Organize your daily workflows into one-click launches.</p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} className="rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    New Workspace
                </Button>
            </div>

            {/* Create Modal (Inline for sleekness) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md p-6 bg-[var(--bg-card)] shadow-2xl scale-in-95 animate-in duration-200">
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Create Workspace</h2>
                        <form onSubmit={handleCreateWorkspace} className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-16">
                                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Icon</label>
                                    <Input
                                        value={newWorkspaceEmoji}
                                        onChange={(e) => setNewWorkspaceEmoji(e.target.value)}
                                        className="text-center text-xl bg-[var(--bg-app)] border-[var(--border-main)]"
                                        maxLength={2}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 block">Name</label>
                                    <Input
                                        value={newWorkspaceName}
                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                        placeholder="e.g., Development"
                                        className="bg-[var(--bg-app)] border-[var(--border-main)]"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={!newWorkspaceName.trim()}>Create</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Workspace Grid */}
            {workspaces.length === 0 ? (
                <div className="text-center py-20 bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-subtle)]">
                    <FolderPlus className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-[var(--text-primary)]">No Workspaces Found</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 mb-6">Create your first workspace to start organizing your tabs.</p>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>Create Workspace</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {workspaces.map(workspace => (
                        <Card
                            key={workspace.id}
                            hoverable
                            className="p-5 cursor-pointer group flex flex-col justify-between h-40 bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-focus)] transition-all"
                            onClick={() => setSelectedWorkspaceId(workspace.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-[14px] bg-[var(--bg-hover)] flex items-center justify-center text-2xl border border-[var(--border-subtle)]">
                                        {workspace.emoji}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-[var(--text-primary)]">{workspace.name}</h3>
                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{workspace.websites.length} websites</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 -mr-2 -mt-2 hover:text-[var(--brand-danger)]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteWorkspace(workspace.id);
                                    }}
                                >
                                    <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                                </Button>
                            </div>

                            <div className="flex justify-end mt-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full bg-[var(--bg-app)] hover:bg-[var(--border-focus)] hover:text-white transition-colors"
                                    onClick={(e) => handleLaunch(workspace.id, e)}
                                    isLoading={isLaunching === workspace.id}
                                >
                                    <Rocket className="w-3.5 h-3.5 mr-2" />
                                    Launch
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};