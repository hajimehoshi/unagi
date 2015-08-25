'use strict';

const KEY_ENTER = 13;
const KEY_LEFT  = 37;
const KEY_UP    = 38;
const KEY_RIGHT = 39;
const KEY_DOWN  = 40;

class Input {
    constructor() {
        this.keyPressed_ = new Map();
        this.keyStates_ = new Map();
    }

    update() {
        for (let key in this.keyPressed_) {
            if (this.keyPressed_[key]) {
                if (!this.keyStates_[key])
                    this.keyStates_[key] = 0;
                this.keyStates_[key]++;
            } else {
                this.keyStates_[key] = 0;
            }
        }
    }

    isPressed(key) {
        return 0 < this.keyStates_[key];
    }

    isTrigger(key) {
        return this.keyStates_[key] === 1;
    }

    onKeyDown(e) {
        this.keyPressed_[e.keyCode] = true;
    }

    onKeyUp(e) {
        this.keyPressed_[e.keyCode] = false;
    }
}

let $input = new Input();
window.addEventListener('keydown', function(e) {
    e.preventDefault();
    $input.onKeyDown(e);
});
window.addEventListener('keyup', function(e) {
    e.preventDefault();
    $input.onKeyUp(e);
});
