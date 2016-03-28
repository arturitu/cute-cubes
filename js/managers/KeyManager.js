var KeyManager = function ( camera ) {

	'use strict';

	var moveForward = false;
	var moveBackwards = false;
	var moveLeft = false;
	var moveRight = false;
	var radiusLimit = 2;

	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );

	function onDocumentKeyDown( event ) {

		switch ( event.keyCode ) {

			case 38: moveForward = true; break; // up
			case 40: moveBackwards = true; break; // down
			case 37: moveLeft = true; break; // left
			case 39: moveRight = true; break; // right
		}

	}

	function onDocumentKeyUp( event ) {

		switch ( event.keyCode ) {

			case 38: moveForward = false; break; // up
			case 40: moveBackwards = false; break; // down
			case 37: moveLeft = false; break; // left
			case 39: moveRight = false; break; // right

		}

	}

	function update() {

		// TODO FIX position when looks down (change z, x position)
		if ( camera.position.z > - radiusLimit && camera.position.z < radiusLimit ) {

			if ( moveForward ) {

				camera.position.z -= 0.05 * Math.cos( camera.rotation.y );
				camera.position.x -= 0.05 * Math.sin( camera.rotation.y );

			}
			if ( moveBackwards ) {

				camera.position.z += 0.05 * Math.cos( camera.rotation.y );
				camera.position.x += 0.05 * Math.sin( camera.rotation.y );

			}

			if ( camera.position.z < - radiusLimit ) {

				camera.position.z = - radiusLimit + 0.02;

			}

			if ( camera.position.z > radiusLimit ) {

				camera.position.z = radiusLimit - 0.02;

			}

		}

		if ( camera.position.x > - radiusLimit && camera.position.x < radiusLimit ) {

			if ( moveLeft ) {

				camera.position.x -= 0.05 * Math.cos( camera.rotation.y );
				camera.position.z += 0.05 * Math.sin( camera.rotation.y );

			}
			if ( moveRight ) {

				camera.position.x += 0.05 * Math.cos( camera.rotation.y );
				camera.position.z -= 0.05 * Math.sin( camera.rotation.y );

			}

			if ( camera.position.x < - radiusLimit ) {

				camera.position.x = - radiusLimit + 0.02;

			}

			if ( camera.position.x > radiusLimit ) {

				camera.position.x = radiusLimit - 0.02;

			}

		}

	}

	return {
		update: update
	}

}
