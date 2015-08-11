'use strict';

class Actor {
    constructor(id) {
        this.id_ = id;
        let data = $idToData[id];
        this.name_ = data.name;
        this.image_ = data.image;
        this.hp_ = data.maxHP;
        this.mp_ = data.maxMP;
        this.maxHPOffset_ = 0;
        this.maxMPOffset_ = 0;
    }

    get name() { return this.name_; }
    get image() { return Images.byId(this.image_); }
    get hp() { return this.hp_; }
    get mp() { return this.mp_; }
    get maxHP() {
        return $idToData[this.id_].maxHP + this.maxHPOffset_;
    }
    get maxMP() {
        return $idToData[this.id_].maxMP + this.maxMPOffset_;
    }
}
