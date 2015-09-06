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
            return 30;
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
            this.offscreen_.fill({r: 0, g: 0, b:0, a: 255});

            let rate = 1 - this.counter_ / this.maxCounter;
            let opaque = 1;
            if (rate < 0.5) {
                // TODO: |previousScene_| is undefined only at the very beginning.
                // Can we make the counter half then?
                if (this.previousScene_) {
                    this.previousScene_.draw(this.offscreen_);
                }
                opaque = 1 - rate * 2;
            } else {
                this.current.draw(this.offscreen_);
                opaque = (rate - 0.5) * 2;
            }
            let colorM = new graphics.ColorMatrix();
            colorM.scale(1, 1, 1, opaque);
            screen.drawImage(this.offscreen_, {colorM});
        }
    }
}
