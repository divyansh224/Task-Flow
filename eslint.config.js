import globals from 'globals';

export default [{
  ignores: ['node_modules/**', 'coverage/**'],
  files: ['**/*.js'],
  languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.node, ...globals.jest } },
  rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }], 'no-undef': 'error', 'no-console': 'off' }
}];
