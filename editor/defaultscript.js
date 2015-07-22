'use strict';

const KEY_LEFT  = 37;
const KEY_UP    = 38;
const KEY_RIGHT = 39;
const KEY_DOWN  = 40;

class Input {
    constructor() {
        this.keyPressed_ = new Map();
        this.keyStates_ = new Map();
    }

    update() {
        for (let key in this.keyPressed_) {
            if (this.keyPressed_[key]) {
                if (!this.keyStates_[key])
                    this.keyStates_[key] = 0;
                this.keyStates_[key]++;
            } else {
                this.keyStates_[key] = 0;
            }
        }
    }

    isPressed(key) {
        return 0 < this.keyStates_[key];
    }

    isTrigger(key) {
        return this.keyStates_[key] === 1;
    }

    onKeyDown(e) {
        this.keyPressed_[e.keyCode] = true;
    }

    onKeyUp(e) {
        this.keyPressed_[e.keyCode] = false;
    }
}

let $input = new Input();
window.addEventListener('keydown', function(e) { $input.onKeyDown(e); });
window.addEventListener('keyup', function(e) { $input.onKeyUp(e) });

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

    moveBy(dx, dy) {
        this.playerPosition_.x += dx;
        this.playerPosition_.y += dy;
    }

    get playerPosition() {
        return {
            mapId: this.playerPosition_.mapId,
            x:     this.playerPosition_.x,
            y:     this.playerPosition_.y,
        }
    }
}

const CHARACTER_DIRECTION_UP    = 0;
const CHARACTER_DIRECTION_RIGHT = 1;
const CHARACTER_DIRECTION_DOWN  = 2;
const CHARACTER_DIRECTION_LEFT  = 3;

const CHARACTER_POSE_LEFT   = 0;
const CHARACTER_POSE_MIDDLE = 1;
const CHARACTER_POSE_RIGHT  = 2;

class CharacterSprite {
    constructor(image) {
        this.image_ = image;
        this.x_ = 0;
        this.y_ = 0;
        this.direction_ = CHARACTER_DIRECTION_DOWN;
        this.pose_ = CHARACTER_POSE_MIDDLE;
        this.poseCounter1_ = 0;
        this.poseCounter2_ = 0;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    get x() {
        return this.x_;
    }

    set x(x) {
        this.x_ = x;
    }

    get y() {
        return this.y_;
    }

    set y(y) {
        this.y_ = y;
    }

    get width() {
        return this.image_.width / 4 / 3;
    }

    get height() {
        return this.image_.height / 2 / 4;
    }

    startMoving(direction, poseTime1, poseTime2) {
        this.direction_ = direction;
        this.poseCounter1_ = poseTime1;
        this.poseCounter2_ = poseTime2;
    }

    stopMoving() {
        this.pose_ = CHARACTER_POSE_MIDDLE;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    update() {
        if (this.poseCounter1_) {
            this.poseCounter1_--;
            if (this.poseCounter1_ === 0) {
                this.pose_ = this.nextPose_;
                this.nextPose_ = (this.nextPose_ === CHARACTER_POSE_LEFT) ? CHARACTER_POSE_RIGHT : CHARACTER_POSE_LEFT;
            }
            return;
        }
        if (this.poseCounter2_) {
            this.poseCounter2_--;
            if (this.poseCounter2_ === 0) {
                this.pose_ = CHARACTER_POSE_MIDDLE;
            }
        }
    }

    draw(context) {
        context.save();
        let sx = 0 + this.pose_ * this.width;
        let sy = 0 + this.direction_ * this.height;
        context.drawImage(this.image_, sx, sy, this.width, this.height, this.x, this.y, this.width, this.height);
        context.restore();
    }
}

class MapScene {
    constructor(gameState) {
        this.gameState_ = gameState;
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
        if (this.movingCounter_) {
            this.movingCounter_--;
            if (this.movingCounter_) {
                return;
            }
            this.gameState_.moveBy(this.movingDirectionX_, this.movingDirectionY_);
        }
        this.movingDirectionX_ = 0;
        this.movingDirectionY_ = 0;
        let time1 = (this.maxMovingCounter / 3)|0;
        let time2 = this.maxMovingCounter - time1;
        if ($input.isPressed(KEY_LEFT)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = -1;
            this.movingDirectionY_ = 0;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_LEFT, time1, time2);
            return;
        }
        if ($input.isPressed(KEY_UP)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 0;
            this.movingDirectionY_ = -1;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_UP, time1, time2);
            return;
        }
        if ($input.isPressed(KEY_RIGHT)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 1;
            this.movingDirectionY_ = 0;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_RIGHT, time1, time2);
            return;
        }
        if ($input.isPressed(KEY_DOWN)) {
            this.movingCounter_ = this.maxMovingCounter;
            this.movingDirectionX_ = 0;
            this.movingDirectionY_ = 1;
            this.playerSprite_.startMoving(CHARACTER_DIRECTION_DOWN, time1, time2);
            return;
        }
        this.playerSprite_.stopMoving();
    }

    draw(context) {
        this.playerSprite_.x = (320 - this.playerSprite_.width) / 2;
        this.playerSprite_.y = data.gridSize * 8 - this.playerSprite_.height;

        context.save();
        let mapId = $game.mapIdAt(0);
        let map = $game.mapAt(mapId);
        let offsetX = this.playerSprite_.x + this.playerSprite_.width / 2 - data.gridSize / 2;
        let offsetY = this.playerSprite_.y + this.playerSprite_.height - data.gridSize;
        offsetX -= this.gameState_.playerPosition.x * data.gridSize;
        offsetY -= this.gameState_.playerPosition.y * data.gridSize;
        let nextOffsetX = offsetX - this.movingDirectionX_ * data.gridSize;
        let nextOffsetY = offsetY - this.movingDirectionY_ * data.gridSize;
        let rate = 1 - this.movingCounter_ / this.maxMovingCounter;
        if (offsetX !== nextOffsetX) {
            offsetX = ((1 - rate) * offsetX + rate * nextOffsetX)|0;
        }
        if (offsetY !== nextOffsetY) {
            offsetY = ((1 - rate) * offsetY + rate * nextOffsetY)|0;
        }
        for (let j = 0; j < map.yNum; j++) {
            for (let i = 0; i < map.xNum; i++) {
                let tile = map.tiles[i + map.xNum * j];
                let sx = (tile % 8) * data.gridSize;
                let sy = ((tile / 8)|0) * data.gridSize;
                let dx = i * data.gridSize + offsetX;
                let dy = j * data.gridSize + offsetY;
                context.drawImage(tileSetImage, sx, sy, data.gridSize, data.gridSize, dx, dy, data.gridSize, data.gridSize);
            }
        }
        util.drawBitmapTextAt(context, map.id, 0, 0);
        this.playerSprite_.draw(context);
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

    $input.update();
    currentScene.update();
    currentScene.draw(context);
}

Env.run(update);
