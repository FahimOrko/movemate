import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/coverage', '**/migrations'] },
  js.configs.recommended,
  tseslint.configs.strict,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/api/**/*.ts', '**/*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
  ...['move', 'guidance', 'photos'].map((context) => ({
    // A context reaches another context through its service, never its repository or db/schema file.
    files: [`apps/api/src/contexts/${context}/**/*.ts`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['../**/*.repository'], message: 'Call the other context’s service instead.' },
            {
              group: ['**/db/schema/*', `!**/db/schema/${context}`],
              message: 'Use only your own db/schema file; call the other context’s service instead.',
            },
          ],
        },
      ],
    },
  })),
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // Vendored shadcn files export variants next to components.
    files: ['apps/web/src/components/ui/**'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
);
