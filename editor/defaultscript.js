'use strict';

// TODO: Tileset image should be registered in $game.
var tileSetImage = new Image();
tileSetImage.src = 'images/tileset.png';

var characterSetImage = new Image();
characterSetImage.src = 'images/characterset.png';

class CharacterSprite {
    constructor(image) {
        this.image_ = image;
    }

    get patternWidth() {
        return this.image_.width / 4;
    }

    get patternHeight() {
        return this.image_.height / 2;
    }

    get x() {
        return (320 - this.width) / 2;
    }

    get y() {
        return 16 * 8 - this.height;
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
        var sx = 0 + this.width;
        var sy = 0 + 2 * this.height;
        context.drawImage(this.image_, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
        context.restore();
    }
}

class MapScene {
    constructor() {
        this.playerSprite = new CharacterSprite(characterSetImage);
    }

    update() {
        this.playerSprite.update();
    }

    draw(context) {
        context.save();
        let mapId = $game.mapIdAt(0);
        let map = $game.mapAt(mapId);
        for (let j = 0; j < 15; j++) {
            for (let i = 0; i < 20; i++) {
                let tile = map.tileAt(i, j);
                let sx = (tile % 8) * 16;
                let sy = ((tile / 8)|0) * 16;
                let dx = i * 16;
                let dy = j * 16;
                context.drawImage(tileSetImage, sx, sy, 16, 16, dx, dy, 16, 16);
            }
        }
        util.drawBitmapTextAt(context, "ABC OPQ あいう\nIch heiße\n魑魅魍魎", 0, 16);
        this.playerSprite.draw(context);
        context.restore();
    }
}

var currentScene = new MapScene();

function update(context) {
    if (!currentScene) {
        return;
    }

    currentScene.update();
    currentScene.draw(context);
}

Env.run(update);
