import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["backend/src/**/*.ts"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      // Disable the no-unused-vars rule from ESLint core
      'no-unused-vars': 'off',
      
      // Use TypeScript's version instead, but only mark as errors parameters that aren't prefixed with _
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        // Don't report when a catch clause parameter is unused
        caughtErrorsIgnorePattern: '^_',
        // Don't report unused variables whose name is exactly 'error'
        varsIgnorePattern: '^error$'
      }],
      
      // Allow console.log in development
      'no-console': 'off',
      
      // Prevent duplicate imports
      'no-duplicate-imports': 'error',
      
      // Don't require explicit return types
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Allow namespaces for now (we can fix later)
      '@typescript-eslint/no-namespace': 'off',
      "no-trailing-spaces": "error",
      "indent": ["error", 2],
      "space-before-function-paren": ["error", "never"],
      "keyword-spacing": ["error", { "before": true, "after": true }]
    },
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/prisma/**'
    ],
  }
);