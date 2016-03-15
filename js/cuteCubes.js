'use strict'

var clock, container, camera, scene, renderer, controls, effect, manager, listener, loader, loaderStroke;
var cameraRails = new THREE.Object3D();
var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
var sound1, sound2, sound3;
var	toogle = 0;
var sky;
var cuteCube;
var cubesArr = [];
var ground, positionalGround;
var light, pointL1, pointL2, pointL3;
var lightsArr = [];
var isPaused = false;
var initMinRadius = 2;
var initMaxRadius = 4;
var originPos;
var worldPosition = new THREE.Vector3();

if ( WEBVR.isAvailable() === undefined ) {

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

	cameraRails.add ( camera );
	cameraRails.position.y = 1.3;
	originPos = worldPosition.setFromMatrixPosition( cameraRails.matrixWorld );

	scene.add( cameraRails );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	effect = new THREE.VREffect( renderer );
	effect.setSize( window.innerWidth, window.innerHeight );

	container.innerHTML = '';
	container.appendChild( renderer.domElement );

	// CONTROLS
	controls = new THREE.VRControls( camera );
	manager = new WebVRManager( renderer, effect, { hideButton: false } );

	var skyGeo = new THREE.SphereGeometry( 4500, 32, 15 );

	//Sky
	loader = new THREE.TextureLoader();

	loader.load( 'assets/stars.jpg', function( texture ) {

		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;

		sky = new THREE.Mesh( skyGeo, new THREE.MeshBasicMaterial( { map : texture, side: THREE.BackSide } ) );
		sky.rotation.y = Math.PI / 2;
		scene.add( sky );

	} );

	//Lights
	light = new THREE.AmbientLight( 0x404040 );
	// scene.add( light );

	pointL1 = new THREE.PointLight( 0x404040, 2, 7 );
	pointL1.position.set( 0, 3, 0 );
	scene.add( pointL1 );

	//Ground
	var planeGeometry = new THREE.PlaneBufferGeometry( 50, 50, 50, 50 );
	planeGeometry.rotateX( - Math.PI / 2 );

	ground = new THREE.Mesh( planeGeometry, new THREE.MeshLambertMaterial( { wireframe: true } ) );
	scene.add( ground );

	var planePosGeometry = new THREE.PlaneBufferGeometry( 4, 3, 4, 3 );
	planePosGeometry.rotateX( - Math.PI / 2 );
	positionalGround = new THREE.Mesh( planePosGeometry, new THREE.MeshLambertMaterial( { color: 0x404040 } ) );
	scene.add( positionalGround );

	cuteCube = new CuteCube();
	cuteCube.addEventListener( 'ready', cuteCubeReady.bind( this ) );

	// 	//Load sounds
	// 	sound1 = new THREE.PositionalAudio( listener );
	// 	sound1.load( 'audio/base.ogg' );
	// 	sound1.setRefDistance( 2.5 );
	// 	sound1.source.loop = true;
	// 	sound1.autoplay = true;
	// 	cube.add( sound1 );
	//
	// 	sound2 = new THREE.PositionalAudio( listener );
	// 	sound2.load( 'audio/mistery.ogg' );
	// 	sound2.setRefDistance( 2 );
	// 	sound2.source.loop = true;
	// 	sound2.autoplay = true;
	// 	// houseMistery.add( sound2 );
	//
	// 	sound3 = new THREE.PositionalAudio( listener );
	// 	sound3.load( 'audio/equal.ogg' );
	// 	sound3.setRefDistance( 1 );
	// 	sound3.source.loop = true;
	// 	sound3.autoplay = true;
	// 	// pyramidEqual.add( sound3 );

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

	animate();

}

function cuteCubeReady() {

	for ( var i = 0; i < 50; i ++ ) {

		//¿Random position and mass?
		var cube = new THREE.Mesh( cuteCube.geometry, cuteCube.material.clone() );

		var randomAngle = Math.PI * 2 * Math.random();
		var randomRadius = randomRange( initMinRadius, initMaxRadius );
		cube.position.z = Math.sin( randomAngle ) * randomRadius;
		cube.position.x = Math.cos( randomAngle ) * randomRadius;

		cube.lookAt( new THREE.Vector3( originPos.x,0,originPos.z ) );
		cubesArr.push( cube );
		scene.add( cube );

	}

}

function randomRange ( min, max ) {

	return min + Math.random() * ( max - min );

};

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	resolution.set( window.innerWidth, window.innerHeight );

}

function animate( timestamp ) {

	if ( isPaused ) {

		return;

	}
	toogle += 0.02;
	// Update VR headset position and apply to camera.
	controls.update();

	// Render the scene through the manager.
	manager.render( scene, camera, timestamp );

	requestAnimationFrame( animate );

}

function pauseAll( bool ) {

	isPaused = bool;
	// if ( bool ) {
	//
	// 	sound1.pause();
	// 	sound2.pause();
	// 	sound3.pause();
	//
	// } else {
	//
	// 	animate();
	// 	sound1.play();
	// 	sound2.play();
	// 	sound3.play();
	//
	// }

}
