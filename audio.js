goog.provide('lava.Audio');

goog.require('lime.audio.Audio');

lava.audio_ = null;

lava.Audio = function() {
    this.fizzle_ = new lime.audio.Audio('assets/fizzle.wav');
    this.burnGrass_ = new lime.audio.Audio('assets/burnGrass.wav');
    this.burnVillager_ = new lime.audio.Audio('assets/burnVillager.wav');
};

lava.Audio.setup = function() {
    lava.audio_ = new lava.Audio();
};

lava.Audio.fizzle = function() {
    lava.audio_.fizzle_.play();
};

lava.Audio.burnVillager = function() {
    lava.audio_.burnVillager_.play();
};

lava.Audio.burnGrass = function() {
    lava.audio_.burnGrass_.play();
};
