'use strict';

class GameState {
    constructor() {
        this.party_ = [];
        for (let actor of $game.data.system.initialParty) {
            this.party_.push(actor);
        }
        this.playerPosition_ = null;
    }

    get party() {
        return this.party_;
    }

    moveTo(mapId, x, y) {
        this.playerPosition_ = {
            mapId: mapId,
            x:     x,
            y:     y,
        };
    }

    moveBy(dx, dy) {
        this.playerPosition_.x += dx;
        this.playerPosition_.y += dy;
    }

    get playerPosition() {
        return {
            mapId: this.playerPosition_.mapId,
            x:     this.playerPosition_.x,
            y:     this.playerPosition_.y,
        }
    }
}

class Actor {
    constructor(data) {
        this.hp_ = data.maxHP;
        this.mp_ = data.maxMP;
    }
}
