'use strict';

class MapScene {
    constructor(map) {
        let characterSetImage = $gameState.getPartyMember(0).image;
        this.map_ = map;
        this.playerSprite_ = new CharacterSprite(characterSetImage, $gameState.playerCharacter);

        this.eventSprites_ = map.events.map(function(e) {
            let page = e.pages[0];
            let image = Images.byId(page.image);
            let sprite = new CharacterSprite(image, page.imageX)
            sprite.direction = page.imageY;
            return sprite;
        }, null);
    }

    update() {
        $gameState.playerCharacter.update();
        /*for (let eventSprite of this.eventSprites_) {
            eventSprite.update();
        }*/

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
        this.playerSprite_.x = (320 - this.playerSprite_.width) / 2;
        this.playerSprite_.y = data.gridSize * 8 - this.playerSprite_.height;

        // TODO: Use initial position
        let offsetX = this.playerSprite_.x + this.playerSprite_.width / 2 - data.gridSize / 2;
        let offsetY = this.playerSprite_.y + this.playerSprite_.height - data.gridSize;
        offsetX -= $gameState.playerCharacter.x * data.gridSize;
        offsetY -= $gameState.playerCharacter.y * data.gridSize;
        let nextOffsetX = offsetX - $gameState.playerCharacter.movingDirectionX * data.gridSize;
        let nextOffsetY = offsetY - $gameState.playerCharacter.movingDirectionY * data.gridSize;
        let rate = $gameState.playerCharacter.movingRate;
        if (offsetX !== nextOffsetX) {
            offsetX = ((1 - rate) * offsetX + rate * nextOffsetX)|0;
        }
        if (offsetY !== nextOffsetY) {
            offsetY = ((1 - rate) * offsetY + rate * nextOffsetY)|0;
        }
        let minI = Math.max($gameState.playerCharacter.x - 11, 0);
        let maxI = Math.min($gameState.playerCharacter.x + 11, this.map_.xNum);
        let minJ = Math.max($gameState.playerCharacter.y - 8, 0);
        let maxJ = Math.min($gameState.playerCharacter.y + 8, this.map_.yNum);
        let imageParts = [];
        for (let j = minJ; j <= maxJ; j++) {
            for (let i = minI; i <= maxI; i++) {
                let tile = this.map_.tiles[i + this.map_.xNum * j];
                let sx = (tile % 8) * data.gridSize;
                let sy = ((tile / 8)|0) * data.gridSize;
                let dx = i * data.gridSize + offsetX;
                let dy = j * data.gridSize + offsetY;
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
        this.playerSprite_.draw(screen);

        /*for (let eventSprite of this.eventSprites_) {
            eventSprite.draw(screen);
        }*/
    }
}
