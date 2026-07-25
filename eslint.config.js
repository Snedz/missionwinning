import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.next', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': 'warn',
      // Decorative icons paired with visible text — avoid noisy alt-text warnings.
      'jsx-a11y/alt-text': ['warn', { elements: ['img'], img: ['Image'] }],
    },
  },
  {
    // A bare localStorage call throws in Safari private mode and when the disk is
    // full, which can blank a page — on a product whose promise is offline-first
    // logging. `src/lib/storage/safeStorage.ts` is the only module allowed to
    // touch it directly (plus backup.ts, which must enumerate raw keys so a stale
    // key registry can never drop data from a user's only safety net).
    //
    // This started as a ratchet with a 59-file allowlist. The allowlist is gone:
    // every call site now goes through safeStorage, so this is a plain error and a
    // new direct call fails lint rather than joining a backlog.
    files: ['app/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['src/lib/storage/**', 'src/lib/backup.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message:
            'Use @/lib/storage/safeStorage — a bare localStorage call can throw and blank the page.',
        },
      ],
    },
  }
);
