# Changelog

### v0.2.2

Fix `.destroy()` bug with [flickity-as-nav-for](https://github.com/metafizzy/flickity-as-nav-for)

### v0.2.1

+ Swap out [flickity-sync](https://github.com/metafizzy/flickity-sync) package for [flickity-as-nav-for](https://github.com/metafizzy/flickity-as-nav-for), for [#13](https://github.com/metafizzy/flickity/issues/13)
+ Build `pkgd.js` with [flickity-imagesloaded](https://github.com/metafizzy/flickity-imagesloaded) v0.1.2
+ Added `.getParentCell()`
+ Added `clickedCellIndex` and `clickedCellElement` arguments in `staticClick` callback
+ Fixed jQuery plugin bug, added `._init()`. Fixed [#30](https://github.com/metafizzy/flickity/issues/30)

## v0.2.0

+ Refactor feature files to be event based. See [Metafizzy blog:Making features independent with internal events ](http://metafizzy.co/blog/making-features-independent-with-internal-events/)
+ Fork off [Unipointer](https://github.com/metafizzy/unipointer) and [Unidragger](https://github.com/metafizzy/unidragger) libraries
+ Fork off [Fizzy UI Utils](https://github.com/metafizzy/fizzy-ui-utils)
+ Add page visibility listening to pause/unpause autoPlay. Fixed [#6](https://github.com/metafizzy/flickity/issues/6)
+ Add touchVerticalScroll to vertical scroll pages on mobile. Fixed [#3](https://github.com/metafizzy/flickity/issues/3)
+ Use TapListener to make tapping buttons snappy. Fixed [#4](https://github.com/metafizzy/flickity/issues/4)
+ Improve right-to-left CSS. Fixed [#17](https://github.com/metafizzy/flickity/issues/17)
+ add `.reposition()`
+ rename `resizeBound` option to `resize`
+ Add [flickity-sync](https://github.com/metafizzy/flickity-sync) to `pkgd.js` files
+ Add [flickity-imagesloaded](https://github.com/metafizzy/flickity-imagesloaded) to `pkgd.js` files

## v0.1.0

Initial public beta release
