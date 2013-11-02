goog.provide('lava.Board');
goog.provide('lava.Square');

goog.require('lime.Layer');
goog.require('lime.fill.Color');

lava.kLen = 44;
lava.kGrass = 0;
lava.kLava = 1;
lava.kGrassFill = '#0f0';
lava.kLavaFill = '#f00';

lava.Square = function(row, col) {
    this.type_ = lava.kGrass; 
    this.row = row;
    this.col = col;
};

lava.Square.onTouch = function(e) {
    if (this.getFill().str == lava.kLavaFill) {
        return;
    }

    this.setFill(lava.kLavaFill);
    // Propegate
    lava.Board.onTouch.call(this.getParent(), this.square_);
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

// Creates the sprite, attaches an event handler and this to it, and returns it.
lava.Square.prototype.getSprite = function() {
    var sprite = new lime.Sprite().setSize(lava.kLen, lava.kLen)
        .setPosition(lava.kLen*this.col, lava.kLen*this.row)
        .setFill(this.getFill())
        .setAnchorPoint(0, 0);
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
            this.board[str][col+''] = new lava.Square(row, col);
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
    layer.board_ = this;
    return layer;
};

lava.Board.onTouch = function(square) {
    var row = square.row;
    var col = square.col;
    var board = this.board_.board;
    var square = board[row+''][col+''];
    for (var r = row-1; r <= row+1; r++) {
        var rStr = r+'';
        if (!(rStr in board)) {
            board[rStr] = {};
        }
        for (var c = col-1; c <= col+1; c++) {
            var cStr = c+'';
            if (!(cStr in board[rStr])) {
                var newSquare = new lava.Square(r, c);
                board[rStr][cStr] = newSquare;
                this.appendChild(newSquare.getSprite());
            }
        }
    }
};
