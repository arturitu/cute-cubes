'use strict'

var clock, container, camera, scene, renderer, controls, effect, listener, loader;
var vrMode = false;
var vrDisplay = null;
var	toogle = 0;
var userHeight = 1.8;
var totalCubes = 20;
var sky;
var cuteCubeMesh;
var cubesArr = [];
var ground, positionalGround;
var light, pointL1, pointL2, pointL3;
var lightsArr = [];
var isPaused = false;
var initMinRadius = 0.1;
var initMaxRadius = 0.5;
var originPos;
var worldPosition = new THREE.Vector3();
var totalTime = 0;

//For touch controls (fallback for testing without VR)
var mouse = new THREE.Vector2();
var moveForward = false;
var moveBackwards = false;
var moveLeft = false;
var moveRight = false;
var radiusLimit = 2;

var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

// if ( ('speechSynthesis' in window) && ('webkitSpeechRecognition' in window) ) {
//
// 	console.log( 'yea' );
//
// } else {
//
// 	console.log( 'non' );
//
// }

if ( WEBVR.isLatestAvailable() === false ) {

	SHADOW_MAP_WIDTH = 2048;
	SHADOW_MAP_HEIGHT = 2048;
	document.body.appendChild( WEBVR.getMessage() );

}


init();

function init() {

	window.onfocus = function() {

		pauseAll ( false );

	};
	window.onblur = function() {

		pauseAll ( true );

	};

	container = document.getElementById( 'container' );

	container.classList.add( 'handOpen' );

	clock = new THREE.Clock();

	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.05, 1000000 );
	camera.layers.enable( 1 );
	// camera.position.set ( 0, userHeight, 0 );

	listener = new THREE.AudioListener();
	camera.add( listener );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = '';
	container.appendChild( renderer.domElement );

	// CONTROLS
	if ( navigator.getVRDisplays || navigator.getVRDevices ) {

		controls = new THREE.VRControls( camera, vrFallback );
		controls.standing = true;
		vrMode = true;

		navigator.getVRDisplays().then( function ( displays ) {

			if ( displays.length > 0 ) {

				vrDisplay = displays[ 0 ];

				// console.log( vrDisplay );

				if ( vrDisplay.stageParameters ) {

					// console.log( vrDisplay.stageParameters.sittingToStandingTransform );
					var secureGeo = new THREE.PlaneGeometry(  vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ, 32, 32 );
					secureGeo.rotateX( - Math.PI / 2 );

					var secure = new THREE.Mesh( secureGeo, new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
					// console.log( secure.geometry );
					secure.position.fromArray( vrDisplay.stageParameters.sittingToStandingTransform );
					secure.receiveShadow = true;
					// console.log( secure.position );
					scene.add( secure );

				}

			}

		} );

	} else {

		vrFallback();

	}

	var skyGeo = new THREE.SphereGeometry( 450, 32, 15 );

	//Sky
	var skyBox = new THREE.Mesh( skyGeo, new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader().load( 'assets/panoleft.png' ), side: THREE.BackSide } ) );
	skyBox.layers.set( 1 );
	scene.add( skyBox );


	var skyBoxR = new THREE.Mesh( skyGeo, new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader().load( 'assets/panoright.png' ), side: THREE.BackSide } ) );
	skyBoxR.layers.set( 2 );
	scene.add( skyBoxR );

	//Lights
	light = new THREE.AmbientLight( 0x404050, 3 );
	scene.add( light );

	pointL1 = new THREE.PointLight( 0x404050, 3, 0 );
	pointL1.castShadow = true;
	pointL1.shadow.camera.near = 1;
	pointL1.shadow.camera.far = 30;
	pointL1.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	pointL1.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
	pointL1.shadow.bias = 0.001;
	pointL1.position.set( - 3, 5, - 3 );
	scene.add( pointL1 );

	//Ground

	var planePosGeometry = new THREE.PlaneBufferGeometry( 10, 10, 50, 50 );
	planePosGeometry.rotateX( - Math.PI / 2 );
	positionalGround = new THREE.Mesh( planePosGeometry, new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true } ) );
	positionalGround.receiveShadow = true;
	scene.add( positionalGround );

	cuteCubeMesh = new CuteCubeMesh();
	cuteCubeMesh.addEventListener( 'ready', cuteCubeMeshReady.bind( this ) );

	if ( WEBVR.isAvailable() === true ) {

		document.body.appendChild( WEBVR.getButton( effect ) );

	}

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

	animate();

}

function cuteCubeMeshReady() {

	for ( var i = 0; i < totalCubes; i ++ ) {

		var randomAngle = Math.PI * 2 * Math.random();
		var randomRadius = randomRange( initMinRadius, initMaxRadius );

		var xRnd = Math.cos( randomAngle ) * randomRadius;
		var zRnd = Math.sin( randomAngle ) * randomRadius;

		var cube = new CuteCube( i, totalCubes, xRnd, zRnd, cuteCubeMesh, camera, listener );
		cubesArr.push( cube );
		scene.add( cube );

	}

}

function randomRange ( min, max ) {

	return min + Math.random() * ( max - min );

}

function vrFallback() {

	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );
	// camera.position.set( 0, 2, 0 );
	// controls = new THREE.OrbitControls( camera );
	mouse.x = 0;
	mouse.y = 0;
	controls = new THREE.TouchControls( camera, mouse, 0 );

}

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

function enterVR() {

	//dispatch from WebVR.js
	onWindowResize();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	if ( vrMode ) {

		if ( vrDisplay && vrDisplay.isPresenting ) {

			var leftEye = vrDisplay.getEyeParameters( "left" );
			var rightEye = vrDisplay.getEyeParameters( "right" );

			var width = Math.max( leftEye.renderWidth, rightEye.renderWidth ) * 2;
			var height = Math.max( leftEye.renderHeight, rightEye.renderHeight );

			effect.setSize( width, height );

		}else {

			effect.setSize( window.innerWidth, window.innerHeight );

		}

		// console.log( container.childNodes[ 0 ] )
		// container.childNodes[ 0 ].width  = window.innerWidth;
		// container.childNodes[ 0 ].height = window.innerHeight;
		// container.childNodes[ 0 ].style.width = window.innerWidth;
		// container.childNodes[ 0 ].style.height = window.innerHeight;

	} else {

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

}

function animate( timestamp ) {

	if ( isPaused ) {

		return;

	}

	requestAnimationFrame( animate );
	render( timestamp );

}


function render( timestamp ) {

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

	if ( vrMode ) {

		effect.render( scene, camera );
		var gamepads = navigator.getGamepads();
		for ( var i = 0; i < gamepads.length; ++ i ) {

			var gamepad = gamepads[ i ];
			if ( gamepad && gamepad.pose ) {

				// Because this sample is done in standing space we need to apply
				// the same transformation to the gamepad pose as we did the
				// VRDisplay's pose.
				// getPoseMatrix(gamepadMat, gamepad.pose);

				// Loop through all the gamepad's axes and rotate the cube by their
				// value.
				for ( var j = 0; j < gamepad.axes.length; ++ j ) {

					switch ( j % 3 ) {
						case 0:
							mat4.rotateX( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
							break;
						case 1:
							mat4.rotateY( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
							break;
						case 2:
							mat4.rotateZ( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
							break;
					}

				}

				// Show the gamepad's cube as red if any buttons are pressed, blue
				// otherwise.
				vec4.set( gamepadColor, 0, 0, 1, 1 );
				for ( var j = 0; j < gamepad.buttons.length; ++ j ) {

					if ( gamepad.buttons[ j ].pressed ) {

						vec4.set( gamepadColor, gamepad.buttons[ j ].value, 0, 0, 1 );
						break;

					}

				}

				debugGeom.drawBoxWithMatrix( gamepadMat, gamepadColor );

			}

		}

	} else {

		renderer.render( scene, camera );

	}
	// Update VR headset position and apply to camera.
	controls.update();

	totalTime = Math.round( timestamp / 1000 );
	// console.log(totalTime);
	for ( var i = 0; i < cubesArr.length; i ++ ) {

		if ( totalTime > 60 && totalTime < 120 ) {

			cubesArr[ i ].setSecureDistance( 1 );

		}
		if ( totalTime > 120 ) {

			cubesArr[ i ].setSecureDistance( 0.3 );

		}
		cubesArr[ i ].applyBehaviors( cubesArr );
		cubesArr[ i ].update( timestamp );
		var godPos = worldPosition.setFromMatrixPosition( camera.matrixWorld );
		cubesArr[ i ].lookAt( new THREE.Vector3( godPos.x,0,godPos.z ) );

	}
	// console.log(renderer.info.memory);

}

function pauseAll( bool ) {

	isPaused = bool;

	if ( ! isPaused ) {

		animate();

	}

	for ( var i = 0; i < cubesArr.length; i ++ ) {

		cubesArr[ i ].pauseAll( bool );

	}



}
