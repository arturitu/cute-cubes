'use strict'

var clock, container, camera, scene, renderer, controls, effect, listener, loader;
var vrMode = false;
var	toogle = 0;
var userHeight = 1.3;
var totalCubes = 20;
var sky;
var cuteCubeMesh;
var cubesArr = [];
var ground, positionalGround;
var light, pointL1, pointL2, pointL3;
var lightsArr = [];
var isPaused = false;
var initMinRadius = 2.1;
var initMaxRadius = 3;
var originPos;
var worldPosition = new THREE.Vector3();
var totalTime = 0;

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
	camera.position.set ( 0, userHeight, 0 );

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
		vrMode = true;

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
	pointL1.position.set( -3, 5, -3 );
	scene.add( pointL1 );

	//Ground

	var planePosGeometry = new THREE.PlaneBufferGeometry( 10, 10, 1, 1 );
	planePosGeometry.rotateX( - Math.PI / 2 );
	positionalGround = new THREE.Mesh( planePosGeometry, new THREE.MeshPhongMaterial( { color: 0xffffff, shininess: 10,
					specular: 0x111111 } ) );
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

		var cube = new CuteCube( xRnd, zRnd, cuteCubeMesh, camera, listener );
		cube.name = 'cube' + i;
		cubesArr.push( cube );
		scene.add( cube );

	}

}

function randomRange ( min, max ) {

	return min + Math.random() * ( max - min );

}

function vrFallback() {

	// controls = new THREE.OrbitControls( camera );
	mouse.x = 0;
	mouse.y = 0;
	controls = new THREE.TouchControls( camera, mouse, 0 );

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
	totalTime = Math.round(timestamp/1000);
	// console.log(totalTime);
	for ( var i = 0; i < cubesArr.length; i ++ ) {

		if(totalTime > 60 && totalTime<120){
			cubesArr[ i ].setSecureDistance(1);
		}
		if ( totalTime>120 ){
			cubesArr[ i ].setSecureDistance(0.3);
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
