var CuteCube = function (x,z,mesh) {

	'use strict';

	//Seek and Separation parameters
	this.r = 0.25;
	this.maxSpeed = 0.25;
	this.maxForce = 0.03;
	this.acceleration = new THREE.Vector2( 0, 0 );
	this.velocity = new THREE.Vector2( 0, 0 );

	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

	THREE.Mesh.call( this, mesh.geometry, mesh.material.clone() );
	this.position.x = x;
	this.position.z = z;

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

CuteCube.prototype.applyBehaviors = function ( arr ) {
	// console.log(arr);
}
