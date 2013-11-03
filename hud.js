goog.provide('lava.Hud');

goog.require('lime.Layer');
goog.require('lime.RoundedRect');

lava.Hud = function() {
    lime.RoundedRect.call(this);

    this.percent_ = 100;
    this.setRadius(lava.Hud.kWidth/2)
        .setSize(lava.Hud.kWidth, lava.Hud.kHeight).setFill('#000')
        .setAnchorPoint(.5, 1).setPosition(50, 270);

    var inner = new lime.RoundedRect().setRadius(lava.Hud.kWidth/2)
        .setSize(lava.Hud.kWidth, lava.Hud.kHeight)
        .setAnchorPoint(.5, 1)
        .setFill(lava.kRed);
    this.appendChild(inner);
    this.inner_ = inner;
};

goog.inherits(lava.Hud, lime.RoundedRect);

lava.Hud.kWidth = 20;
lava.Hud.kHeight = 250;

lava.Hud.prototype.setProgress = function(value) {
    this.percent_ = value;
    this.inner_.setSize(lava.Hud.kWidth, lava.Hud.kHeight*(this.percent_/100));
    return this;
};

lava.Hud.prototype.getProgress = function() {
    return this.percent_;
};
