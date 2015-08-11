'use strict';

class SceneStack {
    constructor() {
        this.stack_ = [];
    }

    get current() {
        return this.stack_[this.stack_.length - 1];
    }

    push(scene) {
        this.stack_.push(scene);
    }

    pop() {
        return this.stack_.pop();
    }

    clear() {
        this.stack_.length = 0;
    }
}

let $sceneStack = new SceneStack();

(function() {
    $sceneStack.push(new MapScene());
    let initialPosition = $gameData.playerInitialPosition;
    $gameState.moveTo(initialPosition.mapId, initialPosition.x, initialPosition.y);
})()

function update(screen) {
    if (!$sceneStack.current) {
        return;
    }

    $input.update();
    $sceneStack.current.update();
    $sceneStack.current.draw(screen);
}

Env.run(update);
