goog.provide('lava.Villager');
goog.provide('lava.Villagers');

lava.Villager = function(row, col) {
    lime.Sprite.call(this);

    this.setFill('#000').setSize(20, 20)
        .setPosition(lava.kLen*col+lava.kLen/2, lava.kLen*row+lava.kLen/2);

    this.row = row;
    this.col = col;
    this.alive_ = true;
    this.new_ = true;
};

goog.inherits(lava.Villager, lime.Sprite);

lava.Villager.prototype.kill = function() {
    this.alive_ = false;
    this.setFill('#777');
};

lava.Villager.prototype.isAlive = function() {
    return this.alive_;
};


// 0 -> -1, -1
// 1 -> -1, 0
// 2 -> -1, 1
// 3 -> 0, -1
// 6 -> 1
lava.Villager.prototype.move = function(board) {
    var dir = random(9);
    for (var i = 0; i < 9; i++) {
        var row = Math.floor(dir/3) - 1;
        var col = dir%3 - 1;
        var square = board.getSquare(row, col);

        // If this is unwalkable, try another direction
        if (square != null && 
            (square.getType() == lava.kLava || 
             square.getType() == lava.kRock)) {
            dir = (dir + 1) % 9;   
            continue;
        }

        // Otherwise, move
	this.runAction(new lime.animation.MoveTo(
                           col*lava.kLen+lava.kLen/2,
                           row*lava.kLen+lava.kLen/2));
        // TODO: remove if off board
        return;
    }
    // No where to walk
    this.alive_ = false;
};

// Villager actions.
lava.Villagers = function() {
    this.villagers = [];
};

lava.Villagers.prototype.add = function(row, col) {
    var villager = new lava.Villager(row, col);
    this.villagers.push(villager);
    return villager;
};

lava.Villagers.prototype.dowse = function(boardSprite) {
    for (var i = 0; i < this.villagers.length; i++) {
        var villager = this.villagers[i];
        if (!villager.isAlive()) {
            continue;
        }

        if (!villager.new_) {
            villager.move(boardSprite);
        }

        villager.new_ = false;
        var board = boardSprite.board;

        outer:
        for (var row = -1; row <= 1; row++) {
            for (var col = -1; col <= 1; col++) {
                if (row == 0 && col == 0) {
                    continue;
                }
                var targetRow = villager.row + row;
                var targetCol = villager.col + col;
                if (targetRow in board && 
                    targetCol in board[targetRow] &&
                    board[targetRow][targetCol].getType() == lava.kLava) {
                    board[targetRow][targetCol].setType(lava.kRock);
                    break outer;
                }
            }
        }
    }
};