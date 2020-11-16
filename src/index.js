const canvas = document.querySelector(`#canvas`);
const ctx = canvas.getContext(`2d`);
let UserScore = document.querySelector(`#UserScore`);
let Timer = document.querySelector(`#TimerCount`);

const CacheImages = [
	`bg.jpg`,
	`player.png`,
	`player_left.png`,
	`player_right.png`,
	`car1.png`,
	`car2.png`,
	`car3.png`,
	`pit2.png`,
	`bank1.png`,
	`title.png`
];
const Images = {};

//Iterating over CacheImages and checking for loading
let PromisesArray = CacheImages.map(ImageUrl => {
	let Promises = new Promise(resolve => {
		const img = new Image();
		img.onload = () => {
			Images[ImageUrl] = img;
			resolve();
		};
		img.src = `img/` + ImageUrl;
	});
	return Promises;
});

window.addEventListener(`resize`, Resize())
window.addEventListener(`keydown`, event => {
	if (event.defaultPrevented) { return; }
	let key = state.keyMap[event.code]
	state.pressedKeys[key] = true
}, false);

window.addEventListener(`keyup`, event => {
	if (event.defaultPrevented) { return; }
	let key = state.keyMap[event.code];
	state.pressedKeys[key] = false
}, false);

//if Images is loaded
Promise.all(PromisesArray).then(() => {
	requestAnimationFrame(update);
});

// engine variables
const SPEED = 4;
const SCALE = 0.5;
const FRAME_DURATION = 1000 / 144; // 144 this is fps 
let dt = 0;
let lasttime = 0;
let isPlayer = true;

//game variables
let TimerCount = 20;
let bgYpos = canvas.height;
let score = 0;
let Objects = [];

let state = {
	pressedKeys: {
		ArrowRight: false,
		ArrowLeft: false
	},
	keyMap: {
		ArrowRight: `ArrowRight`,
		ArrowLeft: `ArrowLeft`
	}
};

class BackGround {
	constructor(height, image, speed) {
		this.height = height
		this.y = this.height;
		this.image = image;
		this.speed = speed
	}

	draw() {
		ctx.drawImage(this.image[`bg.jpg`],
			0,
			-(this.image[`bg.jpg`].height - this.y));
	}

	update(dt) {
		this.draw();
		this.y += this.speed * dt;
		if(this.y >= this.image[`bg.jpg`].height - this.height){
			this.y = this.height;
		}
	}
}

class Player {
	constructor(images, speed, pressedKeys, scale, width) {
		this.x = 520;
		this.y = 710;
		this.images = images;
		this.speed = speed;
		this.pressedKeys = pressedKeys;
		this.scale = scale;
		this.width = width;
	}

	draw() {
		ctx.drawImage(this.images[`player.png`],
			this.x,
			this.y,
			this.images[`player.png`].width * this.scale,
			this.images[`player.png`].height * this.scale);
	}

	collision() {
		if (this.x + this.images[`player.png`].width * this.scale >= this.width) {
			this.x = this.width - this.images[`player.png`].width * this.scale;
		} else if (this.x <= 0) {
			this.x = 0;
		}
	}

	update(dt) {
		if (this.pressedKeys.ArrowLeft) {
			ctx.drawImage(this.images[`player_right.png`],
				this.x,
				this.y,
				this.images[`player_right.png`].width * this.scale,
				this.images[`player_right.png`].height * this.scale);
			this.x -= this.speed * dt;
		} else if (this.pressedKeys.ArrowRight) {
			ctx.drawImage(this.images[`player_left.png`],
				this.x,
				this.y,
				this.images[`player_left.png`].width * this.scale,
				this.images[`player_left.png`].height * this.scale);
			this.x += this.speed * dt;
		} else {
			this.draw();
		}

		this.collision();
	}
}

class OtherObjects {
	constructor(x, y, image, speed, scale) {
		this.x = x;
		this.y = y;
		this.image = image;
		this.speed = speed;
		this.scale = scale;
	}
	draw() {
		ctx.drawImage(this.image,
			this.x,
			this.y,
			this.image.width * this.scale,
			this.image.height * this.scale);
	}
	update(dt) {
		this.draw();
		this.collision();
		this.y += this.speed * dt;
	}
	collision() {
		if (player.x + Images[`player.png`].width * this.scale >= this.x
			&& player.x <= this.x + this.image.width * this.scale
			&& player.y + Images[`player.png`].height * this.scale >= this.y
			&& player.y <= this.y + this.image.height * this.scale) {
			if (this.image === Images[`bank1.png`]) {
				score++;
				UserScore.innerHTML = score;
			} else {
				isPlayer = false;
				GameOver();
			}
		}
	}
}

const bg = new BackGround(canvas.height, Images, SPEED);
const player = new Player(Images, SPEED, state.pressedKeys, SCALE, canvas.width);

function update(now) {
	dt = (now - lasttime) / FRAME_DURATION;

	bg.update(dt);

	Objects.forEach((enemy, index) => {
		enemy.update(dt);
		if (enemy.y >= canvas.height + enemy.image.height) {
			Objects.splice(index, 1);
		}
	})

	player.update(dt);

	lasttime = now;
	TimerCount = Math.floor(now / 1000);
	Timer.innerHTML = 20 - TimerCount;
	
	if (isPlayer && TimerCount < 20) {
		requestAnimationFrame(update);
	} else {
		GameOver();
	}
}

function spawnEntity() {
	setInterval(() => {
		let img;
		let rand = Math.random()
		if (rand < 0.2) {
			img = Images[`car2.png`];
		} else if (rand < 0.4) {
			img = Images[`car3.png`];
		} else if (rand < 0.6) {
			img = Images[`car1.png`];
		} else if (rand < 0.8) {
			img = Images[`pit2.png`];
		} else {
			img = Images[`bank1.png`];
		}

		const x = ~~(Math.random() * (canvas.width - img.width)) + (img.width * SCALE) // ~~ it`s bitwise operator
		const y = -500;
		Objects.push(new OtherObjects(x, y, img, SPEED, SCALE));
	}, 1000);
}

spawnEntity();

function Resize() {
	canvas.width = 1047;
	canvas.height = innerHeight;
}
function GameOver() {
	ctx.beginPath();
	ctx.fillStyle = `red`;
	ctx.font = `48px arial`;
	ctx.textAlign = `center`;
	ctx.fillText(`Your score: ${score}. If you want play. Click on button`, canvas.width / 2, canvas.height / 2);
	ctx.fill();
}
