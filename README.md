# Flickity

_Touch, responsive, flickable galleries_

[flickity.metafizzy.co](http://flickity.metafizzy.co)

## Beta testing

Help make Flickity better for it’s v1.0 release. Try out Flickity and provide any feedback. We'll send you some Metafizzy stickers for helping us out.

Did it work as expected? What trouble did you run into? Is there something else you'd like? Bugs, feature requests, questions — we're happy to hear it all.

+ Submit an [issue on GitHub](https://github.com/metafizzy/flickity/issues)
+ Email [yo@metafizzy.co](mailto:yo@metafizzy.co?subject=Flickity beta feedback)
+ Tweet [@metafizzyco](https://twitter.com/metafizzyco)

## Under development

I'm making a carousel/slider/gallery library! [Follow @metafizzyco on Twitter for updates and news on releases](https://twitter.com/metafizzyco).

I'm blogging development at [metafizzy.co/blog](http://metafizzy.co/blog).

## Install

### Download

+ JavaScript: [flickity.pkgd.js](https://github.com/metafizzy/flickity/raw/master/dist/flickity.pkgd.js) uncompressed or [flickity.pkgd.min.js](https://github.com/metafizzy/flickity/raw/master/dist/flickity.pkgd.min.js) minified
+ CSS: [flickity.css](https://github.com/metafizzy/flickity/raw/master/dist/flickity.css)

### Package managers

Bower: `bower install flickity --save`

npm: `npm install flickity --save`

## Usage

Flickity works with a container element and a set of child cell elements

``` html
<div class="gallery">
  <div class="cell">...</div>
  <div class="cell">...</div>
  <div class="cell">...</div>
  ...
</div>
```

``` js
var flky = new Flickity( '.gallery', {
  // options, defaults listed

  accessibility: true,
  // enable keyboard navigation, pressing left & right keys

  autoPlay: false,
  // advances to the next cell
  // if true, default is 3 seconds
  // or set time between advances in milliseconds
  // i.e. `autoPlay: 1000` will advance every 1 second

  cellAlign: 'center',
  // alignment of cells, 'center', 'left', or 'right'
  // or a decimal 0-1, 0 is beginning (left) of container, 1 is end (right)

  cellSelector: undefined,
  // specify selector for cell elements

  contain: false,
  // will contain cells to container
  // so no excess scroll at beginning or end
  // has no effect if wrapAround is enabled

  draggable: true,
  // enables dragging & flicking

  freeScroll: false,
  // enables content to be freely scrolled and flicked
  // without aligning cells

  friction: 0.2,
  // smaller number = easier to flick farther

  imagesLoaded: false,
  // if imagesLoaded is present, Flickity can re-position cells
  // once images are loaded

  initialIndex: 0,
  // zero-based index of the initial selected cell

  percentPosition: true,
  // sets positioning in percent values, rather than pixels
  // Enable if items have percent widths
  // Disable if items have pixel widths, like images

  prevNextButtons: true,
  // creates and enables buttons to click to previous & next cells

  pageDots: true,
  // create and enable page dots

  resizeBound: true,
  // listens to window resize events to adjust size & positions

  watchCSS: false,
  // watches the content of :after of the element
  // activates if #element:after { content: 'flickity' }
  // IE8 and Android 2.3 do not support watching :after
  // set watch: 'fallbackOn' to enable for these browsers

  wrapAround: false
  // at end of cells, wraps-around to first for infinite scrolling

});
```

## License

Flickity is currently in development, v0. It is licensed GPL v3. With v1, Flickity will be dual-licensed: GPL, and a commercial license that exempts GPL.

---

By [Metafizzy](http://metafizzy.co)
