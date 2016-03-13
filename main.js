var alienRight;
var shipIndex;
var lifeIndex;
var lifeCount;
var score;
var leval;
var newGameImg;
var loadGameImg;
var saveGameImg;
this.startButton;
var mainLogo;
var mainLogo1;
var gameOverSprite;
var gameEngine;
var shipPic;
var alienPic;
var space1;
var space2;
var pro1;
var pro2;
var explosion;
var bg1;
var bg2;
var bg3;
var bg4;
var socket = io.connect("http://76.28.150.193:8888");

// platforms animation
function AnimationPlatform(image, frameWidth, frameHeight, imageX, imageY) {
    this.image = image;
    this.width = frameWidth;
    this.height = frameHeight;
    this.imageX = imageX;
    this.imageY = imageY;
    this.elapsedTime = 0;
}

AnimationPlatform.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

    ctx.drawImage(this.image, 0, 0, this.width, this.height,
        this.imageX + x, this.imageY + y, this.width * scaleBy, this.height * scaleBy);
}
AnimationPlatform.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationPlatform.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// sprites animation
function AnimationSprite(spriteSheet, startX, startY, frameWidth, frameHeight,
    frameDuration, frames, loop, reverse) {

    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

AnimationSprite.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.spriteSheet,
            index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
            this.frameWidth, this.frameHeight,
            locX, locY,
            this.frameWidth * scaleBy,
            this.frameHeight * scaleBy);
}

AnimationSprite.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

AnimationSprite.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/*
 * Basic Explosion
 */
function ProjectileExp(game, explosionSprite, width, height, startX, startY, duration, frames, loop, reverse, placeX, placeY) {

    this.animation = new AnimationSprite(explosionSprite, startX, startY, width, height, duration, frames, loop, reverse);
    this.index = 0
    this.place = 0;
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.x = placeX;
    this.y = placeY;
    Entity.call(this, game, placeX, placeY);
    this.radius = height / 2;
}

ProjectileExp.prototype = new Entity();

ProjectileExp.prototype.constructor = ProjectileExp;

ProjectileExp.prototype.update = function () {

    Entity.prototype.update.call(this);
}

ProjectileExp.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this);
}

/*
 * Basic Button
 */

function Button(game, platformSprite, width, height, startX, startY, scroll, placeX, placeY, backCode) {

    this.animation = new AnimationPlatform(platformSprite, width, height, startX, startY, scroll);
    //game.addEntity(new Block(this.game, placeX - 10, placeY - 10, width + 20, height + 20, Color, 50, false, 10));
    this.game = game;
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.x = placeX;
    this.y = placeY;
    this.code = backCode;
    Entity.call(this, game, placeX, placeY);
    this.radius = height / 2;
}

Button.prototype = new Entity();

Button.prototype.constructor = Button;

Button.prototype.beginingX = function () {
    return this.x;
}

Button.prototype.endingX = function () {
    return this.x + this.width;
}

Button.prototype.top = function () {
    return this.y;
}

Button.prototype.bottom = function () {
    return this.y + this.height;
}

Button.prototype.update = function () {

    if (this.game.mouseX >= this.beginingX() && this.game.mouseX <= this.endingX()) {
        if (this.game.mouseY >= this.top() && this.game.mouseY <= this.bottom()) {
            switch (this.code) {
                case 0:
                    gameMenu();
                    break;
                case 1:
                    newGame();
                    break;
                case 2:
                    loadGame();
                    break;
                case 3:
                    saveGame();
                    break;
            }
        }
    }
    Entity.prototype.update.call(this);
}

Button.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this);
}

/*
 * Basic Platform
 */

function Platform(game, platformSprite, width, height, startX, startY, scroll, placeX, placeY) {
    this.animation = new AnimationPlatform(platformSprite, width, height, startX, startY, scroll);
    this.startX = startX;
    this.startY = startY;
    this.width = width;
    this.height = height;
    this.x = placeX;
    this.y = placeY;
    Entity.call(this, game, placeX, placeY);
    this.radius = height / 2;
}

Platform.prototype = new Entity();

Platform.prototype.constructor = Platform;

Platform.prototype.beginingX = function () {
    return this.x;
}

Platform.prototype.endingX = function () {
    return this.x + this.width;
}

Platform.prototype.top = function () {
    return this.y;
}

Platform.prototype.bottom = function () {
    return this.y + this.height;
}

Platform.prototype.update = function () {

    Entity.prototype.update.call(this);
}

Platform.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);
    Entity.prototype.draw.call(this);
}

/*
 * Ship
 */
function Ship(game, ShipSprite, frameHeight, frameWidth, startX, startY,
   placeX, placeY, loop, speed, leftOffset, rightOffset, scaleBy, fireSprite) {

    this.animationShip = new AnimationPlatform(ShipSprite, frameWidth,
        frameHeight, startX, startY, loop)

    this.width = frameWidth;
    this.height = frameHeight;
    this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.firePic = fireSprite;
    this.scale = scaleBy;
    this.speed = speed;
    this.leftOffset = leftOffset;
    this.rightOffset = rightOffset;
    this.check = true;
    Entity.call(this, game, placeX, placeY);
}

Ship.prototype = new Entity();

Ship.prototype.constructor = Ship;

Ship.prototype.beginingX = function () {
    return this.x + this.leftOffset;
}

Ship.prototype.endingX = function () {
    return this.x + (this.width * this.scale) + this.rightOffset;
}

Ship.prototype.top = function () {
    return this.y - 30;
}

Ship.prototype.bottom = function () {
    return this.y + (this.height * this.scale);
}

Ship.prototype.update = function () {

    if (this.game.moveRight && this.endingX() <= 800) {
        this.x += this.speed;
    } else if (this.game.moveLeft && this.beginingX() >= 0) {
        this.x -= this.speed;
    }
    if (this.game.moveUp && this.top() >= 500) {
        this.y -= this.speed;
    } else if (this.game.moveDown && this.bottom() <= 800) {
        this.y += this.speed;
    }

    if (this.game.fire) {
        console.log("fire from ship");
        var sx = this.x + this.width / 2 + 10;
        var sShot = new FireBall(this.game, this.firePic, 21, 5, 0, 0,
            sx, this.top(), false, 1, 0, 0, true);

        this.game.addEntity(sShot);
        this.game.firedShots.push(sShot);
        this.game.fire = false;
    }

    Entity.prototype.update.call(this);
}

Ship.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animationShip.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    Entity.prototype.draw.call(this);
}

/*
 * Aliens
 */
function Alien(game, AlienSprite, frameHeight, frameWidth, startX, startY,
    placeX, placeY, loop, speed, leftOffset, rightOffset, fireSprite) {


    this.animationAlien = new AnimationPlatform(AlienSprite, frameWidth, frameHeight,
        startX, startY, false);

    this.name = "alien";
    this.index = 0;
    this.width = frameWidth;
    this.height = frameHeight;
    this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.speed = speed;
    this.moveRight = false;
    this.leftOffset = leftOffset;
    this.rightOffset = rightOffset;
    this.check = true;
    this.firePic = fireSprite;
    this.game = game;

    Entity.call(this, game, placeX, placeY);
}

Alien.prototype = new Entity();

Alien.prototype.constructor = Alien;

Alien.prototype.beginingX = function () {
    return this.x + this.leftOffset;
}

Alien.prototype.endingX = function () {
    return this.x + this.width + this.rightOffset;
}

Alien.prototype.top = function () {
    return this.y;
}

Alien.prototype.bottom = function () {
    return this.y + this.height - 25;
}

Alien.prototype.update = function () {

    if (this.x <= 0) {
        this.game.alienRight = true;
    } else if (this.endingX() >= 801) {
        this.game.alienRight = false;
    }

    if (this.game.alienRight) {
        this.x += this.speed;
    } else {
        this.x -= this.speed;
    }
    
   var Shoot = Math.random();
   if (Shoot >= .999) {
       var sx = this.x + this.width / 2;
       var fShot = new FireBall(this.game, this.firePic, 21, 5, 0, 0,
           sx, this.bottom(), false, 1, 0, 0, false);

       this.game.addEntity(fShot);
       this.game.firedShots.push(fShot);
   }

   Entity.prototype.update.call(this);
}

Alien.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animationAlien.drawFrame(this.game.clockTick, ctx, this.x, this.y, 1);

    Entity.prototype.draw.call(this);
}

/*
 * Fire Ball
 */
function FireBall(game, fireSprite, frameHeight, frameWidth, startX, startY,
    placeX, placeY, loop, speed, leftOffset, rightOffset, fromShip) {

    this.animationFire = new AnimationPlatform(fireSprite, frameWidth, frameHeight,
        startX, startY, false);

    this.name = "fireBall";
    this.fromShip = fromShip;
    this.width = frameWidth;
    this.height = frameHeight;
    this.radius = frameHeight / 2;
    this.y = placeY;
    this.x = placeX;
    this.speed = speed;
    this.leftOffset = leftOffset;
    this.rightOffset = rightOffset;
    Entity.call(this, game, placeX, placeY);
}

FireBall.prototype = new Entity();

FireBall.prototype.constructor = FireBall;

FireBall.prototype.beginingX = function () {
    return this.x + this.leftOffset;
}

FireBall.prototype.endingX = function () {
    return this.x + this.width + this.rightOffset;
}

FireBall.prototype.top = function () {
    return this.y;
}

FireBall.prototype.bottom = function () {
    return this.y + this.height - 17.5;
}

FireBall.prototype.update = function () {
    var kill = false;
    

    if (this.fromShip) {
        this.y -= this.speed;
    } else {
        this.y += this.speed;
    }

    checkShot();

    Entity.prototype.update.call(this);
}

FireBall.prototype.draw = function (ctx) {

    ctx.globalAlpha = 1;
    this.animationFire.drawFrame(this.game.clockTick, ctx, this.x, this.y, 2);

    Entity.prototype.draw.call(this);
}

checkShot = function () {
    var kill = false;

    for (var i = 0; i < this.gameEngine.firedShots.length ; i++) {
        if (this.gameEngine.firedShots[i].fromShip) {
            if (this.gameEngine.firedShots[i].y <= -40) {
                this.gameEngine.firedShots[i].removeFromWorld = true;
                this.gameEngine.firedShots.splice(i, 1);
            } else {
                if (this.gameEngine.firedShots[i].top() <= 600) {
                    for (var j = 0; j < this.gameEngine.alienShips.length && !kill; j++) {
                        if (this.gameEngine.firedShots[i].bottom() >= this.gameEngine.alienShips[j].top() &&
                        this.gameEngine.firedShots[i].top() <= this.gameEngine.alienShips[j].bottom()) {
                            //console.log("with: " + j);
                            if (this.gameEngine.firedShots[i].endingX() >= this.gameEngine.alienShips[j].beginingX() &&
                            this.gameEngine.firedShots[i].beginingX() <= this.gameEngine.alienShips[j].endingX()) {
                                //console.log("killed: " + j);
                                var killX = this.gameEngine.alienShips[j].x;
                                var killY = this.gameEngine.alienShips[j].y;
                                this.gameEngine.alienShips[j].removeFromWorld = true;
                                this.gameEngine.alienShips.splice(j, 1);
                                this.gameEngine.firedShots[i].removeFromWorld = true;
                                this.gameEngine.firedShots.splice(i, 1);
                                this.gameEngine.score++;
                                console.log(this.gameEngine.score);
                                kill = true;
                                projectileExplosion(killX, killY);
                                if (this.gameEngine.alienShips.length === 0) {
                                    for (var z = 0; z < this.gameEngine.firedShots.length; z++) {
                                        this.gameEngine.firedShots[z].y = -40;
                                        this.gameEngine.firedShots[z].removeFromWorld = true;
                                    }
                                    pickBackground();
                                    addAlienShips(3, 6);
                                }
                            }
                        }
                    }
                }
            }
        } else {
            if (this.gameEngine.firedShots[i].y >= 810) {
                this.gameEngine.firedShots[i].removeFromWorld = true;
                this.gameEngine.firedShots.splice(i, 1);
            } else {
                if (this.gameEngine.firedShots[i].bottom() >= this.gameEngine.ship.top() &&
                    this.gameEngine.firedShots[i].top() <= this.gameEngine.ship.bottom()) {
                    if (this.gameEngine.firedShots[i].endingX() >= this.gameEngine.ship.beginingX() &&
                        this.gameEngine.firedShots[i].beginingX() <= this.gameEngine.ship.endingX()) {
                        console.log("kill");
                        var killX = this.gameEngine.firedShots[i].beginingX();
                        var killY = this.gameEngine.firedShots[i].bottom();
                        projectileExplosion(killX, killY);
                        this.gameEngine.firedShots[i].removeFromWorld = true;
                        this.gameEngine.firedShots.splice(i, 1);
                        minusLife();
                    }
                }
            }
        }
    }
}

// Block
function Block(game, startX, startY, width, height, color, trans, fill, border) {
    this.x = startX;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.fColor = color;
    this.t = trans / 100;
    this.fill = fill;
    this.b = border;
    Entity.call(this, game, startX, startY);
    this.radius = width / 2;
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

Block.prototype.update = function () {}

Block.prototype.draw = function (ctx) {
    ctx.fillStyle = this.fColor;
    ctx.globalAlpha = this.t;
    ctx.lineWidth = this.b;
    if (this.fill) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    };
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/alien.png");
ASSET_MANAGER.queueDownload("./img/ship.png");
ASSET_MANAGER.queueDownload("./img/space1.png");
ASSET_MANAGER.queueDownload("./img/space2.png");
ASSET_MANAGER.queueDownload("./img/space3.jpg");
ASSET_MANAGER.queueDownload("./img/solar-wind.jpg");
ASSET_MANAGER.queueDownload("./img/projectileU.png");
ASSET_MANAGER.queueDownload("./img/projectileD.png");
ASSET_MANAGER.queueDownload("./img/explosion.png");
ASSET_MANAGER.queueDownload("./img/GameOver.png");
ASSET_MANAGER.queueDownload("./img/MainLogo1.png");
ASSET_MANAGER.queueDownload("./img/MainLogo.png");
ASSET_MANAGER.queueDownload("./img/start.png");
ASSET_MANAGER.queueDownload("./img/newGame.png");
ASSET_MANAGER.queueDownload("./img/loadGame.png");
ASSET_MANAGER.queueDownload("./img/saveGame.png");
ASSET_MANAGER.queueDownload("./img/aliens.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    this.shipPic = ASSET_MANAGER.getAsset("./img/ship.png");
    this.alienPic = ASSET_MANAGER.getAsset("./img/alien.png");
    this.space1 = ASSET_MANAGER.getAsset("./img/space1.png");
    this.space2 = ASSET_MANAGER.getAsset("./img/space2.png");
    this.space3 = ASSET_MANAGER.getAsset("./img/space3.jpg");
    this.space4 = ASSET_MANAGER.getAsset("./img/solar-wind.jpg");
    this.pro1 = ASSET_MANAGER.getAsset("./img/projectileU.png");
    this.pro2 = ASSET_MANAGER.getAsset("./img/projectileD.png");
    this.explosion = ASSET_MANAGER.getAsset("./img/explosion.png");
    this.gameOverSprite = ASSET_MANAGER.getAsset("./img/GameOver.png");
    this.mainLogo = ASSET_MANAGER.getAsset("./img/MainLogo1.png");
    this.startButton = ASSET_MANAGER.getAsset("./img/start.png");
    this.mainLogo1 = ASSET_MANAGER.getAsset("./img/MainLogo.png");
    this.newGameImg = ASSET_MANAGER.getAsset("./img/newGame.png");
    this.loadGameImg = ASSET_MANAGER.getAsset("./img/loadGame.png");
    this.saveGameImg = ASSET_MANAGER.getAsset("./img/saveGame.png");

    this.gameEngine = new GameEngine();
    this.bg1 = new Platform(this.gameEngine, this.space1, 800, 800, 0, 0, false, 0, 0);
    this.bg2 = new Platform(this.gameEngine, this.space2, 800, 800, 0, 0, false, 0, 0);
    this.bg3 = new Platform(this.gameEngine, this.space3, 800, 800, 0, 0, false, 0, 0);
    this.bg4 = new Platform(this.gameEngine, this.space4, 800, 800, 0, 0, false, 0, 0);

    pickBackground();
    this.gameEngine.addEntity(this.gameEngine.backGround);
    startGame();
    //basicControlImage(this.gameEngine);

    gameEngine.init(ctx);
    gameEngine.start();
});

pickBackground = function () {
    var wo = Math.random();
    if (wo <= .25) {
        this.gameEngine.backGround = this.bg1;
    } else if (wo > .25 && wo <= .50) {
        this.gameEngine.backGround = this.bg2;
    } else if (wo > .50 && wo <= .75) {
        this.gameEngine.backGround = this.bg3;
    } else if (wo > .75 && wo <= 1) {
        this.gameEngine.backGround = this.bg4;
    }
}

startGame = function () {
    this.gameEngine.addEntity(new Platform(this.gameEngine, this.mainLogo, 374, 254,
        0, 0, false, 205, 120));
    this.gameEngine.addEntity(new Button(this.gameEngine, this.startButton, 144, 106,
        0, 0, false, 320, 500, 0));
}

gameMenu = function () {
    this.gameEngine.entities[this.gameEngine.entities.length - 1].removeFromWorld = true;
    this.gameEngine.entities[this.gameEngine.entities.length - 2].removeFromWorld = true;

    this.gameEngine.addEntity(new Button(this.gameEngine, this.newGameImg, 161, 27,
        0, 0, false, 310, 350, 1));

    this.gameEngine.addEntity(new Button(this.gameEngine, this.loadGameImg, 178, 31,
        0, 0, false, 310, 400, 2));
}

saveGame = function () {
    var gameNum = prompt("Please enter a name that you will remember for when you want to load the game back.");
    var gameData = [];

    if (gameNum) {
        gameData.push(this.gameEngine.score);
        gameData.push(this.gameEngine.lifeCount);
        gameData.push(this.gameEngine.ship.x);
        gameData.push(this.gameEngine.ship.y);
        gameData.push(this.gameEngine.alienRight);
        gameData.push(this.gameEngine.alienShips.length);
        for (var i = 0; i < this.gameEngine.alienShips.length; i++) {
            gameData.push(this.gameEngine.alienShips[i].x);
            gameData.push(this.gameEngine.alienShips[i].y);
        }
        //gameData.push(this.gameEngine.firedShots.length);
        //for (var i = 0; i < this.gameEngine.firedShots.length; i++) {
        //    gameData.push(this.gameEngine.firedShots[i].x);
        //    gameData.push(this.gameEngine.firedShots[i].y);
        //    gameData.push(this.gameEngine.firedShots[i].fromShip);
        //}

        this.socket.emit("save", { studentname: "Jason Hall", statename: gameNum, data: gameData });
        //alert("Your game number is: " + gameNum + "\n Please keep it for when loading.");
        for (var i = 1; i < this.gameEngine.entities.length; i++) {
            this.gameEngine.entities[i].removeFromWorld = true;
        }
        startGame();
    }
}
14578426
newGame = function () {
    this.gameEngine.entities[this.gameEngine.entities.length - 1].removeFromWorld = true;
    this.gameEngine.entities[this.gameEngine.entities.length - 2].removeFromWorld = true;

    alert("To move ship left: left arrow; To move ship right: right arrow; to move ship down: down arrow; to move ship up: up arrow; To fire: space bar.");
    this.gameEngine.saveButton = new Button(this.gameEngine, this.saveGameImg, 178, 31,
        0, 0, false, 622, 769, 3)
    this.gameEngine.addEntity(this.gameEngine.saveButton);
    this.gameEngine.lifeCount = 4;
    lifeScoreImage();
    addLife();
    addShip(300,600);
    addAlienShips(3, 6);
}

loadGame = function () {
    var that = this;
    var loadData = [];

    this.gameEngine.entities[this.gameEngine.entities.length - 1].removeFromWorld = true;
    this.gameEngine.entities[this.gameEngine.entities.length - 2].removeFromWorld = true;

    var gameNum = prompt("What is the game number that you want to load?");
    console.log(gameNum);
    if (!gameNum) {
        startGame();
    } else {
        this.socket.emit("load", { studentname: "Jason Hall", statename: gameNum });
    }

    this.socket.on("load", function (data) {
        loadData = data.data;
        console.log(loadData);
        that.gameEngine.saveButton = new Button(that.gameEngine, that.saveGameImg, 178, 31,
        0, 0, false, 622, 769, 3)
        that.gameEngine.addEntity(that.gameEngine.saveButton);
        that.gameEngine.score = loadData[0];
        that.gameEngine.lifeCount = loadData[1];
        lifeScoreImage();
        addLife();
        addShip(loadData[2], loadData[3])
        that.gameEngine.alienRight = loadData[4];
        for (var i = 0; i < loadData[5]; i++) {
            addAlienShip(loadData[6 + i * 2], loadData[7 + i * 2]);
        }
        console.log(loadData[6 + loadData[5] * 2]);
        var shotsFired = 6 + loadData[5] * 2;
        var shotX = 7 + loadData[5] * 2;
        var shotY = 8 + loadData[5] * 2;
        var shotZ = 9 + loadData[5] * 2;
        //for (var i = 0; i < loadData[shotsFired]; i++) {
        //    if (loadData[shotY + i * 3] > 0) {
        //        addShot(loadData[shotX + i * 3], loadData[shotY + i * 3],
        //            loadData[shotZ + i * 3]);
        //        console.log("x: " + loadData[shotX + i * 3]);
        //        console.log("y: " + loadData[shotY + i * 3]);
        //        console.log("z: " + loadData[shotZ + i * 3]);
        //    }
        //}

    });

}

addShot = function (x, y, z) {
    var fShot = new FireBall(this.gameEngine, this.firePic, 21, 5, 0, 0,
        x, y, false, 1, 0, 0, z);

    this.gameEngine.addEntity(fShot);
    this.gameEngine.firedShots.push(fShot);
}

socket.on("connect", function () {
    console.log("Socket connected.")
});
socket.on("disconnect", function () {
    console.log("Socket disconnected.")
});
socket.on("reconnect", function () {
    console.log("Socket reconnected.")
});

minusLife = function () {
    this.gameEngine.lifeCount -= 1;

    if (this.gameEngine.lifeCount > 0) {
        this.gameEngine.ship.removeFromWorld = true;
        addShip(300, 600);
        var killX = this.gameEngine.lifeShips[this.gameEngine.lifeCount - 1].beginingX();
        var killY = this.gameEngine.lifeShips[this.gameEngine.lifeCount - 1].top();
        this.gameEngine.lifeShips[this.gameEngine.lifeCount - 1].removeFromWorld = true;
        projectileExplosion(killX, killY);
        console.log(this.gameEngine.lifeCount);
    } else {
        gameOver();
    }
}

gameOver = function () {
    var i = 0;
    var j = 0;

    this.gameEngine.ship.removeFromWorld = true;
    for (i = 0; i < this.gameEngine.firedShots.length; i++) {
        this.gameEngine.firedShots[i].removeFromWorld = true;
    }
    for (i = 0; i < this.gameEngine.alienShips.length; i++) {
        this.gameEngine.alienShips[i].removeFromWorld = true;
    }
    this.gameEngine.saveButton.removeFromWorld = true;
    var gameO = new Platform(this.gameEngine, gameOverSprite, 178, 178, 0, 0, false, 320, 220);
    this.gameEngine.addEntity(gameO);
}
projectileExplosion = function (x, y) {
    this.gameEngine.addEntity(new ProjectileExp(this.gameEngine, this.explosion,
        39.4, 40, 0, 0, .1, 13, false, false, x, y));
}

addLife = function () {
    for (var i = 0; i < this.gameEngine.lifeCount - 1; i++) {
        var lShip = new Platform(this.gameEngine, this.shipPic, 31, 37, 0, 0,
            false, 707 + (i * 29), 0);
        this.gameEngine.addEntity(lShip);
        this.gameEngine.lifeShips[i] = lShip;
        if (i === 1) this.gameEngine.lifeIndex = this.gameEngine.entities.length - 1;
    }
}

addShip = function (x, y) {
    this.gameEngine.ship = new Ship(this.gameEngine, this.shipPic, 37, 31, 0, 0, x, y, false, 2, 0, 0, 2, this.pro1);
    this.gameEngine.addEntity(this.gameEngine.ship);
}

addAlienShip = function (x, y) {
    this.gameEngine.alienShips.push(new Alien(this.gameEngine, this.alienPic, 66, 67, 0, 0,
        x, y, false, 1, 0, 0, this.pro2));
    this.gameEngine.addEntity(this.gameEngine.alienShips[this.gameEngine.alienShips.length - 1]);
}

addAlienShips = function (numRow, numCol) {
    var count = 0;
    for (var i = 1; i <= numRow; i++) {
        for (var j = 1; j <= numCol; j++) {
            this.gameEngine.alienShips[count] = new Alien(this.gameEngine, this.alienPic, 66, 67, 0, 0,
                j * 100, i * 100 + 25, false, 1, 0, 0, this.pro2);
            this.gameEngine.addEntity(this.gameEngine.alienShips[count]);
            count++;
        }
    }
}

 lifeScoreImage = function () {
        // L
        var letterL1 = new Block(this.gameEngine, 630, 5, 5, 5, "blue", 75, true, 1);
        var letterL2 = new Block(this.gameEngine, 630, 10, 5, 5, "blue", 75, true, 1);
        var letterL3 = new Block(this.gameEngine, 630, 15, 5, 5, "blue", 75, true, 1);
        var letterL4 = new Block(this.gameEngine, 630, 20, 5, 5, "blue", 75, true, 1);
        var letterL5 = new Block(this.gameEngine, 630, 25, 5, 5, "blue", 75, true, 1);
        var letterL6 = new Block(this.gameEngine, 635, 25, 5, 5, "blue", 75, true, 1);
        var letterL7 = new Block(this.gameEngine, 640, 25, 5, 5, "blue", 75, true, 1);
        // I
        var letterI1 = new Block(this.gameEngine, 650, 5, 5, 5, "blue", 75, true, 1);
        var letterI2 = new Block(this.gameEngine, 650, 10, 5, 5, "blue", 75, true, 1);
        var letterI3 = new Block(this.gameEngine, 650, 15, 5, 5, "blue", 75, true, 1);
        var letterI4 = new Block(this.gameEngine, 650, 20, 5, 5, "blue", 75, true, 1);
        var letterI5 = new Block(this.gameEngine, 650, 25, 5, 5, "blue", 75, true, 1);
        // F
        var letterF1 = new Block(this.gameEngine, 660, 5, 5, 5, "blue", 75, true, 1);
        var letterF2 = new Block(this.gameEngine, 660, 10, 5, 5, "blue", 75, true, 1);
        var letterF3 = new Block(this.gameEngine, 660, 15, 5, 5, "blue", 75, true, 1);
        var letterF4 = new Block(this.gameEngine, 660, 20, 5, 5, "blue", 75, true, 1);
        var letterF5 = new Block(this.gameEngine, 660, 25, 5, 5, "blue", 75, true, 1);
        var letterF6 = new Block(this.gameEngine, 665, 5, 5, 5, "blue", 75, true, 1);
        var letterF7 = new Block(this.gameEngine, 670, 5, 5, 5, "blue", 75, true, 1);
        var letterF8 = new Block(this.gameEngine, 665, 15, 5, 5, "blue", 75, true, 1);
        // E
        var letterE1 = new Block(this.gameEngine, 680, 5, 5, 5, "blue", 75, true, 1);
        var letterE2 = new Block(this.gameEngine, 680, 10, 5, 5, "blue", 75, true, 1);
        var letterE3 = new Block(this.gameEngine, 680, 15, 5, 5, "blue", 75, true, 1);
        var letterE4 = new Block(this.gameEngine, 680, 20, 5, 5, "blue", 75, true, 1);
        var letterE5 = new Block(this.gameEngine, 680, 25, 5, 5, "blue", 75, true, 1);
        var letterE6 = new Block(this.gameEngine, 685, 5, 5, 5, "blue", 75, true, 1);
        var letterE7 = new Block(this.gameEngine, 690, 5, 5, 5, "blue", 75, true, 1);
        var letterE8 = new Block(this.gameEngine, 685, 25, 5, 5, "blue", 75, true, 1);
        var letterE9 = new Block(this.gameEngine, 690, 25, 5, 5, "blue", 75, true, 1);
        var letterE10 = new Block(this.gameEngine, 685, 15, 5, 5, "blue", 75, true, 1);

        var letterE11 = new Block(this.gameEngine, 680, 40, 5, 5, "blue", 75, true, 1);
        var letterE12 = new Block(this.gameEngine, 680, 45, 5, 5, "blue", 75, true, 1);
        var letterE13 = new Block(this.gameEngine, 680, 50, 5, 5, "blue", 75, true, 1);
        var letterE14 = new Block(this.gameEngine, 680, 55, 5, 5, "blue", 75, true, 1);
        var letterE15 = new Block(this.gameEngine, 680, 60, 5, 5, "blue", 75, true, 1);
        var letterE16 = new Block(this.gameEngine, 685, 40, 5, 5, "blue", 75, true, 1);
        var letterE17 = new Block(this.gameEngine, 690, 40, 5, 5, "blue", 75, true, 1);
        var letterE18 = new Block(this.gameEngine, 685, 60, 5, 5, "blue", 75, true, 1);
        var letterE19 = new Block(this.gameEngine, 690, 60, 5, 5, "blue", 75, true, 1);
        var letterE20 = new Block(this.gameEngine, 685, 50, 5, 5, "blue", 75, true, 1);
        // R
        var letterR1 = new Block(this.gameEngine, 660, 40, 5, 5, "blue", 75, true, 1);
        var letterR2 = new Block(this.gameEngine, 660, 45, 5, 5, "blue", 75, true, 1);
        var letterR3 = new Block(this.gameEngine, 660, 50, 5, 5, "blue", 75, true, 1);
        var letterR4 = new Block(this.gameEngine, 660, 55, 5, 5, "blue", 75, true, 1);
        var letterR5 = new Block(this.gameEngine, 660, 60, 5, 5, "blue", 75, true, 1);
        var letterR6 = new Block(this.gameEngine, 665, 40, 5, 5, "blue", 75, true, 1);
        var letterR7 = new Block(this.gameEngine, 670, 40, 5, 5, "blue", 75, true, 1);
        var letterR8 = new Block(this.gameEngine, 665, 50, 5, 5, "blue", 75, true, 1);
        var letterR9 = new Block(this.gameEngine, 670, 45, 5, 5, "blue", 75, true, 1);
        var letterR10 = new Block(this.gameEngine, 670, 55, 5, 5, "blue", 75, true, 1);
        var letterR11 = new Block(this.gameEngine, 670, 60, 5, 5, "blue", 75, true, 1);
        // O
        var letterO1 = new Block(this.gameEngine, 640, 40, 5, 5, "blue", 75, true, 1);
        var letterO2 = new Block(this.gameEngine, 640, 45, 5, 5, "blue", 75, true, 1);
        var letterO3 = new Block(this.gameEngine, 640, 50, 5, 5, "blue", 75, true, 1);
        var letterO4 = new Block(this.gameEngine, 640, 55, 5, 5, "blue", 75, true, 1);
        var letterO5 = new Block(this.gameEngine, 640, 60, 5, 5, "blue", 75, true, 1);
        var letterO6 = new Block(this.gameEngine, 645, 40, 5, 5, "blue", 75, true, 1);
        var letterO7 = new Block(this.gameEngine, 650, 40, 5, 5, "blue", 75, true, 1);
        var letterO8 = new Block(this.gameEngine, 645, 60, 5, 5, "blue", 75, true, 1);
        var letterO9 = new Block(this.gameEngine, 650, 45, 5, 5, "blue", 75, true, 1);
        var letterO10 = new Block(this.gameEngine, 650, 55, 5, 5, "blue", 75, true, 1);
        var letterO11 = new Block(this.gameEngine, 650, 60, 5, 5, "blue", 75, true, 1);
        var letterO12 = new Block(this.gameEngine, 650, 50, 5, 5, "blue", 75, true, 1);
        // C
        var letterC1 = new Block(this.gameEngine, 620, 40, 5, 5, "blue", 75, true, 1);
        var letterC2 = new Block(this.gameEngine, 620, 45, 5, 5, "blue", 75, true, 1);
        var letterC3 = new Block(this.gameEngine, 620, 50, 5, 5, "blue", 75, true, 1);
        var letterC4 = new Block(this.gameEngine, 620, 55, 5, 5, "blue", 75, true, 1);
        var letterC5 = new Block(this.gameEngine, 620, 60, 5, 5, "blue", 75, true, 1);
        var letterC6 = new Block(this.gameEngine, 625, 40, 5, 5, "blue", 75, true, 1);
        var letterC7 = new Block(this.gameEngine, 630, 40, 5, 5, "blue", 75, true, 1);
        var letterC8 = new Block(this.gameEngine, 625, 60, 5, 5, "blue", 75, true, 1);
        var letterC9 = new Block(this.gameEngine, 630, 60, 5, 5, "blue", 75, true, 1);
        // S
        var letterS1 = new Block(this.gameEngine, 600, 40, 5, 5, "blue", 75, true, 1);
        var letterS2 = new Block(this.gameEngine, 600, 45, 5, 5, "blue", 75, true, 1);
        var letterS3 = new Block(this.gameEngine, 600, 50, 5, 5, "blue", 75, true, 1);
        var letterS4 = new Block(this.gameEngine, 610, 55, 5, 5, "blue", 75, true, 1);
        var letterS5 = new Block(this.gameEngine, 610, 50, 5, 5, "blue", 75, true, 1);
        var letterS6 = new Block(this.gameEngine, 605, 40, 5, 5, "blue", 75, true, 1);
        var letterS7 = new Block(this.gameEngine, 610, 40, 5, 5, "blue", 75, true, 1);
        var letterS8 = new Block(this.gameEngine, 605, 60, 5, 5, "blue", 75, true, 1);
        var letterS9 = new Block(this.gameEngine, 610, 60, 5, 5, "blue", 75, true, 1);
        var letterS10 = new Block(this.gameEngine, 605, 50, 5, 5, "blue", 75, true, 1);
        var letterS11 = new Block(this.gameEngine, 600, 60, 5, 5, "blue", 75, true, 1);

        // L
        this.gameEngine.addEntity(letterL1);
        this.gameEngine.addEntity(letterL2);
        this.gameEngine.addEntity(letterL3);
        this.gameEngine.addEntity(letterL4);
        this.gameEngine.addEntity(letterL5);
        this.gameEngine.addEntity(letterL6);
        this.gameEngine.addEntity(letterL7);
        // I
        this.gameEngine.addEntity(letterI1);
        this.gameEngine.addEntity(letterI2);
        this.gameEngine.addEntity(letterI3);
        this.gameEngine.addEntity(letterI4);
        this.gameEngine.addEntity(letterI5);
        // F
        this.gameEngine.addEntity(letterF1);
        this.gameEngine.addEntity(letterF2);
        this.gameEngine.addEntity(letterF3);
        this.gameEngine.addEntity(letterF4);
        this.gameEngine.addEntity(letterF5);
        this.gameEngine.addEntity(letterF6);
        this.gameEngine.addEntity(letterF7);
        this.gameEngine.addEntity(letterF8);
        // E
        this.gameEngine.addEntity(letterE1);
        this.gameEngine.addEntity(letterE2);
        this.gameEngine.addEntity(letterE3);
        this.gameEngine.addEntity(letterE4);
        this.gameEngine.addEntity(letterE5);
        this.gameEngine.addEntity(letterE6);
        this.gameEngine.addEntity(letterE7);
        this.gameEngine.addEntity(letterE8);
        this.gameEngine.addEntity(letterE9);
        this.gameEngine.addEntity(letterE10);
        // S
        this.gameEngine.addEntity(letterS1);
        this.gameEngine.addEntity(letterS2);
        this.gameEngine.addEntity(letterS3);
        this.gameEngine.addEntity(letterS4);
        this.gameEngine.addEntity(letterS5);
        this.gameEngine.addEntity(letterS6);
        this.gameEngine.addEntity(letterS7);
        this.gameEngine.addEntity(letterS8);
        this.gameEngine.addEntity(letterS9);
        this.gameEngine.addEntity(letterS10);
        this.gameEngine.addEntity(letterS11);
        // C
        this.gameEngine.addEntity(letterC1);
        this.gameEngine.addEntity(letterC2);
        this.gameEngine.addEntity(letterC3);
        this.gameEngine.addEntity(letterC4);
        this.gameEngine.addEntity(letterC5);
        this.gameEngine.addEntity(letterC6);
        this.gameEngine.addEntity(letterC7);
        this.gameEngine.addEntity(letterC8);
        this.gameEngine.addEntity(letterC9);
        // O
        this.gameEngine.addEntity(letterO1);
        this.gameEngine.addEntity(letterO2);
        this.gameEngine.addEntity(letterO3);
        this.gameEngine.addEntity(letterO4);
        this.gameEngine.addEntity(letterO5);
        this.gameEngine.addEntity(letterO6);
        this.gameEngine.addEntity(letterO7);
        this.gameEngine.addEntity(letterO8);
        this.gameEngine.addEntity(letterO9);
        this.gameEngine.addEntity(letterO10);
        this.gameEngine.addEntity(letterO11);
        this.gameEngine.addEntity(letterO12);
        // R
        this.gameEngine.addEntity(letterR1);
        this.gameEngine.addEntity(letterR2);
        this.gameEngine.addEntity(letterR3);
        this.gameEngine.addEntity(letterR4);
        this.gameEngine.addEntity(letterR5);
        this.gameEngine.addEntity(letterR6);
        this.gameEngine.addEntity(letterR7);
        this.gameEngine.addEntity(letterR8);
        this.gameEngine.addEntity(letterR9);
        this.gameEngine.addEntity(letterR10);
        this.gameEngine.addEntity(letterR11);
        // E
        this.gameEngine.addEntity(letterE11);
        this.gameEngine.addEntity(letterE12);
        this.gameEngine.addEntity(letterE13);
        this.gameEngine.addEntity(letterE14);
        this.gameEngine.addEntity(letterE15);
        this.gameEngine.addEntity(letterE16);
        this.gameEngine.addEntity(letterE17);
        this.gameEngine.addEntity(letterE18);
        this.gameEngine.addEntity(letterE19);
        this.gameEngine.addEntity(letterE20);
    }

    basicControlImage = function () {
        // four move pad
        var run = new Block(this.gameEngine, 750, 750, 50, 50, "blue", 25, true, 10);
        var duck = new Block(this.gameEngine, 700, 750, 50, 50, "blue", 25, true, 10);
        var block = new Block(this.gameEngine, 650, 750, 50, 50, "blue", 25, true, 10);
        var jump = new Block(this.gameEngine, 700, 700, 50, 50, "blue", 25, true, 10);

        // outline the four buttons
        var outline1 = new Block(this.gameEngine, 750, 750, 50, 50, "black", 25, false, 1);
        var outline2 = new Block(this.gameEngine, 650, 750, 50, 50, "black", 25, false, 1);
        var outline3 = new Block(this.gameEngine, 700, 700, 50, 50, "black", 25, false, 1);

        // arrow right
        var rightArrow = [];
        rightArrow[0] = new Block(this.gameEngine, 770, 775, 3, 3, "black", 50, false, 1);
        rightArrow[1] = new Block(this.gameEngine, 773, 775, 3, 3, "black", 50, false, 1);
        rightArrow[2] = new Block(this.gameEngine, 776, 775, 3, 3, "black", 50, false, 1);
        rightArrow[3] = new Block(this.gameEngine, 779, 775, 3, 3, "black", 50, false, 1);
        rightArrow[4] = new Block(this.gameEngine, 782, 775, 3, 3, "black", 50, false, 1);
        rightArrow[5] = new Block(this.gameEngine, 785, 775, 3, 3, "black", 50, false, 1);
        rightArrow[6] = new Block(this.gameEngine, 782, 772, 3, 3, "black", 50, false, 1);
        rightArrow[7] = new Block(this.gameEngine, 782, 778, 3, 3, "black", 50, false, 1);
        rightArrow[8] = new Block(this.gameEngine, 779, 772, 3, 3, "black", 50, false, 1);
        rightArrow[9] = new Block(this.gameEngine, 779, 778, 3, 3, "black", 50, false, 1);
        rightArrow[10] = new Block(this.gameEngine, 779, 769, 3, 3, "black", 50, false, 1);
        rightArrow[11] = new Block(this.gameEngine, 779, 781, 3, 3, "black", 50, false, 1);

        // arrow left
        var left1 = new Block(this.gameEngine, 670, 775, 3, 3, "black", 50, false, 1);
        var left2 = new Block(this.gameEngine, 673, 775, 3, 3, "black", 50, false, 1);
        var left3 = new Block(this.gameEngine, 676, 775, 3, 3, "black", 50, false, 1);
        var left4 = new Block(this.gameEngine, 679, 775, 3, 3, "black", 50, false, 1);
        var left5 = new Block(this.gameEngine, 682, 775, 3, 3, "black", 50, false, 1);
        var left6 = new Block(this.gameEngine, 685, 775, 3, 3, "black", 50, false, 1);
        var left7 = new Block(this.gameEngine, 673, 772, 3, 3, "black", 50, false, 1);
        var left8 = new Block(this.gameEngine, 673, 778, 3, 3, "black", 50, false, 1);
        var left9 = new Block(this.gameEngine, 676, 772, 3, 3, "black", 50, false, 1);
        var left10 = new Block(this.gameEngine, 676, 778, 3, 3, "black", 50, false, 1);
        var left11 = new Block(this.gameEngine, 676, 769, 3, 3, "black", 50, false, 1);
        var left12 = new Block(this.gameEngine, 676, 781, 3, 3, "black", 50, false, 1);

        // arrow up
        var up1 = new Block(this.gameEngine, 725, 726, 3, 3, "black", 50, false, 1);
        var up2 = new Block(this.gameEngine, 725, 723, 3, 3, "black", 50, false, 1);
        var up3 = new Block(this.gameEngine, 725, 720, 3, 3, "black", 50, false, 1);
        var up4 = new Block(this.gameEngine, 725, 717, 3, 3, "black", 50, false, 1);
        var up5 = new Block(this.gameEngine, 725, 714, 3, 3, "black", 50, false, 1);
        var up6 = new Block(this.gameEngine, 725, 711, 3, 3, "black", 50, false, 1);
        var up7 = new Block(this.gameEngine, 722, 714, 3, 3, "black", 50, false, 1);
        var up8 = new Block(this.gameEngine, 728, 714, 3, 3, "black", 50, false, 1);
        var up9 = new Block(this.gameEngine, 722, 717, 3, 3, "black", 50, false, 1);
        var up10 = new Block(this.gameEngine, 728, 717, 3, 3, "black", 50, false, 1);
        var up11 = new Block(this.gameEngine, 719, 717, 3, 3, "black", 50, false, 1);
        var up12 = new Block(this.gameEngine, 731, 717, 3, 3, "black", 50, false, 1);

        // arrow down
        var down1 = new Block(this.gameEngine, 725, 770, 3, 3, "black", 50, false, 1);
        var down2 = new Block(this.gameEngine, 725, 773, 3, 3, "black", 50, false, 1);
        var down3 = new Block(this.gameEngine, 725, 776, 3, 3, "black", 50, false, 1);
        var down4 = new Block(this.gameEngine, 725, 779, 3, 3, "black", 50, false, 1);
        var down5 = new Block(this.gameEngine, 725, 782, 3, 3, "black", 50, false, 1);
        var down6 = new Block(this.gameEngine, 725, 785, 3, 3, "black", 50, false, 1);
        var down7 = new Block(this.gameEngine, 722, 782, 3, 3, "black", 50, false, 1);
        var down8 = new Block(this.gameEngine, 728, 782, 3, 3, "black", 50, false, 1);
        var down9 = new Block(this.gameEngine, 722, 779, 3, 3, "black", 50, false, 1);
        var down10 = new Block(this.gameEngine, 728, 779, 3, 3, "black", 50, false, 1);
        var down11 = new Block(this.gameEngine, 719, 779, 3, 3, "black", 50, false, 1);
        var down12 = new Block(this.gameEngine, 731, 779, 3, 3, "black", 50, false, 1);

        // Arrow Butons
        this.gameEngine.addEntity(run);
        this.gameEngine.addEntity(duck);
        this.gameEngine.addEntity(block);
        this.gameEngine.addEntity(jump);
        this.gameEngine.addEntity(outline1);
        this.gameEngine.addEntity(outline2);
        this.gameEngine.addEntity(outline3);
        // right arrow
        this.gameEngine.addEntity(rightArrow[0]);
        this.gameEngine.addEntity(rightArrow[1]);
        this.gameEngine.addEntity(rightArrow[2]);
        this.gameEngine.addEntity(rightArrow[3]);
        this.gameEngine.addEntity(rightArrow[4]);
        this.gameEngine.addEntity(rightArrow[5]);
        this.gameEngine.addEntity(rightArrow[6]);
        this.gameEngine.addEntity(rightArrow[7]);
        this.gameEngine.addEntity(rightArrow[8]);
        this.gameEngine.addEntity(rightArrow[9]);
        this.gameEngine.addEntity(rightArrow[10]);
        this.gameEngine.addEntity(rightArrow[11]);
        // left arrow
        this.gameEngine.addEntity(left1);
        this.gameEngine.addEntity(left2);
        this.gameEngine.addEntity(left3);
        this.gameEngine.addEntity(left4);
        this.gameEngine.addEntity(left5);
        this.gameEngine.addEntity(left6);
        this.gameEngine.addEntity(left7);
        this.gameEngine.addEntity(left8);
        this.gameEngine.addEntity(left9);
        this.gameEngine.addEntity(left10);
        this.gameEngine.addEntity(left11);
        this.gameEngine.addEntity(left12);
        // up arrow
        this.gameEngine.addEntity(up1);
        this.gameEngine.addEntity(up2);
        this.gameEngine.addEntity(up3);
        this.gameEngine.addEntity(up4);
        this.gameEngine.addEntity(up5);
        this.gameEngine.addEntity(up6);
        this.gameEngine.addEntity(up7);
        this.gameEngine.addEntity(up8);
        this.gameEngine.addEntity(up9);
        this.gameEngine.addEntity(up10);
        this.gameEngine.addEntity(up11);
        this.gameEngine.addEntity(up12);
        // down arrow
        this.gameEngine.addEntity(down1);
        this.gameEngine.addEntity(down2);
        this.gameEngine.addEntity(down3);
        this.gameEngine.addEntity(down4);
        this.gameEngine.addEntity(down5);
        this.gameEngine.addEntity(down6);
        this.gameEngine.addEntity(down7);
        this.gameEngine.addEntity(down8);
        this.gameEngine.addEntity(down9);
        this.gameEngine.addEntity(down10);
        this.gameEngine.addEntity(down11);
        this.gameEngine.addEntity(down12);

    }