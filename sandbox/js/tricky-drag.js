let nonDragFlkty = new Flickity( '.carousel--non-drag', {
  draggable: false,
} );

function onStaticClick( event, pointer, cellElem, cellIndex ) {
  console.log( 'staticClick', this.element.className, cellIndex );
}

nonDragFlkty.on( 'staticClick', onStaticClick );

let singleCellFlkty = new Flickity('.carousel--single-cell');
singleCellFlkty.on( 'staticClick', onStaticClick );

let groupFlkty = new Flickity( '.carousel--group', {
  groupCells: true,
} );

groupFlkty.on( 'staticClick', function( event ) {
  let cellElem = event.target.closest('.carousel-cell');
  if ( cellElem ) groupFlkty.remove( cellElem );
} );

function makeGroupCell() {
  let cell = document.createElement('div');
  cell.className = 'carousel-cell';
  let b = document.createElement('b');
  b.textContent = groupFlkty.cells.length + 1;
  cell.appendChild( b );
  return cell;
}

document.querySelector('.add-group-cell-button').onclick = function() {
  groupFlkty.append( makeGroupCell() );
};
