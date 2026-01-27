/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // 🎨 PALETA COMPOSTA - Base #664FFA
                "primary": "#664FFA",
                "primary-light": "#8B7BFC",
                "primary-dark": "#4A35D9",
                "primary-glow": "rgba(102, 79, 250, 0.25)",

                // Harmonia Composta (Split-Complementary + Triadic)
                "accent-gold": "#FAC864",      // Âmbar quente
                "accent-mint": "#64FAC8",      // Menta fria
                "accent-coral": "#FA6464",     // Coral vibrante
                "accent-magenta": "#FA64C8",   // Magenta elétrico

                // Superfícies
                "surface-light": "#FAFAFC",
                "surface-dark": "#0D0D12",
                "surface-elevated": "#FFFFFF",
                "surface-elevated-dark": "#16161F",

                // Bordas
                "border-subtle": "#E8E8F0",
                "border-subtle-dark": "#2A2A3C",

                // Legacy (para compatibilidade)
                "accent-peach": "#FFF0E6",
                "accent-lavender": "#F0EDFF",
                "background-light": "#FAFAFC",
                "background-dark": "#0D0D12",

                // 🌌 ELECTRIC TECHNICAL PALETTE
                "void": "#020408",      // Absolute Black base
                "void-surface": "#050a14", // Slightly elevated surface
                "void-border": "#1a1f2e",  // Technical borders
                "acid": "#00F2FE",      // Electric Cyan
                "acid-glow": "rgba(0, 242, 254, 0.5)",
                "acid-dark": "#0099FF", // Deep Blue fallback
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"],
                "body": ["Outfit", "sans-serif"],
                "sora": ["Sora", "sans-serif"],
                "inter": ["Inter", "sans-serif"],
            },
            borderRadius: {
                // 🔷 GEOMETRIA EXTREMA - Sharp Tech
                "none": "0px",
                "sharp": "2px",
                "DEFAULT": "4px",
                "md": "6px",
                "lg": "12px",
                "xl": "16px",
                "2xl": "24px",
                "3xl": "32px",
                "4xl": "48px",
                "full": "9999px"
            },
            boxShadow: {
                // Sombras premium com depth
                "glow-sm": "0 0 15px -3px rgba(102, 79, 250, 0.3)",
                "glow": "0 0 25px -5px rgba(102, 79, 250, 0.4)",
                "glow-lg": "0 0 40px -8px rgba(102, 79, 250, 0.5)",
                "depth-sm": "0 4px 20px -4px rgba(0, 0, 0, 0.08)",
                "depth": "0 8px 40px -8px rgba(0, 0, 0, 0.12)",
                "depth-lg": "0 16px 60px -12px rgba(0, 0, 0, 0.18)",
                "inner-glow": "inset 0 0 20px -5px rgba(102, 79, 250, 0.15)",
            },
            animation: {
                'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-up': 'scaleUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'width-full': 'widthFull 0.5s ease-out forwards',
                'float-up': 'floatUp 2s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'bounce-subtle': 'bounceSubtle 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                scaleUp: {
                    '0%': { opacity: '0', transform: 'scale(0.92)' },
                    '100%': { opacity: '1', transform: 'scale(1)' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                widthFull: {
                    '0%': { width: '0' },
                    '100%': { width: '100%' }
                },
                floatUp: {
                    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(-100px) rotate(360deg)', opacity: '0' }
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px -5px rgba(102, 79, 250, 0.4)' },
                    '50%': { boxShadow: '0 0 30px -3px rgba(102, 79, 250, 0.6)' }
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' }
                },
                reveal: {
                    '0%': { opacity: '0', transform: 'translateY(30px) scale(0.96)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
                },
                bounceSubtle: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                    '100%': { transform: 'scale(1)' }
                },
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/container-queries'),
    ],
}
