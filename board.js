goog.provide('lava.Board');
goog.provide('lava.Square');

goog.require('lava.Audio');
goog.require('lava.Stats');
goog.require('lava.Villager');

goog.require('lime.Layer');
goog.require('lime.Sprite');

lava.kLen = 44;
lava.kGrass = 0;
lava.kLava = 1;
lava.kRock = 2;
lava.kGrassFill = 'grass.png';
lava.kLavaFill = 'lava.png';
lava.kRockFill = 'charred.png';
lava.kTypeUnknown = '#fff';
lava.kCloudFill = 'cloud.png';

lava.Square = function(row, col) {
    lime.Sprite.call(this);

    this.row = row;
    this.col = col;

    this.setSize(lava.kLen, lava.kLen)
        .setPosition(lava.kLen*this.col, lava.kLen*this.row)
        .setAnchorPoint(0, 0);
    this.setType(lava.kGrass);

    this.tree_ = null;
    if (random(20) == 0) {
        this.tree_ = new lime.Sprite()
            .setFill(lava.spriteSheet.getFrame('tree.png'))
            .setPosition(lava.kLen/2, lava.kLen/2);
        this.appendChild(this.tree_);
    }

    goog.events.listen(this,
                       [goog.events.EventType.MOUSEDOWN, 
                        goog.events.EventType.TOUCHSTART],
                       lava.Square.onTouch);
};

goog.inherits(lava.Square, lime.Sprite);

lava.Square.onTouch = function(e) {
    if (this.getType() != lava.kGrass ||
        !this.isLavaAdjacent()) {
        return;
    }

    if (this.tree_) {
        lava.addToTurns(10);
        this.removeChild(this.tree_);
        var plus = label("+10°")
            .setPosition(this.col*lava.kLen+lava.kLen/2, 
                         this.row*lava.kLen+lava.kLen/2);
        this.getParent().appendChild(plus);
        plus.runAction(
            new lime.animation.Spawn(
                new lime.animation.MoveBy(0, -lava.kLen),
                new lime.animation.FadeTo(0).setDuration(3)));
    }
    lava.registerTurn();
    this.setType(lava.kLava);
    lava.Audio.burnGrass();
    // Propegate
    lava.Board.onTouch.call(this.getParent(), this);
};

lava.Square.prototype.isLavaAdjacent = function() {
    var board = this.getParent().board;
    for (var row = this.row-1; row <= this.row+1; row++) {
        for (var col = this.col-1; col <= this.col+1; col++) {
            if (row in board && 
                col in board[row] &&
                board[row][col].getType() == lava.kLava) {
                return true;
            }
        }
    }
    return false;
};

lava.Square.prototype.getType = function() {
    return this.type_;
};

lava.Square.prototype.setType = function(type) {
    this.type_ = type;
    switch (this.type_) {
    case lava.kGrass:
        this.setFill(lava.spriteSheet.getFrame('grass.png'));
        break;
    case lava.kLava:
        this.setFill(lava.spriteSheet.getFrame('lava.png'));
        this.getParent().addToLavaList(this);
        break;
    case lava.kRock:
        this.setFill(lava.spriteSheet.getFrame('charred.png'));
        this.getParent().rmFromLavaList(this);
        break;
    default:
        this.setFill(lava.kTypeUnknown);
    }
};

lava.Board = function() {
    lime.Layer.call(this);

    this.lavaList_ = [];

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
    this.villagers = new lava.Villagers(this);
    this.setSize(lava.kLen*3, lava.kLen*3);

    this.tutorial = new lava.Tutorial();
    this.appendChild(this.tutorial.grass);
    this.tutorial.grass.active_ = true;

    // Setup scrolling
    goog.events.listen(
        this,
        [goog.events.EventType.MOUSEDOWN, goog.events.EventType.TOUCHSTART],
        function(e) {
	    e.startDrag();
	});
};

goog.inherits(lava.Board, lime.Layer);

// Safe to call for row/col outside of board, returns null.
lava.Board.prototype.getSquare = function(row, col) {
    if (row in this.board && col in this.board[row]) {
        return this.board[row][col];
    }
    return null;
};

lava.Board.prototype.addToLavaList = function(square) {
    this.lavaList_.push(square);
    lava.Stats.lavaSquares++;
};

lava.Board.prototype.rmFromLavaList = function(square) {
    if (goog.array.remove(this.lavaList_, square)) {
        // if this is called multiple times, only count once
        lava.Stats.lavaSquares--;
        lava.Stats.cooledSquares++;      
    }

    if (!this.tutorial.cooled.hasGone) {
        this.appendChild(this.tutorial.cooled);
        this.tutorial.cooled.hasGone = true;
        this.tutorial.cooled.active_ = true;
    }
};

lava.Board.prototype.hasMoves = function() {
    for (var i = 0; i < this.lavaList_.length; i++) {
        var live = this.lavaList_[i];
        for (var j = live.row-1; j <= live.row+1; j++) {
            for (var k = live.col-1; k <= live.col+1; k++) {
                var square = this.getSquare(j, k);
                if (square != null && square.getType() == lava.kGrass) {
                    return true;
                }
            }
        }
    }
    return false;
};

// this = lime.Layer
lava.Board.onTouch = function(square) {
    if (this.tutorial.grass.active_) {
        this.removeChild(this.tutorial.grass);
        this.tutorial.grass.active_ = false;
    } else if (this.tutorial.villagers.active_) {
        this.removeChild(this.tutorial.villagers);
        this.tutorial.villagers.active_ = false;
    } else if (this.tutorial.cooled.active_) {
        this.removeChild(this.tutorial.cooled);
        this.tutorial.cooled.active_ = false;

        this.appendChild(this.tutorial.temp);
        this.tutorial.temp.active_ = true;
    } else if (this.tutorial.temp.active_) {
        this.removeChild(this.tutorial.temp);
        this.tutorial.temp.active_ = false;        
    }

    var row = square.row;
    var col = square.col;
    var board = this.board;

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
                board[rStr][cStr] = newSquare;
                this.appendChild(newSquare);
            }
        }
    }

    // Generate new villagers
    // random(14) at lava.Stats.turns == 0
    // random(4) at turns == 100
    // -1 every 10 turns
    var chances = 14 - Math.floor(lava.Stats.turnsPlayed/10);
    for (var r in this.board) {
        for (var c in this.board[r]) {
            if (this.hasEdge(this.getSquare(r, c)) && random(chances) == 0) {
                this.appendChild(this.villagers.add(r, c));
                
                if (!this.tutorial.villagers.hasGone) {
                    this.appendChild(this.tutorial.villagers);
                    this.tutorial.villagers.active_ = true;
                    this.tutorial.villagers.hasGone = true;
                }
            }
        }
    }

    this.villagers.kill();
    // After adding villagers, so they get picked up next round
    this.villagers.douse();

    if (lava.turnsRemaining == 0 || !this.hasMoves()) {
        lava.endGame();
    }
};

lava.Board.prototype.hasEdge = function(square) {
    for (var row = square.row-1; row <= square.row+1; row++) {
        for (var col = square.col-1; col <= square.col+1; col++) {
            if (this.getSquare(row, col) == null) {
                return true;
            }
        }
    }
    return false;
};

lava.Tutorial = function() {
    this.text = [
        "Click on the grass next\nto you to spread.",
        "Villagers will throw water on you\n(unless you burn them).",
        "Cooled off lava blocks you and villagers.",
        "Once you've cooled off completely or\nrun out of possible moves, the game is over."
    ];

    this.grass = label(this.text[0])
        .setFontColor(lava.kTan).setAnchorPoint(.5, 0)
        .setPosition(80, -150);
    this.villagers = label(this.text[1])
        .setFontColor(lava.kTan).setAnchorPoint(.5, 0)
        .setPosition(80, -150);
    this.villagers.hasGone = false;
    this.cooled = label(this.text[2])
        .setFontColor(lava.kTan).setAnchorPoint(.5, 0)
        .setPosition(80, -150);
    this.temp = label(this.text[3])
        .setFontColor(lava.kTan).setAnchorPoint(.5, 0)
        .setPosition(80, -150);
};
