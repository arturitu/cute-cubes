var MoodController = function ( listener ) {

	'use strict';

	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

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

}

MoodController.prototype.makeMood = function () {

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

MoodController.prototype.laugh = function () {

	if ( this.soundLaugh.sourceType !== 'empty' && ! this.soundLaugh.isPlaying ) {

		this.soundLaugh.play();

	}
	setTimeout( this.laugh.bind( this ), ( Math.random() * 5000 ) + 1000 );

}
