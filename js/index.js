/*!
 * Flickity v3.0.0
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * https://flickity.metafizzy.co
 * Copyright 2015-2022 Metafizzy
 */

if ( typeof module == 'object' && module.exports ) {
  const Flickity = require('./core');
  require('./drag');
  require('./prev-next-button');
  require('./page-dots');
  require('./player');
  require('./add-remove-cell');
  require('./lazyload');
  require('./imagesloaded');

  module.exports = Flickity;
}
