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

    get playerPosition() {
        return {
            mapId: this.playerPosition_.mapId,
            x:     this.playerPosition_.x,
            y:     this.playerPosition_.y,
        }
    }
}

class CharacterSprite {
    constructor(image) {
        this.image_ = image;
    }

    // TODO: Rename
    get patternWidth() {
        return this.image_.width / 4;
    }

    // TODO: Rename
    get patternHeight() {
        return this.image_.height / 2;
    }

    get x() {
        return (320 - this.width) / 2;
    }

    get y() {
        return data.gridSize * 8 - this.height;
    }

    get width() {
        return this.patternWidth / 3;
    }

    get height() {
        return this.patternHeight / 4;
    }

    update() {
    }

    draw(context) {
        context.save();
        let sx = 0 + this.width;
        let sy = 0 + 2 * this.height;
        context.drawImage(this.image_, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
        context.restore();
    }
}

class MapScene {
    constructor(gameState) {
        this.gameState_ = gameState;
        this.playerSprite = new CharacterSprite(characterSetImage);
    }

    update() {
        this.playerSprite.update();
    }

    draw(context) {
        context.save();
        let mapId = $game.mapIdAt(0);
        let map = $game.mapAt(mapId);
        let offsetX = this.playerSprite.x + this.playerSprite.width / 2 - data.gridSize / 2;
        let offsetY = this.playerSprite.y + this.playerSprite.height - data.gridSize;
        offsetX -= this.gameState_.playerPosition.x * data.gridSize;
        offsetY -= this.gameState_.playerPosition.y * data.gridSize;
        for (let j = 0; j < map.yNum; j++) {
            for (let i = 0; i < map.xNum; i++) {
                let tile = map.tileAt(i, j);
                let sx = (tile % 8) * data.gridSize;
                let sy = ((tile / 8)|0) * data.gridSize;
                let dx = i * data.gridSize + offsetX;
                let dy = j * data.gridSize + offsetY;
                context.drawImage(tileSetImage, sx, sy, data.gridSize, data.gridSize, dx, dy, data.gridSize, data.gridSize);
            }
        }
        util.drawBitmapTextAt(context, "ABC OPQ あいう\nIch heiße\n魑魅魍魎", 0, data.gridSize);
        this.playerSprite.draw(context);
        context.restore();
    }
}

let gameState = new GameState();
let currentScene = new MapScene(gameState);

(function() {
    let initialPosition = $game.playerInitialPosition;
    gameState.moveTo(initialPosition.mapId, initialPosition.x, initialPosition.y);
})()

function update(context) {
    if (!currentScene) {
        return;
    }

    currentScene.update();
    currentScene.draw(context);
}

Env.run(update);
