import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  // Don't lint build output or deps
  { ignores: ['.next/**', 'node_modules/**'] },

  // Standard JS recommended rules
  js.configs.recommended,

  // TypeScript-aware rules
  ...tseslint.configs.recommended,

  // Next.js rules — use .configs.recommended.rules directly.
  // This avoids the broken flatConfig.coreWebVitals export entirely.
  {
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },

  // Project-specific overrides
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)