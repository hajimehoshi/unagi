'use strict';

// TODO: Tileset image should be registered in $game.
let tileSetImage = new Image();
tileSetImage.src = 'images/tileset.png';

let characterSetImage = new Image();
characterSetImage.src = 'images/characterset.png';

class GameState {
    constructor() {
        this.playerPosition_ = null;
    }

    moveTo(mapId, x, y) {
        this.playerPosition_ = {
            mapId: mapId,
            x:     x,
            y:     y,
        };
    }

    moveBy(dx, dy) {
        this.playerPosition_.x += dx;
        this.playerPosition_.y += dy;
    }

    get playerPosition() {
        return {
            mapId: this.playerPosition_.mapId,
            x:     this.playerPosition_.x,
            y:     this.playerPosition_.y,
        }
    }
}

let gameState = null;
let currentScene = null;

(function() {
    gameState = new GameState();
    currentScene = new MapScene(gameState);
    let initialPosition = $game.playerInitialPosition;
    gameState.moveTo(initialPosition.mapId, initialPosition.x, initialPosition.y);
})()

function update(context) {
    if (!currentScene) {
        return;
    }

    $input.update();
    currentScene.update();
    currentScene.draw(context);
}

Env.run(update);
