// http://blog.teamtreehouse.com/getting-started-speech-synthesis-api
var SpeechManager = function () {

	this.msg = new SpeechSynthesisUtterance();
	this.msg.lang = 'en-US';
	// this.msg.lang = 'es-ES';
	this.msg.volume = 1;
	this.msg.rate = 0.8;
	this.msg.pitch = 1.5;

	this.speakReady = false;

	var scope = this;
	window.speechSynthesis.onvoiceschanged = function() {

		scope.msg.voice = window.speechSynthesis.getVoices().filter( function( voice ) {

			scope.speakReady = true;
			return voice.name == 'Princess';

		} )[ 0 ];

	};

	this.msg.onstart = function ( e ) {

		console.log( 'start' );

	}

	this.msg.onend = function ( e ) {

		console.log( 'end' );

	}

}

SpeechManager.prototype.speak = function ( text ) {

	if ( ! this.speakReady ) {

		return;

	}
	// console.log( 'speak' );
	// Set the text.
	this.msg.text = text;
	// Queue this utterance.
	window.speechSynthesis.speak( this.msg );


}
