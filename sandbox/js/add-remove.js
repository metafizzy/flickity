let cellCount = 6;

function getRandom( ary ) {
  let index = Math.floor( Math.random() * ary.length );
  return ary[ index ];
}

let widthClasses = [ '', 'w2', 'w3' ];
let nClasses = 'n1 n2 n3 n4 n5 n6'.split(' ');

function makeCell() {
  let cell = document.createElement('div');
  cell.className = `cell ${getRandom( widthClasses )} ${getRandom( nClasses )}`;
  let b = document.createElement('b');
  b.textContent = ++cellCount;
  cell.appendChild( b );
  let removeButton = document.createElement('button');
  removeButton.className = 'remove-button';
  removeButton.textContent = '×';
  cell.appendChild( removeButton );
  return cell;
}

function makeCells() {
  return [ makeCell(), makeCell(), makeCell() ];
}

// init
[ ...document.querySelectorAll('.demo') ].forEach( ( demo ) => {
  let container = demo.querySelector('.container');
  let flkty = Flickity.data( container );

  demo.querySelector('.container').addEventListener( 'click', function( event ) {
    if ( event.target.matches('.remove-button') ) return;

    let cellElement = event.target.closest('.cell');
    flkty.remove( cellElement );
  } );

  demo.querySelector('.prepend-button').addEventListener( 'click', function() {
    flkty.prepend( makeCells() );
  } );

  demo.querySelector('.insert-button').addEventListener( 'click', function() {
    flkty.insert( makeCells(), 3 );
  } );

  demo.querySelector('.append-button').addEventListener( 'click', function() {
    flkty.append( makeCells() );
  } );

} );

// ----- reposition ----- //

( function() {
  let flkty = new Flickity('#reposition .container');
  flkty.on( 'staticClick', function( event, pointer, cellElem ) {
    if ( !cellElem ) return;

    cellElem.classList.toggle('w3');
    flkty.reposition();
  } );
} )();

// ----- prepend single, #492 ----- //

( function() {
  let demo = document.querySelector('#prepend-single');
  let flkty = new Flickity( demo.querySelector('.container') );
  demo.querySelector('.prepend-button').addEventListener( 'click', function() {
    flkty.prepend( makeCell() );
  } );
} )();
