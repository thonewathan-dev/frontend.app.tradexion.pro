import { defineStore } from 'pinia';
import api from '../utils/api';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        themeColor: '#000000',
        gradientColor1: null,
        gradientColor2: null,
        gradientAngle: 135,
    }),
    actions: {
        async fetchSettings() {
            try {
                const response = await api.get('/settings/public');
                if (response.data.themeColor) {
                    this.themeColor = response.data.themeColor;
                }
                if (response.data.gradientColor1 && response.data.gradientColor2) {
                    this.gradientColor1 = response.data.gradientColor1;
                    this.gradientColor2 = response.data.gradientColor2;
                    this.gradientAngle = response.data.gradientAngle || 135;
                } else {
                    this.gradientColor1 = null;
                    this.gradientColor2 = null;
                }
                this.applyTheme();
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        },
        applyTheme() {
            // Theme is now static white/light theme as requested.
            // Database settings for background color are ignored.
            // document.documentElement.style.setProperty('--bg-color', '#ffffff');
            // document.body.style.background = '#ffffff';
        }
    }
});
