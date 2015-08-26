namespace game {
    export class MapScene {
        private map_: data.Map;
        private event_: EventCharacter;
        private playerSprite_: CharacterSprite;
        private eventCharacters_: EventCharacter[];
        private eventSprites_: CharacterSprite[];

        constructor(map: data.Map) {
            this.map_ = map;
            this.event_ = null;
            this.playerSprite_ = new CharacterSprite($gameState.playerCharacter);

            this.eventCharacters_ = this.map_.events.map((e) => {
                return new EventCharacter(e);
            });
            this.eventSprites_ = this.eventCharacters_.map((c) => {
                return new CharacterSprite(c);
            });
        }

        private passable(x: number, y: number): boolean {
            for (let e of this.eventCharacters_) {
                if (e.x !== x || e.y !== y) {
                    continue;
                }
                if (!e.currentPage.passable) {
                    return false;
                }
            }
            return true;
        }

        private eventAt(x: number, y: number): EventCharacter {
            return this.eventCharacters_.filter(function(e) {
                return e.x === x && e.y === y;
            })[0];
        }

        public update() {
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
                if (this.passable(x - 1, y)) {
                    $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_LEFT);
                    return;
                }
                $gameState.playerCharacter.turn(CHARACTER_DIRECTION_LEFT);
            }
            if ($input.isPressed(KEY_UP)) {
                if (this.passable(x, y - 1)) {
                    $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_UP);
                    return;
                }
                $gameState.playerCharacter.turn(CHARACTER_DIRECTION_UP);
            }
            if ($input.isPressed(KEY_RIGHT)) {
                if (this.passable(x + 1, y)) {
                    $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_RIGHT);
                    return;
                }
                $gameState.playerCharacter.turn(CHARACTER_DIRECTION_RIGHT);
            }
            if ($input.isPressed(KEY_DOWN)) {
                if (this.passable(x, y + 1)) {
                    $gameState.playerCharacter.startMoving(CHARACTER_DIRECTION_DOWN);
                    return;
                }
                $gameState.playerCharacter.turn(CHARACTER_DIRECTION_DOWN);
            }
            $gameState.playerCharacter.stopMoving();
            if ($input.isTrigger(KEY_ENTER)) {
                let event = this.eventAt(x, y);
                if (event) {
                    this.event_ = event;
                    return;
                }
                switch ($gameState.playerCharacter.direction) {
                case CHARACTER_DIRECTION_LEFT:
                    event = this.eventAt(x - 1, y);
                    if (event) {
                        this.event_ = event;
                    }
                    break;
                case CHARACTER_DIRECTION_UP:
                    event = this.eventAt(x, y - 1);
                    if (event) {
                        this.event_ = event;
                    }
                    break;
                case CHARACTER_DIRECTION_RIGHT:
                    event = this.eventAt(x + 1, y);
                    if (event) {
                        this.event_ = event;
                    }
                    break;
                case CHARACTER_DIRECTION_DOWN:
                    event = this.eventAt(x, y + 1);
                    if (event) {
                        this.event_ = event;
                    }
                    break;
                }
            }
        }

        public draw(screen: graphics.Image) {
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
            characterSprites.sort((a, b) => {
                if (a.y !== b.y) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            }).forEach((c) => {
                c.draw(screen, {geoM});
            });
        }
    }
}
