/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Premium Dark V2 Palette
                pageBg: '#000000', // Pure Black
                cardBg: '#09090b', // Deep Zinc

                // Accents
                'premium-gold': '#FCD34D', // Amber-300/Yellow-300 mix
                'premium-orange': '#F59E0B',

                // Text
                textMain: '#FFFFFF',
                textMuted: '#A1A1AA', // Zinc-400

                // Structural
                glassBorder: 'rgba(255, 255, 255, 0.08)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'ambient-glow': 'conic-gradient(from 180deg at 50% 50%, rgba(79, 70, 229, 0.1) 0deg, rgba(147, 51, 234, 0.1) 180deg, rgba(79, 70, 229, 0.1) 360deg)',
            },
            animation: {
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
}
