const fs = require('fs');
const { execSync } = require('child_process');
const { minify } = require('terser');

const indexPath = 'js/index.js';
const distPath = 'dist/flickity.pkgd.js';
const distMinPath = 'dist/flickity.pkgd.min.js';

let indexContent = fs.readFileSync( `./${indexPath}`, 'utf8' );
// get file paths from index.js
let jsPaths = indexContent.match( /require\('([.\-/\w]+)'\)/gi )
  .map( ( path ) => path.replace( "require('.", 'js' ).replace( "')", '.js' ) );

let paths = [
  'node_modules/jquery-bridget/jquery-bridget.js',
  'node_modules/ev-emitter/ev-emitter.js',
  'node_modules/get-size/get-size.js',
  'node_modules/fizzy-ui-utils/utils.js',
  'node_modules/unidragger/unidragger.js',
  'node_modules/imagesloaded/imagesloaded.js',
  'js/cell.js',
  'js/slide.js',
  'js/animate.js',
  ...jsPaths,
];

// concatenate files
execSync(`cat ${paths.join(' ')} > ${distPath}`);

// add banner
let banner = indexContent.split(' */')[0] + ' */\n\n';
banner = banner.replace( 'Flickity', 'Flickity PACKAGED' );
let distJsContent = fs.readFileSync( distPath, 'utf8' );
distJsContent = banner + distJsContent;
fs.writeFileSync( distPath, distJsContent );

// minify
( async function() {
  let { code } = await minify( distJsContent, { mangle: true } );
  fs.writeFileSync( distMinPath, code );
} )();
