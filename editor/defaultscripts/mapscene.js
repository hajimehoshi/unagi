'use strict';

class MapScene {
    constructor(map) {
        this.map_ = map;
        this.playerSprite_ = new CharacterSprite($gameState.playerCharacter);

        this.eventCharacters_ = map.events.map(function(e) {
            let page = e.pages[0];
            let image = Images.byId(page.image);
            let character = new Character(image, page.imageX);
            character.forceMove(e.x, e.y);
            character.direction = page.imageY;
            return character;
        });
        this.eventSprites_ = this.eventCharacters_.map(function(c) {
            return new CharacterSprite(c);
        });
    }

    update() {
        $gameState.playerCharacter.update();
        for (let eventCharacter of this.eventCharacters_) {
            eventCharacter.update();
        }

        // test
        if ($gameState.playerCharacter.x === 5 && $gameState.playerCharacter.y === 5) {
            $sceneStack.push(new BattleScene());
            return;
        }

        if (!$gameState.playerCharacter.isMoving) {
            if ($input.isPressed(KEY_LEFT)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_LEFT);
                return;
            }
            if ($input.isPressed(KEY_UP)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_UP);
                return;
            }
            if ($input.isPressed(KEY_RIGHT)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_RIGHT);
                return;
            }
            if ($input.isPressed(KEY_DOWN)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_DOWN);
                return;
            }
            $gameState.playerCharacter.stopMoving();
        }
    }

    draw(screen) {
        /*let minI = Math.max($gameState.playerCharacter.x - 11, 0);
        let maxI = Math.min($gameState.playerCharacter.x + 11, this.map_.xNum);
        let minJ = Math.max($gameState.playerCharacter.y - 8, 0);
        let maxJ = Math.min($gameState.playerCharacter.y + 8, this.map_.yNum);*/
        let minI = 0;
        let maxI = this.map_.xNum;
        let minJ = 0;
        let maxJ = this.map_.yNum;
        let imageParts = [];
        for (let j = minJ; j <= maxJ; j++) {
            for (let i = minI; i <= maxI; i++) {
                let tile = this.map_.tiles[i + this.map_.xNum * j];
                let sx = (tile % 8) * data.gridSize;
                let sy = ((tile / 8)|0) * data.gridSize;
                let dx = i * data.gridSize;
                let dy = j * data.gridSize;
                imageParts.push({
                    srcX:      sx,
                    srcY:      sy,
                    srcWidth:  data.gridSize,
                    srcHeight: data.gridSize,
                    dstX:      dx,
                    dstY:      dy,
                    dstWidth:  data.gridSize,
                    dstHeight: data.gridSize,
                });
            }
        }

        let tileSetImage = Images.byName('tileset');
        screen.drawImage(tileSetImage, {imageParts});

        let characterSprites = [this.playerSprite_].concat(this.eventSprites_);
        characterSprites.sort(function (a, b) {
            if (a.y !== b.y) {
                return a.y - b.y;
            }
            return a.x - b.x;
        }).forEach(function(c) {
            c.draw(screen);
        });
    }
}
