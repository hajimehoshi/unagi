'use strict';

class EventCharacter {
    constructor(data) {
        this.data_ = data;
        let page = this.currentPage;
        let image = Images.byId(page.image);
        let character = new Character(image, page.imageX);
        character.forceMove(this.data_.x, this.data_.y);
        character.direction = page.imageY;
        this.character_ = character;
    }

    get image() { return this.character_.image; }
    get x() { return this.character_.x; }
    get y() { return this.character_.y; }
    get pose() { return this.character_.pose_; }
    get direction() { return this.character_.direction_; }
    get movingDirectionX() { return this.character_.movingDirectionX; }
    get movingDirectionY() { return this.character_.movingDirectionY; }

    start() {
        this.isProcessing_ = true;
        console.log('start!');
    }

    get isProcessing() {
        return this.isProcessing_;
    }

    get currentPage() {
        // TODO: Choice correct page
        return this.data_.pages[0];
    }

    update() {
        this.character_.update();
        this.isProcessing_ = false;
    }

    draw(screen, options) {
        this.character_.draw(screen, options);
    }
}
