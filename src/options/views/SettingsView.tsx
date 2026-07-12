import React, { useRef, useState } from 'react';
import { Monitor, Zap, ShieldAlert, Download, Upload, RefreshCw } from 'lucide-react';
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
                <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Settings</h1>
                <p className="text-[#64748B]">Configure your SmartTabs experience.</p>
            </div>

            {logStatus && (
                <div className={`p-4 rounded-[14px] text-sm font-medium ${logStatus.error ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#F0FDF4] text-[#22C55E]'}`}>
                    {logStatus.text}
                </div>
            )}

            <div className="space-y-6">
                {/* Core Settings Sections (Theme, Delay, Notifications, etc.) */}
                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[#E5E7EB] flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-[#2563EB]" />
                        <h2 className="text-lg font-semibold text-[#0F172A]">Appearance</h2>
                    </div>
                    <div className="p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[#0F172A]">Theme</p>
                                <p className="text-sm text-[#64748B]">Select your preferred interface theme.</p>
                            </div>
                            <select
                                className="bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[10px] focus:ring-[#2563EB] focus:border-[#2563EB] block p-2.5"
                                value={settings.theme}
                                onChange={(e) => setTheme(e.target.value as ThemePreference)}
                            >
                                <option value="system">System Default</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[#0F172A]">Interface Animations</p>
                                <p className="text-sm text-[#64748B]">Enable smooth transitions and hover effects.</p>
                            </div>
                            <Switch
                                checked={settings.animationsEnabled}
                                onChange={(checked) => updateSettings({ animationsEnabled: checked })}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[#E5E7EB] flex items-center gap-3">
                        <Zap className="w-5 h-5 text-[#2563EB]" />
                        <h2 className="text-lg font-semibold text-[#0F172A]">Launch Engine</h2>
                    </div>
                    <div className="p-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="pr-8">
                                <p className="font-medium text-[#0F172A]">Global Launch Delay (ms)</p>
                                <p className="text-sm text-[#64748B]">Time between opening each tab. Prevents browser freezing on large workspaces.</p>
                            </div>
                            <input
                                type="number"
                                min="0"
                                step="50"
                                className="w-24 bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[10px] focus:ring-[#2563EB] focus:border-[#2563EB] block p-2.5"
                                value={settings.globalDelay}
                                onChange={(e) => setGlobalDelay(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-[#0F172A]">Duplicate Strategy</p>
                                <p className="text-sm text-[#64748B]">How to handle websites that are already open.</p>
                            </div>
                            <select
                                className="bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F172A] text-sm rounded-[10px] focus:ring-[#2563EB] focus:border-[#2563EB] block p-2.5"
                                value={settings.defaultDuplicateStrategy}
                                onChange={(e) => updateSettings({ defaultDuplicateStrategy: e.target.value as DuplicateStrategy })}
                            >
                                <option value="focus_existing">Focus Existing Tab</option>
                                <option value="open_new">Always Open New Tab</option>
                                <option value="ignore">Skip (Do Nothing)</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Data Architecture Backup & Portability Division */}
                <Card className="overflow-visible">
                    <div className="p-5 border-b border-[#E5E7EB] flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-[#2563EB]" />
                        <h2 className="text-lg font-semibold text-[#0F172A]">Backup & Portability</h2>
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-sm text-[#64748B]">
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

                {/* Emergency Systems Maintenance Partition */}
                <Card className="border-[#EF4444] border bg-[#FFF5F5]">
                    <div className="p-5 border-b border-[#FCA5A5] flex items-center gap-3">
                        <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
                        <h2 className="text-lg font-semibold text-[#EF4444]">Danger Zone</h2>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-[#0F172A]">Wipe Application Node Cache</p>
                            <p className="text-sm text-[#64748B]">Resets the system parameters and completely clears the local store schema layout state.</p>
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