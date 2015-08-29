namespace game {
    export class MessageWindow {
        private window_: Window;
        private content_: string;

        constructor(content: string) {
            this.window_ = new Window(0, 160, 320, 80);
            this.content_ = content;
        }

        public open() {
            this.window_.open();
        }

        public close() {
            this.window_.close();
        }

        public get isAnimating(): boolean {
            return this.window_.isAnimating;
        }

        public update() {
            this.window_.update();
        }

        public draw(screen: graphics.Image) {
            this.window_.draw(screen);
            if (this.window_.isAnimating) {
                return;
            }
            BitmapFont.Regular.drawAt(screen, this.content_, this.window_.x + 8, this.window_.y + 8, {r: 255, g: 255, b: 255, a: 255});
        }
    }
}
