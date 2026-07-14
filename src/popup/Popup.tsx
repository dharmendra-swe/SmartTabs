import React, { useState } from 'react';
import { Settings, Rocket, CodeXml } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';
import { QuickLaunch } from './QuickLaunch';
import '@/globals.css';
import { useTheme } from '@/hooks/useTheme';

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
        <div className="flex flex-col w-full h-full bg-[var(--bg-app)]  max-h-[400px]">
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

            {/* Micro Component Search */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* List Pipeline */}
            {filteredWorkspaces.length === 0 ? (
                <div className="flex-1 text-center py-8 px-4">
                    <Rocket className="w-8 h-8 text-[var(--border-main)] mx-auto mb-3" />
                    <p className="text-sm text-[var(--text-secondary)]">No workspaces found.</p>
                    {workspaces.length === 0 && (
                        <Button variant="primary" size="sm" className="mt-4" onClick={openOptions}>
                            Create Your First Workspace
                        </Button>
                    )}
                </div>
            ) : (
                <QuickLaunch 
                    workspaces={filteredWorkspaces} 
                    isLaunching={isLaunching} 
                    onLaunch={handleLaunch} 
                />
            )}

            {/* Footer Handle */}
            <div className="px-4 py-3 bg-[var(--bg-card)] border-t border-[var(--border-main)] flex items-center justify-center space-x-2 text-xs text-[var(--text-muted)]">
                <CodeXml className="w-3 h-3" />
                <span>Developed by <a href="https://www.linkedin.com/in/dharmendra-swe/" target="_blank" rel="noopener noreferrer" className="text-[var(--text-primary)] hover:underline">Dharmendra</a></span>
            </div>
        </div>
    );
};