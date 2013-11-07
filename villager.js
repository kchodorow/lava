goog.provide('lava.Villager');
goog.provide('lava.Villagers');

goog.require('lime.Sprite');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.KeyframeAnimation');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.Spawn');

var kCounter = 0;

lava.Villager = function(row, col) {
    lime.Sprite.call(this);

    this.setFill(lava.spriteSheet.getFrame('villager0.png'));
    this.facing_ = lava.Villager.kRight;
    if (random(2) == 0) {
        // face left
        this.changeDirection();
    }

    this.row = row;
    this.col = col;
    this.alive_ = true;
    this.new_ = true;

    this.throwWater_ = null;
    this.move_ = null;

    if (goog.DEBUG) {
        var num = new lime.Label().setText(kCounter).setFontColor('#fff');
        this.appendChild(num);
        this.num_ = kCounter++;        
    }
};

goog.inherits(lava.Villager, lime.Sprite);

lava.Villager.kLeft = 0;
lava.Villager.kRight = 1;

lava.Villager.prototype.kill = function() {
    this.alive_ = false;
    var parent = this.getParent();
    if (parent != null) {
        parent.removeChild(this);
    }
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
        if (row == this.row && col == this.col) {
            continue;
        }
        var square = board.getSquare(row, col);

        // If this is unwalkable, try another direction
        if (square != null && 
            (square.getType() == lava.kLava || 
             square.getType() == lava.kRock)) {
            dir = (dir + 1) % 9;   
            continue;
        }

        // Otherwise, move
        if (this.throwWater_ != null) {
            this.move_ = goog.partial(this.moveAnimation, row, col, square);
        } else {
            this.moveAnimation(row, col, square);
        }

        return true;
    }
    // No where to walk
    this.alive_ = false;
    return false;
};

lava.Villager.prototype.moveAnimation = function(row, col, square) {
    if ((col < this.col && this.facing_ == lava.Villager.kRight) ||
        col > this.col && this.facing_ == lava.Villager.kLeft) {
        this.changeDirection();
    }

    this.row = row;
    this.col = col;
    if (this.domElement) {
        goog.style.setStyle(this.domElement, 'z-index', 2);    
    }

    var move = new lime.animation.MoveTo(
        col*lava.kLen+lava.kLen/2, row*lava.kLen+lava.kLen/2);
    this.runAction(move);

    var walk = new lime.animation.KeyframeAnimation();
    walk.setDelay(1/8);
    walk.addFrame(lava.spriteSheet.getFrame('villager1.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager_step.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager2.png'));
    walk.addFrame(lava.spriteSheet.getFrame('villager_step.png'));
    this.runAction(walk);    

    if (square == null) {
        var removeDude = function(){
            var villager = this.targets[0];
            villager.kill();
        };
        goog.events.listen(move, lime.animation.Event.STOP, removeDude);
    }
    goog.events.listen(move, lime.animation.Event.STOP, 
                       goog.partial(stopWalk, walk));
};

var stopWalk = function(action) {
    action.stop();
};

lava.Villager.prototype.changeDirection = function() {
    this.setScale(-1, 1);
    this.facing_ = (this.facing_ == lava.Villager.kLeft) ?
        lava.Villager.kRight : lava.Villager.kLeft;
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
            var square = board.getSquare(row, col);
            if (square == null) {
                continue;
            }
            if (square.getType() == lava.kLava) {
                // facing
                if ((col < this.col && this.facing_ == lava.Villager.kRight) ||
                    col > this.col && this.facing_ == lava.Villager.kLeft) {
                    this.changeDirection();
                }

                var sploosh = new lime.animation.KeyframeAnimation()
                    .setDelay(1/8).setLooping(false);
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager0.png'));
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager_throw1.png'));
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager_throw2.png'));
                sploosh.addFrame(
                    lava.spriteSheet.getFrame('villager0.png'));
                this.throwWater_ = sploosh;
                this.runAction(sploosh);
                goog.events.listen(sploosh, lime.animation.Event.STOP, 
                                   goog.partial(coolLava, square, this));
                return;
            }
        }
    }
};

var coolLava = function(square, villager) {
    var overlay = new lime.Sprite()
        .setFill(lava.spriteSheet.getFrame(lava.kLavaFill))
        .setPosition(lava.kLen/2, lava.kLen/2);
    square.appendChild(overlay);
    overlay.runAction(new lime.animation.FadeTo(0));

    var cloud = new lime.Sprite()
        .setFill(lava.spriteSheet.getFrame(lava.kCloudFill))
        .setPosition(lava.kLen/2, lava.kLen/2);
    square.appendChild(cloud);
    cloud.runAction(new lime.animation.Spawn(
                        new lime.animation.FadeTo(0),
                        new lime.animation.MoveBy(0, -lava.kLen)));

    square.setType(lava.kRock);

    // If villager needed to move, do that now
    if (villager.move_ != null) {
        villager.move_();
        villager.move_ = null;
        villager.throwWater_ = null;
    }

    if (lava.turnsRemaining == 0 || !square.getParent().hasMoves()) {
        lava.endGame();
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
    row = parseInt(row);
    col = parseInt(col);
    var villager = new lava.Villager(row, col);

    outer:
    for (var r = row-1; r <= row+1; r++) {
        for (var c = col-1; c <= col+1; c++) {
            if (this.boardSprite_.getSquare(r, c) == null) {
                villager.setPosition(
                    lava.kLen*c+lava.kLen/2, 
                    lava.kLen*r+lava.kLen/2);

                villager.runAction(
                    new lime.animation.MoveTo(
                        lava.kLen*col+lava.kLen/2,
                        lava.kLen*row+lava.kLen/2));
                // TODO: facing
                break outer;
            }
        }
    }

    this.villagers.push(villager);
    return villager;
};

lava.Villagers.prototype.kill = function() {
    for (var i = 0; i < this.villagers.length; i++) {
        var villager = this.villagers[i];
        var square = this.boardSprite_.getSquare(villager.row, villager.col);
        if (square != null && square.getType() == lava.kLava) {
            if (villager.alive_) {
                lava.Stats.villagersKilled++;
            }
            villager.kill();
        }
    }
};

lava.Villagers.prototype.douse = function() {
    for (var i = 0; i < this.villagers.length; i++) {
        var villager = this.villagers[i];
        if (!villager.isAlive()) {
            continue;
        }
        villager.water(this.boardSprite_);
        villager.move(this.boardSprite_);
        villager.setOld();
    }
};
