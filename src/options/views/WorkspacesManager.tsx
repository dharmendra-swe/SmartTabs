import React, { useState } from 'react';
import { Plus, Search, Trash2, Copy, Star, Edit2, Rocket, FolderOpenDot } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { WorkspaceEngine } from '@/services/workspaceEngine';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/forms/Input';

interface WorkspacesManagerProps {
    onEdit: (id: string) => void;
}

export const WorkspacesManager: React.FC<WorkspacesManagerProps> = ({ onEdit }) => {
    const { workspaces, addWorkspace, deleteWorkspace, duplicateWorkspace, toggleFavorite } = useWorkspaceStore();
    const { settings } = useSettingsStore();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorkspaces = workspaces.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ws.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNew = () => {
        addWorkspace({
            name: 'New Workspace',
            description: 'A new collection of websites.',
            color: '#2563EB',
            emoji: '🚀',
            websites: [],
            isFavorite: false,
            isHidden: false,
        });
    };

    const handleLaunch = async (workspaceId: string) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            await WorkspaceEngine.launchWorkspace(workspace, settings);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="sm:flex items-center justify-between">
                <div className="mb-2 sm:mb-0">
                    <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Workspaces</h1>
                    <p className="text-[#64748B]">Manage and organize your tab collections.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleCreateNew}>
                    Create Workspace
                </Button>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-[16px] border border-[#E5E7EB]">
                <Input
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="border-none shadow-none focus:ring-0"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkspaces.map(workspace => (
                    <Card key={workspace.id} hoverable className="flex flex-col h-full group relative overflow-hidden">
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shadow-sm"
                                    style={{ backgroundColor: `${workspace.color}15`, color: workspace.color, border: `1px solid ${workspace.color}30` }}
                                >
                                    {workspace.emoji}
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-[#94A3B8] hover:text-[#EAB308]"
                                        onClick={() => toggleFavorite(workspace.id)}
                                    >
                                        <Star className={`w-4 h-4 ${workspace.isFavorite ? 'fill-current text-[#EAB308]' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">{workspace.name}</h3>
                            <p className="text-sm text-[#64748B] line-clamp-2 mb-4">{workspace.description}</p>

                            <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] bg-[#F8FAFC] w-fit px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                                <span>{workspace.websites.length} websites</span>
                            </div>
                        </div>

                        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex gap-1">
                                {/* Notice onEdit is now correctly mapped here */}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B]" onClick={() => onEdit(workspace.id)} title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#64748B]" onClick={() => duplicateWorkspace(workspace.id)} title="Duplicate">
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#EF4444] hover:bg-[#FEF2F2]" onClick={() => deleteWorkspace(workspace.id)} title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <Button variant="primary" size="sm" leftIcon={<Rocket className="w-3 h-3" />} onClick={() => handleLaunch(workspace.id)}>
                                Launch
                            </Button>
                        </div>
                    </Card>
                ))}

                {workspaces.length > 0 && filteredWorkspaces.length === 0 && (
                    <div className="col-span-full py-12 text-center text-[#64748B]">
                        No workspaces found matching "{searchQuery}"
                    </div>
                )}

                {/* SCENARIO 2: No workspaces exist at all (Initial state) */}
                {workspaces.length === 0 && (
                    <Card className="col-span-full p-4 sm:p-6 md:p-8 lg:p-12 text-center border-dashed border-2 border-[var(--border-main)] bg-[var(--bg-hover)]">
                        <FolderOpenDot className="w-8 h-8 text-[var(--text-secondary)] mx-auto mb-2" />
                        <h3 className="text-sm sm:text-lg font-medium text-[var(--text-primary)] mb-2">No workspaces found.</h3>
                        <p className="text-xs sm:text-md text-[var(--text-secondary)] mb-2 sm:mb-4 md:mb-6">Create your first workspace to start organizing your workflow.</p>
                        <Button variant="primary" size="xs" onClick={handleCreateNew}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
};