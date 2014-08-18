$( function() {

	var $winScreen = $( '#win-screen' ),
		addNote = false,
		timerTracker = 0,
		timer,
		entryNum,
		curFocusInput;

	// **********
	// Verify entry is a number & if board is completed correctly
	// **********
	$( '.blank' ).keypress( function( evt ) {
		// Take care of styling in case previous entry was invalid
		$(this).removeClass( 'invalid' );
		// If entry is not a number do not allow to be entered
		// Else if entry is a number but a value exist clear that value to allow to be overwritten
		if ( !String.fromCharCode( evt.which ).match( /[1-9\.]/ ) ) {
			return false;
		} else {
			entryNum = String.fromCharCode( evt.which );
			$(this).val( '' );
		}
		// Verify entry and then the board is correct
		// Need to use input/propertychange allow to be able to get the most recently entered input
		$(this).on( 'input propertychange', function() {
			var currentValidate = false,
				entryVal = $(this).val(),
				rowClass = $(this).attr("class").match(/row[\w-]*\b/),
				columnClass = $(this).attr("class").match(/column[\w-]*\b/),
				boxClass = $(this).attr("class").match(/box[\w-]*\b/),
				curBoxNum = $(this).attr( 'id' ).slice( -2 );
			// If we are in adding notes mode add a note
			// Else add entry to the input/game
			if ( addNote ){
				// Clear value so notes can show
				$(this).val( '' );
				// Get note number id from
				var noteId = '#notes-' + curBoxNum + ' .notes-' + entryNum;
				// If the notes wrapper is already appended to the input just show the correct note
				// Else append the notes wrapper and then show the correct note
				if ( $(this).next().hasClass( 'notes-wrapper' ) ) {
					$( '#notes-' + curBoxNum ).show();
					$( '#notes-' + curBoxNum + ' .notes-' + entryVal ).show();
				} else {
					$( '.notes-wrapper' ).clone().attr( 'id', 'notes-' + curBoxNum ).insertAfter( $(this) );
					$( '#notes-' + curBoxNum ).show();
					$( '#notes-' + curBoxNum + ' .notes-' + entryVal ).show();
				}
			} else {
				// Clear the notes for this input
				$( '#notes-' + curBoxNum ).hide();
				// Validate the row, the column and the box of the entry
				if( validateInput( rowClass[0], entryVal ) ) {
					if( validateInput( columnClass[0], entryVal ) ) {
						if( validateInput( boxClass[0], entryVal ) ) {
							currentValidate = true;
						}
					}
				}
				// If the entry did not validate within its own row, column, and box signal to user
				// Else validate all rows, then all columns, then all 9 input 'boxes'
				if( !currentValidate ) {
					$(this).addClass( 'invalid' );
				} else {
					if( validateSection( '.row' ) ) {
						if( validateSection( '.column' ) ) {
							if( validateSection( '.box' ) ) {
								$winScreen.show();
							}
						}
					}
				}
			}
		});
	});
	// Helper function for validating the row, column and box the input is in
	var validateInput = function ( section, entryVal ) {
		var isDup = false;
		$( '.' + section ).each( function() {
			// Need to not check the input currently being entered
			if( !$(this).is( ':focus' ) ) {
				if( $(this).val() === entryVal ) {
					isDup = true;
					if ( !$(this).hasClass( 'set' ) ) {
						$(this).addClass( 'invalid' );
					}
				}
			}
		});
		if ( isDup ) {
			return false;
		} else {
			return true;
		}
	};
	// Helper function for validating full puzzle
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
	// Timer handling
	// **********
	var timerFunc = function() {
		// Interval defined in function to be able to be cleared and restarted with play/pause button 
		timer = setInterval( function() {
			$( '#seconds' ).html( addZero( timerTracker % 60 ) );
			$( '#minutes' ).html( addZero( parseInt( timerTracker / 60, 10 ) % 60 ) );
			$( '#hours' ).html( addZero( parseInt( timerTracker / 3600, 10) % 60 ) );
			timerTracker++;
		}, 1000 );
	};
	timerFunc();
	// Helper function to get timer interval to show correctly in clock
	var addZero = function( timeVal ) {
		return timeVal <= 9 ? '0' + timeVal : timeVal;
	};
	// **********
	// Play/Pause button handling
	// **********
	$( '#play-pause' ).click( function() {
		// If button is Play state 
		// Else button is in Pause state
		if ( $(this).text() === $(this).data( 'text-swap' ) ) {
			// Re-start interval and set text to 'Pause'
			timerFunc();
			$(this).text( $(this).data( 'text-original' ));
		} else {
			// Clear timeout to stop timer and set text to 'Play'
			window.clearTimeout(timer);
			$(this).data("text-original", $(this).text());
			$(this).text( $(this).data( 'text-swap' ));
		}
	});

	// **********
	// Handle add note
	// **********
	$( '#add-note' ).click( function( evt ) {
		addNote = !addNote;
		$(this).toggleClass( 'adding-note' );
		$( '#' + curFocusInput ).focus();
	});

	// **********
	// Clear board on clear button click
	// **********
	$( '#clear-all' ).click( function() {
		$( '.blank' ).val( '' );
	});

	// **********
	// Win screen Play Again button handling
	// **********
	$( '#play-again' ).click( function() {
		$( '.blank' ).val( '' );
		$winScreen.hide();
	});


	// **********
	// Win screen Exit button handling
	// **********
	$( '#exit' ).click( function() {
		$winScreen.hide();
	});

	// **********
	// Handle enter - if allow defualt all invalid values become valid
	// **********
	$( 'input' ).on( 'keydown keyup', function( evt ) {
		if( evt.which == 13 ) {
			evt.preventDefault();
		}
	});

	// **********
	// Prevent scroll in input number fields
	// **********
	$( '.blank' ).focus( function ( evt ) {
		evt.preventDefault();
		curFocusInput = $(this).attr( 'id' );
		$(this).on( 'mousewheel', function ( evt ) {
			evt.preventDefault();
		});
	});

});