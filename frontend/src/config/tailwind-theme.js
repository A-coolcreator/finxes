/* ═══════════════════════════════════════════════════
   FINEXIS TAILWIND THEME CONFIGURATION
   Source: Design Blueprint v1.0 (conversation 972730af)
   ═══════════════════════════════════════════════════ */
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── 1.1 Neutrals ── */
        paper:      "#F7F8FA",
        surface:    "#FFFFFF",
        ink:        "#12161C",
        "ink-muted":  "#5A6472",
        "ink-faint":  "#8A93A1",
        line:       "#E4E7EC",
        "line-soft":  "#EDEFF2",

        /* ── 1.2 Forensic Green (Primary Brand) ── */
        "forensic-50":  "#EAF4F1",
        "forensic-100": "#ECFDF5",
        "forensic-100-soft": "#CFE6DF",
        "forensic-active": "#ECFDF5",
        "forensic-300": "#6FAE9D",
        "forensic-500": "#0E6E5E",
        "forensic-600": "#0B5E50",
        "forensic-700": "#0A4F44",
        "forensic-900": "#062F28",

        /* ── Primary aliases (maps to forensic-500) ── */
        primary:              "#0E6E5E",
        "primary-container":  "#0B5E50",
        "primary-fixed":      "#ECFDF5",
        "on-primary":         "#FFFFFF",

        /* ── 1.3 Amber (Warning) ── */
        "amber-50":  "#FDF3E7",
        "amber-100": "#F8E0BD",
        "amber-400": "#E08A2A",
        "amber-500": "#D97706",
        "amber-600": "#B8650A",

        /* ── 1.4 Flag / Danger ── */
        "flag-500":        "#C0392B",
        "status-critical": "#C0392B",
        "status-warning":  "#D97706",
        "status-success":  "#0E6E5E",

        /* ── Legacy surface aliases (backwards compat) ── */
        background:                "#F7F8FA",
        "on-background":           "#12161C",
        "on-surface":              "#12161C",
        "on-surface-variant":      "#5A6472",
        secondary:                 "#5A6472",
        "on-secondary":            "#FFFFFF",
        outline:                   "#8A93A1",
        "outline-variant":         "#E4E7EC",
        "surface-muted":           "#F7F8FA",
        "surface-dim":             "#EDEFF2",
        "surface-container-lowest":"#FFFFFF",
        "surface-container-low":   "#F7F8FA",
        "surface-container":       "#EDEFF2",
        "surface-container-high":  "#E4E7EC",
        "surface-container-highest":"#D8DADC",
        "surface-bright":          "#FFFFFF",
        "surface-variant":         "#EDEFF2",
        "border-subtle":           "#E4E7EC",

        /* Status colors */
        error:                "#C0392B",
        "on-error":           "#FFFFFF",
        "error-container":    "#FFEAE8",
        "on-error-container": "#7A0B00",

        /* Misc legacy */
        tertiary:                     "#0B5E50",
        "surface-tint":               "#0E6E5E",
        "inverse-surface":            "#2D3130",
        "inverse-on-surface":         "#EEF1F0",
        "inverse-primary":            "#6FAE9D",
        "on-tertiary":                "#FFFFFF",
        "on-tertiary-container":      "#6FAE9D",
        "primary-fixed-dim":          "#6FAE9D",
        "on-primary-fixed":           "#062F28",
        "on-primary-fixed-variant":   "#0A4F44",
        "tertiary-fixed":             "#ECFDF5",
        "tertiary-fixed-dim":         "#6FAE9D",
        "on-tertiary-fixed":          "#062F28",
        "on-tertiary-fixed-variant":  "#0A4F44",
        "secondary-fixed":            "#E4E7EC",
        "secondary-fixed-dim":        "#D0D4D9",
        "on-secondary-fixed":         "#12161C",
        "on-secondary-fixed-variant": "#5A6472",
        "secondary-container":        "#EDEFF2",
        "on-secondary-container":     "#5A6472",
        "tertiary-container":         "#0B5E50",
        "text-body":                  "#5A6472",
      },

      /* ── Border Radius (blueprint: 6/8/12/16/9999) ── */
      borderRadius: {
        DEFAULT: "6px",
        sm:      "4px",
        md:      "8px",
        lg:      "12px",
        xl:      "16px",
        "2xl":   "20px",
        full:    "9999px",
      },

      /* ── Letter Spacing ── */
      letterSpacing: {
        widest2: "0.18em",
      },

      /* ── Font Families ── */
      fontFamily: {
        display:      ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans:         ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono:         ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        /* legacy aliases */
        "body-lg":    ["Inter"],
        "display-lg": ["Fraunces", "ui-serif"],
        "label-sm":   ["JetBrains Mono"],
        "headline-md":["Fraunces", "ui-serif"],
        "body-md":    ["Inter"],
        "headline-lg":["Fraunces", "ui-serif"],
        "body-sm":    ["Inter"],
        "label-md":   ["JetBrains Mono"],
      },

      /* ── Type Scale ── */
      fontSize: {
        "display-lg": ["68px", { lineHeight: "1.06", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-md": ["52px", { lineHeight: "1.06", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-sm": ["40px", { lineHeight: "1.06", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg":["38px", { lineHeight: "1",    fontWeight: "600" }],
        "headline-md":["32px", { lineHeight: "1.1",  fontWeight: "600" }],
        "headline-sm":["24px", { lineHeight: "1.2",  fontWeight: "600" }],
        "stat-lg":    ["44px", { lineHeight: "1",    fontWeight: "600" }],
        "stat-md":    ["32px", { lineHeight: "1",    fontWeight: "600" }],
        "stat-sm":    ["24px", { lineHeight: "1",    fontWeight: "600" }],
        "body-lg":    ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md":    ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm":    ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md":   ["13px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm":   ["11px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "500" }],
        "mono-md":    ["12.5px",{ lineHeight: "auto", fontWeight: "400" }],
        "mono-sm":    ["11.5px",{ lineHeight: "auto", fontWeight: "400" }],
        "eyebrow":    ["11px", { lineHeight: "auto", letterSpacing: "0.18em", fontWeight: "700" }],
      },

      /* ── Spacing System (4px base) ── */
      spacing: {
        "base":          "4px",
        "gutter":        "24px",
        "margin-mobile": "16px",
        "margin-desktop":"48px",
        "container-max": "1240px",
      },

      /* ── Shadows ── */
      boxShadow: {
        card:   "0 1px 2px rgba(18,22,28,0.04), 0 8px 24px -8px rgba(18,22,28,0.06)",
        ring:   "0 0 0 1px rgba(18,22,28,0.04)",
        sm:     "0 1px 2px rgba(0,0,0,0.05)",
        md:     "0 4px 6px rgba(0,0,0,0.07)",
        none:   "none",
      },

      /* ── Max Width ── */
      maxWidth: {
        container: "1240px",
      },
    },
  },
};
