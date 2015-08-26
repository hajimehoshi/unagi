'use strict';

class Window {
    private x_: number;
    private y_: number;
    private width_: number;
    private height_: number;
    private opaque_: number;
    private background_: graphics.Image;

    constructor(x, y, width, height) {
        this.x_ = x;
        this.y_ = y;
        this.width_ = width;
        this.height_ = height;
        this.opaque_ = 255;
        this.background_ = new graphics.Image(width - 2, height - 2);
    }

    public get x(): number { return this.x_; }
    public get y(): number { return this.y_; }
    public get width(): number { return this.width_; }
    public get height(): number { return this.height_; }
    public get opaque(): number { return this.opaque_; }
    public set opaque(opaque: number) { this.opaque_ = opaque; }

    public update() {
    }

    public draw(screen: graphics.Image) {
        // TODO: Draw the frame
        /*context.save();
        context.fillStyle = `rgba(0, 64, 128, ${alpha})`;
        context.fillRect(this.x_, this.y_, this.width_, this.height_);
        context.strokeStyle = `rgba(128, 128, 128, 1)`;
        context.strokeRect(this.x_ + 0.5, this.y_ + 0.5, this.width_ - 1, this.height_ - 1);
        context.strokeStyle = `rgba(255, 255, 255, 1)`;
        context.strokeRect(this.x_ + 1.5, this.y_ + 1.5, this.width_ - 3, this.height_ - 3);
        context.restore();*/
        this.background_.fill({r: 0, g: 64, b: 128, a: this.opaque_});
        let geoM = new graphics.GeometryMatrix();
        geoM.translate(this.x_ + 1, this.y_ + 1);
        screen.drawImage(this.background_, {geoM});
    }
}
