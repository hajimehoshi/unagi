'use strict';

class MapScene {
    constructor() {
        let actor = $gameState.party[0];
        let characterSetImage = Images.byId(actor.image);
        this.playerSprite_ = new CharacterSprite(characterSetImage);
        this.movingCounter_ = 0;
        this.movingDirectionX_ = 0;
        this.movingDirectionY_ = 0;
    }

    get maxMovingCounter() {
        return 15;
    }

    update() {
        this.playerSprite_.update();

        // test
        if ($gameState.playerPosition.x === 5 && $gameState.playerPosition.y === 5) {
            $sceneStack.push(new BattleScene());
            return;
        }

        if (this.movingCounter_) {
            this.movingCounter_--;
            if (this.movingCounter_) {
                return;
            }
            $gameState.moveBy(this.movingDirectionX_, this.movingDirectionY_);
        }
        this.movingDirectionX_ = 0;
        this.movingDirectionY_ = 0;
        if ($input.isPressed(KEY_LEFT)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = -1;
            this.movingDirectionY_ = 0;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_LEFT, this.maxMovingCounter);
            return;
        }
        if ($input.isPressed(KEY_UP)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 0;
            this.movingDirectionY_ = -1;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_UP, this.maxMovingCounter);
            return;
        }
        if ($input.isPressed(KEY_RIGHT)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 1;
            this.movingDirectionY_ = 0;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_RIGHT, this.maxMovingCounter);
            return;
        }
        if ($input.isPressed(KEY_DOWN)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 0;
            this.movingDirectionY_ = 1;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_DOWN, this.maxMovingCounter);
            return;
        }
        this.playerSprite_.stopMoving();
    }

    draw(screen) {
        this.playerSprite_.x = (320 - this.playerSprite_.width) / 2;
        this.playerSprite_.y = data.gridSize * 8 - this.playerSprite_.height;

        // TODO: Use initial position
        let map = $game.data.maps[0];
        let offsetX = this.playerSprite_.x + this.playerSprite_.width / 2 - data.gridSize / 2;
        let offsetY = this.playerSprite_.y + this.playerSprite_.height - data.gridSize;
        offsetX -= $gameState.playerPosition.x * data.gridSize;
        offsetY -= $gameState.playerPosition.y * data.gridSize;
        let nextOffsetX = offsetX - this.movingDirectionX_ * data.gridSize;
        let nextOffsetY = offsetY - this.movingDirectionY_ * data.gridSize;
        let rate = 1 - this.movingCounter_ / this.maxMovingCounter;
        if (offsetX !== nextOffsetX) {
            offsetX = ((1 - rate) * offsetX + rate * nextOffsetX)|0;
        }
        if (offsetY !== nextOffsetY) {
            offsetY = ((1 - rate) * offsetY + rate * nextOffsetY)|0;
        }
        let minI = Math.max($gameState.playerPosition.x - 11, 0);
        let maxI = Math.min($gameState.playerPosition.x + 11, map.xNum);
        let minJ = Math.max($gameState.playerPosition.y - 8, 0);
        let maxJ = Math.min($gameState.playerPosition.y + 8, map.yNum);
        let imageParts = [];
        for (let j = minJ; j <= maxJ; j++) {
            for (let i = minI; i <= maxI; i++) {
                let tile = map.tiles[i + map.xNum * j];
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

    }
}
