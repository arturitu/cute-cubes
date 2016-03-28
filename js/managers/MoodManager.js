var MoodManager = function ( index, totalCubes, eyesMap, mouthMap, listener ) {

	'use strict';

	THREE.Object3D.call( this );

	this.index = index;
	this.stage = 0;

	this.eyesMap = eyesMap;
	this.mouthMap = mouthMap;

	//Eyes texture has 2x4 image atlas
	this.eyesPerColumn = 4;
	this.eyesPerRow = 2;

	//Mouth texture has 4x4 image atlas
	this.mouthsPerColumn = 4;
	this.mouthsPerRow = 4;

	this.soundsIndexArr = [
		'whoBoss',
		'who01',
		'who02',
		'who03',
		'closeBoss',
		'close01',
		'close02',
		'niceBoss',
		'nice01',
		'nice02',
		'backBoss',
		'back01',
		'loveBoss',
		'love01',
		'love02'
	];

	this.soundToExpressionsArr = [];
	this.soundToExpressionsArr [ 'whoBoss' ] = this.getPhonemes( 'Whooooo arrrrr youuuuuu' );
	this.soundToExpressionsArr [ 'who01' ] = this.getPhonemes( 'Whoooooooo Whoooooooo' );
	this.soundToExpressionsArr [ 'who02' ] = this.getPhonemes( 'Whoooooooooooo' );
	this.soundToExpressionsArr [ 'who03' ] = this.getPhonemes( ' Whoooooooo' );
	this.soundToExpressionsArr [ 'closeBoss' ] = this.getPhonemes( 'tooo clooose too cloose' );
	this.soundToExpressionsArr [ 'close01' ] = this.getPhonemes( 'cloose clooosee' );
	this.soundToExpressionsArr [ 'close02' ] = this.getPhonemes( 'cloooose' );
	this.soundToExpressionsArr [ 'niceBoss' ] = this.getPhonemes( 'Niiiice toooo meeeet youuu ' );
	this.soundToExpressionsArr [ 'nice01' ] = this.getPhonemes( 'niiiice' );
	this.soundToExpressionsArr [ 'nice02' ] = this.getPhonemes( 'niiceeee' );
	this.soundToExpressionsArr [ 'backBoss' ] = this.getPhonemes( 'Coome baaack ' );
	this.soundToExpressionsArr [ 'back01' ] = this.getPhonemes( 'bbaaack' );
	this.soundToExpressionsArr [ 'loveBoss' ] = this.getPhonemes( 'oooooooo weee looovee youuu ' );
	this.soundToExpressionsArr [ 'love01' ] = this.getPhonemes( 'oooohooooohooh' );
	this.soundToExpressionsArr [ 'love02' ] = this.getPhonemes( 'ooohoohohoh' );

	this.soundsArr = [];

	for ( var i = 0; i < this.soundsIndexArr.length; i ++ ) {

		var posAudioTmp = new THREE.PositionalAudio( listener );
		posAudioTmp.name = this.soundsIndexArr[ i ];
		posAudioTmp.load( 'audio/' + this.soundsIndexArr[ i ] + '.ogg' );
		posAudioTmp.setRefDistance( 0.5 );
		this.soundsArr.push( posAudioTmp );

	}

	this.isFar = false;
	this.seeking = false;

	this.expressionsArr = [];
	this.isMoodActive = false;

	if ( this.index === 0 ) {

		this.timerMood = 5000;

	}else {

		this.timerMood = ( Math.random() * ( 1000 * totalCubes ) ) + 1000;

	}

	this.timerArrExpressions = setInterval( this.doArrExpressions.bind( this ), 80 );
	this.timerIdle = ( Math.random() * 500 ) + 500;
	this.timerBlink = ( Math.random() * 1000 ) + 3000;

	this.moodFrame = 0;
	this.expressionsFrameArr = 0;
	this.idleFrame = 0;
	this.blinkFrame = 0;

	this.expressionsArrIndex = 0;

}

MoodManager.prototype = Object.create( THREE.Object3D.prototype );

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

	if ( this.expressionsArr.length > 0 ) {

		if ( this.expressionsArrIndex < this.expressionsArr.length ) {

			this.renderExpression( this.expressionsArr[ this.expressionsArrIndex ] );
			this.expressionsArrIndex ++;

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

MoodManager.prototype.getPossibleMood = function () {

	var possibleMoods = [];
	if ( this.index === 0 ) {

		switch ( stage ) {
			case 0:
				if ( this.seeking ) {

					possibleMoods.push( 'whoBoss' );

				}else {

					possibleMoods.push( 'closeBoss' );

				}
				possibleMoods.push( 'none' );
				break;
			case 1:
				if ( this.seeking ) {

					possibleMoods.push( 'niceBoss' );

				}else {

					possibleMoods.push( 'closeBoss' );

				}
				possibleMoods.push( 'none' );
				break;
			case 2:
				if ( this.isFar ) {

					possibleMoods.push( 'backBoss' );

				}else {

					possibleMoods.push( 'loveBoss' );

				}
				break;

		}



	}else {

		switch ( stage ) {
			case 0:
				if ( this.seeking ) {

					possibleMoods.push( 'who01' );
					possibleMoods.push( 'who02' );
					possibleMoods.push( 'who03' );

				}else {

					possibleMoods.push( 'close01' );
					possibleMoods.push( 'close02' );

				}
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				break;
			case 1:
				if ( this.seeking ) {

					possibleMoods.push( 'nice01' );
					possibleMoods.push( 'nice02' );

				}else {

					possibleMoods.push( 'close01' );
					possibleMoods.push( 'close02' );

				}
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				break;
			case 2:
				if ( this.isFar ) {

					possibleMoods.push( 'back01' );
					possibleMoods.push( 'back02' );

				}else {

					possibleMoods.push( 'love01' );
					possibleMoods.push( 'love02' );

				}
				possibleMoods.push( 'none' );
				possibleMoods.push( 'none' );
				break;
		}

	}
	// console.log( Math.floor( Math.random() * possibleMoods.length ) );
	var randMood = Math.floor( Math.random() * possibleMoods.length );
	return possibleMoods[ randMood ];

}

MoodManager.prototype.getSoundByName = function ( name ) {

	for ( var i = 0; i < this.soundsArr.length; i ++ ) {

		if ( this.soundsArr[ i ].name === name ) {

			return this.soundsArr[ i ];

		}

	}

}


MoodManager.prototype.doMood = function () {

	if ( this.isMoodActive ) {

		return;

	}
	var name = this.getPossibleMood();
	var actualSound = this.getSoundByName( name );
	if ( ! actualSound ) {

		return;

	}
	this.isMoodActive = true;
	if ( ! actualSound.source.buffer ) {

		return;

	}
	actualSound.play();
	this.expressionsArr = this.soundToExpressionsArr[ name ];
	var scope = this;
	actualSound.source.onended = function() {

		actualSound.isPlaying = false;
		scope.isMoodActive = false;
		scope.expressionsArr = [];
		scope.expressionsArrIndex = 0;

	};

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
	phonemesArr.push( 'idle' );
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
			switch ( stage ) {
				case 0:
					this.changeMouth( 9 );
					break;
				case 1:
					this.changeMouth( 2 );
					break;
				case 2:
					this.changeMouth( 1 );
					break;
			}
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
