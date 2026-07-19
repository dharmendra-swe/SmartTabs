import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (val: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="p-4 shrink-0 ">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                    type="text"
                    placeholder="Search Workspaces..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-10 pl-9 pr-4 bg-[var(--color-primary)] border border-[var(--border-main)] rounded-[14px] text-sm text-[var(--text-primary)] focus:outline-none focus:border-transparent transition-all"
                    autoFocus
                />
            </div>
        </div>
    );
};