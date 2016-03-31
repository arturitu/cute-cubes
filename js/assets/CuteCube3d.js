var CuteCube = function ( index, totalCubes, x, z, mesh, godtoFollow, listener ) {

	'use strict';
	//Seek and Separation parameters

	this.secureDistanceToGod = 0.2;
	this.maxSpeed = 0.005;
	this.maxForce = 0.0002;
	this.acceleration = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	this.separateFactor = 8;
	this.seekFactor = 6;
	this.desiredSeparation = 0.05;
	this.godToFollow = godtoFollow;

	this.stage = 0;

	THREE.Mesh.call( this, mesh.geometry, mesh.material.clone() );
	this.name = 'cube' + index;

	this.scale.set( 0.2, 0.2, 0.2 );

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

	// this.moodManager = new MoodManager( index, totalCubes, this.material.materials[ 1 ].map, this.material.materials[ 2 ].map, listener );
	// this.add( this.moodManager );

};

CuteCube.prototype = Object.create( THREE.Mesh.prototype );

//INIT CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
CuteCube.prototype.applyBehaviors = function ( vehicles ) {

	// console.log(arr);
	var separateForce = this.separate( vehicles );

	var godPosition = new THREE.Vector3( this.godToFollow.position.x,this.godToFollow.position.y, this.godToFollow.position.z );
	var seekForce = this.seek( godPosition );

	separateForce.multiplyScalar( this.separateFactor );
	seekForce.multiplyScalar( this.seekFactor );

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

		var myPos2D = new THREE.Vector3( this.position.x,this.position.y, this.position.z );
		var vehiclePos2D = new THREE.Vector3( vehicles[ i ].position.x,vehicles[ i ].position.y,vehicles[ i ].position.z );
		var d = myPos2D.distanceTo( vehiclePos2D );
		// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
		if ( ( d > 0 ) && ( d < this.desiredSeparation ) ) {

			// Calculate vector pointing away from neighbor
			var diff = new THREE.Vector3();
			diff = diff.subVectors( myPos2D, vehiclePos2D );
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

		// if ( count > 2 ) {
		//
		// 	this.moodManager.clashing = true;
		//
		// }else {
		//
		// 	this.moodManager.clashing = false;
		//
		// }

	}
	return sum;

}

CuteCube.prototype.seek = function ( godPosition ) {

	var desired = new THREE.Vector3();
	var myPos2D = new THREE.Vector3( this.position.x,this.position.y,this.position.z );
	desired = desired.subVectors( godPosition, myPos2D );  // A vector pointing from the location to the target
	// if ( this.name === 'cube0' ) {
	//
	// 	console.log( desired.length() );
	//
	// }
	// if ( desired.length() > 1.4  ) {
	//
	// 	this.moodManager.isFar = true;
	//
	// }else {
	//
	// 	this.moodManager.isFar = false;
	//
	// }
	if ( desired.length() < this.secureDistanceToGod ) {

		// var m = THREE.Math.mapLinear( desired.length(), 0, this.secureDistanceToGod, 0, this.maxSpeed );
		// desired.setLength(m);
		switch ( this.stage ) {
			case 0:
				desired.setLength( - 0.01 );
				break;
			case 1:
				desired.setLength( - 0.005 );
				break;
			default:
				desired.setLength( - 0.001 );
		}

		// this.moodManager.seeking = false;

	}else {

		// Normalize desired and scale to maximum speed
		desired.setLength( this.maxSpeed );

		// this.moodManager.seeking = true;

	}

	// Steering = Desired minus velocity
	var steer = new THREE.Vector3();
	steer = steer.subVectors( desired, this.velocity );
	steer.setLength( this.maxForce );  // Limit to maximum steering force
	return steer;

}

// Method to update location
CuteCube.prototype.update = function ( timestamp ) {

	// Update velocity
	this.velocity.add( this.acceleration );
	// Limit speed
	this.velocity.setLength( this.maxSpeed );
	var vel3D = new THREE.Vector3 ( this.velocity.x,this.velocity.y,this.velocity.z );
	this.position.add( vel3D );

	// Reset acceleration to 0 each cycle
	this.acceleration.multiplyScalar( 0 );
	// this.moodManager.update( timestamp );

}
//END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/

CuteCube.prototype.setSecureDistance = function ( i ) {

	if ( this.stage !== i ) {

		this.stage = i;
		this.moodManager.stage = this.stage;
		switch ( this.stage ) {
			case 0:
				this.secureDistanceToGod = 0.5;
				break;
			case 1:
				this.secureDistanceToGod = 0.4;
				break;
			case 2:
				this.secureDistanceToGod = 0.3;
				break;
			default:

		}


	}

}
