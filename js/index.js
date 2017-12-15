var ctx = [];
var paddle = [];
var ball = [];
var timer = [];
var blocks = [];

var balls = 3;
var score = 0;

var WIDTH = 600;
var HEIGHT = 600;

var colors = ['red', 'orange', 'yellow', 'green', 'purple', 'blue'];

function Ball() {
	this.x = 0;
	this.y = HEIGHT + this.r;
	this.dx = 0;
	this.dy = 0;
	this.r = 10;
	this.dir = 0;
	this.speed = 10;
	
	this.move = function() {
		this.x += this.dx;
		this.y += this.dy;
	}
	
	this.changeDir = function(dir) {
		this.dir = dir;
		this.dx = this.speed * Math.cos(dir);
		this.dy = -this.speed * Math.sin(dir);
	}
	
	this.draw = function(ctx) {
		drawBall(this.x, this.y, this.r);
	}
	
	console.log("ballx = " + this.x + "; bally = " + this.y + "; ballr = " + this.r);
}

Block.prototype = Paddle.prototype = {
	draw: function(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}

function Block(x, y, i) {
	this.x = x;
	this.y = y;
	this.w = 50;
	this.h = 20;
	this.color = colors[i];
	this.point = (6 - i) * 10;
}

function Paddle() {
	this.w = 110;
	this.h = 20;
	this.x = (WIDTH - this.w) / 2;
	this.y = HEIGHT - 20;
	this.color = 'yellow';
	this.keyL = false;
	this.keyR = false;
}

function init() {
	ctx = document.getElementById('canvas').getContext('2d');
	ctx.font = "20pt Arial";
	
	window.addEventListener('keydown', function(e) {
		toggleKey(e.keyCode, true);
	}, true);
	
	window.addEventListener('keyup', function(e) {
		toggleKey(e.keyCode, false);
	}, true);
	
	paddle = new Paddle();
	ball = new Ball();
	start();
	
	if (!isNaN(timer)) {
		timer = setInterval(mainLoop, 15);
	}
}

function toggleKey(code, flag) {
	switch(code) {
		case 37:
			paddle.keyL = flag;
			break;
		case 39:
			paddle.keyR = flag;
			break;
		case 32:
			if (!isPlaying()) {
				ball.x = paddle.x + paddle.y / 2;
				ball.y = paddle.y - ball.r;
				ball.changeDir(Math.random() * Math.PI / 2 + Math.PI / 4);
			}
			
			break;
	}
}

function start() {
	paddle.w = Math.max(20, paddle.w - 10);
	ball.speed = Math.min(20, ball.speed + 1);
	
	for (var i = 0; i < 6; i++) {
		for (var j = 0; j < 9; j++) {
			blocks.push(new Block(j * 60 + 35, i * 30 + 50, i));
		}
	}
}

function mainLoop() {
	if (paddle.keyL) {
		paddle.x = Math.max(0, paddle.x - 10);
	}
	
	if (paddle.keyR) {
		paddle.x = Math.min(WIDTH - paddle.w, paddle.x + 10);
	}
	
	draw();
	
	if (!isPlaying()) {
		return;
	}
	
	if (ball.y > HEIGHT - paddle.h) {
		if (paddle.x < ball.x && paddle.x + paddle.w > ball.x &&
		    paddle.y < ball.y && paddle.y + paddle.h > ball.y) {
			var ratio = (paddle.x + paddle.w / 2 - ball.x) / paddle.w * 0.8;
			ball.changeDir(Math.PI / 2 + Math.PI * ratio);
		} else {
			if (--balls == 0) {
				clearInterval(timer);
				timer = NaN;
				draw();
				return;
			}
			
			ball.y = HEIGHT + ball.r;
		}
	}
	
	var nx = ball.x + ball.dx;
	var ny = ball.y + ball.dy;
	
	if (ny < ball.r && ball.dy < 0) {
		ball.changeDir(ball.dir * -1);
	} else if (nx < ball.r || nx + ball.r > WIDTH) {
		ball.changeDir(Math.PI - ball.dir);
	}
	
	var hit = -1;
	
	blocks.some(function (block, i) {
		if (block.x - ball.r < nx && block.x + block.w + ball.r > nx &&
		    block.y - ball.r < ny && block.y + block.h + ball.r > ny) {
			hit = i;
			return true;
		}
		
		return false;
	});
	
	if (hit >= 0) {
		score += blocks[hit].point;
		blocks.splice(hit, 1);
		
		if (blocks.length <= 0) {
			ball.y = HEIGHT + ball.r;
			start();
			return;
		}
		
		ball.changeDir(ball.dir * -1);
	}
	
	ball.move();
}

function isPlaying() {
	return ball.y < HEIGHT + ball.r;
}

function drawBall(x, y, r) {
	ctx.fillStyle = 'yellow';
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2, true);
	ctx.fill();
}

function draw() {
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	blocks.forEach(function(block) {
		block.draw(ctx);
	});
	
	paddle.draw(ctx);
	
	ball.draw(ctx);
	if (balls > 2) {
		drawBall(80, 15, 10);
	}
	
	if (balls > 1) {
		drawBall(50, 15, 10);
	}
	
	ctx.fillStyle = 'rgb(0, 255, 0)';
	ctx.fillText(('00000' + score).slice(-5), 500, 30);

	if (isNaN(timer)) {
		ctx.fillText('GAME OVER', 220, 250);
	}
}