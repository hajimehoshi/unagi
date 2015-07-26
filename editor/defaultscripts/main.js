'use strict';

// TODO: Tileset image should be registered in $game.
let tileSetImage = new Image();
tileSetImage.src = 'images/tileset.png';

let characterSetImage = new Image();
characterSetImage.src = 'images/characterset.png';

let $gameState = new GameState();

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
    let initialPosition = $game.playerInitialPosition;
    $gameState.moveTo(initialPosition.mapId, initialPosition.x, initialPosition.y);
})()

function update(context) {
    if (!$sceneStack.current) {
        return;
    }

    $input.update();
    $sceneStack.current.update();
    $sceneStack.current.draw(context);
}

Env.run(update);
