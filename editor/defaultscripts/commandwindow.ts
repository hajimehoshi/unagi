namespace game {
    export class CommandWindow {
        private window_: Window;

        constructor(items: string[], x: number, y: number) {
            let width = 0;
            let height = 0;
            for (let item of items) {
                let size = $regularFont.calculateTextSize(item);
                width = Math.max(size.width, width);
                height += size.height;
            }
            width += Window.PADDING_X * 2;
            height += Window.PADDING_Y * 2;
            this.window_ = new Window(x, y, width, height);
            this.window_.content = items.join('\n');
        }

        public get x(): number { return this.window_.x; }
        public set x(x: number) { this.window_.x = x; }
        public get y(): number { return this.window_.y; }
        public set y(y: number) { this.window_.y = y; }
        public get width(): number { return this.window_.width; }
        public get height(): number { return this.window_.height; }

        public update() {
            this.window_.update();
            this.window_.setSelection(Window.PADDING_X / 2, Window.PADDING_Y, this.window_.width - Window.PADDING_X, 16);
        }

        public draw(screen: graphics.Image) {
            this.window_.draw(screen);
        }
    }
}
