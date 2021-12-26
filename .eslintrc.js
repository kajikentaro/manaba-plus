module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true
  },
  extends: ['standard-typescript','prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/member-delimiter-style': 'off'
  },
};
