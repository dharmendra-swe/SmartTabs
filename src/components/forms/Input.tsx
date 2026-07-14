import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, helperText, id, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                            {leftIcon}
                        </div>
                    )}
                    <input id={inputId} ref={ref} className={cn(
                        "block w-full rounded-[12px] border bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors outline-none",
                        "focus:ring-2 focus:ring-[var(--border-focus)] focus:border-transparent",
                        error
                            ? "border-[var(--color-brand-danger)] focus:ring-[var(--color-brand-danger)]"
                            : "border-[var(--border-main)] focus:border-[var(--border-focus)]",
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
                        className)} {...props}/>
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-[var(--color-brand-danger)]">{error}</p>}
                {helperText && !error && <p className="mt-1.5 text-sm text-[var(--text-secondary)]">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";