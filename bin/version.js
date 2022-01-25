const fs = require('fs');
const version = require('../package.json').version;

[ 'css/flickity.css', 'js/index.js' ].forEach( function( file ) {
  let src = fs.readFileSync( file, 'utf8' );
  src = src.replace( /Flickity v\d+\.\d+\.\d+/, `Flickity v${version}` );
  fs.writeFileSync( file, src, 'utf8' );
} );
