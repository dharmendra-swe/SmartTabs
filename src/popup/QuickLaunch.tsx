import React from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Workspace } from '@/types';

interface QuickLaunchProps {
    workspaces: Workspace[];
    isLaunching: string | null;
    onLaunch: (id: string) => void;
}

export const QuickLaunch: React.FC<QuickLaunchProps> = ({ workspaces, isLaunching, onLaunch }) => {
    return (
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 hide-scrollbar">
            {workspaces.map(workspace => (
                <Card
                    key={workspace.id}
                    className="p-3 flex items-center justify-between group cursor-pointer hover:border-[var(--text-muted)] transition-colors"
                    onClick={() => isLaunching !== workspace.id && onLaunch(workspace.id)}
                >
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 font-sans"
                            style={{ backgroundColor: `${workspace.color}15`, color: workspace.color }}
                        >
                            <span className="text-lg">{workspace.emoji || '🚀'}</span>
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
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        disabled={isLaunching !== null}
                    >
                        {isLaunching === workspace.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ExternalLink className="w-4 h-4" />
                        )}
                    </Button>
                </Card>
            ))}
        </div>
    );
};