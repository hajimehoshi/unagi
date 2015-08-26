namespace game {
    // TODO: Use enum
    export const KEY_ENTER = 13;
    export const KEY_LEFT  = 37;
    export const KEY_UP    = 38;
    export const KEY_RIGHT = 39;
    export const KEY_DOWN  = 40;

    export class Input {
        private keyPressed_: {[key: number]: boolean};
        private keyStates_: {[key: number]: number};

        constructor() {
            this.keyPressed_ = {};
            this.keyStates_ = {};
        }

        public update() {
            for (let key in this.keyPressed_) {
                if (this.keyPressed_[key]) {
                    if (!this.keyStates_[key]) {
                        this.keyStates_[key] = 0;
                    }
                    this.keyStates_[key]++;
                } else {
                    this.keyStates_[key] = 0;
                }
            }
        }

        public isPressed(key: number): boolean {
            return 0 < this.keyStates_[key];
        }

        public isTrigger(key: number): boolean {
            return this.keyStates_[key] === 1;
        }

        public onKeyDown(e: KeyboardEvent) {
            this.keyPressed_[e.keyCode] = true;
        }

        public onKeyUp(e: KeyboardEvent) {
            this.keyPressed_[e.keyCode] = false;
        }
    }

    export let $input = new Input();
    window.addEventListener('keydown', (e: KeyboardEvent) => {
        e.preventDefault();
        $input.onKeyDown(e);
    });
    window.addEventListener('keyup', (e: KeyboardEvent) => {
        e.preventDefault();
        $input.onKeyUp(e);
    });
}
