import React from 'react';
import { Save, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { Website } from '@/types';

interface WorkspaceEditorProps {
    workspaceId: string;
    onClose: () => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({ workspaceId, onClose }) => {
    const {
        workspaces,
        updateWorkspace,
        addWebsiteToWorkspace,
        updateWebsiteInWorkspace,
        removeWebsiteFromWorkspace
    } = useWorkspaceStore();

    const workspace = workspaces.find(ws => ws.id === workspaceId);

    if (!workspace) return null;

    const handleUpdate = (updates: Partial<typeof workspace>) => {
        updateWorkspace(workspaceId, updates);
    };

    const handleAddWebsite = () => {
        addWebsiteToWorkspace(workspaceId, {
            title: 'New Website',
            url: 'https://',
            category: 'General',
            delay: 200,
            pinned: false,
            enabled: true,
            duplicateRule: 'focus_existing',
            openMode: 'current_window',
            notes: '',
            tags: [],
            order: workspace.websites.length
        });
    };

    const handleWebsiteUpdate = (websiteId: string, updates: Partial<Website>) => {
        updateWebsiteInWorkspace(workspaceId, websiteId, updates);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between">
                <Input
                    className="text-2xl font-bold border-none bg-transparent focus:ring-0 px-0"
                    value={workspace.name}
                    onChange={(e) => handleUpdate({ name: e.target.value })}
                />
                <Button variant="primary" leftIcon={<Save className="w-4 h-4" />} onClick={onClose}>
                    Save
                </Button>
            </div>

            <Card className="p-6">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Websites ({workspace.websites.length})</h3>
                <div className="space-y-3">
                    {workspace.websites.map((site: Website) => (
                        <div key={site.id} className="flex items-center gap-4 p-3 bg-[#F8FAFC] rounded-[14px] border border-[#E5E7EB] group">
                            <GripVertical className="w-5 h-5 text-[#94A3B8] cursor-grab" />
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <Input
                                    value={site.title}
                                    onChange={(e) => handleWebsiteUpdate(site.id, { title: e.target.value })}
                                    placeholder="Title"
                                />
                                <Input
                                    value={site.url}
                                    onChange={(e) => handleWebsiteUpdate(site.id, { url: e.target.value })}
                                    placeholder="URL"
                                />
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeWebsiteFromWorkspace(workspaceId, site.id)}
                                        aria-label={`Delete ${site.title}`}
                                    >
                                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="secondary"
                        className="w-full border-dashed mt-2"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={handleAddWebsite}
                    >
                        Add Website
                    </Button>
                </div>
            </Card>
        </div>
    );
};