namespace game {
    export class MapScene {
        private map_: data.Map;
        private playerSprite_: CharacterSprite;
        private eventCharacters_: EventCharacter[];
        private eventSprites_: CharacterSprite[];
        private eventCommandInterpreter_: EventCommandInterpreter;

        constructor(map: data.Map) {
            this.map_ = map;
            this.playerSprite_ = new CharacterSprite($gameState.playerCharacter);
            this.eventCommandInterpreter_ = new EventCommandInterpreter();

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

        private tryMovePlayer(): boolean {
            let x = $gameState.playerCharacter.x;
            let y = $gameState.playerCharacter.y;
            if ($input.isPressed(Key.LEFT)) {
                if (this.passable(x - 1, y)) {
                    $gameState.playerCharacter.startMoving(CharacterDirection.LEFT);
                    return true;
                }
                $gameState.playerCharacter.turn(CharacterDirection.LEFT);
            }
            if ($input.isPressed(Key.UP)) {
                if (this.passable(x, y - 1)) {
                    $gameState.playerCharacter.startMoving(CharacterDirection.UP);
                    return true;
                }
                $gameState.playerCharacter.turn(CharacterDirection.UP);
            }
            if ($input.isPressed(Key.RIGHT)) {
                if (this.passable(x + 1, y)) {
                    $gameState.playerCharacter.startMoving(CharacterDirection.RIGHT);
                    return true;
                }
                $gameState.playerCharacter.turn(CharacterDirection.RIGHT);
            }
            if ($input.isPressed(Key.DOWN)) {
                if (this.passable(x, y + 1)) {
                    $gameState.playerCharacter.startMoving(CharacterDirection.DOWN);
                    return true;
                }
                $gameState.playerCharacter.turn(CharacterDirection.DOWN);
            }
            $gameState.playerCharacter.stopMoving();
            return false;
        }

        private get currentEvent(): EventCharacter {
            let x = $gameState.playerCharacter.x;
            let y = $gameState.playerCharacter.y;
            let event = this.eventAt(x, y);
            if (event) {
                return event;
            }
            switch ($gameState.playerCharacter.direction) {
            case CharacterDirection.LEFT:
                event = this.eventAt(x - 1, y);
                if (event && !event.isPassable) {
                    return event;
                }
                break;
            case CharacterDirection.UP:
                event = this.eventAt(x, y - 1);
                if (event && !event.isPassable) {
                    return event;
                }
                break;
            case CharacterDirection.RIGHT:
                event = this.eventAt(x + 1, y);
                if (event && !event.isPassable) {
                    return event;
                }
                break;
            case CharacterDirection.DOWN:
                event = this.eventAt(x, y + 1);
                if (event && !event.isPassable) {
                    return event;
                }
                break;
            }
            return null;
        }

        public update() {
            let isEventCommandRunning = this.eventCommandInterpreter_.isRunning;
            this.eventCommandInterpreter_.update();
            $gameState.playerCharacter.update();
            for (let eventCharacter of this.eventCharacters_) {
                eventCharacter.update();
            }
            if (isEventCommandRunning) {
                return;
            }

            // test
            if ($gameState.playerCharacter.x === 5 && $gameState.playerCharacter.y === 5) {
                $sceneStack.push(new BattleScene());
                return;
            }

            if ($gameState.playerCharacter.isMoving) {
                return;
            }
            if (this.tryMovePlayer()) {
                return;
            }
            let event = this.currentEvent;
            if (!event) {
                return;
            }
            event.tryStartCommands(this.eventCommandInterpreter_);
        }

        public draw(screen: graphics.Image) {
            let cameraX = -this.playerSprite_.x + (320 - this.playerSprite_.width) / 2;
            let cameraY = -this.playerSprite_.y + (240 - this.playerSprite_.height) / 2;
            let geoM = new graphics.GeometryMatrix()
            geoM.translate(cameraX, cameraY);

            let cx = (-cameraX / data.GRID_SIZE)|0;
            let cy = (-cameraY / data.GRID_SIZE)|0;
            let minI = Math.max(cx - 1, 0);
            let maxI = Math.min(cx + 20, this.map_.xNum);
            let minJ = Math.max(cy - 1, 0);
            let maxJ = Math.min(cy + 15, this.map_.yNum);
            let imageParts = [];
            for (let j = minJ; j <= maxJ; j++) {
                for (let i = minI; i <= maxI; i++) {
                    let tile = this.map_.tiles[i + this.map_.xNum * j];
                    let sx = (tile % 8) * data.GRID_SIZE;
                    let sy = ((tile / 8)|0) * data.GRID_SIZE;
                    let dx = i * data.GRID_SIZE;
                    let dy = j * data.GRID_SIZE;
                    imageParts.push({
                        srcX:      sx,
                        srcY:      sy,
                        srcWidth:  data.GRID_SIZE,
                        srcHeight: data.GRID_SIZE,
                        dstX:      dx,
                        dstY:      dy,
                        dstWidth:  data.GRID_SIZE,
                        dstHeight: data.GRID_SIZE,
                    });
                }
            }

            let tileSetImage = $images.byName('tileset');
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

            this.eventCommandInterpreter_.draw(screen);
        }
    }
}
