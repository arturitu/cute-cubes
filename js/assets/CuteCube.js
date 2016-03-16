var CuteCube = function () {

	'use strict';

	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

	var scope = this;
	var loader = new THREE.JSONLoader();
	loader.load( 'assets/cuteCube.json', function( geometry, materials ) {

		var mat = new THREE.MultiMaterial( materials );
		// cuteCube = new THREE.Mesh ( geometry, mat );
		THREE.Mesh.call( scope, geometry, mat );
		scope.dispatchEvent( { type: 'ready' } );

	} );


};

CuteCube.prototype = Object.create( THREE.Mesh.prototype );

CuteCube.prototype.changeEyes = function ( index ) {

	var row = Math.ceil( index / this.eyesPerRow ) - 1;
	var column = ( index - 1 ) % this.eyesPerRow;
	this.material.materials[ 2 ].map.offset.x = 1 / this.eyesPerRow * column;
	this.material.materials[ 2 ].map.offset.y = - 1 / this.eyesPerColumn * row;

}

CuteCube.prototype.changeMouth = function ( index ) {

	var row = Math.ceil( index / this.mouthsPerRow ) - 1;
	var column = ( index - 1 ) % this.mouthsPerRow;
	this.material.materials[ 1 ].map.offset.x = 1 / this.mouthsPerRow * column;
	this.material.materials[ 1 ].map.offset.y = - 1 / this.mouthsPerColumn * row;

}
