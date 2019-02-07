module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['airbnb', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'no-console': 0,
    'react/no-danger': 0,
    'airbnb/jsx-a11y/href-no-hash': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
    'max-len': 0,
    'no-param-reassign': [
      2,
      {
        props: false,
      },
    ],
    'comma-dangle': 0,
    'func-names': 0,
  },
}
