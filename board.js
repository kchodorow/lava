goog.provide('lava.Board');
goog.provide('lava.Square');

goog.require('lava.Villager');

goog.require('lime.Layer');
goog.require('lime.Sprite');

lava.kLen = 44;
lava.kGrass = 0;
lava.kLava = 1;
lava.kRock = 2;
lava.kGrassFill = '#0f0';
lava.kLavaFill = '#f00';
lava.kRockFill = '#999';
lava.kTypeUnknown = '#fff';

lava.Square = function(row, col) {
    lime.Sprite.call(this);

    this.row = row;
    this.col = col;

    this.setSize(lava.kLen, lava.kLen)
        .setPosition(lava.kLen*this.col, lava.kLen*this.row)
        .setAnchorPoint(0, 0);
    this.setType(lava.kGrass);
    goog.events.listen(this,
                       [goog.events.EventType.MOUSEDOWN, 
                        goog.events.EventType.TOUCHSTART],
                       lava.Square.onTouch);
};

goog.inherits(lava.Square, lime.Sprite);

lava.Square.onTouch = function(e) {
    if (this.getFill().str == lava.kLavaFill) {
        return;
    }

    this.setType(lava.kLava);
    // Propegate
    lava.Board.onTouch.call(this.getParent(), this);
};

lava.Square.prototype.getType = function() {
    return this.type_;
};

lava.Square.prototype.setType = function(type) {
    this.type_ = type;
    switch (this.type_) {
    case lava.kGrass:
        this.setFill(lava.kGrassFill);
        break;
    case lava.kLava:
        this.setFill(lava.kLavaFill);
        break;
    case lava.kRock:
        this.setFill(lava.kRockFill);
        break;
    default:
        this.setFill(lava.kTypeUnknown);
    }
};

lava.Board = function() {
    lime.Layer.call(this);

    // Start with a 3x3 board
    this.board = {};
    for (var row = 0; row < 3; row++) {
        str = row + '';
        this.board[str] = {};
        for (var col = 0; col < 3; col++) {
            var square = new lava.Square(row, col);
            this.board[str][col+''] = square;
            this.appendChild(square);
        }
    }
    this.board['1']['1'].setType(lava.kLava);
    this.villagers = new lava.Villagers();
    // TODO: center
    this.setPosition(512, 380);
};

goog.inherits(lava.Board, lime.Layer);

// this = lime.Layer
lava.Board.onTouch = function(square) {
    var row = square.row;
    var col = square.col;
    var board = this.board;

    var villagers = this.villagers;
    villagers.dowse(board);

    // Add new square to the board
    for (var r = row-1; r <= row+1; r++) {
        var rStr = r+'';
        if (!(rStr in board)) {
            board[rStr] = {};
        }
        for (var c = col-1; c <= col+1; c++) {
            var cStr = c+'';
            if (!(cStr in board[rStr])) {
                var newSquare = new lava.Square(r, c);
                if (random(2) == 0) {
                    newSquare.appendChild(villagers.add(r, c));
                }
                board[rStr][cStr] = newSquare;
                this.appendChild(newSquare);
            }
        }
    }
};
