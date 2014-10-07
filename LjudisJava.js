// Start off by initializing a new context.
context = new (window.AudioContext || window.webkitAudioContext)();

if (!context.createGain)
  context.createGain = context.createGainNode;
if (!context.createDelay)
  context.createDelay = context.createDelayNode;
if (!context.createScriptProcessor)
  context.createScriptProcessor = context.createJavaScriptNode;

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
return  window.requestAnimationFrame       || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame    || 
  window.oRequestAnimationFrame      || 
  window.msRequestAnimationFrame     || 
  function( callback ){
  window.setTimeout(callback, 1000 / 60);
};
})();





navigator.getUserMedia = (navigator.getUserMedia ||
						  navigator.webkitGetUserMedia ||
						  navigator.mozGetUserMedia ||
						  navigator.msGetUserMedia);

function MicrophoneSample() {
	this.WIDTH = 300;
	this.HEIGHT = 300;
	this.getMicrophoneInput();
	this.canvas = document.querySelector('canvas');
}

MicrophoneSample.prototype.getMicrophoneInput = function() {
	navigator.getUserMedia({audio: true},
	this.onStream.bind(this),
	this.onStreamError.bind(this));
};

MicrophoneSample.prototype.onStream = function(stream) {
	var input = context.createMediaStreamSource(stream);
	
	var x = document.getElementById('roligt');
	x.innerHTML = '3';
	
	var filter = context.createBiquadFilter();
	filter.frequency.value = 60.0;
	filter.type = filter.NOTCH;
	filter.Q = 10.0;
	var analyser = context.createAnalyser();
	
	
	
	// Connect graph.
	input.connect(filter);
	filter.connect(analyser);
	this.analyser = analyser;
	
	// Setup a timer to visualize some stuff.
	requestAnimFrame(this.visualize.bind(this));
};

MicrophoneSample.prototype.onStreamError = function(e) {
	console.error('Error getting microphone', e);
};

MicrophoneSample.prototype.visualize = function() {
	this.canvas.width = this.WIDTH;
	this.canvas.height = this.HEIGHT;
	var drawContext = this.canvas.getContext('2d');
	var times = new Uint8Array(this.analyser.frequencyBinCount);
	this.analyser.getByteTimeDomainData(times);
	for (var i = 0; i < times.length; i++) {
		var value = times[i];
		var percent = value / 256;
		var height = this.HEIGHT * percent;
		var offset = this.HEIGHT - height - 1;
		var barWidth = this.WIDTH/times.length;
		drawContext.fillStyle = 'black';
		drawContext.fillRect(i * barWidth, offset, 1, 1);
	}
	
	requestAnimFrame(this.visualize.bind(this));
};