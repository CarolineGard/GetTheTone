

navigator.getUserMedia = (navigator.getUserMedia ||
						  navigator.webkitGetUserMedia ||
						  navigator.mozGetUserMedia ||
						  navigator.msGetUserMedia);

var context = new (window.AudioContext || window.webkitAudioContext)();

var analyser,
	rafID,
	pitchElem,
	buf,
	MIN_SAMPLES,
	freqDomain,
	frequency;

//läser in frekvense
var analyser = context.createAnalyser();
analyser.fftSize = 2048;



window.onload = function () { //väntar på html, deklarerar allt här typ yolo
	rafID = null;
	pitchElem;
	buf = new Float32Array( 1024 );
	MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

	freqDomain = new Uint8Array(analyser.frequencyBinCount); //aurocorrelate behöver tidsdomänen för att arbeta

	navigator.getUserMedia({ audio: true }, gotStream, error);


}



function error() {
    alert('Stream generation failed.');
}



function gotStream(stream) {
    
    input = context.createMediaStreamSource(stream);

    //Lägga in bandpassfilter!!!
    //biquadFilter = lowpass, highpass, bandpass...

    input.connect( analyser );

    //requestAnimFrame(visualize); //updatePitch();
    updatePitch();
}


function updatePitch( time ) {
	analyser.getFloatTimeDomainData( buf );

	var ac = autoCorrelate( buf, context.sampleRate );
	// TODO: Paint confidence meter on canvasElem here.

	pitch = ac;

	frequency = pitch;

	//skriver ut pitch
	pitchElem = document.getElementById( "pitch" );
	pitchElem.innerText = Math.round( pitch ) ;

	if (!window.requestAnimFrame)
		window.requestAnimFrame = window.webkitRequestAnimFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}


function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i = 0;i < SIZE; i++) {
		var val = buf[i];
		rms += val * val;
	}

	rms = Math.sqrt(rms / SIZE);
	if (rms < 0.01) // not enough signal
		return -1;

	var lastCorrelation = 1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i = 0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i]) - (buf[i + offset]));
		}
		correlation = 1 - (correlation / MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation > 0.9) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			var shift = (correlations[best_offset+1] - correlations[best_offset- 1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}