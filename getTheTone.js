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

var playedTone;
var counter = 0;

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
	var low = context.createBiquadFilter();
	
	low.frequency.value = 1000.0;
	low.type = low.LOWPASS;
	
	var high = context.createBiquadFilter();
	high.frequency.value = 100.0;
	high.type = high.HIGHPASS;
	
    //Lägga in bandpassfilter!!!
    //biquadFilter = lowpass, highpass, bandpass...
	/*input.connect(low);
	low.connect(high)
	high.connect(analyser);*/
	input.connect(analyser);

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
	console.log("FORE: " + this.oscillator.frequency.value);
	this.oscillator.frequency.value = val;
	console.log("EFTER: " + this.oscillator.frequency.value);
};

var thePlayed;

function ReferensFreq() {
	var MAX = 545;
	thePlayed = Math.floor((Math.random() * 351) + 200);

	var x = document.getElementById("demo");
	x.innerHTML = thePlayed;
				
	sample.changeFrequency(thePlayed); //x.innerHTML

	thePlayed = MAX - thePlayed + 70;
	
	toneCounter.start();
	render();
	playedTone = x.innerHTML;

	//return x.innerHTML;
}

function toDo(){
	//make menu invisible
	document.getElementById("menu").style.visibility = 'hidden';
	document.getElementById("menu2").style.visibility = 'hidden';
	sample.toggle();
	ReferensFreq();
	gameCounter.start();
	//var count = setInterval(updateTime, 1000);
	//currentTime = setInterval( function () { updateTime() }, 1000);
	main();
}

var currentTime;

//Create the canvas-----------------------------
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 480;
document.body.appendChild(canvas); 

//set time
var sTime = new Date().getTime();
var countDown = 10;
var sec;
 

//Reset when game is over
var reset = function() {
	score = 0;
}
//Rita cirkel
var el = document.getElementById("manCirkel"),
twoCirkel = new Two({
		fullscreen: true
		});
							
	twoCirkel.appendTo(el);
	var cirkel = twoCirkel.makeCircle(110,110,10);
	cirkel.fill = "white";
	cirkel.noStroke();

var score = 0;
var update = function(modifier) {
	var userFrequency = updatePitch();
	var points = document.getElementById("points");
	//console.log("UPDATE");
	
	cirkel.translation.set(700,userFrequency);
	twoCirkel.update();

	if ((userFrequency > playedTone - 1) && (userFrequency < playedTone + 1)) {
		console.log("kul");
		ReferensFreq(); //slumpar fram en ny ton. 
		score += 10;
		r = e = 0; //nollställer
	}
	points.innerHTML = score + " poäng";
	//if time is out
	if (sec == 0) { 
		//console.log("time is out");
		document.getElementById("menu2").style.visibility = 'visible';
		document.getElementById("score").innerHTML = "Spelet slut. Du fick " + score + " poäng. Spela igen?";	
	}

}

//TIMER--------------------------

var toneCounter = new Countdown({  
    seconds:1,  // number of seconds to count down
    onUpdateStatus: function(sec){console.log(sec);}, // callback for each second
    onCounterEnd: function(){ sample.toggle();} // final action
});
//alert('counter ended!');
document.getElementById("theTimer").innerHTML = "Time: 10";
var gameCounter = new Countdown({  
    seconds:10,  // number of seconds to count down
    onUpdateStatus: function(sec){
							console.log(sec);
							document.getElementById("theTimer").innerHTML = "Time: " + sec.toString();	
							}, // callback for each second
    onCounterEnd: function(){ 
						document.getElementById("theTimer").innerHTML = "Game over";
						sec = 0;
					} // final action
});

function Countdown(options) {
  var timer,
  instance = this,
  seconds = options.seconds || 10,
  updateStatus = options.onUpdateStatus || function () {},
  counterEnd = options.onCounterEnd || function () {};

  function decrementCounter() {
    updateStatus(seconds);
    if (seconds === 0) {
      counterEnd();
      instance.stop();
    }
    seconds--;
  }

  this.start = function () {
    clearInterval(timer);
    timer = 0;
    seconds = options.seconds;
    timer = setInterval(decrementCounter, 1000);
  };

  this.stop = function () {
    clearInterval(timer);
  };
}
//Graphics----------------------------

two = new Two({
        fullscreen: true
});

//SKAPA LINJEN
var yled = 0;

document.getElementById("de").innerHTML = yled;
var el = document.getElementById("man");
 
two.appendTo(el);
var line = two.makeRectangle(720, 545, 1000, 5);	
line.fill = "white";
line.noStroke();


//------------------------
var render = function() {
	//rita saker
	e = Math.round(480 / 350);
	r = Number(thePlayed) - 200;
	yled = (e * r) + 300 ;
 	
 	line.translation.set(720, yled);

	two.update();
	document.getElementById("man").style.visibility = 'visible';


}


var main = function () {
	if (counter == 0) {
		ReferensFreq(); // för första gången
		counter++;
	}

	update();
	requestAnimationFrame(main);

}