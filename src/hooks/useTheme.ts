import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const useTheme = () => {
    // Assuming your settingsStore has a 'theme' property: 'light' | 'dark' | 'system'
    const theme = useSettingsStore((state) => state.settings?.theme || 'system');

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (currentTheme: string) => {
            root.classList.remove('light', 'dark');

            if (currentTheme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
            } else {
                root.classList.add(currentTheme);
            }
        };

        applyTheme(theme);

        // Listen for system theme changes if set to 'system'
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') applyTheme('system');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);
};