namespace game {
    export class Actor {
        private id_: string;
        private name_: string;
        private image_: string;
        private hp_: number;
        private mp_: number;
        private maxHPOffset_: number;
        private maxMPOffset_: number;

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

        public get name(): string { return this.name_; }
        public get image(): data.Image { return Images.byId(this.image_); }
        public get hp(): number { return this.hp_; }
        public get mp(): number { return this.mp_; }
        public get maxHP(): number {
            return $idToData[this.id_].maxHP + this.maxHPOffset_;
        }
        public get maxMP(): number {
            return $idToData[this.id_].maxMP + this.maxMPOffset_;
        }
    }
}
