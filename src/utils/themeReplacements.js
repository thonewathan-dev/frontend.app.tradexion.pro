// Global CSS Class Replacements for Binance Theme
// This file documents the CSS class migrations from light theme to Binance dark theme

export const classReplacements = {
    // Background colors
    'bg-[#fafafa]': 'bg-[var(--bg-secondary)]',
    'bg-[#f9fafb]': 'bg-[var(--bg-secondary)]',
    'bg-gray-50': 'bg-[var(--bg-secondary)]',
    'bg-gray-100': 'bg-[var(--bg-tertiary)]',
    'bg-gray-200': 'bg-[var(--bg-tertiary)]',
    'bg-white': 'bg-[var(--bg-secondary)]',

    // Text colors
    'text-gray-900': 'text-[var(--text-primary)]',
    'text-gray-800': 'text-[var(--text-primary)]',
    'text-gray-700': 'text-[var(--text-secondary)]',
    'text-gray-600': 'text-[var(--text-secondary)]',
    'text-gray-500': 'text-[var(--text-tertiary)]',
    'text-gray-400': 'text-[var(--text-tertiary)]',
    'text-gray-900/60': 'text-[var(--text-secondary)]',
    'text-gray-900/70': 'text-[var(--text-tertiary)]',
    'text-gray-900/40': 'text-[var(--text-disabled)]',

    // Border colors
    'border-gray-200': 'border-[var(--border-primary)]',
    'border-gray-300': 'border-[var(--border-primary)]',
    'border-gray-100': 'border-[var(--border-primary)]',

    // Component classes
    'glass-card': 'binance-card',
    'glass-card-no-hover': 'binance-card',
    'glass': 'binance-card',
    'glass-dark': 'binance-card-elevated',
    'glass-input': 'binance-input',
    'glass-button': 'binance-btn-secondary',
    'glass-button-no-hover': 'binance-btn-secondary',

    // Trading colors - keep these as is, just update class names
    'text-green-300': 'text-buy',
    'text-red-300': 'text-sell',
    'text-binance-green': 'text-buy',
    'text-binance-red': 'text-sell',

    // Hover states
    'hover:bg-gray-100': 'hover:bg-[var(--bg-tertiary)]',
    'hover:bg-gray-50': 'hover:bg-[var(--bg-tertiary)]',
    'hover:text-gray-900': 'hover:text-[var(--text-primary)]',

    // Skeleton loaders
    'bg-gray-100 animate-pulse': 'binance-shimmer',

    // Buttons - primary
    'bg-blue-600': 'binance-btn-primary',
    'bg-blue-500': 'binance-btn-primary',

    // Yellow accent
    'text-binance-yellow': 'text-yellow',
    'bg-binance-yellow': 'bg-[var(--accent-primary)]'
};
