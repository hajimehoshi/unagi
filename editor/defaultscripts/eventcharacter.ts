namespace game {
    export class EventCharacter {
        private data_: data.Event;
        private character_: Character;

        constructor(data: data.Event) {
            this.data_ = data;
            let page = this.currentPage;
            let image = Images.byId(page.image);
            let character = new Character(image, page.imageX);
            character.forceMove(this.data_.x, this.data_.y);
            character.direction = page.imageY;
            this.character_ = character;
        }

        public get image(): graphics.Image { return this.character_.image; }
        public get x(): number { return this.character_.x; }
        public get y(): number { return this.character_.y; }
        public get pose(): CharacterPose { return this.character_.pose; }
        public get direction(): CharacterDirection { return this.character_.direction; }
        public get isMoving(): boolean { return this.character_.isMoving; }
        public get movingRate(): number { return this.character_.movingRate; }

        public get currentPage(): data.EventPage {
            // TODO: Choice correct page
            return this.data_.pages[0];
        }

        public get isPassable(): boolean {
            return this.currentPage.passable;
        }

        public update() {
            this.character_.update();
            // TODO: Updating the current page
        }
    }
}
