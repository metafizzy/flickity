## To do

## Feature requests

isGroupPaging
lazy load
animations for add/remove
disable animation on imagesLoaded loading

## Test

cellAlign
wrapAround

## Check

videos

## Blog about

handling clicks vs. dragging
HTML init
lots of files

## Parts

jQuery Bridget
imagesLoaded
flickity-imagesloaded
cell-change (add/remove)
syncing

## IE8 quirks

scrollTop & scrollLeft
can't set `button.type = 'button'` has to be `button.setAttribute( 'type', 'button' )`
cannot `.focus()` on a button that is `disabled`

    function preventDefaultEvent( event ) {
      if ( event.preventDefault ) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
    }

Cannot `elem.detach( 'onevent', undefined )`

in order to prevent child element from 'stealing' focus, need to set `unselectable="on"`
http://stackoverflow.com/a/17525223/182183
