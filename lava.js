//set main namespace
goog.provide('lava');

goog.require('lava.Audio');
goog.require('lava.Board');
goog.require('lava.Hud');

goog.require('lime.Director');
goog.require('lime.Scene');

lava.kMaxTurns = 100;

// Generate a random number between 0 and num-1.
var random = function(num) {
    return Math.floor(Math.random()*num);
};

lava.start = function(){
    var director = new lime.Director(document.body,1024,768);
    var scene = new lime.Scene();
    lava.Audio.setup();

    // TODO: black background

    scene.appendChild(new lava.Board());
    this.hud_ = new lava.Hud();
    this.turnsRemaining = lava.kMaxTurns;
    scene.appendChild(lava.hud_);

    director.makeMobileWebAppCapable();
    director.replaceScene(scene);
};

lava.registerTurn = function() {
    this.hud_.setProgress(--this.turnsRemaining);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('lava.start', lava.start);
