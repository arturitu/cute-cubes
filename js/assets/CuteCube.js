var CuteCube = function ( x, z, mesh, godtoFollow ) {

	'use strict';

	this.godToFollow = godtoFollow;
	//Seek and Separation parameters
	this.radiusSecureArea = 5;
	this.maxSpeed = 0.005;
	this.maxForce = 0.0065;
	this.acceleration = new THREE.Vector3();
	this.velocity = new THREE.Vector3();

	this.separateFactor = 0.1;
	this.seekFactor = 0.1;
	this.desiredSeparation = 0.3;

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

	}
	return sum;

}

CuteCube.prototype.seek = function ( godPosition ) {

	var desired = new THREE.Vector3();
	desired = desired.subVectors( godPosition, this.position );  // A vector pointing from the location to the target

	// Normalize desired and scale to maximum speed
	desired.setLength( this.maxSpeed );
	// console.log(godPosition);

	// Steering = Desired minus velocity
	var steer = new THREE.Vector3();
	steer = steer.subVectors( desired, this.velocity );
	steer.setLength( this.maxForce );  // Limit to maximum steering force
	return steer;

}

// Method to update location
CuteCube.prototype.update = function ( godPosition ) {

	// console.log(this.velocity);
	// console.log(this.acceleration);
	// Update velocity
	this.velocity.add( this.acceleration );
	// Limit speed
	this.velocity.setLength( this.maxSpeed );
	this.position.add( this.velocity );
	// Reset acceleration to 0 each cycle
	this.acceleration.multiplyScalar( 0 );
	this.position.y = 0;
	// console.log(this.position);

}
//END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

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
