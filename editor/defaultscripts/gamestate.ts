namespace game {
    export class GameState {
        private actors_: Actor[];
        private party_: string[];
        private playerCharacter_: Character;

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

        public get playerCharacter(): Character {
            return this.playerCharacter_;
        }

        public getPartyMember(index): Actor {
            return this.actors_[this.party_[index]];
        }

        public get partySize(): number {
            return this.party_.length;
        }

        public moveTo(x: number, y: number) {
            this.playerCharacter_.forceMove(x, y);
        }
    }
}
