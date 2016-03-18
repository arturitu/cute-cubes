'use strict'

var clock, container, camera, scene, renderer, controls, effect, listener, loader;
var vrMode = false;
var	toogle = 0;
var userHeight = 1.3;
var totalCubes = 2;
var sky;
var cuteCubeMesh;
var cubesArr = [];
var ground, positionalGround;
var light, pointL1, pointL2, pointL3;
var lightsArr = [];
var isPaused = false;
var initMinRadius = 2;
var initMaxRadius = 4;
var originPos;
var worldPosition = new THREE.Vector3();

if ( WEBVR.isLatestAvailable() === false ) {

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

	camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.05, 1000000 );

	listener = new THREE.AudioListener();
	camera.add( listener );

	scene = new THREE.Scene();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = '';
	container.appendChild( renderer.domElement );

	// CONTROLS
	if ( navigator.getVRDisplays || navigator.getVRDevices ) {

		controls = new THREE.VRControls( camera, vrFallback );
		vrMode = true;

	} else {

		vrFallback();

	}

	var skyGeo = new THREE.SphereGeometry( 4500, 32, 15 );

	//Sky
	loader = new THREE.TextureLoader();

	loader.load( 'assets/stars.jpg', function( texture ) {

		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;

		sky = new THREE.Mesh( skyGeo, new THREE.MeshBasicMaterial( { map : texture, side: THREE.BackSide } ) );
		sky.rotation.y = Math.PI / 2;
		// scene.add( sky );

	} );

	//Lights
	light = new THREE.AmbientLight( 0x404040 );
	scene.add( light );

	pointL1 = new THREE.PointLight( 0x404040, 2, 7 );
	pointL1.position.set( 0, 3, 0 );
	scene.add( pointL1 );

	//Ground
	var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 50, 50 );
	planeGeometry.rotateX( - Math.PI / 2 );

	ground = new THREE.Mesh( planeGeometry, new THREE.MeshLambertMaterial( { wireframe: true } ) );
	// scene.add( ground );

	var planePosGeometry = new THREE.PlaneBufferGeometry( 4, 3, 4, 3 );
	planePosGeometry.rotateX( - Math.PI / 2 );
	positionalGround = new THREE.Mesh( planePosGeometry, new THREE.MeshLambertMaterial( { color: 0x404040 } ) );
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

		var cube = new CuteCube( xRnd, zRnd, cuteCubeMesh, camera );
		cube.name = 'cube' + i;
		cubesArr.push( cube );
		scene.add( cube );

	}

}

function randomRange ( min, max ) {

	return min + Math.random() * ( max - min );

}

function vrFallback() {

	camera.position.set ( - 2, 2, - 2 );
	controls = new THREE.OrbitControls( camera );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	if ( vrMode ) {

		effect.setSize( window.innerWidth, window.innerHeight );

	} else {

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

}

function animate( timestamp ) {

	if ( isPaused ) {

		return;

	}

	if ( vrMode ) {

		effect.render( scene, camera );

	} else {

		renderer.render( scene, camera );

	}
	// Update VR headset position and apply to camera.
	controls.update();

	requestAnimationFrame( animate );

	for ( var i = 0; i < cubesArr.length; i ++ ) {

		cubesArr[ i ].applyBehaviors( cubesArr );
		cubesArr[ i ].update();
		var godPos = worldPosition.setFromMatrixPosition( camera.matrixWorld );
		cubesArr[ i ].lookAt( new THREE.Vector3( godPos.x,0,godPos.z ) );

	}

}

function pauseAll( bool ) {

	isPaused = bool;

	if ( ! isPaused ) {

		animate();

		for ( var i = 0; i < cubesArr.length; i ++ ) {

			cubesArr[ i ].wakeUp();

		}

	}else {

		for ( var i = 0; i < cubesArr.length; i ++ ) {

			cubesArr[ i ].sleep();

		}

	}



}
