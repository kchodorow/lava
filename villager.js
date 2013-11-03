goog.provide('lava.Villager');
goog.provide('lava.Villagers');

goog.require('lava.Audio');

goog.require('lime.Sprite');
goog.require('lime.animation.KeyframeAnimation');

lava.Villager = function(row, col) {
    lime.Sprite.call(this);

    this.setFill(lava.spriteSheet.getFrame('villager0.png'));
    this.setPosition(lava.kLen*col+lava.kLen/2, lava.kLen*row+lava.kLen/2);

    var walk = new lime.animation.KeyframeAnimation();
    walk.addFrame(lava.spriteSheet.getFrame('villager1.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager_step.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager2.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager_step.png'));
    this.runAction(walk);

    this.row = row;
    this.col = col;
    this.alive_ = true;
    this.new_ = true;
};

goog.inherits(lava.Villager, lime.Sprite);

lava.Villager.prototype.kill = function() {
    this.alive_ = false;
    var parent = this.getParent();
    if (parent != null) {
        parent.removeChild(this);
    }
    lava.Audio.burnVillager();
};

lava.Villager.prototype.isAlive = function() {
    return this.alive_;
};

// Returns true if moved, false otherwise.
lava.Villager.prototype.move = function(board) {
    if (this.new_) {
        return false;
    }

    // 0 -> -1, -1
    // 1 -> -1, 0
    // 2 -> -1, 1
    // 3 -> 0, -1
    // 6 -> 1
    var dir = random(9);
    for (var i = 0; i < 9; i++) {
        var row = this.row + (Math.floor(dir/3) - 1);
        var col = this.col + (dir%3 - 1);
        var square = board.getSquare(row, col);

        // If this is unwalkable, try another direction
        if (square != null && 
            (square.getType() == lava.kLava || 
             square.getType() == lava.kRock)) {
            dir = (dir + 1) % 9;   
            continue;
        }

        // Otherwise, move
        this.row = row;
        this.col = col;
        goog.style.setStyle(this.domElement, 'z-index', 2);
	this.runAction(new lime.animation.MoveTo(
                           col*lava.kLen+lava.kLen/2,
                           row*lava.kLen+lava.kLen/2));
        // TODO: remove if off board
        return true;
    }
    // No where to walk
    this.alive_ = false;
    return false;
};

lava.Villager.prototype.water = function(board) {
    if (this.new_) {
        return;
    }

    for (var row = this.row-1; row <= this.row+1; row++) {
        for (var col = this.col-1; col <= this.col+1; col++) {
            if (row == this.row && col == this.col) {
                continue;
            }
            if (row in board && 
                col in board[row] &&
                board[row][col].getType() == lava.kLava) {
                board[row][col].setType(lava.kRock);
                lava.Audio.fizzle();

                var sploosh = new lime.animation.KeyframeAnimation();
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager0.png'));
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager_throw1.png'));
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager_throw2.png'));
                this.runAction(sploosh);
                return;
            }
        }
    }
};

lava.Villager.prototype.setOld = function() {
    this.new_ = false;
};

// Villager actions.
lava.Villagers = function(boardSprite) {
    this.villagers = [];
    this.boardSprite_ = boardSprite;
};

lava.Villagers.prototype.add = function(row, col) {
    var villager = new lava.Villager(row, col);
    this.villagers.push(villager);
    return villager;
};

lava.Villagers.prototype.kill = function() {
    for (var i = 0; i < this.villagers.length; i++) {
        var villager = this.villagers[i];
        var square = this.boardSprite_.getSquare(villager.row, villager.col);
        if (square != null && square.getType() == lava.kLava) {
            villager.kill();
        }
    }
};

lava.Villagers.prototype.dowse = function() {
    for (var i = 0; i < this.villagers.length; i++) {
        var villager = this.villagers[i];
        if (!villager.isAlive()) {
            continue;
        }
        villager.water(this.boardSprite_.board);
        villager.move(this.boardSprite_);
        villager.setOld();
    }
};
