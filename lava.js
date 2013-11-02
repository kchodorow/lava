//set main namespace
goog.provide('lava');

goog.require('lava.Board');

goog.require('lime.Director');
goog.require('lime.Scene');

// Generate a random number between 0 and num-1.
var random = function(num) {
    return Math.floor(Math.random()*num);
};

lava.start = function(){
    var director = new lime.Director(document.body,1024,768);
    var scene = new lime.Scene();

    // TODO: black background

    scene.appendChild(new lava.Board());

    director.makeMobileWebAppCapable();
    director.replaceScene(scene);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('lava.start', lava.start);
