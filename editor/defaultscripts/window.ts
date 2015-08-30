namespace game {
    enum WindowState {
        NORMAL,
        OPENING,
        CLOSING,
    }

    export class Window {
        public static drawShadowTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            BitmapFont.Regular.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            BitmapFont.Regular.drawAt(screen, text, x, y, color);
        }

        public static drawShadowNumberTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            BitmapFont.Number.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            BitmapFont.Number.drawAt(screen, text, x, y, color);
        }

        private x_: number;
        private y_: number;
        private width_: number;
        private height_: number;
        private opaque_: number;
        private background_: graphics.Image;
        private counter_: number;
        private state_: WindowState;
        private content_: string;

        constructor(x, y, width, height) {
            this.x_ = x;
            this.y_ = y;
            this.width_ = width;
            this.height_ = height;
            this.opaque_ = 255;
            this.background_ = new graphics.Image(width - 2, height - 2);
            this.counter_ = 0;
            this.state_ = WindowState.NORMAL;
        }

        public get x(): number { return this.x_; }
        public get y(): number { return this.y_; }
        public get width(): number { return this.width_; }
        public get height(): number { return this.height_; }
        public get opaque(): number { return this.opaque_; }
        public set opaque(opaque: number) { this.opaque_ = opaque; }

        public get content(): string { return this.content_; }
        public set content(content: string) { this.content_ = content; }

        public open() {
            this.counter_ = this.maxCounter;
            this.state_ = WindowState.OPENING;
        }

        public close() {
            this.counter_ = this.maxCounter;
            this.state_ = WindowState.CLOSING;
        }

        public get isAnimating(): boolean {
            return this.state_ !== WindowState.NORMAL;
        }

        private get maxCounter(): number {
            return 10;
        }

        public update() {
            if (this.counter_ === 0) {
                return;
            }
            this.counter_--;
            if (this.counter_ === 0) {
                this.state_ = WindowState.NORMAL;
            }
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

            let rate = 1 - this.counter_ / this.maxCounter;
            switch (this.state_) {
            case WindowState.OPENING:
                geoM.translate(0, -this.height_ / 2);
                geoM.scale(1, rate);
                geoM.translate(0, this.height_ / 2);
                break;
            case WindowState.CLOSING:
                geoM.translate(0, -this.height_ / 2);
                geoM.scale(1, 1- rate);
                geoM.translate(0, this.height_ / 2);
                break;
            }

            geoM.translate(this.x_ + 1, this.y_ + 1);
            screen.drawImage(this.background_, {geoM});

            if (!this.content_) {
                return;
            }
            if (this.isAnimating) {
                return;
            }
            Window.drawShadowTextAt(screen, this.content_, this.x + 8, this.y + 8, {r: 255, g: 255, b: 255, a: 255});
        }
    }
}
