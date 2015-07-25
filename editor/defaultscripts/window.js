'use strict';

class Window {
    constructor(x, y, width, height) {
        this.x_ = x;
        this.y_ = y;
        this.width_ = width;
        this.height_ = height;
    }

    update() {
    }

    draw(context) {
        context.save();
        context.fillStyle = 'rgba(51, 51, 51, 255)';
        context.fillRect(this.x_, this.y_, this.width_, this.height_);
        context.strokeStyle = 'rgba(255, 255, 255, 255)';
        context.strokeRect(this.x_ + 0.5, this.y_ + 0.5, this.width_ - 1, this.height_ - 1);
        context.restore();
    }
}
