// https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API?hl=en
var RecognitionManager = function () {

	'use strict';

	//I used a Object3D to be a DOM object to dispatch Events
	THREE.Object3D.call( this );
	this.recognition = new webkitSpeechRecognition();
	this.recognition.lang = 'en-US';
	this.recognition.continuous = true;
	this.recognition.interimResults = true;

	this.final_transcript = '';
	var scope = this;

	this.recognition.onresult = function( event ) {

		// console.log( event );

		var interim_transcript = '';

		for ( var i = event.resultIndex; i < event.results.length; ++ i ) {

			if ( event.results[ i ].isFinal ) {

				scope.final_transcript += event.results[ i ][ 0 ].transcript;
				scope.stop();
				// var event = new CustomEvent( 'recognized', { 'transcript': final_transcript } );
				scope.dispatchEvent( { type: 'recognized' } );

			} else {

				interim_transcript += event.results[ i ][ 0 ].transcript;

			}

		}
		// console.log( interim_transcript );
		console.log( scope.final_transcript );

	}

	this.recognition.onstart = function( event ) {

		console.log( 'audio start' );

	}

	this.recognition.onend = function( event ) {

		console.log( 'audio end' );
		// this.stop();
		scope.start();

	}

	// this.recognition.onend = function( event ) {
	//
	// 	console.log( 'endddd' );
	//
	// }

	this.recognition.onerror = function( error ) {

		console.log( 'error', error );

	}

	this.recognition.onnomatch = function() {

		console.log( 'no match' );

	}

}

RecognitionManager.prototype = Object.create( THREE.Object3D.prototype );

RecognitionManager.prototype.start = function () {

	this.final_transcript = '';
	this.recognition.start();

}

RecognitionManager.prototype.stop = function () {

	this.recognition.stop();

}
