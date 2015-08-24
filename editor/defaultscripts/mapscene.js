'use strict';

class MapScene {
    constructor(map) {
        this.map_ = map;
        this.event_ = null;
        this.playerSprite_ = new CharacterSprite($gameState.playerCharacter);

        this.eventCharacters_ = map.events.map(function(e) {
            // TODO: Choice correct page
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

    passable_(x, y) {
        for (let event of this.map_.events) {
            if (event.x !== x || event.y !== y) {
                continue;
            }
            // TODO: Choice correct page
            if (!event.pages[0].passable) {
                return false;
            }
        }
        return true;
    }

    eventAt_(x, y) {
        return this.map_.events.filter(function(e) {
            return e.x === x && e.y === y;
        })[0];
    }

    update() {
        $gameState.playerCharacter.update();
        for (let eventCharacter of this.eventCharacters_) {
            eventCharacter.update();
        }
        if (this.event_) {
            this.event_.update();
            if (!this.event_.isProcessing) {
                this.event_ = null;
            }
            return;
        }

        // test
        if ($gameState.playerCharacter.x === 5 && $gameState.playerCharacter.y === 5) {
            $sceneStack.push(new BattleScene());
            return;
        }

        if (this.event_ && this.event_.isProcessing) {
            return;
        }
        if ($gameState.playerCharacter.isMoving) {
            return;
        }

        let x = $gameState.playerCharacter.x;
        let y = $gameState.playerCharacter.y;
        if ($input.isPressed(KEY_LEFT)) {
            if (this.passable_(x - 1, y)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_LEFT);
                return;
            }
            $gameState.playerCharacter.turn(CHARACTER_DIRECTION_LEFT);
        }
        if ($input.isPressed(KEY_UP)) {
            if (this.passable_(x, y - 1)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_UP);
                return;
            }
            $gameState.playerCharacter.turn(CHARACTER_DIRECTION_UP);
        }
        if ($input.isPressed(KEY_RIGHT)) {
            if (this.passable_(x + 1, y)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_RIGHT);
                return;
            }
            $gameState.playerCharacter.turn(CHARACTER_DIRECTION_RIGHT);
        }
        if ($input.isPressed(KEY_DOWN)) {
            if (this.passable_(x, y + 1)) {
                $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_DOWN);
                return;
            }
            $gameState.playerCharacter.turn(CHARACTER_DIRECTION_DOWN);
        }
        $gameState.playerCharacter.stopMoving();
        if ($input.isTrigger(KEY_ENTER)) {
            let event = this.eventAt_(x, y);
            if (event) {
                this.event_ = new Event(event);
                return;
            }
            switch ($gameState.playerCharacter.direction) {
            case CHARACTER_DIRECTION_LEFT:
                event = this.eventAt_(x - 1, y);
                if (event) {
                    this.event_ = new Event(event);
                }
                break;
            case CHARACTER_DIRECTION_UP:
                event = this.eventAt_(x, y - 1);
                if (event) {
                    this.event_ = new Event(event);
                }
                break;
            case CHARACTER_DIRECTION_RIGHT:
                event = this.eventAt_(x + 1, y);
                if (event) {
                    this.event_ = new Event(event);
                }
                break;
            case CHARACTER_DIRECTION_DOWN:
                event = this.eventAt_(x, y + 1);
                if (event) {
                    this.event_ = new Event(event);
                }
                break;
            }
        }
    }

    draw(screen) {
        let cameraX = -this.playerSprite_.x + (320 - this.playerSprite_.width) / 2;
        let cameraY = -this.playerSprite_.y + 240 / 2 - this.playerSprite_.height;
        let geoM = new graphics.GeometryMatrix()
        geoM.translate(cameraX, cameraY);

        let cx = (-cameraX / data.gridSize)|0;
        let cy = (-cameraY / data.gridSize)|0;
        let minI = Math.max(cx - 1, 0);
        let maxI = Math.min(cx + 20, this.map_.xNum);
        let minJ = Math.max(cy - 1, 0);
        let maxJ = Math.min(cy + 15, this.map_.yNum);
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
        screen.drawImage(tileSetImage, {imageParts, geoM});

        let characterSprites = [this.playerSprite_].concat(this.eventSprites_);
        characterSprites.sort(function (a, b) {
            if (a.y !== b.y) {
                return a.y - b.y;
            }
            return a.x - b.x;
        }).forEach(function(c) {
            c.draw(screen, {geoM});
        });
    }
}
