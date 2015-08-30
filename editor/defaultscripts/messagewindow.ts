namespace game {
    export class MessageWindow {
        private window_: Window;
        private content_: string;

        constructor(content: string) {
            this.window_ = new Window(0, 0, 320, 80);
            this.window_.content = content;
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
        }
    }
}
