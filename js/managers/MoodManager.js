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
	this.isMoodActive = false;

	this.timerIdle = Math.random()*500 + 500;
	this.timerBlink = Math.random()*1000 + 3000;

	this.idleFrame = 0;
	this.blinkFrame = 0;

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

MoodManager.prototype.update = function ( timestamp ) {

	// if(this.parent.name === 'cube1' ){

	var blinkFrameTmp = timestamp%this.timerBlink / this.timerBlink;
	if ( this.blinkFrame > blinkFrameTmp ){
		this.doBlink();
	}
	this.blinkFrame = blinkFrameTmp;


	var idleFrameTmp = timestamp%this.timerIdle / this.timerIdle;
	if ( this.idleFrame > idleFrameTmp ){
		this.doIdle();
	}
	this.idleFrame = idleFrameTmp;


	// switch ( this.mood ) {
	// 	case 'laugh':
	// 		if ( this.soundLaugh.isPlaying ) {
	//
	// 			this.renderExpression( 'laugh' );
	//
	// 		}else {
	//
	// 			this.renderExpression( 'idle' );
	//
	// 		}
	// 		break;
	// 	case 'clash':
	// 		if ( this.soundClash.isPlaying ) {
	//
	// 			this.renderExpression( 'clash' );
	//
	// 		}else {
	//
	// 			this.renderExpression( 'idle' );
	//
	// 		}
	// 		break;
	// }

}

MoodManager.prototype.doBlink = function () {

	this.renderExpression('blink');

}

MoodManager.prototype.doIdle = function () {

	if( !this.isMoodActive ){

		this.renderExpression('idle');

	}

}

//To control pause
MoodManager.prototype.pauseAll = function ( bool ) {

	if ( bool ){

	}else {

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

MoodManager.prototype.renderExpression = function ( expression ) {
	// console.log(expression);
	if ( this.expression === expression ) {

		return;

	}
	this.expression = expression;
	// console.log( this.name, expression );
	switch ( expression ) {
		case 'idle':
				this.changeEyes( 1 );
				this.changeMouth( 2 );
			break;
		case 'blink':
			this.changeEyes( 5 );
			break;
		case 'clash_a':
			this.changeEyes( 4 );
			this.changeMouth( 3 );
			break;
		case 'clash_b':
			this.changeEyes( 6 );
			this.changeMouth( 4 );
			break;
		case 'guegue1':
			this.changeEyes( 2 );
			this.changeMouth( 11 );
			break;
		case 'guegue2':
			this.changeEyes( 2 );
			this.changeMouth( 12 );
			break;
		case 'laugh1':
			this.changeEyes( 7 );
			this.changeMouth( 1 );
			break;
		case 'laugh2':
			this.changeEyes( 7 );
			this.changeMouth( 14 );
			break;
		case 'phoneme_-':
			this.changeMouth( 9 );
			break;
		case 'phoneme_a':
			this.changeMouth( 10 );
			break;
		case 'phoneme_o':
			this.changeMouth( 11 );
			break;
		case 'phoneme_e':
			this.changeMouth( 12 );
			break;
		case 'phoneme_s':
			this.changeMouth( 13 );
			break;
		case 'phoneme_l':
			this.changeMouth( 14 );
			break;
		case 'phoneme_m':
			this.changeMouth( 15 );
			break;
		case 'phoneme_f':
			this.changeMouth( 16 );
			break;
	}

}
