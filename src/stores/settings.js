import { defineStore } from 'pinia';
import api from '../utils/api';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        themeColor: '#000000',
    }),
    actions: {
        async fetchSettings() {
            try {
                const response = await api.get('/settings/public');
                if (response.data.themeColor) {
                    this.themeColor = response.data.themeColor;
                    this.applyTheme();
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        },
        applyTheme() {
            document.documentElement.style.setProperty('--bg-color', this.themeColor);
        }
    }
});
