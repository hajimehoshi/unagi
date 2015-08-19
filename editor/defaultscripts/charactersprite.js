'use strict';

class CharacterSprite {
    constructor(character) {
        this.character_ = character;
    }

    get width() { return this.character_.image.width / 3; }
    get height() { return this.character_.image.height / 4; }

    draw(screen) {
        let x = this.character_.x * data.gridSize - (this.width - data.gridSize) / 2;
        let y = this.character_.y * data.gridSize - this.height + data.gridSize;
        let nextX = x + this.character_.movingDirectionX * data.gridSize;
        let nextY = y + this.character_.movingDirectionY * data.gridSize;
        let rate = this.character_.movingRate;
        if (x !== nextX) {
            x = ((1 - rate) * x + rate * nextX)|0;
        }
        if (y !== nextY) {
            y = ((1 - rate) * y + rate * nextY)|0;
        }

        let sx = this.character_.pose * this.width;
        let sy = this.character_.direction * this.height;
        let imageParts = [
            {
                srcX:      sx,
                srcY:      sy,
                srcWidth:  this.width,
                srcHeight: this.height,
                dstX:      x,
                dstY:      y,
                dstWidth:  this.width,
                dstHeight: this.height,
            }
        ];
        screen.drawImage(this.character_.image, {imageParts});
    }
}
