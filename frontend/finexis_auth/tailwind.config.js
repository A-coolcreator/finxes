/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F8FA",
        surface: "#FFFFFF",
        ink: "#12161C",
        "ink-muted": "#5A6472",
        "ink-faint": "#8A93A1",
        line: "#E4E7EC",
        "line-soft": "#EDEFF2",
        forensic: {
          50: "#EAF4F1",
          100: "#CFE6DF",
          300: "#6FAE9D",
          500: "#0E6E5E",
          600: "#0B5E50",
          700: "#0A4F44",
          900: "#062F28",
        },
        amber: {
          50: "#FDF3E7",
          100: "#F8E0BD",
          400: "#E08A2A",
          500: "#D97706",
          600: "#B8650A",
        },
        flag: {
          500: "#C0392B",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
      boxShadow: {
        // Hijack shadow-sm to use your standard Finexis card token
        'sm': '0 2px 8px rgba(18,22,28,0.08), 0 12px 32px -8px rgba(18,22,28,0.14)',

        // Hijack shadow-md to use your hover token
        'md': '0 4px 16px rgba(18,22,28,0.12), 0 20px 48px -8px rgba(18,22,28,0.20)',

        // Hijack shadow-2xl to make all modals match the deep hover spec
        '2xl': '0 4px 16px rgba(18,22,28,0.12), 0 20px 48px -8px rgba(18,22,28,0.20)',
      },
      maxWidth: {
        page: "1240px",
      },
    },
  },
  plugins: [],
};
