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
    this.board_ = board;
};

lava.Square.onTouch = function(e) {
    if (this.getFill().str == lava.kLavaFill) {
        return;
    }

    this.setFill(lava.kLavaFill);
    this.square_.getBoard().onTouch(this);
};

lava.Square.prototype.setType = function(type) {
    this.type_ = type;
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

lava.Square.prototype.getBoard = function() {
    return this.board_;
};

// Creates the sprite, attaches an event handler and this to it, and returns it.
lava.Square.prototype.getSprite = function() {
    var sprite = new lime.Sprite().setSize(lava.kLen, lava.kLen)
        .setPosition(lava.kLen*this.col, lava.kLen*this.row)
        .setFill(this.getFill());
    goog.events.listen(sprite, 
                       [goog.events.EventType.MOUSEDOWN, 
                        goog.events.EventType.TOUCHSTART],
                       lava.Square.onTouch);
    sprite.square_ = this;
    return sprite;
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
    this.layer_ = layer;
    return layer;
};

lava.Board.prototype.onTouch = function(sprite) {
    var square = sprite.square_;
    var row = square.row;
    var col = square.col;
    for (var r = row-1; r <= row+1; r++) {
        var rStr = r+'';
        if (!(rStr in this.board)) {
            this.board[rStr] = {};
        }
        for (var c = col-1; c <= col+1; c++) {
            var cStr = c+'';
            if (!(cStr in this.board[rStr])) {
                var newSquare = new lava.Square(r, c, this);
                this.board[rStr][cStr] = newSquare;
                this.layer_.appendChild(newSquare.getSprite());
            }
        }
    }
};
