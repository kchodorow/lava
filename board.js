goog.provide('lava.Board');
goog.provide('lava.Square');

goog.require('lime.Layer');
goog.require('lime.fill.Color');

lava.kLen = 44;
lava.kGrass = 0;
lava.kLava = 1;
lava.kGrassFill = '#0f0';
lava.kLavaFill = '#f00';

lava.Square = function(row, col, board) {
    this.type_ = lava.kGrass; 
    this.row = row;
    this.col = col;
    this.sprite_ = new lime.Sprite().setSize(lava.kLen, lava.kLen)
        .setPosition(lava.kLen*this.col, lava.kLen*this.row)
        .setFill(this.getFill());
    this.sprite_.board_ = board;
    goog.events.listen(this.sprite_, 
                       [goog.events.EventType.MOUSEDOWN, 
                        goog.events.EventType.TOUCHSTART],
                       lava.Square.onTouch);
};

lava.Square.onTouch = function(e) {
    if (this.getFill().str == lava.kLavaFill) {
        return;
    }

    this.setFill(lava.kLavaFill);
};

lava.Square.prototype.setType = function(type) {
    this.type_ = type;
    this.sprite_.setFill(this.getFill());
};

lava.Square.prototype.getFill = function() {
    switch (this.type_) {
    case lava.kGrass:
        return lava.kGrassFill;
    case lava.kLava:
        return lava.kLavaFill;
    }
    return lime.fill.Color(255, 255, 255);
};

lava.Square.prototype.getSprite = function() {
    return this.sprite_;
};

lava.Board = function() {
    // Start with a 3x3 board
    this.board = {};
    for (var row = 0; row < 3; row++) {
        str = row + '';
        this.board[str] = {};
        for (var col = 0; col < 3; col++) {
            this.board[str][col+''] = new lava.Square(row, col, this);
        }
    }
    this.board['1']['1'].setType(lava.kLava);
};

lava.Board.prototype.getLayer = function() {
    var layer = new lime.Layer();
    for (var row in this.board) {
        for (var col in this.board[row]) {
            var square = this.board[row][col];
            layer.appendChild(square.getSprite());
        }
    }
    layer.setPosition(512, 380);
    return layer;
};

