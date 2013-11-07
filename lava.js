//set main namespace
goog.provide('lava');
goog.provide('lava.Stats');

goog.require('lava.Board');
goog.require('lava.Hud');

goog.require('lime.Director');
goog.require('lime.Label');
goog.require('lime.Scene');
goog.require('lime.parser.JSON');
goog.require('lime.ASSETS.lava.json');
goog.require('lime.SpriteSheet');
goog.require('lime.animation.FadeTo');

lava.kTan = 'rgb(248,205,142)';
lava.kBlue = 'rgb(6,31,42)';
lava.kGreen = 'rgb(7,41,6)';
lava.kRed = 'rgb(217,21,14)';
lava.kMaroon = 'rgb(111,12,28)';
lava.kFontColor = lava.kTan;
lava.kFontSize = 24;
lava.kMaxTurns = 100;

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
    var lbl = new lime.Label().setText(text).setFontSize(40)
        .setFontColor(lava.kFontColor)
        .setFontFamily('VT323').setMultiline(true);
    lbl.createDomElement();
    goog.style.setStyle(lbl.domElement, {cursor: 'default'});
    return lbl;
};

lava.start = function(){
    lava.kWidth = 1024;
    lava.kHeight = 768;

    var director = new lime.Director(document.body, lava.kWidth, lava.kHeight);
    var scene = new lime.Scene();
    this.spriteSheet = new lime.SpriteSheet('assets/lava.png',
					    lime.ASSETS.lava.json,
					    lime.parser.JSON);
    var bg = new lime.Sprite().setSize(lava.kWidth, lava.kHeight)
        .setFill(lava.kBlue)
        .setPosition(512, 384);
    scene.appendChild(bg);
    var board = new lava.Board();
    center(board);
    scene.appendChild(board);
    this.hud_ = new lava.Hud();
    this.turnsRemaining = lava.kMaxTurns;
    scene.appendChild(lava.hud_);
    var title = label('The Little  Volcano that Could')
        .setFontColor(lava.kTan)
        .setPosition(lava.kWidth/2, lava.kHeight - 24);
    scene.appendChild(title);
    this.scene = scene;

    director.makeMobileWebAppCapable();
    director.replaceScene(scene);
};

lava.registerTurn = function() {
    this.hud_.setProgress(--this.turnsRemaining);
    lava.Stats.turnsPlayed++;
};

lava.addToTurns = function(num) {
    this.turnsRemaining = Math.min(this.turnsRemaining + num, 100);
};

lava.endGame = function() {
    var width = 0;
    var height = -50;
    var box = new lime.Sprite().setFill(lava.kTan)
        .setSize(600, 400).setPosition(512, 384);

    box.appendChild(label("Game Over!").setPosition(width, height)
        .setFontColor(lava.kMaroon));
    height += 50;

    box.appendChild(label("Hot lava: "+lava.Stats.lavaSquares)
        .setFontSize(lava.kFontSize).setPosition(width, height)
        .setFontColor(lava.kMaroon));
    height += 30;
    box.appendChild(label("Cooled lava: "+lava.Stats.cooledSquares)
        .setFontSize(lava.kFontSize).setPosition(width, height)
        .setFontColor(lava.kMaroon));
    height += 30;
    box.appendChild(label("Villagers burned: "+lava.Stats.villagersKilled)
        .setFontSize(lava.kFontSize).setPosition(width, height)
        .setFontColor(lava.kMaroon));
    height += 30;
    box.appendChild(label("Number of moves: "+lava.Stats.turnsPlayed)
        .setFontSize(lava.kFontSize).setPosition(width, height)
        .setFontColor(lava.kMaroon));

    box.setOpacity(0);
    box.runAction(new lime.animation.FadeTo(1).setDuration(3));
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
