var ctx = [];
var paddle = [];
var ball = [];
var timer = [];
var blocks = [];

var balls = 3;
var score = 0;
var combo = 0;
var level = 1;
var getBonusBall = false;

var WIDTH = 600;
var HEIGHT = 600;

var row = 6;
var column = 9;

var colors = ['red', 'orange', 'yellow', 'green', 'purple', 'blue'];

var canvas = document.getElementsByTagName('canvas');

function Ball() {
	this.x = 0;
	this.y = HEIGHT + this.r;
	this.dx = 0;
	this.dy = 0;
	this.r = 10;
	this.dir = 0;
	this.speed = 3;
	
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
	this.point = (row - i) * 10;
}

function Paddle() {
	this.w = 110;
	this.h = 20;
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
				ball.x = paddle.x + (paddle.w / 2 - ball.r);
				ball.y = paddle.y - ball.r;
				ball.changeDir(Math.random() * Math.PI / 2 + Math.PI / 4);
			}
			
			break;
	}
}

function start() {
	if (level > 5 && level <= 10) {
		WIDTH = 785;
		canvas[0].width = WIDTH;
		column = 12;
	} else if (level > 10) {
		WIDTH = 1025;
		canvas[0].width = WIDTH;
		column = 16;
	}
	
	paddle.w = Math.max(20, paddle.w - 10);
	paddle.x = (WIDTH - paddle.w) / 2;
	ball.speed = Math.min(20, ball.speed + 1);
	
	for (var i = 0; i < row; i++) {
		for (var j = 0; j < column; j++) {
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
	
	if (paddle.x < ball.x && paddle.x + paddle.w > ball.x &&
		paddle.y - ball.r < ball.y) {
		combo = 0;
		getBonusBall = false;
		var ratio = (paddle.x + paddle.w / 2 - ball.x) / paddle.w * 0.8;
		ball.changeDir(Math.PI / 2 + Math.PI * ratio);
	} else if (ball.y >= HEIGHT + 2) {
		if (--balls == 0) {
			clearInterval(timer);
			timer = NaN;
			draw();
			return;
		}

		ball.y = HEIGHT + ball.r;
	}
	
	var nx = ball.x + ball.dx;
	var ny = ball.y + ball.dy;
	
	if (ny < ball.r && ball.dy < 0) {
		ball.changeDir(ball.dir * -1);
	} else if (nx < ball.r || nx + ball.r > WIDTH) {
		ball.changeDir(Math.PI - ball.dir);
	}
	
	var hit = -1;
	var direction;
	
	blocks.some(function (block, i) {
		if (block.x - ball.r < nx && block.x + block.w + ball.r > nx &&
		    block.y - ball.r < ny && block.y + block.h + ball.r > ny) {
			if (block.x - ball.r < ball.x && block.x + block.w + ball.r > ball.x &&
				block.y + block.h < ball.y && block.y + block.h + ball.r > ball.y) {
				hit = i;
				direction = "down";
				return true; 
			} else if (block.x - ball.r < ball.x && block.x + block.w + ball.r > ball.x &&
					   block.y - ball.r < ball.y && block.y > ball.y) {
				hit = i;
				direction = "up";
				return true;
			} else if (block.x - ball.r < ball.x && block.x > ball.x &&
					   block.y - ball.r < ball.y && block.y + block.h + ball.r > ball.y) {
				hit = i;
				direction = "left";
				return true;
			} else if (block.x + block.w < ball.x && block.x + block.w + ball.r > ball.x &&
					   block.y - ball.r < ball.y && block.y + block.h + ball.r > ball.y) {
				hit = i;
				direction = "right";
				return true;
			}
		}
		
		return false;
	});
	
	if (hit >= 0) {
		combo++;
		
		if (combo > 0 && combo <= 2) {
			score += Math.round(1 * blocks[hit].point);
		} else if (combo > 2 && combo <= 5) {
			score += Math.round(1.25 * blocks[hit].point);
		} else if (combo > 5 && combo <= 9) {
			score += Math.round(1.5 * blocks[hit].point);
		} else if (combo > 9 && combo <= 15) {
			score += Math.round(1.75 * blocks[hit].point);
		} else if (combo > 15) {
			score += Math.round(2 * blocks[hit].point);
			if (!getBonusBall) {
				balls++;
				getBonusBall = true;
			}
		}
		
		blocks.splice(hit, 1);
		
		if (blocks.length <= 0) {
			ball.y = HEIGHT + ball.r;
			ball.speed = ball.speed + 0.5;
			level++;
			balls++;
			start();
			return;
		}
		
		if (direction == "down" || direction == "up") {
			ball.changeDir(ball.dir * -1);
		} else if (direction == "left" || direction == "right") {
			ball.changeDir(Math.PI - ball.dir);
		}
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
	ctx.font = "20pt Arial";
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	blocks.forEach(function(block) {
		block.draw(ctx);
	});
	
	paddle.draw(ctx);
	
	ball.draw(ctx);
	
	if (balls <= 5) {
		for (var i = 0; i < balls; i++) {
			drawBall(50 + 30 * i, 20, 10);
		}
	} else {
		drawBall(50, 20, 10);
		ctx.fillText("x" + balls, 70, 30);
	}

	ctx.fillStyle = 'rgb(0, 255, 0)';
	ctx.fillText(('00000' + score).slice(-5), (WIDTH - 100), 30);
	ctx.fillText(level, (WIDTH / 2) - 10, 30);

	if (isNaN(timer)) {
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.fillText('GAME OVER', (WIDTH - 80), 250);
	}
}