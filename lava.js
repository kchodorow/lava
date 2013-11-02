//set main namespace
goog.provide('lava');

goog.require('lava.Board');

goog.require('lime.Director');
goog.require('lime.Scene');

lava.start = function(){
    var director = new lime.Director(document.body,1024,768);
    var scene = new lime.Scene();

    // TODO: black background

    var board = new lava.Board();
    scene.appendChild(board.getLayer());

    director.makeMobileWebAppCapable();
    director.replaceScene(scene);
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('lava.start', lava.start);
