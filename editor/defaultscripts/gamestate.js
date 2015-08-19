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
        this.playerCharacter_ = new Character(this.getPartyMember(0).image);
    }

    get playerCharacter() {
        return this.playerCharacter_;
    }

    getPartyMember(index) {
        return this.actors_[this.party_[index]];
    }

    get partySize() {
        return this.party_.length;
    }

    moveTo(mapId, x, y) {
        // TODO: Use mapId
        this.playerCharacter_.forceMove(x, y);
    }
}
