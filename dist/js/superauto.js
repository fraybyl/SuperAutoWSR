/******/ (() => { // webpackBootstrap
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements:  */
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var canvas = document.querySelector('#canvas');
var ctx = canvas.getContext('2d');
var UserScore = document.querySelector('#UserScore');
var Timer = document.querySelector('#TimerCount');
var CacheImages = ['bg.jpg', 'player.png', 'player_left.png', 'player_right.png', 'car1.png', 'car2.png', 'car3.png', 'pit2.png', 'bank1.png', 'title.png'];
var Images = {}; //Iterating over CacheImages and checking for loading

var PromisesArray = CacheImages.map(function (ImageUrl) {
  var Promises = new Promise(function (resolve) {
    var img = new Image();

    img.onload = function () {
      Images[ImageUrl] = img;
      resolve();
    };

    img.src = 'img/' + ImageUrl;
  });
  return Promises;
});
window.addEventListener('resize', Resize());
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
    ArrowRight: 'ArrowRight',
    ArrowLeft: 'ArrowLeft'
  }
};

var BackGround = /*#__PURE__*/function () {
  function BackGround(height, image, speed) {
    _classCallCheck(this, BackGround);

    this.y = height;
    this.image = image;
    this.speed = speed;
  }

  _createClass(BackGround, [{
    key: "draw",
    value: function draw() {
      ctx.drawImage(this.image['bg.jpg'], 0, -(this.image['bg.jpg'].height - this.y));
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
      ctx.drawImage(this.images['player.png'], this.x, this.y, this.images['player.png'].width * this.scale, this.images['player.png'].height * this.scale);
    }
  }, {
    key: "collision",
    value: function collision() {
      if (this.x + this.images['player.png'].width * this.scale >= this.width) {
        this.x = this.width - this.images['player.png'].width * this.scale;
      } else if (this.x <= 0) {
        this.x = 0;
      }
    }
  }, {
    key: "update",
    value: function update(dt) {
      if (this.pressedKeys.ArrowLeft) {
        ctx.drawImage(this.images['player_right.png'], this.x, this.y, this.images['player_right.png'].width * this.scale, this.images['player_right.png'].height * this.scale);
        this.x -= this.speed * dt;
      } else if (this.pressedKeys.ArrowRight) {
        ctx.drawImage(this.images['player_left.png'], this.x, this.y, this.images['player_left.png'].width * this.scale, this.images['player_left.png'].height * this.scale);
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
        if (this.image === Images['bank1.png']) {
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
      img = Images['car2.png'];
    } else if (rand < 0.4) {
      img = Images['car3.png'];
    } else if (rand < 0.6) {
      img = Images['car1.png'];
    } else if (rand < 0.8) {
      img = Images['pit2.png'];
    } else {
      img = Images['bank1.png'];
    }

    var x = ~~(Math.random() * (canvas.width - img.width)) + img.width * SCALE; // ~~ it's bitwise operator

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
  ctx.font = '48px arial';
  ctx.textAlign = "center";
  ctx.fillText("Your score: ".concat(score, ". If you want play. Click on button"), canvas.width / 2, canvas.height / 2);
  ctx.fill();
}
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdXBlcmF1dG8vLi9zcmMvaW5kZXguanMiXSwibmFtZXMiOlsiY2FudmFzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiY3R4IiwiZ2V0Q29udGV4dCIsIlVzZXJTY29yZSIsIlRpbWVyIiwiQ2FjaGVJbWFnZXMiLCJJbWFnZXMiLCJQcm9taXNlc0FycmF5IiwibWFwIiwiSW1hZ2VVcmwiLCJQcm9taXNlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiaW1nIiwiSW1hZ2UiLCJvbmxvYWQiLCJzcmMiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiUmVzaXplIiwiZXZlbnQiLCJkZWZhdWx0UHJldmVudGVkIiwia2V5Iiwic3RhdGUiLCJrZXlNYXAiLCJjb2RlIiwicHJlc3NlZEtleXMiLCJhbGwiLCJ0aGVuIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidXBkYXRlIiwiU1BFRUQiLCJTQ0FMRSIsIkZSQU1FX0RVUkFUSU9OIiwiZHQiLCJsYXN0dGltZSIsImlzUGxheWVyIiwiVGltZXJDb3VudCIsImJnWXBvcyIsImhlaWdodCIsInNjb3JlIiwiT2JqZWN0cyIsIkFycm93UmlnaHQiLCJBcnJvd0xlZnQiLCJCYWNrR3JvdW5kIiwiaW1hZ2UiLCJzcGVlZCIsInkiLCJkcmF3SW1hZ2UiLCJkcmF3IiwiUGxheWVyIiwiaW1hZ2VzIiwic2NhbGUiLCJ3aWR0aCIsIngiLCJjb2xsaXNpb24iLCJPdGhlck9iamVjdHMiLCJwbGF5ZXIiLCJpbm5lckhUTUwiLCJHYW1lT3ZlciIsImJnIiwibm93IiwiZm9yRWFjaCIsImVuZW15IiwiaW5kZXgiLCJzcGxpY2UiLCJNYXRoIiwiZmxvb3IiLCJzcGF3bkVudGl0eSIsInNldEludGVydmFsIiwicmFuZCIsInJhbmRvbSIsInB1c2giLCJpbm5lckhlaWdodCIsImJlZ2luUGF0aCIsImZpbGxTdHlsZSIsImZvbnQiLCJ0ZXh0QWxpZ24iLCJmaWxsVGV4dCIsImZpbGwiXSwibWFwcGluZ3MiOiI7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LENBQUYsQ0FBRCxHQUFrRHhDLEdBQUcsQ0FBQ3dDLEtBQUosR0FBWXJCLEtBQXhFLENBZmlCLENBZThEOztBQUMvRSxRQUFNZSxDQUFDLEdBQUcsQ0FBQyxHQUFYO0FBQ0FOLFdBQU8sQ0FBQytCLElBQVIsQ0FBYSxJQUFJaEIsWUFBSixDQUFpQkYsQ0FBakIsRUFBb0JQLENBQXBCLEVBQXVCbEMsR0FBdkIsRUFBNEJrQixLQUE1QixFQUFtQ0MsS0FBbkMsQ0FBYjtBQUNBLEdBbEJVLEVBa0JSLElBbEJRLENBQVg7QUFtQkE7O0FBRURvQyxXQUFXOztBQUVYLFNBQVNqRCxNQUFULEdBQWtCO0FBQ2pCckIsUUFBTSxDQUFDdUQsS0FBUCxHQUFlLElBQWY7QUFDQXZELFFBQU0sQ0FBQ3lDLE1BQVAsR0FBZ0JrQyxXQUFoQjtBQUNBOztBQUNELFNBQVNkLFFBQVQsR0FBb0I7QUFDbkIxRCxLQUFHLENBQUN5RSxTQUFKO0FBQ0F6RSxLQUFHLENBQUMwRSxTQUFKO0FBQ0ExRSxLQUFHLENBQUMyRSxJQUFKLEdBQVcsWUFBWDtBQUNBM0UsS0FBRyxDQUFDNEUsU0FBSjtBQUNBNUUsS0FBRyxDQUFDNkUsUUFBSix1QkFBNEJ0QyxLQUE1QiwwQ0FBd0UxQyxNQUFNLENBQUN1RCxLQUFQLEdBQWUsQ0FBdkYsRUFBMEZ2RCxNQUFNLENBQUN5QyxNQUFQLEdBQWdCLENBQTFHO0FBQ0F0QyxLQUFHLENBQUM4RSxJQUFKO0FBQ0EsQyIsImZpbGUiOiJqcy9zdXBlcmF1dG8uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FudmFzJyk7XHJcbmNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG5sZXQgVXNlclNjb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI1VzZXJTY29yZScpO1xyXG5sZXQgVGltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjVGltZXJDb3VudCcpO1xyXG5cclxuY29uc3QgQ2FjaGVJbWFnZXMgPSBbXHJcblx0J2JnLmpwZycsXHJcblx0J3BsYXllci5wbmcnLFxyXG5cdCdwbGF5ZXJfbGVmdC5wbmcnLFxyXG5cdCdwbGF5ZXJfcmlnaHQucG5nJyxcclxuXHQnY2FyMS5wbmcnLFxyXG5cdCdjYXIyLnBuZycsXHJcblx0J2NhcjMucG5nJyxcclxuXHQncGl0Mi5wbmcnLFxyXG5cdCdiYW5rMS5wbmcnLFxyXG5cdCd0aXRsZS5wbmcnXHJcbl07XHJcbmNvbnN0IEltYWdlcyA9IHt9O1xyXG5cclxuLy9JdGVyYXRpbmcgb3ZlciBDYWNoZUltYWdlcyBhbmQgY2hlY2tpbmcgZm9yIGxvYWRpbmdcclxubGV0IFByb21pc2VzQXJyYXkgPSBDYWNoZUltYWdlcy5tYXAoSW1hZ2VVcmwgPT4ge1xyXG5cdGxldCBQcm9taXNlcyA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xyXG5cdFx0Y29uc3QgaW1nID0gbmV3IEltYWdlKCk7XHJcblx0XHRpbWcub25sb2FkID0gKCkgPT4ge1xyXG5cdFx0XHRJbWFnZXNbSW1hZ2VVcmxdID0gaW1nO1xyXG5cdFx0XHRyZXNvbHZlKCk7XHJcblx0XHR9O1xyXG5cdFx0aW1nLnNyYyA9ICdpbWcvJyArIEltYWdlVXJsO1xyXG5cdH0pO1xyXG5cdHJldHVybiBQcm9taXNlcztcclxufSk7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgUmVzaXplKCkpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBldmVudCA9PiB7XHJcblx0aWYgKGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIHsgcmV0dXJuOyB9XHJcblx0bGV0IGtleSA9IHN0YXRlLmtleU1hcFtldmVudC5jb2RlXVxyXG5cdHN0YXRlLnByZXNzZWRLZXlzW2tleV0gPSB0cnVlXHJcbn0sIGZhbHNlKTtcclxuXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZXZlbnQgPT4ge1xyXG5cdGlmIChldmVudC5kZWZhdWx0UHJldmVudGVkKSB7IHJldHVybjsgfVxyXG5cdGxldCBrZXkgPSBzdGF0ZS5rZXlNYXBbZXZlbnQuY29kZV07XHJcblx0c3RhdGUucHJlc3NlZEtleXNba2V5XSA9IGZhbHNlXHJcbn0sIGZhbHNlKTtcclxuXHJcbi8vaWYgSW1hZ2VzIGlzIGxvYWRlZFxyXG5Qcm9taXNlLmFsbChQcm9taXNlc0FycmF5KS50aGVuKCgpID0+IHtcclxuXHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxufSk7XHJcblxyXG4vLyBlbmdpbmUgdmFyaWFibGVzXHJcbmNvbnN0IFNQRUVEID0gNDtcclxuY29uc3QgU0NBTEUgPSAwLjU7XHJcbmNvbnN0IEZSQU1FX0RVUkFUSU9OID0gMTAwMCAvIDE0NDsgLy8gMTQ0IHRoaXMgaXMgZnBzIFxyXG5sZXQgZHQgPSAwO1xyXG5sZXQgbGFzdHRpbWUgPSAwO1xyXG5sZXQgaXNQbGF5ZXIgPSB0cnVlO1xyXG5cclxuLy9nYW1lIHZhcmlhYmxlc1xyXG5sZXQgVGltZXJDb3VudCA9IDIwO1xyXG5sZXQgYmdZcG9zID0gY2FudmFzLmhlaWdodDtcclxubGV0IHNjb3JlID0gMDtcclxubGV0IE9iamVjdHMgPSBbXTtcclxuXHJcbmxldCBzdGF0ZSA9IHtcclxuXHRwcmVzc2VkS2V5czoge1xyXG5cdFx0QXJyb3dSaWdodDogZmFsc2UsXHJcblx0XHRBcnJvd0xlZnQ6IGZhbHNlXHJcblx0fSxcclxuXHRrZXlNYXA6IHtcclxuXHRcdEFycm93UmlnaHQ6ICdBcnJvd1JpZ2h0JyxcclxuXHRcdEFycm93TGVmdDogJ0Fycm93TGVmdCdcclxuXHR9XHJcbn07XHJcblxyXG5jbGFzcyBCYWNrR3JvdW5kIHtcclxuXHRjb25zdHJ1Y3RvcihoZWlnaHQsIGltYWdlLCBzcGVlZCkge1xyXG5cdFx0dGhpcy55ID0gaGVpZ2h0O1xyXG5cdFx0dGhpcy5pbWFnZSA9IGltYWdlO1xyXG5cdFx0dGhpcy5zcGVlZCA9IHNwZWVkXHJcblx0fVxyXG5cclxuXHRkcmF3KCkge1xyXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlWydiZy5qcGcnXSxcclxuXHRcdFx0MCxcclxuXHRcdFx0LSh0aGlzLmltYWdlWydiZy5qcGcnXS5oZWlnaHQgLSB0aGlzLnkpKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZShkdCkge1xyXG5cdFx0dGhpcy5kcmF3KCk7XHJcblx0XHR0aGlzLnkgKz0gdGhpcy5zcGVlZCAqIGR0O1xyXG5cdFx0aWYgKHRoaXMueSA+PSB0aGlzLmltYWdlW2BiZy5qcGdgXS5oZWlnaHQgLSB0aGlzLmhlaWdodCkge1xyXG5cdFx0XHR0aGlzLnkgPSB0aGlzLmhlaWdodDtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmNsYXNzIFBsYXllciB7XHJcblx0Y29uc3RydWN0b3IoaW1hZ2VzLCBzcGVlZCwgcHJlc3NlZEtleXMsIHNjYWxlLCB3aWR0aCkge1xyXG5cdFx0dGhpcy54ID0gNTIwO1xyXG5cdFx0dGhpcy55ID0gNzEwO1xyXG5cdFx0dGhpcy5pbWFnZXMgPSBpbWFnZXM7XHJcblx0XHR0aGlzLnNwZWVkID0gc3BlZWQ7XHJcblx0XHR0aGlzLnByZXNzZWRLZXlzID0gcHJlc3NlZEtleXM7XHJcblx0XHR0aGlzLnNjYWxlID0gc2NhbGU7XHJcblx0XHR0aGlzLndpZHRoID0gd2lkdGg7XHJcblx0fVxyXG5cclxuXHRkcmF3KCkge1xyXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlc1sncGxheWVyLnBuZyddLFxyXG5cdFx0XHR0aGlzLngsXHJcblx0XHRcdHRoaXMueSxcclxuXHRcdFx0dGhpcy5pbWFnZXNbJ3BsYXllci5wbmcnXS53aWR0aCAqIHRoaXMuc2NhbGUsXHJcblx0XHRcdHRoaXMuaW1hZ2VzWydwbGF5ZXIucG5nJ10uaGVpZ2h0ICogdGhpcy5zY2FsZSk7XHJcblx0fVxyXG5cclxuXHRjb2xsaXNpb24oKSB7XHJcblx0XHRpZiAodGhpcy54ICsgdGhpcy5pbWFnZXNbJ3BsYXllci5wbmcnXS53aWR0aCAqIHRoaXMuc2NhbGUgPj0gdGhpcy53aWR0aCkge1xyXG5cdFx0XHR0aGlzLnggPSB0aGlzLndpZHRoIC0gdGhpcy5pbWFnZXNbJ3BsYXllci5wbmcnXS53aWR0aCAqIHRoaXMuc2NhbGU7XHJcblx0XHR9IGVsc2UgaWYgKHRoaXMueCA8PSAwKSB7XHJcblx0XHRcdHRoaXMueCA9IDA7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR1cGRhdGUoZHQpIHtcclxuXHRcdGlmICh0aGlzLnByZXNzZWRLZXlzLkFycm93TGVmdCkge1xyXG5cdFx0XHRjdHguZHJhd0ltYWdlKHRoaXMuaW1hZ2VzWydwbGF5ZXJfcmlnaHQucG5nJ10sXHJcblx0XHRcdFx0dGhpcy54LFxyXG5cdFx0XHRcdHRoaXMueSxcclxuXHRcdFx0XHR0aGlzLmltYWdlc1sncGxheWVyX3JpZ2h0LnBuZyddLndpZHRoICogdGhpcy5zY2FsZSxcclxuXHRcdFx0XHR0aGlzLmltYWdlc1sncGxheWVyX3JpZ2h0LnBuZyddLmhlaWdodCAqIHRoaXMuc2NhbGUpO1xyXG5cdFx0XHR0aGlzLnggLT0gdGhpcy5zcGVlZCAqIGR0O1xyXG5cdFx0fSBlbHNlIGlmICh0aGlzLnByZXNzZWRLZXlzLkFycm93UmlnaHQpIHtcclxuXHRcdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlc1sncGxheWVyX2xlZnQucG5nJ10sXHJcblx0XHRcdFx0dGhpcy54LFxyXG5cdFx0XHRcdHRoaXMueSxcclxuXHRcdFx0XHR0aGlzLmltYWdlc1sncGxheWVyX2xlZnQucG5nJ10ud2lkdGggKiB0aGlzLnNjYWxlLFxyXG5cdFx0XHRcdHRoaXMuaW1hZ2VzWydwbGF5ZXJfbGVmdC5wbmcnXS5oZWlnaHQgKiB0aGlzLnNjYWxlKTtcclxuXHRcdFx0dGhpcy54ICs9IHRoaXMuc3BlZWQgKiBkdDtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuZHJhdygpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuY29sbGlzaW9uKCk7XHJcblx0fVxyXG59XHJcblxyXG5jbGFzcyBPdGhlck9iamVjdHMge1xyXG5cdGNvbnN0cnVjdG9yKHgsIHksIGltYWdlLCBzcGVlZCwgc2NhbGUpIHtcclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cdFx0dGhpcy5pbWFnZSA9IGltYWdlO1xyXG5cdFx0dGhpcy5zcGVlZCA9IHNwZWVkO1xyXG5cdFx0dGhpcy5zY2FsZSA9IHNjYWxlO1xyXG5cdH1cclxuXHRkcmF3KCkge1xyXG5cdFx0Y3R4LmRyYXdJbWFnZSh0aGlzLmltYWdlLFxyXG5cdFx0XHR0aGlzLngsXHJcblx0XHRcdHRoaXMueSxcclxuXHRcdFx0dGhpcy5pbWFnZS53aWR0aCAqIHRoaXMuc2NhbGUsXHJcblx0XHRcdHRoaXMuaW1hZ2UuaGVpZ2h0ICogdGhpcy5zY2FsZSk7XHJcblx0fVxyXG5cdHVwZGF0ZShkdCkge1xyXG5cdFx0dGhpcy5kcmF3KCk7XHJcblx0XHR0aGlzLmNvbGxpc2lvbigpO1xyXG5cdFx0dGhpcy55ICs9IHRoaXMuc3BlZWQgKiBkdDtcclxuXHR9XHJcblx0Y29sbGlzaW9uKCkge1xyXG5cdFx0aWYgKHBsYXllci54ICsgSW1hZ2VzW2BwbGF5ZXIucG5nYF0ud2lkdGggKiB0aGlzLnNjYWxlID49IHRoaXMueFxyXG5cdFx0XHQmJiBwbGF5ZXIueCA8PSB0aGlzLnggKyB0aGlzLmltYWdlLndpZHRoICogdGhpcy5zY2FsZVxyXG5cdFx0XHQmJiBwbGF5ZXIueSArIEltYWdlc1tgcGxheWVyLnBuZ2BdLmhlaWdodCAqIHRoaXMuc2NhbGUgPj0gdGhpcy55XHJcblx0XHRcdCYmIHBsYXllci55IDw9IHRoaXMueSArIHRoaXMuaW1hZ2UuaGVpZ2h0ICogdGhpcy5zY2FsZSkge1xyXG5cdFx0XHRpZiAodGhpcy5pbWFnZSA9PT0gSW1hZ2VzWydiYW5rMS5wbmcnXSkge1xyXG5cdFx0XHRcdHNjb3JlKys7XHJcblx0XHRcdFx0VXNlclNjb3JlLmlubmVySFRNTCA9IHNjb3JlO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGlzUGxheWVyID0gZmFsc2U7XHJcblx0XHRcdFx0R2FtZU92ZXIoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuY29uc3QgYmcgPSBuZXcgQmFja0dyb3VuZChjYW52YXMuaGVpZ2h0LCBJbWFnZXMsIFNQRUVEKTtcclxuY29uc3QgcGxheWVyID0gbmV3IFBsYXllcihJbWFnZXMsIFNQRUVELCBzdGF0ZS5wcmVzc2VkS2V5cywgU0NBTEUsIGNhbnZhcy53aWR0aCk7XHJcblxyXG5mdW5jdGlvbiB1cGRhdGUobm93KSB7XHJcblx0ZHQgPSAobm93IC0gbGFzdHRpbWUpIC8gRlJBTUVfRFVSQVRJT047XHJcblxyXG5cdGJnLnVwZGF0ZShkdCk7XHJcblxyXG5cdE9iamVjdHMuZm9yRWFjaCgoZW5lbXksIGluZGV4KSA9PiB7XHJcblx0XHRlbmVteS51cGRhdGUoZHQpO1xyXG5cdFx0aWYgKGVuZW15LnkgPj0gY2FudmFzLmhlaWdodCArIGVuZW15LmltYWdlLmhlaWdodCkge1xyXG5cdFx0XHRPYmplY3RzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9XHJcblx0fSlcclxuXHJcblx0cGxheWVyLnVwZGF0ZShkdCk7XHJcblxyXG5cdGxhc3R0aW1lID0gbm93O1xyXG5cdFRpbWVyQ291bnQgPSBNYXRoLmZsb29yKG5vdyAvIDEwMDApO1xyXG5cdFRpbWVyLmlubmVySFRNTCA9IDIwIC0gVGltZXJDb3VudDtcclxuXHRcclxuXHRpZiAoaXNQbGF5ZXIgJiYgVGltZXJDb3VudCA8IDIwKSB7XHJcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0R2FtZU92ZXIoKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNwYXduRW50aXR5KCkge1xyXG5cdHNldEludGVydmFsKCgpID0+IHtcclxuXHRcdGxldCBpbWc7XHJcblx0XHRsZXQgcmFuZCA9IE1hdGgucmFuZG9tKClcclxuXHRcdGlmIChyYW5kIDwgMC4yKSB7XHJcblx0XHRcdGltZyA9IEltYWdlc1snY2FyMi5wbmcnXTtcclxuXHRcdH0gZWxzZSBpZiAocmFuZCA8IDAuNCkge1xyXG5cdFx0XHRpbWcgPSBJbWFnZXNbJ2NhcjMucG5nJ107XHJcblx0XHR9IGVsc2UgaWYgKHJhbmQgPCAwLjYpIHtcclxuXHRcdFx0aW1nID0gSW1hZ2VzWydjYXIxLnBuZyddO1xyXG5cdFx0fSBlbHNlIGlmIChyYW5kIDwgMC44KSB7XHJcblx0XHRcdGltZyA9IEltYWdlc1sncGl0Mi5wbmcnXTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdGltZyA9IEltYWdlc1snYmFuazEucG5nJ107XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgeCA9IH5+KE1hdGgucmFuZG9tKCkgKiAoY2FudmFzLndpZHRoIC0gaW1nLndpZHRoKSkgKyAoaW1nLndpZHRoICogU0NBTEUpIC8vIH5+IGl0J3MgYml0d2lzZSBvcGVyYXRvclxyXG5cdFx0Y29uc3QgeSA9IC01MDA7XHJcblx0XHRPYmplY3RzLnB1c2gobmV3IE90aGVyT2JqZWN0cyh4LCB5LCBpbWcsIFNQRUVELCBTQ0FMRSkpO1xyXG5cdH0sIDEwMDApO1xyXG59XHJcblxyXG5zcGF3bkVudGl0eSgpO1xyXG5cclxuZnVuY3Rpb24gUmVzaXplKCkge1xyXG5cdGNhbnZhcy53aWR0aCA9IDEwNDc7XHJcblx0Y2FudmFzLmhlaWdodCA9IGlubmVySGVpZ2h0O1xyXG59XHJcbmZ1bmN0aW9uIEdhbWVPdmVyKCkge1xyXG5cdGN0eC5iZWdpblBhdGgoKTtcclxuXHRjdHguZmlsbFN0eWxlID0gYHJlZGA7XHJcblx0Y3R4LmZvbnQgPSAnNDhweCBhcmlhbCc7XHJcblx0Y3R4LnRleHRBbGlnbiA9IGBjZW50ZXJgO1xyXG5cdGN0eC5maWxsVGV4dChgWW91ciBzY29yZTogJHtzY29yZX0uIElmIHlvdSB3YW50IHBsYXkuIENsaWNrIG9uIGJ1dHRvbmAsIGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyKTtcclxuXHRjdHguZmlsbCgpO1xyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiIn0=