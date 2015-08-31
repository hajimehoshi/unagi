namespace game {
    enum WindowState {
        NORMAL,
        OPENING,
        CLOSING,
        CLOSED,
    }

    export class Window {
        private static windowImage_: graphics.Image;

        public static drawShadowTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            $regularFont.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            $regularFont.drawAt(screen, text, x, y, color);
        }

        public static drawShadowNumberTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            $numberFont.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            $numberFont.drawAt(screen, text, x, y, color);
        }

        private static get windowImage(): graphics.Image {
            if (Window.windowImage_) {
                return Window.windowImage_;
            }
            return Window.windowImage_ = $images.byId($gameData.system.windowImage);
        }

        public static get PADDING() { return data.GRID_SIZE / 2; }

        private x_: number;
        private y_: number;
        private width_: number;
        private height_: number;
        private opaque_: number;
        private counter_: number;
        private state_: WindowState;
        private content_: string;

        constructor(x, y, width, height) {
            this.x_ = x;
            this.y_ = y;
            this.width_ = width;
            this.height_ = height;
            this.opaque_ = 255;
            this.counter_ = 0;
            this.state_ = WindowState.NORMAL;
        }

        public get x(): number { return this.x_; }
        public set x(x: number) { this.x_ = x; }
        public get y(): number { return this.y_; }
        public set y(y: number) { this.y_ = y; }
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
            return this.state_ === WindowState.OPENING || this.state_ === WindowState.CLOSING;
        }

        public get isClosed(): boolean {
            return this.state_ === WindowState.CLOSED;
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
                if (this.state_ === WindowState.CLOSING) {
                    this.state_ = WindowState.CLOSED;
                    return;
                }
                this.state_ = WindowState.NORMAL;
            }
        }

        public draw(screen: graphics.Image) {
            if (this.isClosed) {
                return;
            }

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
            geoM.translate(this.x_, this.y_);

            let imageParts: graphics.ImagePart[] = [
                {
                    srcX: 0,
                    srcY: 0,
                    srcWidth: 32,
                    srcHeight: 32,
                    dstX: 0,
                    dstY: 0,
                    dstWidth: this.width_,
                    dstHeight: this.height_,
                },
            ];
            screen.drawImage(Window.windowImage, {geoM, imageParts});

            let frameOX = 32;
            let frameOY = 0;
            imageParts = [
                // upper left
                {
                    srcX: frameOX + 0,
                    srcY: frameOY + 0,
                    srcWidth: 8,
                    srcHeight: 8,
                    dstX: 0,
                    dstY: 0,
                    dstWidth: 8,
                    dstHeight: 8,
                },
                // upper
                {
                    srcX: frameOX + 8,
                    srcY: frameOY + 0,
                    srcWidth: 16,
                    srcHeight: 8,
                    dstX: 8,
                    dstY: 0,
                    dstWidth: this.width - 16,
                    dstHeight: 8,
                },
                // upper right
                {
                    srcX: frameOX + 24,
                    srcY: frameOY + 0,
                    srcWidth: 8,
                    srcHeight: 8,
                    dstX: this.width_ - 8,
                    dstY: 0,
                    dstWidth: 8,
                    dstHeight: 8,
                },
                // left
                {
                    srcX: frameOX + 0,
                    srcY: frameOY + 8,
                    srcWidth: 8,
                    srcHeight: 16,
                    dstX: 0,
                    dstY: 8,
                    dstWidth: 8,
                    dstHeight: this.height - 16,
                },
                // right
                {
                    srcX: frameOX + 24,
                    srcY: frameOY + 8,
                    srcWidth: 8,
                    srcHeight: 16,
                    dstX: this.width - 8,
                    dstY: 8,
                    dstWidth: 8,
                    dstHeight: this.height - 16,
                },
                // lower left
                {
                    srcX: frameOX + 0,
                    srcY: frameOY + 24,
                    srcWidth: 8,
                    srcHeight: 8,
                    dstX: 0,
                    dstY: this.height_ - 8,
                    dstWidth: 8,
                    dstHeight: 8,
                },
                // lower
                {
                    srcX: frameOX + 8,
                    srcY: frameOY + 24,
                    srcWidth: 16,
                    srcHeight: 8,
                    dstX: 8,
                    dstY: this.height - 8,
                    dstWidth: this.width - 16,
                    dstHeight: 8,
                },
                // lower right
                {
                    srcX: frameOX + 24,
                    srcY: frameOY + 24,
                    srcWidth: 8,
                    srcHeight: 8,
                    dstX: this.width_ - 8,
                    dstY: this.height_ - 8,
                    dstWidth: 8,
                    dstHeight: 8,
                },
                
            ];
            screen.drawImage(Window.windowImage, {geoM, imageParts});

            if (!this.content_) {
                return;
            }
            if (this.isAnimating) {
                return;
            }
            Window.drawShadowTextAt(screen, this.content_, this.x_ + Window.PADDING, this.y_ + Window.PADDING, {r: 255, g: 255, b: 255, a: 255});
        }
    }
}
