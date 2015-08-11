'use strict';

class Actor {
    constructor(id) {
        this.id_ = id;
        this.name_ = this.data.name;
        this.image_ = this.data.image;
        this.hp_ = this.data.maxHP;
        this.mp_ = this.data.maxMP;
        this.maxHPOffset_ = 0;
        this.maxMPOffset_ = 0;
    }

    get data() {
        if (this.data_) {
            return this.data_;
        }
        for (let actor of $gameData.actors) {
            if (actor.id === this.id_) {
                return this.data_ = actor;
            }
        }
        return null;
    }

    get name() { return this.name_; }
    get image() { return Images.byId(this.image_); }
    get hp() { return this.hp_; }
    get mp() { return this.mp_; }
    get maxHP() { return this.data.maxHP + this.maxHPOffset_; }
    get maxMP() { return this.data.maxMP + this.maxMPOffset_; }
}

let $actors = {};

(function() {
    for (let actor of $gameData.actors) {
        $actors[actor.id] = new Actor(actor.id);
    }
})();
