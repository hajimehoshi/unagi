'use strict';

interface Scene {
    update();
    draw(screen: graphics.Image);
}

class SceneStack {
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

let $gameState = new GameState();
let $sceneStack = new SceneStack();

(() => {
    $sceneStack.push(new MapScene($gameData.maps[0]));
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
