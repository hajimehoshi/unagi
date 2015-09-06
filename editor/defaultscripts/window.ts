namespace game {
    enum WindowState {
        NORMAL,
        OPENING,
        CLOSING,
        CLOSED,
    }

    export class WindowText {
        private text_: string;
        private x_: number;
        private y_: number;
        private color_: graphics.Color;

        constructor(text: string, x: number, y: number, color?: graphics.Color) {
            this.text_ = text;
            this.x_ = x;
            this.y_ = y;
            if (color !== void(0)) {
                this.color_ = color;
            } else {
                this.color_ = {r: 255, g: 255, b: 255, a: 255};
            }
        }

        public draw(screen: graphics.Image) {
            Window.drawShadowTextAt(screen, this.text_, this.x_, this.y_, this.color_);
        }
    }

    export class Window {
        private static windowImage_: graphics.Image;

        public static drawShadowTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            $regularFont.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 128});
            $regularFont.drawAt(screen, text, x, y, color);
        }

        public static drawShadowNumberTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            $numberFont.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 128});
            $numberFont.drawAt(screen, text, x, y, color);
        }

        private static get windowImage(): graphics.Image {
            if (Window.windowImage_) {
                return Window.windowImage_;
            }
            return Window.windowImage_ = $images.byId($gameData.system.windowImage);
        }

        private static toNineImageParts(
            srcX: number, srcY: number, srcWidth: number, srcHeight: number,
            dstX: number, dstY: number, dstWidth: number, dstHeight: number,
            paddingX: number, paddingY: number): graphics.ImagePart[] {
            let srcXs = [srcX, srcX + paddingX, srcX + srcWidth - paddingX];
            let srcYs = [srcY, srcY + paddingY, srcY + srcHeight - paddingY];
            let srcWidths = [paddingX, srcWidth - 2 * paddingX, paddingX];
            let srcHeights = [paddingY, srcHeight - 2 * paddingY, paddingY];
            let dstXs = [dstX, dstX + paddingX, dstX + dstWidth - paddingX];
            let dstYs = [dstY, dstY + paddingY, dstY + dstHeight - paddingY];
            let dstWidths = [paddingX, dstWidth - 2 * paddingX, paddingX];
            let dstHeights = [paddingY, dstHeight - 2 * paddingY, paddingY];

            let parts: graphics.ImagePart[] = [];
            for (let j = 0; j < 3; j++) {
                for (let i = 0; i < 3; i++) {
                    parts.push({
                        srcX:      srcXs[i],
                        srcY:      srcYs[j],
                        srcWidth:  srcWidths[i],
                        srcHeight: srcHeights[j],
                        dstX:      dstXs[i],
                        dstY:      dstYs[j],
                        dstWidth:  dstWidths[i],
                        dstHeight: dstHeights[j],
                    });
                }
            }
            return parts;
        }

        public static get PADDING_X() { return data.GRID_SIZE; }
        public static get PADDING_Y() { return data.GRID_SIZE / 2; }

        private x_: number;
        private y_: number;
        private width_: number;
        private height_: number;
        private opacity_: number;
        private selectionX_: number;
        private selectionY_: number;
        private selectionWidth_: number;
        private selectionHeight_: number;
        private timer_: number;
        private counter_: number;
        private state_: WindowState;
        private texts_: WindowText[];
        private contentOffscreen_: graphics.Image;

        constructor(x, y, width, height) {
            this.x_ = x;
            this.y_ = y;
            this.width_ = width;
            this.height_ = height;
            this.opacity_ = 255;
            this.selectionX_ = 0;
            this.selectionY_ = 0;
            this.selectionWidth_ = 0;
            this.selectionHeight_ = 0;
            this.timer_ = 0;
            this.counter_ = 0;
            this.state_ = WindowState.NORMAL;
            this.contentOffscreen_ = new graphics.Image(width - 2 * Window.PADDING_X, height - 2 * Window.PADDING_Y);
        }

        public get x(): number { return this.x_; }
        public set x(x: number) { this.x_ = x; }
        public get y(): number { return this.y_; }
        public set y(y: number) { this.y_ = y; }
        public get width(): number { return this.width_; }
        public get height(): number { return this.height_; }
        public get opacity(): number { return this.opacity_; }
        public set opacity(opacity: number) { this.opacity_ = opacity; }

        public setSelection(x: number, y: number, width: number, height: number) {
            this.selectionX_ = x;
            this.selectionY_ = y;
            this.selectionWidth_ = width;
            this.selectionHeight_ = height;
        }

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
            return 5;
        }

        public update() {
            this.timer_++;
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

        public draw(screen: graphics.Image, texts?: WindowText[]) {
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

            let colorM = new graphics.ColorMatrix();
            colorM.scale(1, 1, 1, this.opacity_ / 255);

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
            screen.drawImage(Window.windowImage, {geoM, colorM, imageParts});

            imageParts = Window.toNineImageParts(32, 0, 32, 32, 0, 0, this.width_, this.height_, 8, 8);
            screen.drawImage(Window.windowImage, {geoM, imageParts});

            if (this.selectionWidth_ && this.selectionHeight_) {
                let srcX = ((this.timer_ / 20)|0) % 2 === 0 ? 64 : 96;
                let imageParts = Window.toNineImageParts(srcX, 0, 32, 32, this.selectionX_, this.selectionY_, this.selectionWidth_, this.selectionHeight_, 8, 8);
                screen.drawImage(Window.windowImage, {geoM, imageParts});
            }

            if (!texts) {
                return;
            }
            if (this.isAnimating) {
                return;
            }
            this.contentOffscreen_.clear();
            for (let text of texts) {
                text.draw(this.contentOffscreen_);
            }
            geoM = new graphics.GeometryMatrix();
            geoM.translate(this.x_ + Window.PADDING_X, this.y_ + Window.PADDING_Y);
            screen.drawImage(this.contentOffscreen_, {geoM});
        }
    }
}
