/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var canvas = document.querySelector("#canvas");
var ctx = canvas.getContext("2d");
var UserScore = document.querySelector("#UserScore");
var Timer = document.querySelector("#TimerCount");
var CacheImages = ["bg.jpg", "player.png", "player_left.png", "player_right.png", "car1.png", "car2.png", "car3.png", "pit2.png", "bank1.png", "title.png"];
var Images = {}; //Iterating over CacheImages and checking for loading

var PromisesArray = CacheImages.map(function (ImageUrl) {
  var Promises = new Promise(function (resolve) {
    var img = new Image();

    img.onload = function () {
      Images[ImageUrl] = img;
      resolve();
    };

    img.src = "img/" + ImageUrl;
  });
  return Promises;
});
window.addEventListener("resize", Resize());
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  var key = state.keyMap[event.code];
  state.pressedKeys[key] = true;
}, false);
window.addEventListener("keyup", function (event) {
  if (event.defaultPrevented) {
    return;
  }

  var key = state.keyMap[event.code];
  state.pressedKeys[key] = false;
}, false); //if Images is loaded

Promise.all(PromisesArray).then(function () {
  requestAnimationFrame(update);
}); // engine variables

var SPEED = 4;
var SCALE = 0.5;
var FRAME_DURATION = 1000 / 144; // 144 this is fps 

var dt = 0;
var lasttime = 0;
var isPlayer = true; //game variables

var TimerCount = 20;
var bgYpos = canvas.height;
var score = 0;
var Objects = [];
var state = {
  pressedKeys: {
    ArrowRight: false,
    ArrowLeft: false
  },
  keyMap: {
    ArrowRight: "ArrowRight",
    ArrowLeft: "ArrowLeft"
  }
};

var BackGround = /*#__PURE__*/function () {
  function BackGround(height, image, speed) {
    _classCallCheck(this, BackGround);

    this.height = height;
    this.y = this.height;
    this.image = image;
    this.speed = speed;
  }

  _createClass(BackGround, [{
    key: "draw",
    value: function draw() {
      ctx.drawImage(this.image["bg.jpg"], 0, -(this.image["bg.jpg"].height - this.y));
    }
  }, {
    key: "update",
    value: function update(dt) {
      this.draw();
      this.y += this.speed * dt;

      if (this.y >= this.image["bg.jpg"].height - this.height) {
        this.y = this.height;
      }
    }
  }]);

  return BackGround;
}();

var Player = /*#__PURE__*/function () {
  function Player(images, speed, pressedKeys, scale, width) {
    _classCallCheck(this, Player);

    this.x = 520;
    this.y = 710;
    this.images = images;
    this.speed = speed;
    this.pressedKeys = pressedKeys;
    this.scale = scale;
    this.width = width;
  }

  _createClass(Player, [{
    key: "draw",
    value: function draw() {
      ctx.drawImage(this.images["player.png"], this.x, this.y, this.images["player.png"].width * this.scale, this.images["player.png"].height * this.scale);
    }
  }, {
    key: "collision",
    value: function collision() {
      if (this.x + this.images["player.png"].width * this.scale >= this.width) {
        this.x = this.width - this.images["player.png"].width * this.scale;
      } else if (this.x <= 0) {
        this.x = 0;
      }
    }
  }, {
    key: "update",
    value: function update(dt) {
      if (this.pressedKeys.ArrowLeft) {
        ctx.drawImage(this.images["player_right.png"], this.x, this.y, this.images["player_right.png"].width * this.scale, this.images["player_right.png"].height * this.scale);
        this.x -= this.speed * dt;
      } else if (this.pressedKeys.ArrowRight) {
        ctx.drawImage(this.images["player_left.png"], this.x, this.y, this.images["player_left.png"].width * this.scale, this.images["player_left.png"].height * this.scale);
        this.x += this.speed * dt;
      } else {
        this.draw();
      }

      this.collision();
    }
  }]);

  return Player;
}();

var OtherObjects = /*#__PURE__*/function () {
  function OtherObjects(x, y, image, speed, scale) {
    _classCallCheck(this, OtherObjects);

    this.x = x;
    this.y = y;
    this.image = image;
    this.speed = speed;
    this.scale = scale;
  }

  _createClass(OtherObjects, [{
    key: "draw",
    value: function draw() {
      ctx.drawImage(this.image, this.x, this.y, this.image.width * this.scale, this.image.height * this.scale);
    }
  }, {
    key: "update",
    value: function update(dt) {
      this.draw();
      this.collision();
      this.y += this.speed * dt;
    }
  }, {
    key: "collision",
    value: function collision() {
      if (player.x + Images["player.png"].width * this.scale >= this.x && player.x <= this.x + this.image.width * this.scale && player.y + Images["player.png"].height * this.scale >= this.y && player.y <= this.y + this.image.height * this.scale) {
        if (this.image === Images["bank1.png"]) {
          score++;
          UserScore.innerHTML = score;
        } else {
          isPlayer = false;
          GameOver();
        }
      }
    }
  }]);

  return OtherObjects;
}();

var bg = new BackGround(canvas.height, Images, SPEED);
var player = new Player(Images, SPEED, state.pressedKeys, SCALE, canvas.width);

function update(now) {
  dt = (now - lasttime) / FRAME_DURATION;
  bg.update(dt);
  Objects.forEach(function (enemy, index) {
    enemy.update(dt);

    if (enemy.y >= canvas.height + enemy.image.height) {
      Objects.splice(index, 1);
    }
  });
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
  setInterval(function () {
    var img;
    var rand = Math.random();

    if (rand < 0.2) {
      img = Images["car2.png"];
    } else if (rand < 0.4) {
      img = Images["car3.png"];
    } else if (rand < 0.6) {
      img = Images["car1.png"];
    } else if (rand < 0.8) {
      img = Images["pit2.png"];
    } else {
      img = Images["bank1.png"];
    }

    var x = ~~(Math.random() * (canvas.width - img.width)) + img.width * SCALE; // ~~ it`s bitwise operator

    var y = -500;
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
  ctx.fillStyle = "red";
  ctx.font = "48px arial";
  ctx.textAlign = "center";
  ctx.fillText("Your score: ".concat(score, ". If you want play. Click on button"), canvas.width / 2, canvas.height / 2);
  ctx.fill();
}
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdXBlcmF1dG8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiY2FudmFzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY3R4IiwiZ2V0Q29udGV4dCIsIlVzZXJTY29yZSIsIlRpbWVyIiwiQ2FjaGVJbWFnZXMiLCJJbWFnZXMiLCJQcm9taXNlc0FycmF5IiwibWFwIiwiSW1hZ2VVcmwiLCJQcm9taXNlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiaW1nIiwiSW1hZ2UiLCJvbmxvYWQiLCJzcmMiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiUmVzaXplIiwiZXZlbnQiLCJkZWZhdWx0UHJldmVudGVkIiwia2V5Iiwic3RhdGUiLCJrZXlNYXAiLCJjb2RlIiwicHJlc3NlZEtleXMiLCJhbGwiLCJ0aGVuIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidXBkYXRlIiwiU1BFRUQiLCJTQ0FMRSIsIkZSQU1FX0RVUkFUSU9OIiwiZHQiLCJsYXN0dGltZSIsImlzUGxheWVyIiwiVGltZXJDb3VudCIsImJnWXBvcyIsImhlaWdodCIsInNjb3JlIiwiT2JqZWN0cyIsIkFycm93UmlnaHQiLCJBcnJvd0xlZnQiLCJCYWNrR3JvdW5kIiwiaW1hZ2UiLCJzcGVlZCIsInkiLCJkcmF3SW1hZ2UiLCJkcmF3IiwiUGxheWVyIiwiaW1hZ2VzIiwic2NhbGUiLCJ3aWR0aCIsIngiLCJjb2xsaXNpb24iLCJPdGhlck9iamVjdHMiLCJwbGF5ZXIiLCJpbm5lckhUTUwiLCJHYW1lT3ZlciIsImJnIiwibm93IiwiZm9yRWFjaCIsImVuZW15IiwiaW5kZXgiLCJzcGxpY2UiLCJNYXRoIiwiZmxvb3IiLCJzcGF3bkVudGl0eSIsInNldEludGVydmFsIiwicmFuZCIsInJhbmRvbSIsInB1c2giLCJpbm5lckhlaWdodCIsImJlZ2luUGF0aCIsImZpbGxTdHlsZSIsImZvbnQiLCJ0ZXh0QWxpZ24iLCJmaWxsVGV4dCIsImZpbGwiXSwibWFwcGluZ3MiOiI7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QUFvQjtBQUNuQjFELEtBQUcsQ0FBQ3lFLFNBQUo7QUFDQXpFLEtBQUcsQ0FBQzBFLFNBQUo7QUFDQTFFLEtBQUcsQ0FBQzJFLElBQUo7QUFDQTNFLEtBQUcsQ0FBQzRFLFNBQUo7QUFDQTVFLEtBQUcsQ0FBQzZFLFFBQUosdUJBQTRCdEMsS0FBNUIsMENBQXdFMUMsTUFBTSxDQUFDdUQsS0FBUCxHQUFlLENBQXZGLEVBQTBGdkQsTUFBTSxDQUFDeUMsTUFBUCxHQUFnQixDQUExRztBQUNBdEMsS0FBRyxDQUFDOEUsSUFBSjtBQUNBLEMiLCJmaWxlIjoianMvc3VwZXJhdXRvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI2NhbnZhc2ApO1xyXG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChgMmRgKTtcclxubGV0IFVzZXJTY29yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCNVc2VyU2NvcmVgKTtcclxubGV0IFRpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgI1RpbWVyQ291bnRgKTtcclxuXHJcbmNvbnN0IENhY2hlSW1hZ2VzID0gW1xyXG5cdGBiZy5qcGdgLFxyXG5cdGBwbGF5ZXIucG5nYCxcclxuXHRgcGxheWVyX2xlZnQucG5nYCxcclxuXHRgcGxheWVyX3JpZ2h0LnBuZ2AsXHJcblx0YGNhcjEucG5nYCxcclxuXHRgY2FyMi5wbmdgLFxyXG5cdGBjYXIzLnBuZ2AsXHJcblx0YHBpdDIucG5nYCxcclxuXHRgYmFuazEucG5nYCxcclxuXHRgdGl0bGUucG5nYFxyXG5dO1xyXG5jb25zdCBJbWFnZXMgPSB7fTtcclxuXHJcbi8vSXRlcmF0aW5nIG92ZXIgQ2FjaGVJbWFnZXMgYW5kIGNoZWNraW5nIGZvciBsb2FkaW5nXHJcbmxldCBQcm9taXNlc0FycmF5ID0gQ2FjaGVJbWFnZXMubWFwKEltYWdlVXJsID0+IHtcclxuXHRsZXQgUHJvbWlzZXMgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcclxuXHRcdGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cdFx0aW1nLm9ubG9hZCA9ICgpID0+IHtcclxuXHRcdFx0SW1hZ2VzW0ltYWdlVXJsXSA9IGltZztcclxuXHRcdFx0cmVzb2x2ZSgpO1xyXG5cdFx0fTtcclxuXHRcdGltZy5zcmMgPSBgaW1nL2AgKyBJbWFnZVVybDtcclxuXHR9KTtcclxuXHRyZXR1cm4gUHJvbWlzZXM7XHJcbn0pO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoYHJlc2l6ZWAsIFJlc2l6ZSgpKVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihga2V5ZG93bmAsIGV2ZW50ID0+IHtcclxuXHRpZiAoZXZlbnQuZGVmYXVsdFByZXZlbnRlZCkgeyByZXR1cm47IH1cclxuXHRsZXQga2V5ID0gc3RhdGUua2V5TWFwW2V2ZW50LmNvZGVdXHJcblx0c3RhdGUucHJlc3NlZEtleXNba2V5XSA9IHRydWVcclxufSwgZmFsc2UpO1xyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoYGtleXVwYCwgZXZlbnQgPT4ge1xyXG5cdGlmIChldmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxyXG5cdGxldCBrZXkgPSBzdGF0ZS5rZXlNYXBbZXZlbnQuY29kZV07XHJcblx0c3RhdGUucHJlc3NlZEtleXNba2V5XSA9IGZhbHNlXHJcbn0sIGZhbHNlKTtcclxuXHJcbi8vaWYgSW1hZ2VzIGlzIGxvYWRlZFxyXG5Qcm9taXNlLmFsbChQcm9taXNlc0FycmF5KS50aGVuKCgpID0+IHtcclxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxufSk7XHJcblxyXG4vLyBlbmdpbmUgdmFyaWFibGVzXHJcbmNvbnN0IFNQRUVEID0gNDtcclxuY29uc3QgU0NBTEUgPSAwLjU7XHJcbmNvbnN0IEZSQU1FX0RVUkFUSU9OID0gMTAwMCAvIDE0NDsgLy8gMTQ0IHRoaXMgaXMgZnBzIFxyXG5sZXQgZHQgPSAwO1xyXG5sZXQgbGFzdHRpbWUgPSAwO1xyXG5sZXQgaXNQbGF5ZXIgPSB0cnVlO1xyXG5cclxuLy9nYW1lIHZhcmlhYmxlc1xyXG5sZXQgVGltZXJDb3VudCA9IDIwO1xyXG5sZXQgYmdZcG9zID0gY2FudmFzLmhlaWdodDtcclxubGV0IHNjb3JlID0gMDtcclxubGV0IE9iamVjdHMgPSBbXTtcclxuXHJcbmxldCBzdGF0ZSA9IHtcclxuXHRwcmVzc2VkS2V5czoge1xyXG5cdFx0QXJyb3dSaWdodDogZmFsc2UsXHJcblx0XHRBcnJvd0xlZnQ6IGZhbHNlXHJcblx0fSxcclxuXHRrZXlNYXA6IHtcclxuXHRcdEFycm93UmlnaHQ6IGBBcnJvd1JpZ2h0YCxcclxuXHRcdEFycm93TGVmdDogYEFycm93TGVmdGBcclxuXHR9XHJcbn07XHJcblxyXG5jbGFzcyBCYWNrR3JvdW5kIHtcclxuXHRjb25zdHJ1Y3RvcihoZWlnaHQsIGltYWdlLCBzcGVlZCkge1xyXG5cdFx0dGhpcy5oZWlnaHQgPSBoZWlnaHRcclxuXHRcdHRoaXMueSA9IHRoaXMuaGVpZ2h0O1xyXG5cdFx0dGhpcy5pbWFnZSA9IGltYWdlO1xyXG5cdFx0dGhpcy5zcGVlZCA9IHNwZWVkXHJcblx0fVxyXG5cclxuXHRkcmF3KCkge1xyXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlW2BiZy5qcGdgXSxcclxuXHRcdFx0MCxcclxuXHRcdFx0LSh0aGlzLmltYWdlW2BiZy5qcGdgXS5oZWlnaHQgLSB0aGlzLnkpKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZShkdCkge1xyXG5cdFx0dGhpcy5kcmF3KCk7XHJcblx0XHR0aGlzLnkgKz0gdGhpcy5zcGVlZCAqIGR0O1xyXG5cdFx0aWYodGhpcy55ID49IHRoaXMuaW1hZ2VbYGJnLmpwZ2BdLmhlaWdodCAtIHRoaXMuaGVpZ2h0KXtcclxuXHRcdFx0dGhpcy55ID0gdGhpcy5oZWlnaHQ7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBQbGF5ZXIge1xyXG5cdGNvbnN0cnVjdG9yKGltYWdlcywgc3BlZWQsIHByZXNzZWRLZXlzLCBzY2FsZSwgd2lkdGgpIHtcclxuXHRcdHRoaXMueCA9IDUyMDtcclxuXHRcdHRoaXMueSA9IDcxMDtcclxuXHRcdHRoaXMuaW1hZ2VzID0gaW1hZ2VzO1xyXG5cdFx0dGhpcy5zcGVlZCA9IHNwZWVkO1xyXG5cdFx0dGhpcy5wcmVzc2VkS2V5cyA9IHByZXNzZWRLZXlzO1xyXG5cdFx0dGhpcy5zY2FsZSA9IHNjYWxlO1xyXG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoO1xyXG5cdH1cclxuXHJcblx0ZHJhdygpIHtcclxuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZXNbYHBsYXllci5wbmdgXSxcclxuXHRcdFx0dGhpcy54LFxyXG5cdFx0XHR0aGlzLnksXHJcblx0XHRcdHRoaXMuaW1hZ2VzW2BwbGF5ZXIucG5nYF0ud2lkdGggKiB0aGlzLnNjYWxlLFxyXG5cdFx0XHR0aGlzLmltYWdlc1tgcGxheWVyLnBuZ2BdLmhlaWdodCAqIHRoaXMuc2NhbGUpO1xyXG5cdH1cclxuXHJcblx0Y29sbGlzaW9uKCkge1xyXG5cdFx0aWYgKHRoaXMueCArIHRoaXMuaW1hZ2VzW2BwbGF5ZXIucG5nYF0ud2lkdGggKiB0aGlzLnNjYWxlID49IHRoaXMud2lkdGgpIHtcclxuXHRcdFx0dGhpcy54ID0gdGhpcy53aWR0aCAtIHRoaXMuaW1hZ2VzW2BwbGF5ZXIucG5nYF0ud2lkdGggKiB0aGlzLnNjYWxlO1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLnggPD0gMCkge1xyXG5cdFx0XHR0aGlzLnggPSAwO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dXBkYXRlKGR0KSB7XHJcblx0XHRpZiAodGhpcy5wcmVzc2VkS2V5cy5BcnJvd0xlZnQpIHtcclxuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlc1tgcGxheWVyX3JpZ2h0LnBuZ2BdLFxyXG5cdFx0XHRcdHRoaXMueCxcclxuXHRcdFx0XHR0aGlzLnksXHJcblx0XHRcdFx0dGhpcy5pbWFnZXNbYHBsYXllcl9yaWdodC5wbmdgXS53aWR0aCAqIHRoaXMuc2NhbGUsXHJcblx0XHRcdFx0dGhpcy5pbWFnZXNbYHBsYXllcl9yaWdodC5wbmdgXS5oZWlnaHQgKiB0aGlzLnNjYWxlKTtcclxuXHRcdFx0dGhpcy54IC09IHRoaXMuc3BlZWQgKiBkdDtcclxuXHRcdH0gZWxzZSBpZiAodGhpcy5wcmVzc2VkS2V5cy5BcnJvd1JpZ2h0KSB7XHJcblx0XHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZXNbYHBsYXllcl9sZWZ0LnBuZ2BdLFxyXG5cdFx0XHRcdHRoaXMueCxcclxuXHRcdFx0XHR0aGlzLnksXHJcblx0XHRcdFx0dGhpcy5pbWFnZXNbYHBsYXllcl9sZWZ0LnBuZ2BdLndpZHRoICogdGhpcy5zY2FsZSxcclxuXHRcdFx0XHR0aGlzLmltYWdlc1tgcGxheWVyX2xlZnQucG5nYF0uaGVpZ2h0ICogdGhpcy5zY2FsZSk7XHJcblx0XHRcdHRoaXMueCArPSB0aGlzLnNwZWVkICogZHQ7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLmRyYXcoKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLmNvbGxpc2lvbigpO1xyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgT3RoZXJPYmplY3RzIHtcclxuXHRjb25zdHJ1Y3Rvcih4LCB5LCBpbWFnZSwgc3BlZWQsIHNjYWxlKSB7XHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHRcdHRoaXMuaW1hZ2UgPSBpbWFnZTtcclxuXHRcdHRoaXMuc3BlZWQgPSBzcGVlZDtcclxuXHRcdHRoaXMuc2NhbGUgPSBzY2FsZTtcclxuXHR9XHJcblx0ZHJhdygpIHtcclxuXHRcdGN0eC5kcmF3SW1hZ2UodGhpcy5pbWFnZSxcclxuXHRcdFx0dGhpcy54LFxyXG5cdFx0XHR0aGlzLnksXHJcblx0XHRcdHRoaXMuaW1hZ2Uud2lkdGggKiB0aGlzLnNjYWxlLFxyXG5cdFx0XHR0aGlzLmltYWdlLmhlaWdodCAqIHRoaXMuc2NhbGUpO1xyXG5cdH1cclxuXHR1cGRhdGUoZHQpIHtcclxuXHRcdHRoaXMuZHJhdygpO1xyXG5cdFx0dGhpcy5jb2xsaXNpb24oKTtcclxuXHRcdHRoaXMueSArPSB0aGlzLnNwZWVkICogZHQ7XHJcblx0fVxyXG5cdGNvbGxpc2lvbigpIHtcclxuXHRcdGlmIChwbGF5ZXIueCArIEltYWdlc1tgcGxheWVyLnBuZ2BdLndpZHRoICogdGhpcy5zY2FsZSA+PSB0aGlzLnhcclxuXHRcdFx0JiYgcGxheWVyLnggPD0gdGhpcy54ICsgdGhpcy5pbWFnZS53aWR0aCAqIHRoaXMuc2NhbGVcclxuXHRcdFx0JiYgcGxheWVyLnkgKyBJbWFnZXNbYHBsYXllci5wbmdgXS5oZWlnaHQgKiB0aGlzLnNjYWxlID49IHRoaXMueVxyXG5cdFx0XHQmJiBwbGF5ZXIueSA8PSB0aGlzLnkgKyB0aGlzLmltYWdlLmhlaWdodCAqIHRoaXMuc2NhbGUpIHtcclxuXHRcdFx0aWYgKHRoaXMuaW1hZ2UgPT09IEltYWdlc1tgYmFuazEucG5nYF0pIHtcclxuXHRcdFx0XHRzY29yZSsrO1xyXG5cdFx0XHRcdFVzZXJTY29yZS5pbm5lckhUTUwgPSBzY29yZTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRpc1BsYXllciA9IGZhbHNlO1xyXG5cdFx0XHRcdEdhbWVPdmVyKCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNvbnN0IGJnID0gbmV3IEJhY2tHcm91bmQoY2FudmFzLmhlaWdodCwgSW1hZ2VzLCBTUEVFRCk7XHJcbmNvbnN0IHBsYXllciA9IG5ldyBQbGF5ZXIoSW1hZ2VzLCBTUEVFRCwgc3RhdGUucHJlc3NlZEtleXMsIFNDQUxFLCBjYW52YXMud2lkdGgpO1xyXG5cclxuZnVuY3Rpb24gdXBkYXRlKG5vdykge1xyXG5cdGR0ID0gKG5vdyAtIGxhc3R0aW1lKSAvIEZSQU1FX0RVUkFUSU9OO1xyXG5cclxuXHRiZy51cGRhdGUoZHQpO1xyXG5cclxuXHRPYmplY3RzLmZvckVhY2goKGVuZW15LCBpbmRleCkgPT4ge1xyXG5cdFx0ZW5lbXkudXBkYXRlKGR0KTtcclxuXHRcdGlmIChlbmVteS55ID49IGNhbnZhcy5oZWlnaHQgKyBlbmVteS5pbWFnZS5oZWlnaHQpIHtcclxuXHRcdFx0T2JqZWN0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0fVxyXG5cdH0pXHJcblxyXG5cdHBsYXllci51cGRhdGUoZHQpO1xyXG5cclxuXHRsYXN0dGltZSA9IG5vdztcclxuXHRUaW1lckNvdW50ID0gTWF0aC5mbG9vcihub3cgLyAxMDAwKTtcclxuXHRUaW1lci5pbm5lckhUTUwgPSAyMCAtIFRpbWVyQ291bnQ7XHJcblx0XHJcblx0aWYgKGlzUGxheWVyICYmIFRpbWVyQ291bnQgPCAyMCkge1xyXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHVwZGF0ZSk7XHJcblx0fSBlbHNlIHtcclxuXHRcdEdhbWVPdmVyKCk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBzcGF3bkVudGl0eSgpIHtcclxuXHRzZXRJbnRlcnZhbCgoKSA9PiB7XHJcblx0XHRsZXQgaW1nO1xyXG5cdFx0bGV0IHJhbmQgPSBNYXRoLnJhbmRvbSgpXHJcblx0XHRpZiAocmFuZCA8IDAuMikge1xyXG5cdFx0XHRpbWcgPSBJbWFnZXNbYGNhcjIucG5nYF07XHJcblx0XHR9IGVsc2UgaWYgKHJhbmQgPCAwLjQpIHtcclxuXHRcdFx0aW1nID0gSW1hZ2VzW2BjYXIzLnBuZ2BdO1xyXG5cdFx0fSBlbHNlIGlmIChyYW5kIDwgMC42KSB7XHJcblx0XHRcdGltZyA9IEltYWdlc1tgY2FyMS5wbmdgXTtcclxuXHRcdH0gZWxzZSBpZiAocmFuZCA8IDAuOCkge1xyXG5cdFx0XHRpbWcgPSBJbWFnZXNbYHBpdDIucG5nYF07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRpbWcgPSBJbWFnZXNbYGJhbmsxLnBuZ2BdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGNvbnN0IHggPSB+fihNYXRoLnJhbmRvbSgpICogKGNhbnZhcy53aWR0aCAtIGltZy53aWR0aCkpICsgKGltZy53aWR0aCAqIFNDQUxFKSAvLyB+fiBpdGBzIGJpdHdpc2Ugb3BlcmF0b3JcclxuXHRcdGNvbnN0IHkgPSAtNTAwO1xyXG5cdFx0T2JqZWN0cy5wdXNoKG5ldyBPdGhlck9iamVjdHMoeCwgeSwgaW1nLCBTUEVFRCwgU0NBTEUpKTtcclxuXHR9LCAxMDAwKTtcclxufVxyXG5cclxuc3Bhd25FbnRpdHkoKTtcclxuXHJcbmZ1bmN0aW9uIFJlc2l6ZSgpIHtcclxuXHRjYW52YXMud2lkdGggPSAxMDQ3O1xyXG5cdGNhbnZhcy5oZWlnaHQgPSBpbm5lckhlaWdodDtcclxufVxyXG5mdW5jdGlvbiBHYW1lT3ZlcigpIHtcclxuXHRjdHguYmVnaW5QYXRoKCk7XHJcblx0Y3R4LmZpbGxTdHlsZSA9IGByZWRgO1xyXG5cdGN0eC5mb250ID0gYDQ4cHggYXJpYWxgO1xyXG5cdGN0eC50ZXh0QWxpZ24gPSBgY2VudGVyYDtcclxuXHRjdHguZmlsbFRleHQoYFlvdXIgc2NvcmU6ICR7c2NvcmV9LiBJZiB5b3Ugd2FudCBwbGF5LiBDbGljayBvbiBidXR0b25gLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMik7XHJcblx0Y3R4LmZpbGwoKTtcclxufVxyXG4iXSwic291cmNlUm9vdCI6IiJ9