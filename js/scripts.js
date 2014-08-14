$( function() {

	var $window = $( window ),
		gameWidth = 0.98,
		$windowWidthAdj = $window.width() * gameWidth,
		$windowHeightAdj = $window.height() * gameWidth,
		gameDimensions = 768 * gameWidth,
		$sudokuGame = $( '#sudoku-game' ),
		$numEntry = $( '.num-entry' ),
		resizeSetTimeout;

	// **********
	// Set up board width and height
	// **********
	var setBoardDimensions = function() {
		// If window width > window height & window height < preset gameDimensions - set game dimensions
		// Else window width < window height & window width < preset gameDimensions - set game dimensions
		if ( $windowWidthAdj  > $windowHeightAdj ) {
			if ( $windowHeightAdj < gameDimensions ) {
				gameDimensions = $windowHeightAdj;
			}
			$sudokuGame.css({ height: gameDimensions, width: gameDimensions });
		} else {
			if ( $windowWidthAdj < gameDimensions ) {
				gameDimensions = $windowWidthAdj;
			}
			$sudokuGame.css({ height: gameDimensions, width: gameDimensions });
		}
	};
	setBoardDimensions();

	// **********
	// Verify entry is a number & if board is completed correctly
	// **********	
	$( 'input[type=number]' ).keypress( function( evt ) {
		// If entry is not a number do not allow to be entered
		// Else if entry is a number but a value exist clear that value to allow to be overwritten
		if ( !String.fromCharCode( evt.keyCode ).match( /[1-9\.]/ ) ) {
			return false;
		} else {
			$(this).val( '' );
		}
		// Verify the full board is correct
		// Need to use input/propertychange allow to be able to get the most recently entered input
		$(this).on( 'input propertychange', function() {
			// Validate all rows, then all columns, then all 9 input 'boxes'
			if( validateSection( '.row' ) ) {
				if( validateSection( '.column' ) ) {
					if( validateSection( '.box' ) ) {
						$( '.win' ).show();
					}
				}
			}
		});
	});
	// Helper function for validating rows, columns and boxes
	var validateSection = function( section ) {
		// 9 of each: rows, columns and boxes
		for( var secCounter = 1; secCounter <= 9; secCounter++ ) {
			// Need to have each of values 1-9
			// Input values are String so using String here 
			var sudokuValuesTracker = [ '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
			$( section + secCounter ).each( function() {
				var thisInputVal = $(this).val();
				// If this value is in the array remove from array and keep checking if not end this check
				if( $.inArray( thisInputVal, sudokuValuesTracker ) > -1 ) {
					sudokuValuesTracker.splice( $.inArray( thisInputVal, sudokuValuesTracker ), 1 );
				} else {
					return false;
				}
			});
			// If the section just checking idd 
			if( sudokuValuesTracker.length !== 0 ) {
				return false;
			}
		}
		// If everything is good keep going
		return true;
	};

	// **********
	// Clear board on clear button click
	// **********
	$( '#clear-all' ).click( function() {
		$( '.blank' ).val( '' );
	});

	// **********
	// Reset board dimensions on window resize
	// **********
	$window.resize( function() {
		// Check to ensure window was resized and do not call each miniscule increment
		if( $windowWidthAdj !== $window.width() * gameWidth || $windowHeightAdj !== $window.height() * gameWidth ){

			clearTimeout( resizeSetTimeout );

			resizeSetTimeout = setTimeout( function(){
				$windowWidthAdj = $window.width() * gameWidth;
				$windowHeightAdj = $window.height() * gameWidth;
				gameDimensions = 768 * gameWidth;
				setBoardDimensions();
			}, 200);

		}
	});
});