/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(220 24% 88%)",
        input: "hsl(220 24% 88%)",
        ring: "hsl(227 78% 55%)",
        background: "hsl(215 40% 98%)",
        foreground: "hsl(222 47% 11%)",
        primary: {
          DEFAULT: "hsl(227 78% 55%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(215 34% 93%)",
          foreground: "hsl(222 47% 11%)",
        },
        muted: {
          DEFAULT: "hsl(215 25% 94%)",
          foreground: "hsl(215 16% 40%)",
        },
        card: {
          DEFAULT: "hsla(0, 0%, 100%, 0.82)",
          foreground: "hsl(222 47% 11%)",
        },
      },
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 24px 60px rgba(37, 99, 235, 0.16)",
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(59,130,246,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(99,102,241,0.18), transparent 30%)",
      },
    },
  },
  plugins: [],
};
