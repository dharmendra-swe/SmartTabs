import React from 'react';
interface PageHeaderProps {
    title?: string;
    subtitle?: string;
}
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
}) => {
    return (
        <div>
            {title && (
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{title}</h1>
            )}
            {subtitle && (
                <p className="text-[var(--text-secondary)]">{subtitle}</p>
            )}
        </div>
    );
};