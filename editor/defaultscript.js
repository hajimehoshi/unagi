'use strict';

// TODO: Tileset image should be registered in $game.
var tileSetImage = new Image();
tileSetImage.src = 'images/tileset.png';

class MapScene {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    update() {
        this.x++;
        this.y++;
    }

    draw(context) {
        let map = $game.mapAt(0);
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
