'use strict'

var clock, container, camera, scene, renderer, controls, effect, listener, loader;

var cameraSpectator, cameraAsset1, cameraAsset, rendererSpectator;

var vrMode = false;
var vrDisplay = null;
//Strings with the different moments of the experience
//0 - far cubes asking who are you
//1 - close cubes saying mmmm interesting
//2 - closest cubes laugh and saiyng I looove u
var stage = 0;

var userHeight = 1.7;
var totalCubes = 15;
var sky;
var cuteCubeMesh;
var cubesArr = [];
var ground, secureArea;
var light, pointL1;
var lightsArr = [];
var isPaused = false;
var initMinRadius = 4;
var initMaxRadius = 7;
var originPos;
var worldPosition = new THREE.Vector3();
var totalTime = 0;

var keyManager;

var handsLoaded = false;
var gamepadL,gamepadR;
var standingMatrix = new THREE.Matrix4();
var animationActiveR = 'rock';
var animationActiveL = 'rock';
var button0Lpressed = false;
var button2Lpressed = false;
var button3Lpressed = false;
var button0Rpressed = false;
var button2Rpressed = false;
var button3Rpressed = false;

//For touch controls (fallback for testing without VR)
var mouse = new THREE.Vector2();

var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

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

	listener = new THREE.AudioListener();
	camera.add( listener );

	cameraSpectator = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.05, 1000000 );
	// cameraSpectator.up = new THREE.Vector3( 0,0,1 );
	cameraSpectator.layers.enable( 1 );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	rendererSpectator = new THREE.WebGLRenderer( { antialias: true } );
	rendererSpectator.setPixelRatio( window.devicePixelRatio );
	rendererSpectator.setSize( window.innerWidth, window.innerHeight );
	rendererSpectator.shadowMap.enabled = true;
	rendererSpectator.shadowMap.type = THREE.PCFSoftShadowMap;

	effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = '';
	container.appendChild( rendererSpectator.domElement );
	// container.appendChild( renderer.domElement );

	// CONTROLS
	if ( navigator.getVRDisplays || navigator.getVRDevices ) {

		controls = new THREE.VRControls( camera, vrFallback );
		controls.standing = true;
		vrMode = true;

		navigator.getVRDisplays().then( function ( displays ) {

			if ( displays.length > 0 ) {

				vrDisplay = displays[ 0 ];

				if ( vrDisplay.stageParameters ) {

					// console.log( vrDisplay.stageParameters );
					var secureGeo = new THREE.PlaneGeometry(  vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ, 32, 32 );
					initMinRadius = Math.max( vrDisplay.stageParameters.sizeX, vrDisplay.stageParameters.sizeZ );
					initMaxRadius = initMinRadius + 4;

					secureGeo.rotateX( - Math.PI / 2 );

					secureArea = new THREE.Mesh( secureGeo, new THREE.MeshLambertMaterial( { color: 0x999999 } ) );
					secureArea.receiveShadow = true;
					secureArea.position.y = - 0.01;
					scene.add( secureArea );

				}

			}

		} );

	} else {

		camera.position.set ( 0, userHeight, 0 );
		vrFallback();

	}

	//Physical camera assets
	// cameraAsset = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.1, 0.3 ), new THREE.MeshLambertMaterial( { color: 0x2194CE } ) );

	cameraAsset1 = new THREE.Mesh( new THREE.BoxGeometry( 0.1, 0.25, 0.3 ), new THREE.MeshLambertMaterial( { color: 0x444444 } ) );
	camera.add( cameraAsset1 );
	scene.add( cameraAsset1 );

	cameraAsset = new THREE.Mesh( new THREE.BoxGeometry( 0.2, 0.2, 0.3 ), new THREE.MeshLambertMaterial( { color: 0x2194CE } ) );
	cameraAsset.position.set ( 2.5, 1.5, - 2.5 );
	cameraAsset.add( cameraSpectator );
	scene.add ( cameraAsset );
	//Sky
	var skyGeo = new THREE.SphereGeometry( 450, 32, 15 );
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
	var objectLoader = new THREE.ObjectLoader();
	objectLoader.load( "assets/ground.json", function ( obj ) {

		ground = obj.children[ 0 ];
		ground.receiveShadow = true;
		ground.geometry.computeVertexNormals();
		scene.add( ground );

	} );

	gamepadL = new THREE.BlendCharacter();
	gamepadL.load( "assets/handL.json", loadHandR );

	// Cute cubes
	cuteCubeMesh = new CuteCubeMesh();
	cuteCubeMesh.addEventListener( 'ready', addCuteCubes.bind( this ) );

	if ( WEBVR.isAvailable() === true ) {

		document.body.appendChild( WEBVR.getButton( effect ) );

	}

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

}

function loadHandR () {

	gamepadL.castShadow = true;
	gamepadL.material.shading = THREE.FlatShading;
	scene.add( gamepadL );

	gamepadR = new THREE.BlendCharacter();
	gamepadR.load( "assets/handR.json", addHandR );
	// animate();

}

function addHandR () {

	gamepadR.castShadow = true;
	gamepadR.material.shading = THREE.FlatShading;
	scene.add( gamepadR );

	handsLoaded = true;
	animate();

}

function addCuteCubes() {

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

	mouse.x = 0;
	mouse.y = 0;
	controls = new THREE.TouchControls( camera, mouse, 0 );

	//Only for debug purposes
	keyManager = new KeyManager( camera );

}

function enterVR() {

	//dispatch from WebVR.js
	onWindowResize();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	cameraSpectator.aspect = window.innerWidth / window.innerHeight;
	cameraSpectator.updateProjectionMatrix();

	if ( vrMode ) {

		if ( vrDisplay && vrDisplay.isPresenting ) {

			var leftEye = vrDisplay.getEyeParameters( "left" );
			var rightEye = vrDisplay.getEyeParameters( "right" );

			var width = Math.max( leftEye.renderWidth, rightEye.renderWidth ) * 2;
			var height = Math.max( leftEye.renderHeight, rightEye.renderHeight );

			effect.setSize( width, height );

		}
		//TODO trying to improve mirroring
		// console.log( container.childNodes[ 0 ] )
		// container.childNodes[ 0 ].width  = window.innerWidth;
		// container.childNodes[ 0 ].height = window.innerHeight;
		// container.childNodes[ 0 ].style.width = window.innerWidth;
		// container.childNodes[ 0 ].style.height = window.innerHeight;

	} else {

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	rendererSpectator.setSize( window.innerWidth, window.innerHeight );

}

function animate( timestamp ) {

	if ( isPaused ) {

		return;

	}

	requestAnimationFrame( animate );
	render( timestamp );

}


function render( timestamp ) {

	if ( vrMode ) {

		if ( handsLoaded ) {

			updateGamepads();

		}

		effect.render( scene, camera );

	} else {

		keyManager.update();
		renderer.render( scene, camera );

	}
	rendererSpectator.render( scene, cameraSpectator );
	var v = new THREE.Vector3();
	v.subVectors( cameraAsset.position, camera.position ).add( cameraAsset.position );
	cameraAsset.lookAt( v );
	cameraAsset1.position.set( camera.position.x, camera.position.y, camera.position.z );
	cameraAsset1.rotation.set( camera.rotation.x, camera.rotation.y, camera.rotation.z );
	// Update VR headset position and apply to camera.
	controls.update();

	totalTime = Math.round( timestamp / 1000 );
	// console.log(totalTime);
	if ( totalTime < 45 ) {

		stage = 0;

	} else if ( totalTime >= 45 && totalTime < 75 ) {

		stage = 1;

	}else if ( totalTime >= 75 ) {

		stage = 2;

	}
	for ( var i = 0; i < cubesArr.length; i ++ ) {

		cubesArr[ i ].applyBehaviors( cubesArr );
		cubesArr[ i ].setSecureDistance( stage );
		cubesArr[ i ].update( timestamp );
		var godPos = worldPosition.setFromMatrixPosition( camera.matrixWorld );
		cubesArr[ i ].lookAt( new THREE.Vector3( godPos.x,0,godPos.z ) );

	}

}


function updateGamepads() {

	if ( ! vrDisplay ) {

		return;

	}

	var delta = clock.getDelta();

	gamepadR.update( delta );
	gamepadL.update( delta );

	var gamepads = navigator.getGamepads();
	for ( var i = 0; i < gamepads.length; ++ i ) {

		var gamepad = gamepads[ i ];
		if ( gamepad && gamepad.pose ) {

			var hand;
			if ( i === 0 ) {

				hand = gamepadR;

			}else {

				hand = gamepadL;

			}
			// console.log( gamepad );
			// Because this sample is done in standing space we need to apply
			// the same transformation to the gamepad pose as we did the
			// VRDisplay's pose.
			// getPoseMatrix(gamepadMat, gamepad.pose);
			updateGamepadPose( hand, gamepad.pose );
			// Loop through all the gamepad's axes and rotate the cube by their
			// value.
			// console.log( gamepad );
			//TODO implement trackpad control
			// for ( var j = 0; j < gamepad.axes.length; ++ j ) {
			//
			// 	switch ( j % 3 ) {
			// 		case 0:
			// 			// mat4.rotateX( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
			// 			// console.log( gamepad.axes[ j ] * Math.PI );
			// 			hand.applyMatrix( new THREE.Matrix4().makeRotationX( gamepad.axes[ j ] * Math.PI ) );
			// 			break;
			// 		case 1:
			// 			// mat4.rotateY( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
			// 			// console.log( gamepad.axes[ j ] * Math.PI );
			// 			hand.applyMatrix( new THREE.Matrix4().makeRotationY( gamepad.axes[ j ] * Math.PI ) );
			// 			break;
			// 		case 2:
			// 			// mat4.rotateZ( gamepadMat, gamepadMat, gamepad.axes[ j ] * Math.PI );
			// 			// console.log( gamepad.axes[ j ] * Math.PI );
			// 			hand.applyMatrix( new THREE.Matrix4().makeRotationZ( gamepad.axes[ j ] * Math.PI ) );
			// 			break;
			// 	}
			//
			// }

			for ( var j = 0; j < gamepad.buttons.length; ++ j ) {

				if ( gamepad.buttons[ j ].pressed ) {

					manageButtons( i, j, gamepad.buttons[ j ].value, gamepad.buttons[ j ].pressed );

				}else {

					manageButtons( i, j, gamepad.buttons[ j ].value, gamepad.buttons[ j ].pressed );

				}

			}

		}

	}

}

function updateGamepadPose ( pad, pose ) {

	pad.quaternion.fromArray( pose.orientation );
	pad.position.fromArray( pose.position );

	if ( vrDisplay.stageParameters ) {

		pad.updateMatrix();

		standingMatrix.fromArray( vrDisplay.stageParameters.sittingToStandingTransform );
		pad.applyMatrix( standingMatrix );
		// pad.geometry.computeFaceNormals();
		pad.geometry.computeVertexNormals();

	}

}

function manageButtons( handId, buttonId, intensity, pressed ) {

	if ( buttonId !== 0 && buttonId !== 2 && buttonId !== 3 ) {

		return;

	}
	// console.log( handId, buttonId, intensity, pressed );
	// handId
	// 0 - right
	// 1 - left

	// buttonId
	// 0 - trackpad
	// 1 - system ( never dispatched on this layer )
	// 2 - trigger ( intensity value from 0.5 to 1 )
	// 3 - grip
	// 4 - menu ( dispatch but better for menu options )

	// animations for each buttonId
	// close - trigger
	// rock - grip
	// thumb - trackpad
	var button0pressed;
	var button2pressed;
	var button3pressed;
	if ( handId === 0 ) {

		button0pressed = button0Rpressed;
		button2pressed = button2Rpressed;
		button3pressed = button3Rpressed;

	}else {

		button0pressed = button0Lpressed;
		button2pressed = button2Lpressed;
		button3pressed = button3Lpressed;

	}
	var animation;
	switch ( buttonId ) {
		case 0:
			if ( button0pressed === pressed ) {

				return;

			}
			if ( handId === 0 ) {

				button0Rpressed = pressed;

			}else {

				button0Lpressed = pressed;

			}
			animation = 'thumb';
			break;
		case 2:
			if ( button2pressed === pressed ) {

				return;

			}
			if ( handId === 0 ) {

				button2Rpressed = pressed;

			}else {

				button2Lpressed = pressed;

			}
			animation = 'close';
			break;
		case 3:
			if ( button3pressed === pressed ) {

				return;

			}
			if ( handId === 0 ) {

				button3Rpressed = pressed;

			}else {

				button3Lpressed = pressed;

			}
			animation = 'rock';
			break;
	}

	var timeScale = - 1;
	if ( pressed ) {

		timeScale = 1;

	}
	if ( animation ) {

		playOnce ( handId, animation, timeScale );

	}

}
function playOnce( hand, animation, timeScale ) {

	// TODO fix aramtures on blend files
	// return;
	// console.log( hand, animation, timeScale );
	var activeHand;
	var animationActive;

	if ( hand === 0 ) {

		activeHand = gamepadR;
		animationActive = animationActiveR;

	}else {

		activeHand = gamepadL;
		animationActive = animationActiveL;

	}

	if ( animation === animationActive && activeHand.mixer.clipAction( animationActive ).timeScale === timeScale ) {

		return;

	}
	activeHand.mixer.clipAction( animation ).loop = 2200;
	activeHand.mixer.clipAction( animation ).clampWhenFinished = true;
	activeHand.mixer.clipAction( animation ).timeScale = timeScale;
	activeHand.play ( animationActive, 0 );
	activeHand.play ( animation, 1 );

	if ( hand === 0 ) {

		animationActiveR = animation;

	}else {

		animationActiveL = animation;

	}

}

function pauseAll( bool ) {

	isPaused = bool;

	if ( ! isPaused ) {

		animate();

	}

}
