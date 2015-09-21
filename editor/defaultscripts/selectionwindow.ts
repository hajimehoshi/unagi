namespace game {
    declare type SelectionWindowItem = {
        name:      string,
        isEnabled: boolean,
    };

    export class SelectionWindow {
        private window_: Window;
        private options_: SelectionWindowItem[];
        private currentSelectionIndex_: number = 0;

        constructor(options: string[], x: number, y: number) {
            let width = 0;
            let height = 0;
            for (let option of options) {
                let size = $regularFont.calculateTextSize(option);
                width = Math.max(size.width, width);
                height += size.height;
            }
            width += Window.PADDING_X * 2;
            height += Window.PADDING_Y * 2;
            this.window_ = new Window(x, y, width, height);

            this.options_ = [];
            for (let option of options) {
                this.options_.push({
                    name:      option,
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
        public get currentSelectionIndex(): number { return this.currentSelectionIndex_; }

        public open() { this.window_.open(); }
        public close() { this.window_.close(); }
        public get isAnimating(): boolean { return this.window_.isAnimating; }
        public get isClosed(): boolean { return this.window_.isClosed; }

        public setEnabled(index: number, enabled: boolean) {
            this.options_[index].isEnabled = enabled;
        }

        public update() {
            this.window_.update();

            if ($input.isTrigger(Key.DOWN)) {
                this.currentSelectionIndex_ = Math.min(this.currentSelectionIndex_ + 1, this.options_.length - 1);
            }
            if ($input.isTrigger(Key.UP)) {
                this.currentSelectionIndex_ = Math.max(this.currentSelectionIndex_ - 1, 0);
            }

            let x = Window.PADDING_X / 2;
            let y = Window.PADDING_Y + 16 * this.currentSelectionIndex_;
            this.window_.setSelection(x, y, this.window_.width - Window.PADDING_X, 16);
        }

        public draw(screen: graphics.Image) {
            let texts: WindowText[] = [];
            for (let i = 0; i < this.options_.length; i++) {
                let option = this.options_[i];
                let text: WindowText = null;
                if (option.isEnabled) {
                    text = new WindowText(option.name, 0, i * 16);
                } else {
                    text = new WindowText(option.name, 0, i * 16, {r: 128, g: 128, b: 128, a: 255});
                }
                texts.push(text);
            }

            this.window_.draw(screen, texts);
        }
    }
}
