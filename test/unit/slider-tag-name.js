QUnit.test( 'sliderTagName', function( assert ) {

  'use strict';
  var tagNames,
      elem,
      flkty,
      flktySlider;

  tagNames = ['ul','section','figure', 'random-custom-js-framework-tagname-or-wutever'];

  for(var i = 0; i < tagNames.length; i++) {

    elem = document.querySelector('#sliderTagName--'+tagNames[i]);
    flkty = new Flickity( elem, {
      sliderTagName: tagNames[i]
    });

    flktySlider = elem.getElementsByClassName('flickity-slider')[0];

    assert.equal( flktySlider.tagName, tagNames[i].toUpperCase(), '.flickity-slider tagName is '+tagNames[i].toUpperCase() );
  }

  /**/

});
