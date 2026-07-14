import React, { useRef, useState } from 'react';
import { Monitor, Zap, ShieldAlert, Download, Upload, RefreshCw, ChevronDown } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { BackupService } from '@/services/backup';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { ThemePreference, DuplicateStrategy } from '@/types';

export const SettingsView: React.FC = () => {
    const { settings, updateSettings, setTheme, setGlobalDelay } = useSettingsStore();
    const { workspaces, setWorkspaces } = useWorkspaceStore();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logStatus, setLogStatus] = useState<{ text: string; error: boolean } | null>(null);

    const handleExport = () => {
        try {
            const dataStr = BackupService.exportData(workspaces);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

            const exportFileDefaultName = `smarttabs_backup_${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();

            setLogStatus({ text: 'Data configuration file exported successfully.', error: false });
        } catch (e) {
            setLogStatus({ text: 'Failed to pack profile configurations.', error: true });
        }
    };

    const handleImportTrigger = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        const file = event.target.files?.[0];

        if (!file) return;

        fileReader.onload = (e) => {
            try {
                const resultString = e.target?.result as string;
                const restoredWorkspaces = BackupService.validateAndImport(resultString);

                setWorkspaces(restoredWorkspaces);
                setLogStatus({ text: `Imported ${restoredWorkspaces.length} workspaces cleanly.`, error: false });
            } catch (err: any) {
                setLogStatus({ text: err.message || 'Failed parsing selected file.', error: true });
            }
        };

        fileReader.readAsText(file);
    };

    const handleResetStorage = () => {
        if (window.confirm('Are you absolutely sure you want to completely purge all local workspaces data? This operation is irreversible.')) {
            setWorkspaces([]);
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.clear();
            }
            setLogStatus({ text: 'All storage partitions successfully wiped.', error: true });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Settings</h1>
                <p className="text-[var(--text-secondary)]">Configure your SmartTabs experience.</p>
            </div>

            {logStatus && (
                <div className={`p-4 rounded-[14px] text-sm font-medium ${logStatus.error ? 'bg-[var(--bg-app)] text-[var(--color-brand-danger)] border border-[var(--color-brand-danger)]' : 'bg-[var(--bg-app)] text-[var(--color-brand-success)] border border-[var(--color-brand-success)]'}`}>
                    {logStatus.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Appearance Section */}
                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[var(--border-main)] flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-[var(--color-brand-primary)]" />
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
                    </div>
                    <div className="p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Theme</p>
                                <p className="text-sm text-[var(--text-secondary)]">Select your preferred interface theme.</p>
                            </div>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-primary)] text-sm rounded-[10px] focus:ring-[var(--border-focus)] focus:border-[var(--border-focus)] block p-2.5 outline-none"
                                    value={settings.theme}
                                    onChange={(e) => setTheme(e.target.value as ThemePreference)}
                                >
                                    <option value="system">System Default</option>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    {/* Chevron Icon wrapper */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)]">
                                        <ChevronDown size={18} />
                                    </div>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Interface Animations</p>
                                <p className="text-sm text-[var(--text-secondary)]">Enable smooth transitions and hover effects.</p>
                            </div>
                            <Switch
                                checked={settings.animationsEnabled}
                                onChange={(checked) => updateSettings({ animationsEnabled: checked })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Launch Engine Section */}
                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[var(--border-main)] flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[var(--color-brand-primary)]" />
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Launch Engine</h2>
                    </div>
                    <div className="p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="pr-8">
                                <p className="font-medium text-[var(--text-primary)]">Global Launch Delay (ms)</p>
                                <p className="text-sm text-[var(--text-secondary)]">Time between opening each tab. Prevents browser freezing on large workspaces.</p>
                            </div>
                            <input
                                type="number"
                                min="0"
                                step="50"
                                className="w-24 bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-primary)] text-sm rounded-[10px] focus:ring-[var(--border-focus)] focus:border-[var(--border-focus)] block p-2.5 outline-none"
                                value={settings.globalDelay}
                                onChange={(e) => setGlobalDelay(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[var(--text-primary)]">Duplicate Strategy</p>
                                <p className="text-sm text-[var(--text-secondary)]">How to handle websites that are already open.</p>
                            </div>
                            <div className="relative">
                                <select
                                    className="appearance-none bg-[var(--bg-app)] border border-[var(--border-main)] text-[var(--text-primary)] text-sm rounded-[10px] focus:ring-[var(--border-focus)] focus:border-[var(--border-focus)] block p-2.5 outline-none"
                                    value={settings.defaultDuplicateStrategy}
                                    onChange={(e) => updateSettings({ defaultDuplicateStrategy: e.target.value as DuplicateStrategy })}
                                >
                                    <option value="focus_existing">Focus Existing Tab</option>
                                    <option value="open_new">Always Open New Tab</option>
                                    <option value="ignore">Skip (Do Nothing)</option>
                                </select>
                                {/* Chevron Icon wrapper */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)]">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Backup & Portability Section */}
                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[var(--border-main)] flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-[var(--color-brand-primary)]" />
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Backup & Portability</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-sm text-[var(--text-secondary)]">
                            Migrate your custom workflows cleanly across client extension environments via data payload structural exports.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden"
                            />
                            <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleExport}>
                                Export Space Config
                            </Button>
                            <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />} onClick={handleImportTrigger}>
                                Import Data Profile
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Danger Zone Section */}
                <Card className="border-[var(--color-brand-danger)] border bg-[var(--bg-card)]">
                    <div className="p-5 border-b border-[var(--color-brand-danger)]/30 flex items-center gap-3 bg-[var(--color-brand-danger)]/5">
                        <ShieldAlert className="w-5 h-5 text-[var(--color-brand-danger)]" />
                        <h2 className="text-lg font-semibold text-[var(--var-brand-danger)] text-[var(--color-brand-danger)]">Danger Zone</h2>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-[var(--text-primary)]">Wipe Application Node Cache</p>
                            <p className="text-sm text-[var(--text-secondary)]">Resets the system parameters and completely clears the local store schema layout state.</p>
                        </div>
                        <Button variant="danger" onClick={handleResetStorage}>
                            Purge Sync
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};