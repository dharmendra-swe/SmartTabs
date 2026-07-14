import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-[var(--color-brand-primary)] text-white hover:opacity-90 focus-visible:ring-[var(--color-brand-primary)]",
            secondary: "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-main)] hover:bg-[var(--bg-hover)] focus-visible:ring-[var(--color-brand-accent)]",
            ghost: "text-[var(--text-primary)] hover:bg-[var(--bg-hover)] focus-visible:ring-[var(--color-brand-primary)]",
            danger: "bg-[var(--color-brand-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--color-brand-danger)]",
        };

        const sizes = {
            sm: "h-8 px-3 text-sm rounded-[12px]",
            md: "h-10 px-4 py-2 text-sm rounded-[14px]",
            lg: "h-12 px-6 text-base rounded-[16px]",
            icon: "h-10 w-10 rounded-[14px] p-2",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = "Button";