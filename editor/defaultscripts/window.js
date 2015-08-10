'use strict';

class Window {
    constructor(x, y, width, height) {
        this.x_ = x;
        this.y_ = y;
        this.width_ = width;
        this.height_ = height;
        this.opaque_ = 255;
        this.image_ = new graphics.Image(width, height);
    }

    get x() { return this.x_; }
    get y() { return this.y_; }
    get width() { return this.width_; }
    get height() { return this.height_; }
    get opaque() { return this.opaque_; }
    set opaque(opaque) { this.opaque_ = opaque; }

    update() {
    }

    draw(screen) {
        // TODO: Draw the frame
        /*context.save();
        context.fillStyle = `rgba(0, 64, 128, ${alpha})`;
        context.fillRect(this.x_, this.y_, this.width_, this.height_);
        context.strokeStyle = `rgba(128, 128, 128, 1)`;
        context.strokeRect(this.x_ + 0.5, this.y_ + 0.5, this.width_ - 1, this.height_ - 1);
        context.strokeStyle = `rgba(255, 255, 255, 1)`;
        context.strokeRect(this.x_ + 1.5, this.y_ + 1.5, this.width_ - 3, this.height_ - 3);
        context.restore();*/
        this.image_.fill({r: 0, g: 64, b: 128, a: this.opaque_});
        let geoM = new graphics.GeometryMatrix();
        geoM.translate(this.x_, this.y_);
        screen.drawImage(this.image_, {geoM});
    }
}
