//set main namespace
goog.provide('lava');
goog.provide('lava.Stats');

goog.require('lava.Audio');
goog.require('lava.Board');
goog.require('lava.Hud');

goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Scene');
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.lava.json');
goog.require('lime.SpriteSheet');

lava.kTan = {r: 248, g: 205, b: 142};
lava.kBlue = {r: 6, g: 31, b: 42};
lava.kGreen = {r: 7, g: 41, b: 6};
lava.kFontColor = lava.kBlue;
lava.kFontSize = 24;
lava.kMaxTurns = 100;

goog.DEBUG = false;

// Generate a random number between 0 and num-1.
var random = function(num) {
    return Math.floor(Math.random()*num);
};

var center = function(item) {
    var itemSize = item.getSize();
    var posX = (lava.kWidth - itemSize.width)/2;
    var posY = (lava.kHeight - itemSize.height)/2;
    item.setPosition(posX, posY);
};

var label = function(text) {
    return new lime.Label().setText(text).setFontSize(40)
        .setFontColor(lava.kFontColor.r, lava.kFontColor.g, lava.kFontColor.b)
        .setFontFamily('VT323');
};

lava.start = function(){
    lava.kWidth = 1024;
    lava.kHeight = 768;

    var director = new lime.Director(document.body, lava.kWidth, lava.kHeight);
    var scene = new lime.Scene();
    lava.Audio.setup();
    this.spriteSheet = new lime.SpriteSheet('assets/lava.png',
					    lime.ASSETS.lava.json,
					    lime.parser.JSON);
    var bg = new lime.Sprite().setSize(lava.kWidth, lava.kHeight)
        .setFill(lava.kBlue.r, lava.kBlue.g, lava.kBlue.b)
        .setPosition(512, 384);
    scene.appendChild(bg);
    // TODO: black background
    var board = new lava.Board();
    center(board);
    scene.appendChild(board);
    this.hud_ = new lava.Hud();
    this.turnsRemaining = lava.kMaxTurns;
    scene.appendChild(lava.hud_);
    this.scene = scene;

    director.makeMobileWebAppCapable();
    director.replaceScene(scene);
};

lava.registerTurn = function() {
    this.hud_.setProgress(--this.turnsRemaining);
    lava.Stats.turnsPlayed++;
};

lava.endGame = function() {
    var width = 50;
    var height = -50;
    var box = new lime.Sprite().setFill(lava.kTan.r, lava.kTan.g, lava.kTan.b)
        .setSize(600, 400).setPosition(512, 384);

    box.appendChild(label("Game Over").setPosition(width, height));
    height += 50;

    box.appendChild(label("Hot lava: "+lava.Stats.lavaSquares)
        .setFontSize(lava.kFontSize).setPosition(width, height));
    height += 30;
    box.appendChild(label("Cooled lava: "+lava.Stats.lavaSquares)
        .setFontSize(lava.kFontSize).setPosition(width, height));
    height += 30;
    box.appendChild(label("Villagers killed: "+lava.Stats.villagersKilled)
        .setFontSize(lava.kFontSize).setPosition(width, height));
    height += 30;
    box.appendChild(label("Number of moves: "+lava.Stats.turnsPlayed)
        .setFontSize(lava.kFontSize).setPosition(width, height));

    this.scene.appendChild(box);
};

lava.Stats = {
    lavaSquares: 0,
    cooledSquares: 0,
    villagersKilled: 0,
    turnsPlayed: 0
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('lava.start', lava.start);
