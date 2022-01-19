module.exports = {
  extends: 'stylelint-config-standard',
  ignoreFiles: [ 'dist/*' ],
  rules: {
    'color-hex-case': 'upper',
    'comment-empty-line-before': null,
    'declaration-block-no-duplicate-properties': [ true, {
      ignore: [ 'consecutive-duplicates-with-different-values' ],
    } ],
    'hue-degree-notation': 'number',
    'property-no-vendor-prefix': null,
    'selector-class-pattern': null,
    'string-quotes': 'single',
  },
};
