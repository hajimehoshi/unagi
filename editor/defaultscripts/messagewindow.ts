namespace game {
    export class MessageWindow {
        private window_: Window;
        private content_: string;

        constructor(content: string) {
            this.window_ = new Window(0, 0, 320, 80);
            this.content_ = content;
        }

        public set content(content: string) {
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

        public get isClosed(): boolean {
            return this.window_.isClosed;
        }

        public update() {
            this.window_.update();
        }

        public draw(screen: graphics.Image) {
            this.window_.draw(screen, [new WindowText(this.content_, 0, 0)]);
        }
    }
}
