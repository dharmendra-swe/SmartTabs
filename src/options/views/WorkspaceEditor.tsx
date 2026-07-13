import React, { useState } from 'react';
import { Save, Plus, GripVertical, Trash2, Pin, Settings2, Globe } from 'lucide-react';
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

    // Local state for the "Quick Add" form
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');

    if (!workspace) return null;

    const handleUpdate = (updates: Partial<typeof workspace>) => {
        updateWorkspace(workspaceId, updates);
    };

    const handleQuickAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl) return;

        let cleanUrl = newUrl.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = `https://${cleanUrl}`;
        }

        addWebsiteToWorkspace(workspaceId, {
            title: newTitle || cleanUrl.replace(/^https?:\/\//, ''),
            url: cleanUrl,
            category: 'General',
            delay: 200,
            pinned: false,
            enabled: true,
            duplicateRule: 'focus_existing',
            openMode: 'new_tab',
            notes: '',
            tags: [],
            order: workspace.websites.length
        });

        setNewUrl('');
        setNewTitle('');
    };

    const handleWebsiteUpdate = (websiteId: string, updates: Partial<Website>) => {
        updateWebsiteInWorkspace(workspaceId, websiteId, updates);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-300 pb-12">
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
            
            {/* Quick Add New Website */}
            <Card className="p-5 bg-[var(--bg-card)]">
                <form onSubmit={handleQuickAdd} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <Input
                            type="text"
                            placeholder="e.g., github.com"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            required
                            className="bg-[var(--bg-app)] border-[var(--border-main)]"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Input
                            type="text"
                            placeholder="e.g., GitHub"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-[var(--bg-app)] border-[var(--border-main)]"
                        />
                    </div>
                    <Button type="submit" variant="primary" className="h-10 px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Tab
                    </Button>
                </form>
            </Card> 
 
            {/* Websites List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Configured Tabs ({workspace.websites.length})
                    </h3>
                </div>

                <div className="space-y-3">
                    {workspace.websites.sort((a, b) => a.order - b.order).map((site: Website) => (
                        <div key={site.id} className="flex items-center gap-4 p-3 bg-[var(--bg-card)] rounded-[14px] border border-[var(--border-main)] hover:border-[var(--border-focus)] transition-colors group shadow-sm">
                            <GripVertical className="w-5 h-5 text-[var(--text-muted)] cursor-grab hover:text-[var(--text-primary)] transition-colors" />

                            {/* Favicon */}
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border-subtle)]">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
                                    alt="icon"
                                    className="w-4 h-4"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
                                    }}
                                />
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <Input
                                    value={site.title}
                                    onChange={(e) => handleWebsiteUpdate(site.id, { title: e.target.value })}
                                    placeholder="Title"
                                    className="bg-transparent border-transparent hover:border-[var(--border-main)] focus:bg-[var(--bg-app)] transition-all h-9"
                                />
                                <Input
                                    value={site.url}
                                    onChange={(e) => handleWebsiteUpdate(site.id, { url: e.target.value })}
                                    placeholder="URL"
                                    className="bg-transparent border-transparent hover:border-[var(--border-main)] focus:bg-[var(--bg-app)] text-[var(--text-secondary)] text-sm transition-all h-9"
                                />
                            </div>

                            {/* Actions Toolbar */}
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleWebsiteUpdate(site.id, { pinned: !site.pinned })}
                                    title={site.pinned ? "Unpin Tab" : "Pin Tab"}
                                >
                                    <Pin className={`w-4 h-4 ${site.pinned ? 'text-[var(--border-focus)] fill-current' : 'text-[var(--text-secondary)]'}`} />
                                </Button>

                                <Button variant="ghost" size="icon" title="Advanced Settings">
                                    <Settings2 className="w-4 h-4 text-[var(--text-secondary)]" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWebsiteFromWorkspace(workspaceId, site.id)}
                                    className="hover:bg-[var(--bg-app)] hover:text-[var(--brand-danger)]"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4 text-[var(--brand-danger)] opacity-70 hover:opacity-100" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {workspace.websites.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-[var(--border-main)] rounded-[18px] bg-[var(--bg-card)]">
                            <Globe className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
                            <p className="text-sm text-[var(--text-secondary)]">Your workspace is empty.</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Use the quick add form above to insert your first website.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};