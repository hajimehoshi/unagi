namespace game {
    export interface Scene {
        update();
        draw(screen: graphics.Image);
    }

    export class SceneStack {
        private stack_: Scene[];

        constructor() {
            this.stack_ = [];
        }

        public get current(): Scene {
            return this.stack_[this.stack_.length - 1];
        }

        public push(scene) {
            this.stack_.push(scene);
        }

        public pop() {
            return this.stack_.pop();
        }

        public clear() {
            this.stack_.length = 0;
        }
    }
}
