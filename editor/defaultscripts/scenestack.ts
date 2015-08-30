namespace game {
    export interface Scene {
        update();
        draw(screen: graphics.Image);
    }

    export class SceneStack {
        private stack_: Scene[];
        private previousScene_: Scene;
        private offscreen_: graphics.Image;
        private counter_: number;

        constructor() {
            this.stack_ = [];
            this.previousScene_ = null;
            this.offscreen_ = new graphics.Image(320, 240);
            this.counter_ = 0;
        }

        public get current(): Scene {
            return this.stack_[this.stack_.length - 1];
        }

        private get maxCounter() {
            return 15;
        }

        private startFading(previousScene: Scene) {
            this.previousScene_ = previousScene;
            this.counter_ = this.maxCounter;
        }

        public push(scene) {
            let previous = this.current;
            this.stack_.push(scene);
            this.startFading(previous);
        }

        public pop() {
            let previous = this.current;
            return this.stack_.pop();
            this.startFading(previous);
        }

        public clear() {
            this.stack_.length = 0;
        }

        public update() {
            if (0 < this.counter_) {
                this.counter_--;
                return;
            }
            this.current.update();
        }

        public draw(screen: graphics.Image) {
            let rate = 1 - this.counter_ / this.maxCounter;
            if (rate < 1) {
                if (this.previousScene_) {
                    this.previousScene_.draw(screen);
                }
                this.offscreen_.fill({r: 0, g: 0, b:0, a: 255});
                this.current.draw(this.offscreen_);
                let colorM = new graphics.ColorMatrix();
                colorM.scale(1, 1, 1, rate);
                screen.drawImage(this.offscreen_, {colorM});
            } else {
                this.current.draw(screen);
            }
        }
    }
}
