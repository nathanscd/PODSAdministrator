export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-app)",
        foreground: "var(--text-primary)",
        card: {
          DEFAULT: "var(--card-bg)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--accent-color)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--text-secondary)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "rgba(156, 163, 175, 0.2)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent-color)",
          hover: "var(--accent-hover)",
        },
        border: "var(--border-color)",
        input: "var(--border-color)",
        ring: "var(--accent-color)",
      },
    },
  },
  plugins: [],
}
