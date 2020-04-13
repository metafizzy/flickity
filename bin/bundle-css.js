const CleanCss = require('clean-css');
const fs = require('fs');

let srcCss = fs.readFileSync( 'css/flickity.css', 'utf8' );
let minifiedCss = new CleanCss().minify( srcCss ).styles.replace( '*/', '*/\n' );
fs.writeFileSync( 'dist/flickity.min.css', minifiedCss );
