/* eslint-env node */

module.exports = {
  plugins: [ 'metafizzy' ],
  extends: 'plugin:metafizzy/browser',
  env: {
    browser: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  globals: {
    Flickity: 'readonly',
    QUnit: 'readonly',
  },
  rules: {
    'prefer-object-spread': 'error',
  },
  ignorePatterns: [ 'bower_components' ],
};
