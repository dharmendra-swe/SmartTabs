import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false, className }) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
                checked ? "bg-[#22C55E]" : "bg-[#E5E7EB]",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <motion.span
                layout
                initial={false}
                animate={{
                    x: checked ? 20 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0"
            />
        </button>
    );
};