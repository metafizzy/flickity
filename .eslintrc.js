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
    define: 'readonly',
  },
  rules: {
  },
  ignorePatterns: [ 'bower_components' ],
};
