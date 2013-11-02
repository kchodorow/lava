goog.provide('lava.Hud');

goog.require('lime.Layer');
goog.require('lime.RoundedRect');

lava.Hud = function() {
    lime.RoundedRect.call(this);

    this.percent_ = 100;
    this.setRadius(5).setSize(lava.Hud.kWidth, lava.Hud.kHeight).setFill('#000')
        .setAnchorPoint(0, .5);

    var inner = new lime.RoundedRect().setRadius(5)
        .setSize(lava.Hud.kWidth, lava.Hud.kHeight)
        .setAnchorPoint(0, .5)
        .setFill('#Ff9900');
    this.appendChild(inner);
    this.inner_ = inner;
    this.setPosition(50, 50);
};

goog.inherits(lava.Hud, lime.RoundedRect);

lava.Hud.kWidth = 200;
lava.Hud.kHeight = 10;

lava.Hud.prototype.setProgress = function(value) {
    this.percent_ = value;
    this.inner_.setSize(lava.Hud.kWidth*(this.percent_/100), lava.Hud.kHeight);
    return this;
};

lava.Hud.prototype.getProgress = function() {
    return this.percent_;
};
