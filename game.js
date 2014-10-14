//storlek på fönster
// var HEIGHT = 1024;
// var WIDTH = 768;
var HEIGHT = window.innerHeight;
var WIDTH = window.innerWidth;


var mouseXpos;
var mouseYpos;

var score = 0;


window.onload = function () {

	var canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');

	context.canvas.width = WIDTH;
	context.canvas.height = HEIGHT;

	stage = new createjs.Stage("myCanvas"); 

	//vill börja då alla filer är laddade. Behövs?
	queue = new createjs.LoadQueue(false);
	queue.installPlugin(createjs.Sound);
	queue.on("complete", queueLoaded, this);
	createjs.Sound.alternativeExtensions = ["ogg"]; //för att kunna spela upp mp3 mm


	//Create a load manifest for all assets
	//lägg in alla bilder och ljud här!
	queue.loadManifest([
			{id: 'backgroundImage', src: 'images/background.jpg'}
	]);
	queue.load();

	gameTimer = setInterval(updateTime, 1000); //för att kunna sätta 10 sekunder tid

	//console.log(frequency);
}

//UPPSÄTTNING
function queueLoaded(event) {
	var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"));
	stage.addChild(backgroundImage);

	//Add score and position
	scoreText = new createjs.Text("Score: " + score.toString(), "30px Arial", "#FFF");
	scoreText.x = 10;
	scoreText.y = 10;
	stage.addChild(scoreText);

	//Add timer 
	timerText = new createjs.Text("Time: " + gameTimer.toString(), "30px Arial", "#FFF");
	timerText.x = 800;
	timerText.y = 10;
	stage.addChild(timerText);

	//lägg till spritesheets för animation av träff av ton osv
	//http://www.youtube.com/watch?v=3hpBX25THlk

	//Add ticker
	createjs.Ticker.setFPS(15);
	createjs.Ticker.addEventListener('tick', stage);
	//createjs.Ticker.addEventListener('tick', tickEvent);

	//för  //BEHÖVS??
	//window.onmousemove = handleMouseMove;
	//window.onmousedown = handleMouseDown;
}


//SJÄLVA SPELET 
function getAction() {


	console.log(frequency);

	//if-funcition = om tonen == frekvensen!
	//plussa på scoren!


}

function updateTime() {
	gameTimer += 1;

	if (gameTimer > 10) {
		timerText.text = "GAME OVER";
		//stage.removeChild() vad behövs ta bort?

		//Spelar upp gameoverljused
		clearInterval(gameTimer);
	}
	else {
		timerText.text = "Time: " + gameTimer;
		createjs.Sound.play("tick");

	}

}
	


























