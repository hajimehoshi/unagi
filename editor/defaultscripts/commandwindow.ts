namespace game {
    export class CommandWindow {
        private window_: Window;
        private commands_: string[];
        private currentCommand_: number = 0; // TODO: currentCommandIndex_?

        constructor(commands: string[], x: number, y: number) {
            let width = 0;
            let height = 0;
            for (let command of commands) {
                let size = $regularFont.calculateTextSize(command);
                width = Math.max(size.width, width);
                height += size.height;
            }
            width += Window.PADDING_X * 2;
            height += Window.PADDING_Y * 2;
            this.window_ = new Window(x, y, width, height);
            this.window_.content = commands.join('\n');

            this.commands_ = [];
            for (let command of commands) {
                this.commands_.push(command);
            }
        }

        public get x(): number { return this.window_.x; }
        public set x(x: number) { this.window_.x = x; }
        public get y(): number { return this.window_.y; }
        public set y(y: number) { this.window_.y = y; }
        public get width(): number { return this.window_.width; }
        public get height(): number { return this.window_.height; }

        public update() {
            this.window_.update();

            if ($input.isTrigger(Key.DOWN)) {
                this.currentCommand_ = Math.min(this.currentCommand_ + 1, this.commands_.length - 1);
            }
            if ($input.isTrigger(Key.UP)) {
                this.currentCommand_ = Math.max(this.currentCommand_ - 1, 0);
            }

            let x = Window.PADDING_X / 2;
            let y = Window.PADDING_Y + 16 * this.currentCommand_;
            this.window_.setSelection(x, y, this.window_.width - Window.PADDING_X, 16);
        }

        public draw(screen: graphics.Image) {
            this.window_.draw(screen);
        }
    }
}
