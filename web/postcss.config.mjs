// Tailwind CSS v4 changed how PostCSS is configured.
// In v3, you needed a tailwind.config.js AND listed tailwindcss here.
// In v4, ALL config moves into globals.css via @theme {}, and you just
// point PostCSS at the new @tailwindcss/postcss package.
// Result: zero config files for Tailwind, everything is CSS-first.

const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
