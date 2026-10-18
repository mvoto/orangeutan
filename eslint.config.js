const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores(['dist/*', 'coverage/*', 'ios/*', 'android/*', '.expo/*', 'expo-env.d.ts']),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-default-export': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
  {
    // Expo Router requires default exports for routes and layouts.
    files: ['src/app/**/*.tsx'],
    rules: { 'import/no-default-export': 'off' },
  },
  {
    files: ['**/__tests__/**', 'src/test/**'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
  {
    // The engine must stay pure so it runs in Jest, Node scripts, and the app alike.
    files: ['src/engine/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react-*', 'react-native*', 'expo', 'expo-*', '@expo/*', '@/*'],
              message: 'src/engine is pure TypeScript: no UI, Expo, or app imports.',
            },
          ],
        },
      ],
    },
  },
]);
