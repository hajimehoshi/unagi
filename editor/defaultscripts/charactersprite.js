'use strict';

class CharacterSprite {
    constructor(image, character) {
        this.image_ = image;
        this.character_ = character;
    }

    get x() { return this.x_; }
    set x(x) { this.x_ = x; }
    get y() { return this.y_; }
    set y(y) { this.y_ = y; }

    get width() { return this.image_.width / 3; }
    get height() { return this.image_.height / 4; }

    draw(screen) {
        console.log();
        let sx = 0 + this.character_.pose * this.width;
        let sy = 0 + this.character_.direction * this.height;
        let imageParts = [
            {
                srcX:      sx,
                srcY:      sy,
                srcWidth:  this.width,
                srcHeight: this.height,
                dstX:      this.x,
                dstY:      this.y,
                dstWidth:  this.width,
                dstHeight: this.height,
            }
        ];
        screen.drawImage(this.image_, {imageParts});
    }
}
