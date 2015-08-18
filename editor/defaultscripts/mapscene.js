'use strict';

class MapScene {
    constructor(map) {
        let characterSetImage = $gameState.getPartyMember(0).image;
        this.map_ = map;
        this.playerSprite_ = new CharacterSprite(characterSetImage);

        this.eventSprites_ = map.events.map(function(e) {
            let page = e.pages[0];
            let image = Images.byId(page.image);
            let sprite = new CharacterSprite(image, page.imageX)
            sprite.direction = page.imageY;
            return sprite;
        });
    }

    update() {
        let wasMoving = this.playerSprite_.isMoving;
        let movingDirectionX = this.playerSprite_.movingDirectionX;
        let movingDirectionY = this.playerSprite_.movingDirectionY;
        this.playerSprite_.update();
        for (let eventSprite of this.eventSprites_) {
            eventSprite.update();
        }

        // test
        if ($gameState.playerPosition.x === 5 && $gameState.playerPosition.y === 5) {
            $sceneStack.push(new BattleScene());
            return;
        }

        if (wasMoving && !this.playerSprite_.isMoving) {
            $gameState.moveBy(movingDirectionX, movingDirectionY);
        }

        if (!this.playerSprite_.isMoving) {
            if ($input.isPressed(KEY_LEFT)) {
                this.playerSprite_.startMoving(CHARACTER_DIRECTION_LEFT);
                return;
            }
            if ($input.isPressed(KEY_UP)) {
                this.playerSprite_.startMoving(CHARACTER_DIRECTION_UP);
                return;
            }
            if ($input.isPressed(KEY_RIGHT)) {
                this.playerSprite_.startMoving(CHARACTER_DIRECTION_RIGHT);
                return;
            }
            if ($input.isPressed(KEY_DOWN)) {
                this.playerSprite_.startMoving(CHARACTER_DIRECTION_DOWN);
                return;
            }
            this.playerSprite_.stopMoving();
        }
    }

    draw(screen) {
        this.playerSprite_.x = (320 - this.playerSprite_.width) / 2;
        this.playerSprite_.y = data.gridSize * 8 - this.playerSprite_.height;

        // TODO: Use initial position
        let offsetX = this.playerSprite_.x + this.playerSprite_.width / 2 - data.gridSize / 2;
        let offsetY = this.playerSprite_.y + this.playerSprite_.height - data.gridSize;
        offsetX -= $gameState.playerPosition.x * data.gridSize;
        offsetY -= $gameState.playerPosition.y * data.gridSize;
        let nextOffsetX = offsetX - this.playerSprite_.movingDirectionX * data.gridSize;
        let nextOffsetY = offsetY - this.playerSprite_.movingDirectionY * data.gridSize;
        let rate = this.playerSprite_.movingRate;
        if (offsetX !== nextOffsetX) {
            offsetX = ((1 - rate) * offsetX + rate * nextOffsetX)|0;
        }
        if (offsetY !== nextOffsetY) {
            offsetY = ((1 - rate) * offsetY + rate * nextOffsetY)|0;
        }
        let minI = Math.max($gameState.playerPosition.x - 11, 0);
        let maxI = Math.min($gameState.playerPosition.x + 11, this.map_.xNum);
        let minJ = Math.max($gameState.playerPosition.y - 8, 0);
        let maxJ = Math.min($gameState.playerPosition.y + 8, this.map_.yNum);
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
