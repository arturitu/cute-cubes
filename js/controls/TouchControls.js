/**
 * Based on canvas_geometry_panorama example
 */

THREE.TouchControls = function ( object, mouse, relLon ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( 'YXZ' );

	this.mouse = mouse;
	this.relLon = relLon;

	var isUserInteracting = false,
	onMouseDownMouseX = 0, onMouseDownMouseY = 0,
	onPointerDownPointerX = 0, onPointerDownPointerY = 0,
	lon = 90 + this.relLon, onMouseDownLon = 0,
	lat = 0, onMouseDownLat = 0,
	phi = 0, theta = 0;
	target = new THREE.Vector3();

	function onDocumentTouchStart( event ) {

		if ( event.originalEvent.touches.length == 1 ) {

			event.preventDefault();

			onPointerDownPointerX = event.originalEvent.touches[ 0 ].pageX;
			onPointerDownPointerY = event.originalEvent.touches[ 0 ].pageY;

			onPointerDownLon = lon;
			onPointerDownLat = lat;

			scope.mouse.x = ( event.originalEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			scope.mouse.y = - ( event.originalEvent.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

		}

	}

	function onDocumentTouchMove( event ) {

		if ( event.originalEvent.touches.length == 1 ) {

			event.originalEvent.preventDefault();

			scope.mouse.x = ( event.originalEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
			scope.mouse.y = - ( event.originalEvent.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

			lon = ( event.originalEvent.touches[ 0 ].pageX - onPointerDownPointerX ) * 0.5 + onPointerDownLon;
			lat = ( event.originalEvent.touches[ 0 ].pageY - onPointerDownPointerY ) * 0.5 + onPointerDownLat;

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		isUserInteracting = true;

		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;

	}

	function onDocumentMouseMove( event ) {

		scope.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		scope.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		scope.mouse.posX = event.clientX;
		scope.mouse.posY = event.clientY;


		if ( isUserInteracting === true ) {

			lon = ( event.clientX - onPointerDownPointerX  ) * 0.2 + onPointerDownLon;
			lat = ( event.clientY - onPointerDownPointerY ) * 0.2 + onPointerDownLat;

		}

	}

	function onDocumentMouseUp( event ) {

		isUserInteracting = false;

	}

	function onDocumentTouchEnd( event ) {

		isUserInteracting = false;

	}

	this.restoreAll = function (  ) {

		lon = 90 + this.relLon ;
		lat = 0;

	}

	this.restoreTouchControls = function ( angle ) {

		lon = 90 + this.relLon - angle;
		lat = 0;

	}

	this.update = function () {

		// console.log ( lon, lat );
		lat = Math.max( - 85, Math.min( 85, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );
		// console.log ( phi, theta );

		target.x = 50 * Math.sin( phi ) * Math.cos( theta );
		target.y = 50 * Math.cos( phi );
		target.z = - 50 * Math.sin( phi ) * Math.sin( theta );
		this.object.lookAt( target );

	};

	this.connect = function() {

		//console.log('tou');
		document.getElementById( 'container' ).addEventListener( 'mousedown', function( event ) {

			onDocumentMouseDown( event );

		} );
		document.getElementById( 'container' ).addEventListener( 'touchstart', function( event ) {

			//console.log('-t-');
			onDocumentTouchStart( event );

		} );

		document.getElementById( 'container' ).addEventListener( 'mousemove', function( event ) {

			onDocumentMouseMove( event );

		} );
		document.getElementById( 'container' ).addEventListener( 'touchmove', function( event ) {

			onDocumentTouchMove( event );

		} );

		document.getElementById( 'container' ).addEventListener( 'mouseup', function( event ) {

			onDocumentMouseUp( event );

		} );
		document.getElementById( 'container' ).addEventListener( 'touchend', function( event ) {

			onDocumentTouchEnd( event );

		} );

	};


	this.disconnect = function() {

		//console.log('disconnect');
		document.getElementById( 'container' ).removeEventListener( 'mousedown' );
		document.getElementById( 'container' ).removeEventListener( 'touchstart' );

		document.getElementById( 'container' ).removeEventListener( 'mousemove' );
		document.getElementById( 'container' ).removeEventListener( 'touchmove' );

		document.getElementById( 'container' ).removeEventListener( 'mouseup' );
		document.getElementById( 'container' ).removeEventListener( 'touchend' );

	};
	this.connect();

};
