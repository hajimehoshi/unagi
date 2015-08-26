namespace game {
    export class EventCharacter {
        private data_: data.Event;
        private character_: Character;
        private isProcessing_: boolean;

        constructor(data: data.Event) {
            this.data_ = data;
            let page = this.currentPage;
            let image = Images.byId(page.image);
            let character = new Character(image, page.imageX);
            character.forceMove(this.data_.x, this.data_.y);
            character.direction = page.imageY;
            this.character_ = character;
            this.isProcessing_ = false;
        }

        public get image(): graphics.Image { return this.character_.image; }
        public get x(): number { return this.character_.x; }
        public get y(): number { return this.character_.y; }
        public get pose(): number { return this.character_.pose; }
        public get direction(): number { return this.character_.direction; }
        public get movingDirectionX(): number { return this.character_.movingDirectionX; }
        public get movingDirectionY(): number { return this.character_.movingDirectionY; }
        public get movingRate(): number { return this.character_.movingRate; }

        public start() {
            this.isProcessing_ = true;
            console.log('start!');
        }

        public get isProcessing(): boolean {
            return this.isProcessing_;
        }

        public get currentPage(): data.EventPage {
            // TODO: Choice correct page
            return this.data_.pages[0];
        }

        public update() {
            this.character_.update();
            this.isProcessing_ = false;
        }
    }
}
