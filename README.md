# Flickity

_Touch, responsive, flickable galleries_

## Under development

I'm making a carousel/slider/gallery library! It's still in its infancy and not ready for use. [Follow @metafizzyco on Twitter for updates and news on releases](https://twitter.com/metafizzyco).

I'm blogging development at [metafizzy.co/blog](http://metafizzy.co/blog).

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

  friction: 0.2,
  // smaller number = easier to flick farther

  imagesLoaded: false,
  // if imagesLoaded is present, Flickity can re-position cells
  // once images are loaded

  pixelPositioning: false,
  // sets positioning in pixels, rather than percentages
  // may be better for more precise positioning

  prevNextButtons: true,
  // creates and enables buttons to click to previous & next cells

  resizeBound: true,
  // listens to window resize events to adjust size & positions

  watch: false,
  // watches the content of ::after of the element
  // activates if #element::after { content: 'flickity' }
  // IE8 and Android 2.3 do not support watching ::after
  // set watch: 'fallbackOn' to enable for these browsers

  wrapAround: false
  // at end of cells, wraps-around to first for infinite scrolling

});
```

## License

Flickity is currently in development, v0. It is licensed GPL v3. With v1, Flickity will be dual-licensed: GPL, and a commercial license that exempts GPL.

