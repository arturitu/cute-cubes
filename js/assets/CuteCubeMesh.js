var CuteCubeMesh = function () {

	'use strict';

	var scope = this;
	var loader = new THREE.JSONLoader();
	loader.load( 'assets/cuteCube.json', function( geometry, materials ) {

		var mat = new THREE.MultiMaterial( materials );
		// cuteCube = new THREE.Mesh ( geometry, mat );
		// console.log(mat.materials[1]);
		THREE.Mesh.call( scope, geometry, mat );
		scope.dispatchEvent( { type: 'ready' } );

	} );

};

CuteCubeMesh.prototype = Object.create( THREE.Mesh.prototype );
