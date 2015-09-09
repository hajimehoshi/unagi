namespace game {
    declare type CommandWindowItem = {
        name:      string,
        isEnabled: boolean,
    };

    export class CommandWindow {
        private window_: Window;
        private commands_: CommandWindowItem[];
        private currentCommandIndex_: number = 0;

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

            this.commands_ = [];
            for (let command of commands) {
                this.commands_.push({
                    name:      command,
                    isEnabled: true,
                });
            }
        }

        public dispose() {
            this.window_.dispose();
        }

        public get x(): number { return this.window_.x; }
        public set x(x: number) { this.window_.x = x; }
        public get y(): number { return this.window_.y; }
        public set y(y: number) { this.window_.y = y; }
        public get width(): number { return this.window_.width; }
        public get height(): number { return this.window_.height; }
        public get currentCommandIndex(): number { return this.currentCommandIndex_; }

        public open() { this.window_.open(); }
        public close() { this.window_.close(); }
        public get isAnimating(): boolean { return this.window_.isAnimating; }
        public get isClosed(): boolean { return this.window_.isClosed; }

        public setEnabled(index: number, enabled: boolean) {
            this.commands_[index].isEnabled = enabled;
        }

        public update() {
            this.window_.update();

            if ($input.isTrigger(Key.DOWN)) {
                this.currentCommandIndex_ = Math.min(this.currentCommandIndex_ + 1, this.commands_.length - 1);
            }
            if ($input.isTrigger(Key.UP)) {
                this.currentCommandIndex_ = Math.max(this.currentCommandIndex_ - 1, 0);
            }

            let x = Window.PADDING_X / 2;
            let y = Window.PADDING_Y + 16 * this.currentCommandIndex_;
            this.window_.setSelection(x, y, this.window_.width - Window.PADDING_X, 16);
        }

        public draw(screen: graphics.Image) {
            let texts: WindowText[] = [];
            for (let i = 0; i < this.commands_.length; i++) {
                let command = this.commands_[i];
                let text: WindowText = null;
                if (command.isEnabled) {
                    text = new WindowText(command.name, 0, i * 16);
                } else {
                    text = new WindowText(command.name, 0, i * 16, {r: 128, g: 128, b: 128, a: 255});
                }
                texts.push(text);
            }

            this.window_.draw(screen, texts);
        }
    }
}
