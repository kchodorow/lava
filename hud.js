goog.provide('lava.Hud');

goog.require('lime.Layer');
goog.require('lime.RoundedRect');

lava.Hud = function() {
    lime.RoundedRect.call(this);

    this.percent_ = 100;
    this.setRadius(lava.Hud.kWidth/2)
        .setSize(lava.Hud.kWidth, lava.Hud.kHeight).setFill(lava.kMaroon)
        .setAnchorPoint(.5, 1).setPosition(lava.kWidth-80, 310);

    var inner = new lime.RoundedRect().setRadius(lava.Hud.kWidth/2)
        .setSize(lava.Hud.kWidth, lava.Hud.kHeight)
        .setAnchorPoint(.5, 1)
        .setFill(lava.kRed);
    this.appendChild(inner);
    this.inner_ = inner;

    var temp = label('Temperature').setFontSize(24).setPosition(0, -285)
        .setFontColor(lava.kTan).setAnchorPoint(.5, .5);
    this.appendChild(temp);
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
