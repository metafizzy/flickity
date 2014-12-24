# Flickity

_Touch, responsive, flickable galleries_

I'm making a carousel/slider/gallery library!

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

  cellSelector: undefined,
  // specify selector for cell elements

  cursorPosition: 0.5,
  // decimal value 0 - 1, representing where cells should align to
  // 0 is beginning (left) of gallery, 1 is end (right)

  draggable: true,
  // enables dragging & flicking

  friction: 0.2,
  // smaller number = easier to flick farther

  pixelPositioning: false,
  // sets positioning in pixels, rather than percentages
  // may be better for more precise positioning

  prevNextButtons: true,
  // creates and enables buttons to click to previous & next cells

  resizeBound: true,
  // listens to window resize events to adjust size & positions

  targetPosition: 0.5,
  // decimal value 0 - 1, representing what part of cells should align to
  // 0 is beginning (left) of the cell, 1 is end (right)

  wrapAround: false
  // at end of cells, wraps-around to first for infinite scrolling

});
```

## License

Flickity is currently in development, v0. It is licensed GPL v3. With v1, Flickity will be dual-licensed: GPL, and a commercial license that exempts GPL.

