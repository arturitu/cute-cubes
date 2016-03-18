var MoodManager = function ( eyesMap, mouthMap, listener ) {

	'use strict';

	THREE.Object3D.call( this );

	this.eyesMap = eyesMap;
	this.mouthMap = mouthMap;
	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

	this.soundLaugh = new THREE.PositionalAudio( listener );
	this.soundLaugh.load( 'audio/hehehe.ogg' );
	this.soundLaugh.setRefDistance( 0.5 );
	this.soundLaugh.source.loop = false;
	this.soundLaugh.autoplay = false;
	this.add( this.soundLaugh );

	this.soundClash = new THREE.PositionalAudio( listener );
	this.soundClash.load( 'audio/guegue.ogg' );
	this.soundClash.setRefDistance( 0.5 );
	this.soundClash.source.loop = false;
	this.soundClash.autoplay = false;
	this.add( this.soundClash );

	//mode = expression + sound
	//laugh / clash
	this.mode = 'laugh';
	this.timerMood = setInterval( this.makeMood.bind( this ), ( Math.random() * 5000 ) + 1000 );

	this.expression;

}

MoodManager.prototype = Object.create( THREE.Object3D.prototype );

MoodManager.prototype.makeMood = function () {

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

MoodManager.prototype.laugh = function () {

	if ( this.soundLaugh.sourceType !== 'empty' && ! this.soundLaugh.isPlaying ) {

		this.soundLaugh.play();

	}
	setTimeout( this.laugh.bind( this ), ( Math.random() * 5000 ) + 1000 );

}

MoodManager.prototype.update = function () {

	// console.log( this.name, this.mood );

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

MoodManager.prototype.renderExpression = function ( expression ) {

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
MoodManager.prototype.pauseAll = function ( bool ) {

	if ( bool ){
			clearInterval( this.timerMood );
	}else {
		this.timerMood = setInterval( this.makeMood.bind( this ), ( Math.random() * 3000 ) + 1000 );
	}

}

//To control moods
MoodManager.prototype.changeEyes = function ( index ) {

	var row = Math.ceil( index / this.eyesPerRow ) - 1;
	var column = ( index - 1 ) % this.eyesPerRow;
	this.eyesMap.offset.x = 1 / this.eyesPerRow * column;
	this.eyesMap.offset.y = - 1 / this.eyesPerColumn * row;

}

MoodManager.prototype.changeMouth = function ( index ) {

	var row = Math.ceil( index / this.mouthsPerRow ) - 1;
	var column = ( index - 1 ) % this.mouthsPerRow;
	this.mouthMap.offset.x = 1 / this.mouthsPerRow * column;
	this.mouthMap.offset.y = - 1 / this.mouthsPerColumn * row;

}
