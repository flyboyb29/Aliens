// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();


function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;
    return gameDelta;
}

function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
    this.aStartIndex = 0;
    this.aTotalShips = 0;
    this.backGround = null;
    this.ship = null;
    this.alienShips = [];
    this.lifeShips = [];
    this.firedShots = [];
    this.gameOver = [];
    this.saveButton;
    this.lifeIndexStart = 0;
    this.lifeCount = 0;
    this.score = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.alienRight;
}

GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();
    console.log('game initialized');
}

GameEngine.prototype.start = function () {
    console.log("starting game");
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    var getY = function (e) {
        return e.clientY - that.ctx.canvas.getBoundingClientRect().top;
    }

    var getX = function (e) {
        return e.clientX - that.ctx.canvas.getBoundingClientRect().left;
    }

    this.ctx.canvas.addEventListener("keydown", function (e) {
        switch (e.which) {
            case 32:
                that.fire = true;
                break;
            case 37:
                that.moveLeft = true;
                break;
            case 38:
                that.moveUp = true;
                break;
           case 39:
               that.moveRight = true;
               break;
            case 40:
                that.moveDown = true;
                break;
            default:
                console.log(e.which);
        }
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        switch (e.which) {
            case 32:
                that.fire = false;
                break;
            case 37:
                that.moveLeft = false;
                break;
            case 38:
                that.moveUp = false;
                break;
            case 39:
                that.moveRight = false;
                break;
            case 40:
                that.moveDown = false;
                break;
        }
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("mousedown", function (e) {
        if (e.button === 0) {
            that.mouseX = getX(e);
            that.mouseY = getY(e);
    //        if (getY(e) > 750 && getY(e) < 800) {
    //            if (getX(e) > 650 && getX(e) < 700) {
    //                that.block = true;
    //            } else if (getX(e) > 700 && getX(e) < 750) {
    //                that.duck = true;
    //            } else if (getX(e) > 750 && getX(e) < 800) {
    //                that.run = true;
    //            }
    //        } else if (getY(e) > 700 && getY(e) < 750) {
    //            if (getX(e) > 700 && getX(e) < 750) {
    //                that.jump = true;
    //            }
    //        }
        }
    }, false);

    //this.ctx.canvas.addEventListener("mouseup", function (e) {
    //    if (e.button === 0) {
    //        if (e.button === 0) {
    //            if (getY(e) > 750 && getY(e) < 800) {
    //                if (getX(e) > 650 && getX(e) < 700) {
    //                    that.block = false;
    //                } else if (getX(e) > 700 && getX(e) < 750) {
    //                    that.duck = false;
    //                } else if (getX(e) > 750 && getX(e) < 800) {
    //                    that.run = false;
    //                }
    //            } else if (getY(e) > 700 && getY(e) < 750) {
    //                if (getX(e) > 700 && getX(e) < 750) {
    //                    that.jump = false;
    //                }
    //            }
    //        }
    //    }
    //}, false);
    //console.log('Input started');
}

GameEngine.prototype.addEntity = function (entity) {
    console.log('added entity');
    this.entities.push(entity);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.ctx);
    }
    this.ctx.restore();
}

GameEngine.prototype.update = function () {
    var entitiesCount = this.entities.length;

    for (var i = 0; i < entitiesCount; i++) {
        var entity = this.entities[i];

        if (!entity.removeFromWorld) {
            entity.update();
        }
    }

    for (var i = this.entities.length - 1; i >= 0; --i) {
        if (this.entities[i].removeFromWorld) {
            this.entities.splice(i, 1);
        }
    }
}

GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.space = null;
}

function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.removeFromWorld = false;
}

Entity.prototype.update = function () {
}

Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}
