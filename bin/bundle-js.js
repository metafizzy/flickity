const fs = require('fs');
const requirejs = require('requirejs');

// get banner
let indexJsSrc = fs.readFileSync( 'js/index.js', 'utf8' );
let banner = indexJsSrc.split(' */')[0] + ' */\n\n';
banner = banner.replace( 'Flickity', 'Flickity PACKAGED' );

let options = {
  out: 'dist/flickity.pkgd.js',
  baseUrl: 'bower_components',
  optimize: 'none',
  include: [
    'jquery-bridget/jquery-bridget',
    'flickity/js/index',
    'flickity-as-nav-for/as-nav-for',
    'flickity-imagesloaded/flickity-imagesloaded',
  ],
  paths: {
    flickity: '../',
    jquery: 'empty:',
  },
};

requirejs.optimize(
    options,
    function() {
      let content = fs.readFileSync( options.out, 'utf8' );
      content = content.replace( "'flickity-imagesloaded/flickity-imagesloaded',", '' );
      content = banner + content;
      fs.writeFileSync( options.out, content );
    },
    function( err ) {
      throw new Error( err );
    },
);
