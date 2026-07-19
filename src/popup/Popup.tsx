import React, { useState } from 'react';
import { Settings, CodeXml, Plus, FolderOpenDot, Search } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/Button'; 
import { QuickLaunch } from './QuickLaunch';
import '@/globals.css';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/forms/Input';

export const Popup: React.FC = () => {
    useTheme();
    const { workspaces } = useWorkspaceStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLaunching, setIsLaunching] = useState<string | null>(null);

    const handleLaunch = (workspaceId: string) => {
        setIsLaunching(workspaceId);
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({
                type: 'LAUNCH_WORKSPACE_ASYNC',
                workspaceId: workspaceId
            });
            setTimeout(() => {
                setIsLaunching(null);
                window.close();
            }, 180);
        }
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
        <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--bg-app)]">
            {/* Header */}
            <div className="shrink-0 px-4 py-3 bg-[var(--bg-card)] border-b border-[var(--border-main)] flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h1 className="text-sm font-semibold text-[var(--text-primary)]">Good Morning 👋</h1>
                    <p className="text-xs text-[var(--text-secondary)]">Ready to start today?</p>
                </div>
                <Button variant="ghost" className="bg-transparent! p-0!" onClick={openOptions} title="Open Settings">
                    <Settings className="w-4.5 h-4.5 text-[var(--text-secondary)] hover:rotate-90 hover:scale-110 transition-transform" />
                </Button>
            </div>

            {/* Micro Component Search */}
            <div className="p-4 shrink-0 ">
                <Input
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-3.5 h-3.5" />}
                />
            </div>

            {/* List Pipeline */}
            <main className="flex-1 overflow-hidden">
                {filteredWorkspaces.length === 0 ? (
                    <div className="flex justify-center px-4 pb-4">
                        <Card className="w-full px-3 py-6 text-center border-dashed !border !border-[var(--border-upload)] bg-[var(--bg-hover)]">
                            <FolderOpenDot className="w-6 h-6 text-[var(--text-secondary)] mx-auto mb-1" />
                            <h3 className="text-sm font-medium text-[var(--text-primary)]">No workspaces found.</h3>
                            <p className="text-[var(--text-secondary)] mb-2">Create your workspace.</p>
                            <Button size="xs" onClick={openOptions} className="text-xs mb-0.5">
                                <Plus className="w-4 h-4 mr-1" />
                                Create
                            </Button>
                        </Card>
                    </div>
                ) : (
                    <QuickLaunch
                        workspaces={filteredWorkspaces}
                        isLaunching={isLaunching}
                        onLaunch={handleLaunch}
                    />
                )}
            </main>

            {/* Footer Handle */}
            <div className="px-4 py-2 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex items-center justify-center space-x-2 text-xs text-[var(--text-muted)]">
                <CodeXml className="w-3 h-3" />
                <span>Developed by <a href="https://www.linkedin.com/in/dharmendra-swe/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:underline">dharmendra</a></span>
            </div>
        </div>
    );
};