module.exports = {
  env: {
    browser: true,
    es2021: true,
    'react-native/react-native': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['src/components/**.js'],
      rules: {
        'react/jsx-props-no-spreading': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['react', 'react-native'],
  rules: {
    'react/jsx-props-no-spreading': 'warn',
    'no-unused-vars': 'error',
  },
};
