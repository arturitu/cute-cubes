var MoodManager = function ( totalCubes, eyesMap, mouthMap, listener ) {

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
	this.add( this.soundLaugh );

	this.soundGueGue = new THREE.PositionalAudio( listener );
	this.soundGueGue.load( 'audio/guegue.ogg' );
	this.soundGueGue.setRefDistance( 0.5 );
	this.soundGueGue.source.loop = false;
	this.soundGueGue.autoplay = false;
	this.add( this.soundGueGue );

	this.soundClash_a = new THREE.PositionalAudio( listener );
	this.soundClash_a.load( 'audio/clash_a.ogg' );
	this.soundClash_a.setRefDistance( 0.5 );
	this.soundClash_a.source.loop = false;
	this.soundClash_a.autoplay = false;
	this.add( this.soundClash_a );

	this.soundClash_b = new THREE.PositionalAudio( listener );
	this.soundClash_b.load( 'audio/clash_b.ogg' );
	this.soundClash_b.setRefDistance( 0.5 );
	this.soundClash_b.source.loop = false;
	this.soundClash_b.autoplay = false;
	this.add( this.soundClash_b );

	this.soundOhh = new THREE.PositionalAudio( listener );
	this.soundOhh.load( 'audio/ohh.ogg' );
	this.soundOhh.setRefDistance( 0.5 );
	this.soundOhh.source.loop = false;
	this.soundOhh.autoplay = false;
	this.add( this.soundOhh );

	this.soundName = new THREE.PositionalAudio( listener );
	this.soundName.load( 'audio/name.ogg' );
	this.soundName.setRefDistance( 0.5 );
	this.soundName.source.loop = false;
	this.soundName.autoplay = false;
	this.add( this.soundName );

	this.clashing = false;
	this.seeking = false;

	this.arrExpressions = [];
	this.isMoodActive = false;

	this.timerMood = ( Math.random() * ( 1000 * totalCubes ) ) + 1000;
	this.timerArrExpressions = setInterval( this.doArrExpressions.bind( this ), 80 );
	this.timerIdle = ( Math.random() * 500 ) + 500;
	this.timerBlink = ( Math.random() * 1000 ) + 3000;

	this.moodFrame = 0;
	this.arrExpressionsFrame = 0;
	this.idleFrame = 0;
	this.blinkFrame = 0;

	this.arrExpressionsIndex = 0;

	this.speechRecognized = 'Whats your name?';

}

MoodManager.prototype = Object.create( THREE.Object3D.prototype );

MoodManager.prototype.init = function ( ) {

	if ( this.parent.name === 'cube0' ) {

		// this.mySpeech = new SpeechManager();
		// this.myRecognizer = new RecognitionManager();
		// this.myRecognizer.start();
		// this.myRecognizer.addEventListener( 'recognized', this.textRecognized.bind( this ) );

	}

}

MoodManager.prototype.textRecognized = function ( ) {

	this.speechRecognized = this.myRecognizer.final_transcript;
	this.doMood( 'speech' );

}

MoodManager.prototype.update = function ( timestamp ) {

	var moodFrameTmp = timestamp % this.timerMood / this.timerMood;
	if ( this.moodFrame > moodFrameTmp ) {

		this.doMood();

	}
	this.moodFrame = moodFrameTmp;

	var blinkFrameTmp = timestamp % this.timerBlink / this.timerBlink;
	if ( this.blinkFrame > blinkFrameTmp ) {

		this.doBlink();

	}
	this.blinkFrame = blinkFrameTmp;


	var idleFrameTmp = timestamp % this.timerIdle / this.timerIdle;
	if ( this.idleFrame > idleFrameTmp ) {

		this.doIdle();

	}
	this.idleFrame = idleFrameTmp;

}

MoodManager.prototype.doArrExpressions = function () {

	if ( this.arrExpressions.length > 0 ) {

		if ( this.arrExpressionsIndex < this.arrExpressions.length ) {

			this.renderExpression( this.arrExpressions[ this.arrExpressionsIndex ] );
			this.arrExpressionsIndex ++;

		}


	}

}

MoodManager.prototype.doBlink = function () {

	if ( ! this.isMoodActive ) {

		this.renderExpression( 'blink' );

	}

}

MoodManager.prototype.doIdle = function () {

	if ( ! this.isMoodActive ) {

		this.renderExpression( 'idle' );

	}

}

MoodManager.prototype.getMood = function () {

	var possibleMoods = [];
	if ( this.parent.name === 'cube0' ) {

		possibleMoods.push( 'speech' );

	}else {

		possibleMoods.push( 'laugh' );

	}

	// if ( this.clashing ) {
	//
	// 	possibleMoods.push( 'clash_a' );
	// 	possibleMoods.push( 'clash_b' );
	//
	// }
	// if ( this.seeking ) {
	//
	// 	possibleMoods.push( 'laugh' );
	//
	// }
	// possibleMoods.push( 'none' );
	// console.log( Math.floor( Math.random() * possibleMoods.length ) );
	var randMood = Math.floor( Math.random() * possibleMoods.length );
	return possibleMoods[ randMood ];

}

MoodManager.prototype.doMood = function ( mustMood ) {

	// console.log( mustMood );
	if ( this.isMoodActive ) {

		return;

	}
	var name = '';
	if ( mustMood !== undefined ) {

		name = mustMood;

	}else {

		name = this.getMood();

	}
	switch ( name ) {
		case 'laugh':
			this.isMoodActive = true;
			if ( ! this.soundLaugh.source.buffer ) {

				return;

			}
			this.soundLaugh.play();
			this.arrExpressions = [ 'laugh1','laugh2','laugh1','laugh2', 'idle' ];
			var scope = this;
			this.soundLaugh.source.onended = function() {

				scope.soundLaugh.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;
		case 'guegue':
			this.isMoodActive = true;
			if ( ! this.soundGueGue.source.buffer ) {

				return;

			}
			this.soundGueGue.play();
			this.arrExpressions = [ 'guegue1','guegue2','guegue1','guegue2' ];
			var scope = this;
			this.soundGueGue.source.onended = function() {

				scope.soundGueGue.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;
		case 'clash_a':
			this.isMoodActive = true;
			if ( ! this.soundClash_a.source.buffer ) {

				return;

			}
			this.soundClash_a.play();
			this.arrExpressions = [ 'clash_a' ];
			var scope = this;
			this.soundClash_a.source.onended = function() {

				scope.soundClash_a.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;
		case 'clash_b':
			this.isMoodActive = true;
			if ( ! this.soundClash_b.source.buffer ) {

				return;

			}
			this.soundClash_b.play();
			this.arrExpressions = [ 'clash_b' ];
			var scope = this;
			this.soundClash_b.source.onended = function() {

				scope.soundClash_b.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;
		case 'ohh':
			this.isMoodActive = true;
			if ( ! this.soundOhh.source.buffer ) {

				return;

			}
			this.soundOhh.play();
			this.arrExpressions = [ 'ohh','ohh','ohh','ohh' ];
			var scope = this;
			this.soundOhh.source.onended = function() {

				scope.soundOhh.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;
		case 'name':
			this.isMoodActive = true;
			console.log( this.soundName.context );
			this.soundName.play();
			this.arrExpressions = this.getPhonemes( 'Whats your name' );
			var scope = this;
			this.soundName.source.onended = function() {

				scope.soundName.isPlaying = false;
				scope.isMoodActive = false;
				scope.arrExpressions = [];
				scope.arrExpressionsIndex = 0;

			};
			break;

	}

}

MoodManager.prototype.getPhonemes = function ( s ) {

	var phonemesArr = [];
	for ( var i = 0; i < s.length; i ++ ) {

		var letter = s.substr( i, 1 ).toLowerCase();
		switch ( letter ) {
			case 'a':
			case 'i':
			case 'y':
				phonemesArr.push( 'phoneme_a' );
				break;
			case 'o':
			case 'u':
			case 'w':
			case 'r':
				phonemesArr.push( 'phoneme_o' );
				break;
			case 'e':
			case 'x':
				phonemesArr.push( 'phoneme_e' );
				break;
			case 's':
			case 'c':
			case 'd':
			case 'g':
			case 'k':
			case 'n':
			case 'r':
			case 't':
			case 'z':
			case 'j':
			case 'q':
				phonemesArr.push( 'phoneme_s' );
				break;
			case 'l':
				phonemesArr.push( 'phoneme_l' );
				break;
			case 'm':
			case 'b':
			case 'p':
				phonemesArr.push( 'phoneme_m' );
				break;
			case 'f':
			case 'v':
				phonemesArr.push( 'phoneme_f' );
				break;
			default:
				phonemesArr.push( 'phoneme_-' );
		}

	}
	// console.log( phonemesArr );
	return phonemesArr;

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

	switch ( expression ) {
		case 'idle':
			this.changeEyes( 1 );
			this.changeMouth( 9 );
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
		case 'ohh':
			this.changeEyes( 1 );
			this.changeMouth( 11 );
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
