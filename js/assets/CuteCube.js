var CuteCube = function ( x, z, mesh, godtoFollow, listener ) {

	'use strict';

	//Seek and Separation parameters

	this.secureDistanceToGod = 2;
	this.maxSpeed = 0.005;
	this.maxForce = 0.0048;
	this.acceleration = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	this.separateFactor = 0.1;
	this.seekFactor = 0.1;
	this.desiredSeparation = 0.3;
	this.godToFollow = godtoFollow;

	THREE.Mesh.call( this, mesh.geometry, mesh.material.clone() );

	var clonedEyes = this.material.materials[ 1 ].map.clone();
	//Hack for sprite issues https://github.com/mrdoob/three.js/issues/7956
	clonedEyes.uuid = this.material.materials[ 1 ].map.uuid;
	clonedEyes.needsUpdate = true;
	this.material.materials[ 1 ].map = clonedEyes;

	var clonedMouths = this.material.materials[ 2 ].map.clone();
	//Hack for sprite issues https://github.com/mrdoob/three.js/issues/7956
	clonedMouths.uuid = this.material.materials[ 2 ].map.uuid;
	clonedMouths.needsUpdate = true;
	this.material.materials[ 2 ].map = clonedMouths;

	this.castShadow = true;
	this.receiveShadow = false;
	this.position.x = x;
	this.position.z = z;

	this.prevPosition =  new THREE.Vector3();

	this.moodManager = new MoodManager( this.material.materials[ 1 ].map, this.material.materials[ 2 ].map, listener );
	this.add( this.moodManager );
};

CuteCube.prototype = Object.create( THREE.Mesh.prototype );

//INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
CuteCube.prototype.applyBehaviors = function ( vehicles ) {

	// console.log(arr);
	var separateForce = this.separate( vehicles );
	var seekForce = this.seek( this.godToFollow.position );

	separateForce * this.separateFactor;
	seekForce * this.seekFactor;

	this.applyForce( separateForce );
	this.applyForce( seekForce );

}

CuteCube.prototype.applyForce = function ( force ) {

	this.acceleration.add( force );

}
CuteCube.prototype.separate = function ( vehicles ) {

	var sum = new THREE.Vector3();
	var count = 0;
	// For every boid in the system, check if it's too close
	for ( var i = 0; i < vehicles.length; i ++ ) {

		// var d = new THREE.Vector3();
		var d = this.position.distanceTo( vehicles[ i ].position );

		// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
		if ( ( d > 0 ) && ( d < this.desiredSeparation ) ) {

			// Calculate vector pointing away from neighbor
			var diff = new THREE.Vector3();
			diff = diff.subVectors( this.position, vehicles[ i ].position );
			diff.normalize();
			diff.divideScalar( d );        // Weight by distance
			sum.add( diff );
			count ++;            // Keep track of how many

		}

	}
	// Average -- divide by how many
	if ( count > 0 ) {

		sum.divideScalar( count );
		// Our desired vector is the average scaled to maximum speed
		sum.normalize();
		sum.multiplyScalar( this.maxSpeed );
		// Implement Reynolds: Steering = Desired - Velocity
		sum.sub( this.velocity );
		sum.setLength( this.maxForce );

		this.moodManager.mode = 'clash';

	}
	return sum;

}

CuteCube.prototype.seek = function ( godPosition ) {

	var desired = new THREE.Vector3();
	desired = desired.subVectors( godPosition, this.position );  // A vector pointing from the location to the target
	console.log(this.secureDistanceToGod);
	if( desired.length() < this.secureDistanceToGod ){
		// var m = THREE.Math.mapLinear( desired.length(), 0, this.secureDistanceToGod, 0, this.maxSpeed );
    // desired.setLength(m);
		desired.setLength(0);
	}else{
			// Normalize desired and scale to maximum speed
		desired.setLength( this.maxSpeed );
	}

	// Steering = Desired minus velocity
	var steer = new THREE.Vector3();
	steer = steer.subVectors( desired, this.velocity );
	steer.setLength( this.maxForce );  // Limit to maximum steering force
	return steer;

}

// Method to update location
CuteCube.prototype.update = function ( timestamp ) {
	// console.log(this.velocity);
	// console.log(this.acceleration);
	// Update velocity
	this.velocity.add( this.acceleration );
	// Limit speed
	this.velocity.setLength( this.maxSpeed );
	// this.prevPosition = this.position.clone();
	// this.prevPosition.add( this.velocity );
	//
	// console.log( Math.abs ( this.prevPosition.x - this.position.x ) + Math.abs ( this.prevPosition.z - this.position.z ) );
	// var diff = Math.abs ( this.prevPosition.x - this.position.x ) + Math.abs ( this.prevPosition.z - this.position.z );
	// if(diff > 0.003){
		this.position.add( this.velocity );
	// }
	// Reset acceleration to 0 each cycle
	this.acceleration.multiplyScalar( 0 );
	this.position.y = 0;
	// console.log(this.position);
	this.moodManager.update( timestamp );

}
//END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

CuteCube.prototype.pauseAll = function ( bool ) {
	this.moodManager.pauseAll( bool );
}

CuteCube.prototype.setSecureDistance = function ( i ) {
	if( this.secureDistanceToGod !== i){
		this.secureDistanceToGod = i;
	}
}
