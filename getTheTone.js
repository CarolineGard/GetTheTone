navigator.getUserMedia = (navigator.getUserMedia ||
						  navigator.webkitGetUserMedia ||
						  navigator.mozGetUserMedia ||
						  navigator.msGetUserMedia);

var context = new (window.AudioContext || window.webkitAudioContext)();




//----------Get the frequency

var analyser,
	rafID,
	pitchElem,
	buf,
	MIN_SAMPLES,
	freqDomain,
	frequency;

//läser in frekvensen
var analyser = context.createAnalyser();
analyser.fftSize = 2048;

rafID = null;
pitchElem;
buf = new Float32Array( 1024 );
MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.

freqDomain = new Uint8Array(analyser.frequencyBinCount); //aurocorrelate behöver tidsdomänen för att arbeta

navigator.getUserMedia({ audio: true }, goStream, error); //gotStream


function error() {
    alert('Stream generation failed.');
}


function goStream(stream) {
    
    input = context.createMediaStreamSource(stream);

    //Lägga in bandpassfilter!!!
    //biquadFilter = lowpass, highpass, bandpass...

    input.connect( analyser );

    updatePitch();
  }


function updatePitch( time ) {
	analyser.getFloatTimeDomainData( buf );

	var ac = autoCorrelate( buf, context.sampleRate );
	// TODO: Paint confidence meter on canvasElem here.

	pitch = ac;
	console.log("Hej");
	frequency = pitch;

	//skriver ut pitch
	pitchElem = document.getElementById( "pitch" );
	pitchElem.innerText = Math.round( pitch ) ;

	if (!window.requestAnimFrame)
		window.requestAnimFrame = window.webkitRequestAnimFrame;
	rafID = window.requestAnimationFrame( updatePitch );

	return pitchElem.innerText;
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



//Get tone to play------------------------------

var sample = new OscillatorSample();

function OscillatorSample() {
	this.isPlaying = false;
	//this.canvas = document.querySelector('canvas');
	//this.WIDTH = 640;
	//this.HEIGHT = 240;
}
OscillatorSample.prototype.play = function() {
	// Create some sweet sweet nodes.
	this.oscillator = context.createOscillator();
	this.analyser = context.createAnalyser();
	// Setup the graph.
	this.oscillator.connect(this.analyser);
	this.analyser.connect(context.destination);
	this.oscillator[this.oscillator.start ? 'start' : 'noteOn'](0);
	//requestAnimFrame(this.visualize.bind(this));
};
OscillatorSample.prototype.stop = function() {
	this.oscillator.stop(0);
};
OscillatorSample.prototype.toggle = function() {
	(this.isPlaying ? this.stop() : this.play());
	this.isPlaying = !this.isPlaying;
};
OscillatorSample.prototype.changeFrequency = function(val) {
	this.oscillator.frequency.value = val;
};

function ReferensFreq() {
	var x = document.getElementById("demo");
	x.innerHTML = Math.floor((Math.random() * 801) + 200);
				
	sample.changeFrequency(x.innerHTML);

	return x.innerHTML;
}

function toDo(){
	sample.toggle();
	ReferensFreq();
}


//Create the canvas-----------------------------
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//Bakgrundsbild?

//Reset when game is over
var reset = function() {
	score = 0;
}


var update = function(modifier) {
	//var userFrequency = updatePitch();
	var referensFrequency = ReferensFreq();

	console.log("hejhejhej");

	if ((userFrequency > referensFrequency - 5) && (userFrequency < referensFrequency + 5)) {
		console.log("kul");
	}

	//if time is out bla bla

}

var render = function() {
	//rita saker

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + score, 32, 32);


}


var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);

	then = now;

	requestAnimationFrame(main);


}



















































