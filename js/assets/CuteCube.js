var CuteCube = function ( x, z, mesh, godtoFollow ) {

	'use strict';

	//Seek and Separation parameters
	this.radiusSecureArea = 5;
	this.maxSpeed = 0.005;
	this.maxForce = 0.0065;
	this.acceleration = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	this.separateFactor = 0.1;
	this.seekFactor = 0.1;
	this.desiredSeparation = 0.3;
	this.godToFollow = godtoFollow;

	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

	THREE.Mesh.call( this, mesh.geometry, mesh.material.clone() );
	this.position.x = x;
	this.position.z = z;

	this.soundLaugh = new THREE.PositionalAudio( listener );
	this.soundLaugh.load( 'audio/hehehe.ogg' );
	// this.sound.setRefDistance( 2.5 );
	this.soundLaugh.source.loop = false;
	this.soundLaugh.autoplay = false;
	this.add( this.soundLaugh );

	this.soundClash = new THREE.PositionalAudio( listener );
	this.soundClash.load( 'audio/guegue.ogg' );
	// this.sound.setRefDistance( 2.5 );
	this.soundClash.source.loop = false;
	this.soundClash.autoplay = false;
	this.add( this.soundClash );

	//mood = expression + sound
	//laugh / clash
	this.mood = 'laugh';
	this.timerMood = setInterval( this.makeMood.bind( this ), ( Math.random() * 5000 ) + 1000 );

	this.expression;

};

CuteCube.prototype = Object.create( THREE.Mesh.prototype );

CuteCube.prototype.makeMood = function () {

	// console.log( this.name, ': ', this.mood );
	switch ( this.mood ) {
		case 'laugh':
			if ( this.soundLaugh.sourceType !== 'empty' && ! this.soundLaugh.isPlaying ) {

				this.soundLaugh.play();
				if ( this.soundClash.isPlaying ) {

					this.soundClash.stop();

				}

			}
			break;
		case 'clash':
			if ( this.soundClash.sourceType !== 'empty' && ! this.soundClash.isPlaying ) {

				this.soundClash.play();
				if ( this.soundLaugh.isPlaying ) {

					this.soundLaugh.stop();

				}

			}
			break;
	}

}

CuteCube.prototype.laugh = function () {

	if ( this.soundLaugh.sourceType !== 'empty' && ! this.soundLaugh.isPlaying ) {

		this.soundLaugh.play();

	}
	setTimeout( this.laugh.bind( this ), ( Math.random() * 5000 ) + 1000 );

}

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

		this.mood = 'clash';

	}else {

		this.mood = 'laugh';

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
	this.updateExpressions();

}
//END CODE BASED ON: natureofcode.com/book/chapter-6-autonomous-agents/
CuteCube.prototype.updateExpressions = function () {

	console.log( this.name, this.mood );

	switch ( this.mood ) {
		case 'laugh':
			if ( this.soundLaugh.isPlaying ) {

				this.renderExpression( 'laugh' );

			}else {

				this.renderExpression( 'idle' );

			}
			break;
		case 'clash':
			if ( this.soundClash.isPlaying ) {

				this.renderExpression( 'clash' );

			}else {

				this.renderExpression( 'idle' );

			}
			break;
	}

}

CuteCube.prototype.renderExpression = function ( expression ) {

	if ( this.expression === expression ) {

		return;

	}
	this.expression = expression;
	// console.log( this.name, expression );
	switch ( expression ) {
		case 'idle':
			this.changeEyes( 1 );
			this.changeMouth( 9 );
			break;
		case 'laugh':
			this.changeEyes( 7 );
			this.changeMouth( 1 );
			break;
		case 'clash':
			this.changeEyes( 6 );
			this.changeMouth( 6 );
			break;
	}

}
//To control pause
CuteCube.prototype.sleep = function () {

	clearInterval( this.timerMood );

}

CuteCube.prototype.wakeUp = function () {


	this.timerMood = setInterval( this.makeMood.bind( this ), ( Math.random() * 3000 ) + 1000 );

}

//To control moods
CuteCube.prototype.changeEyes = function ( index ) {

	var row = Math.ceil( index / this.eyesPerRow ) - 1;
	var column = ( index - 1 ) % this.eyesPerRow;
	this.material.materials[ 1 ].map.offset.x = 1 / this.eyesPerRow * column;
	this.material.materials[ 1 ].map.offset.y = - 1 / this.eyesPerColumn * row;

}

CuteCube.prototype.changeMouth = function ( index ) {

	var row = Math.ceil( index / this.mouthsPerRow ) - 1;
	var column = ( index - 1 ) % this.mouthsPerRow;
	this.material.materials[ 2 ].map.offset.x = 1 / this.mouthsPerRow * column;
	this.material.materials[ 2 ].map.offset.y = - 1 / this.mouthsPerColumn * row;

}
