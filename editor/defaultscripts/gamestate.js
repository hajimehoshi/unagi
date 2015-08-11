'use strict';

class GameState {
    constructor() {
        this.actors_ = [];
        for (let actor of $gameData.actors) {
            this.actors_[actor.id] = new Actor(actor.id);
        }

        this.party_ = [];
        for (let actorId of $gameData.system.initialParty) {
            this.party_.push(actorId);
        }
        this.playerPosition_ = null;
    }

    getPartyMember(index) {
        return this.actors_[this.party_[index]];
    }

    get partySize() {
        return this.party_.length;
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

let $gameState = new GameState();
