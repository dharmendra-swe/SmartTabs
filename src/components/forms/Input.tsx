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
                    <label htmlFor={inputId} className="block text-sm font-medium text-[#0F172A] mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "block w-full rounded-[12px] border bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent",
                            error ? "border-[#EF4444] focus:ring-[#EF4444]" : "border-[#E5E7EB]",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#94A3B8]">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1.5 text-sm text-[#EF4444]">{error}</p>}
                {helperText && !error && <p className="mt-1.5 text-sm text-[#64748B]">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";