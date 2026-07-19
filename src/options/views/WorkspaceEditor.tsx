import React, { useState } from 'react';
import { Save, Plus, GripVertical, Trash2, ArrowLeft, Pin, Settings2, Globe } from 'lucide-react';
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
        removeWebsiteFromWorkspace,
        reorderWebsites
    } = useWorkspaceStore();

    const workspace = workspaces.find(ws => ws.id === workspaceId);

    // Form & UI state
    const [newUrl, setNewUrl] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [activeAdvancedId, setActiveAdvancedId] = useState<string | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

    // --- HTML5 NATIVE DRAG & DROP FUNCTIONS ---
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        reorderWebsites(workspaceId, draggedIndex, index);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">

            {/* Header Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                    <Button variant="ghost" size="icon" onClick={onClose} aria-label="Go Back">
                        <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                    </Button>
                    <div className="flex items-center space-x-3 flex-1">
                        <span className="hidden sm:block shrink-0 text-xl bg-[var(--bg-hover)] p-2 rounded-xl">{workspace.emoji || '🚀'}</span>
                        <Input className="text-xl sm:text-2xl font-bold border-none bg-transparent focus:ring-0 px-0" value={workspace.name}
                            onChange={(e) => handleUpdate({ name: e.target.value })} placeholder="Workspace Name" />
                    </div>
                </div>
                <Button variant="primary" size="xs" leftIcon={<Save className="w-4 h-4" />} onClick={onClose}>
                    <span className="hidden sm:inline">Save</span> 
                </Button>
            </div>

            {/* Quick Add New Website */}
            <Card className="p-5 bg-[var(--bg-card)]">
                <form onSubmit={handleQuickAdd} className="sm:flex gap-4 items-end space-y-2 sm:space-y-0">
                    <div className="flex-1 space-y-2">
                        <Input
                            type="text"
                            placeholder="e.g., GitHub"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="bg-[var(--bg-app)] border-[var(--border-main)]"
                        />
                    </div>
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
                    <Button type="submit" variant="primary" className="h-10 px-6 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                    </Button>
                </form>
            </Card>

            {/* Configured Tabs Pipeline */}
            <div className="space-y-4">
                <div className="px-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                        Configured Tabs ({workspace.websites.length})
                    </h3>
                </div>

                <div className="space-y-3">
                    {[...workspace.websites].sort((a, b) => a.order - b.order).map((site: Website, index: number) => (
                        <div
                            key={site.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex flex-col p-3 bg-[var(--bg-card)] rounded-[14px] border transition-all duration-150 group ${draggedIndex === index ? 'opacity-40 border-dashed border-[var(--color-primary)]' : 'border-[var(--border-main)] hover:border-[var(--text-muted)]'
                                }`}
                        >
                            <div className="flex items-center gap-4 w-full">
                                {/* Native Grip Handle */}
                                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--bg-hover)] rounded-md transition-colors">
                                    <GripVertical className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                                </div>

                                {/* Favicon Pipeline */}
                                <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border-subtle)]">
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=32`}
                                        alt=""
                                        className="w-4 h-4"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg class="w-4 h-4 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
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

                                {/* Actions Control Matrix */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                                    {/* FIXED: Pin / Unpin Button with precise active styling */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleWebsiteUpdate(site.id, { pinned: !site.pinned })}
                                        title={site.pinned ? "Unpin Tab" : "Pin Tab"}
                                        className={site.pinned ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" : "text-[var(--text-secondary)]"}
                                    >
                                        <Pin className={`w-4 h-4 ${site.pinned ? 'fill-current text-blue-600 dark:text-blue-400' : ''}`} />
                                    </Button>

                                    {/* FIXED: Toggle Advanced Settings Drawer inline */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Advanced Settings"
                                        onClick={() => setActiveAdvancedId(activeAdvancedId === site.id ? null : site.id)}
                                        className={activeAdvancedId === site.id ? "bg-[var(--bg-hover)] text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}
                                    >
                                        <Settings2 className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeWebsiteFromWorkspace(workspaceId, site.id)}
                                        className="text-[var(--color-danger)] hover:bg-red-50 dark:hover:bg-red-950/30"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* FIXED: Advanced Configuration Micro-Form Drawer */}
                            {activeAdvancedId === site.id && (
                                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-4 bg-[var(--bg-app)] p-3 rounded-lg animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Sequential Open Delay</label>
                                        <select
                                            value={site.delay}
                                            onChange={(e) => handleWebsiteUpdate(site.id, { delay: Number(e.target.value) })}
                                            className="w-full h-8 px-2 bg-transparent border-transparent hover:border-[var(--border-main)] focus:bg-[var(--bg-app)] text-[var(--text-secondary)] text-sm transition-all"
                                        >
                                            <option value={0}>0ms (Instant)</option>
                                            <option value={200}>200ms (Default)</option>
                                            <option value={500}>500ms (Safe)</option>
                                            <option value={1000}>1000ms (Heavy Page)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">Duplicate Handling Rule</label>
                                        <select
                                            value={site.duplicateRule}
                                            onChange={(e) => handleWebsiteUpdate(site.id, { duplicateRule: e.target.value as any })}
                                            className="w-full h-8 px-2 bg-transparent border-transparent hover:border-[var(--border-main)] focus:bg-[var(--bg-app)] text-[var(--text-secondary)] text-sm transition-all"
                                        >
                                            <option value="focus_existing">Focus Existing Tab</option>
                                            <option value="open_new">Always Open New Tab</option>
                                            <option value="ignore">Ignore Rule</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {workspace.websites.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-[var(--border-upload)] rounded-[18px] bg-[var(--bg-card)]">
                            <Globe className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-40" />
                            <p className="text-md sm:text-sm text-[var(--text-secondary)]">Your environment collection is empty.</p>
                            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1">Add websites to your workspace.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};