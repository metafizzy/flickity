# Changelog

### v1.0.2

+ Fixed double move on prev/next button tap. Fixed [#122](https://github.com/metafizzy/flickity/issues/122)

### v1.0.1

+ Allowed native scrolling for touch devices. Fixed [#67](https://github.com/metafizzy/flickity/issues/67), [#97](https://github.com/metafizzy/flickity/issues/97), [#41](https://github.com/metafizzy/flickity/issues/41)
+ Allowed clicks on all inputs and textareas, for [#105](https://github.com/metafizzy/flickity/issues/105)
+ Fixed IE10 `body.blur()` bug. Fixed #
+ Upgraded [Unidragger](https://github.com/metafizzy/unidragger) to `v1.1.3` [tap-listener](https://github.com/metafizzy/tap-listener) to `v1.1.0`

## v1.0.0

+ Add commercial licensing
+ Update v0.x.x dependencies to v1.0.0
+ Fixed clicking links on child elements of `<a>`. Fixed [#61](https://github.com/metafizzy/flickity/issues/61)

### v0.3.1

Update [flickity-as-nav-for](https://github.com/metafizzy/flickity-as-nav-for) to work with `cellSelect` event, and changed `staticClick` arguments for Flickity v0.3.0

## v0.3.0

+ Changed `select` event to `cellSelect`, to avoid conflict with [native `select` event](https://developer.mozilla.org/en-US/docs/Web/Events/select)
+ Removed `.flickity` event namespace from jQuery events
+ Re-ordered `staticClick` callback parameters to be `function( event, pointer, cellElement, cellIndex )`
+ Added [`setGallerySize` option](http://flickity.metafizzy.co/options.html#setgallerysize)
+ Fixed `contain` bug when all cells can fit inside gallery. Fixed [#48](https://github.com/metafizzy/flickity/issues/48)
+ Fixed jQuery [`.flickity('destroy')`](http://flickity.metafizzy.co/api.html#destroy) bug, not removing data from `this.$element`

### v0.2.3

+ Prevented `wrapAround` if only one cell. Fixed [#40](https://github.com/metafizzy/flickity/issues/40)
+ Fixed `.getParentCell()` bug. Fixed [#39](https://github.com/metafizzy/flickity/issues/39)
+ Added back arrows for IE8 and Android 2.3
+ Fixed IE8 bug on `.deactivate()`

### v0.2.2

Fixed `.destroy()` bug with [flickity-as-nav-for](https://github.com/metafizzy/flickity-as-nav-for)

### v0.2.1

+ Swapped out [flickity-sync](https://github.com/metafizzy/flickity-sync) package for [flickity-as-nav-for](https://github.com/metafizzy/flickity-as-nav-for), for [#13](https://github.com/metafizzy/flickity/issues/13)
+ Built `pkgd.js` with [flickity-imagesloaded](https://github.com/metafizzy/flickity-imagesloaded) v0.1.2
+ Added `.getParentCell()`
+ Added `clickedCellIndex` and `clickedCellElement` arguments in `staticClick` callback
+ Fixed jQuery plugin bug, added `._init()`. Fixed [#30](https://github.com/metafizzy/flickity/issues/30)

## v0.2.0

+ Refactored feature files to be event based. See [Metafizzy blog:Making features independent with internal events ](http://metafizzy.co/blog/making-features-independent-with-internal-events/)
+ Forked off [Unipointer](https://github.com/metafizzy/unipointer) and [Unidragger](https://github.com/metafizzy/unidragger) libraries
+ Forked off [Fizzy UI Utils](https://github.com/metafizzy/fizzy-ui-utils)
+ Added page visibility listening to pause/unpause autoPlay. Fixed [#6](https://github.com/metafizzy/flickity/issues/6)
+ Added touchVerticalScroll to vertical scroll pages on mobile. Fixed [#3](https://github.com/metafizzy/flickity/issues/3)
+ Added TapListener to make tapping buttons snappy. Fixed [#4](https://github.com/metafizzy/flickity/issues/4)
+ Improved right-to-left CSS. Fixed [#17](https://github.com/metafizzy/flickity/issues/17)
+ Added `.reposition()`
+ Renamed `resizeBound` option to `resize`
+ Added [flickity-sync](https://github.com/metafizzy/flickity-sync) to `pkgd.js` files
+ Added [flickity-imagesloaded](https://github.com/metafizzy/flickity-imagesloaded) to `pkgd.js` files

## v0.1.0

Initial public beta release
