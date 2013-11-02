goog.provide('lava.Villager');
goog.provide('lava.Villagers');

lava.Villager = function(row, col) {
    lime.Sprite.call(this);

    this.setFill('#000').setSize(20, 20).setPosition(lava.kLen/2, lava.kLen/2);

    this.row = row;
    this.col = col;
    this.alive_ = true;
};

goog.inherits(lava.Villager, lime.Sprite);

lava.Villager.prototype.kill = function() {
    this.alive_ = false;
    this.setFill('#777');
};

lava.Villager.prototype.isAlive = function() {
    return this.alive_;
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

lava.Villagers.prototype.dowse = function(board) {
    for (var i = 0; i < this.villagers.length; i++) {
        villager = this.villagers[i];
        if (!villager.isAlive()) {
            continue;
        }

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