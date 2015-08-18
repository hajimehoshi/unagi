'use strict';

const CHARACTER_DIRECTION_UP    = 0;
const CHARACTER_DIRECTION_RIGHT = 1;
const CHARACTER_DIRECTION_DOWN  = 2;
const CHARACTER_DIRECTION_LEFT  = 3;

const CHARACTER_POSE_LEFT   = 0;
const CHARACTER_POSE_MIDDLE = 1;
const CHARACTER_POSE_RIGHT  = 2;

class CharacterSprite {
    constructor(image, originalPose) {
        if (originalPose === void(0)) {
            originalPose = CHARACTER_POSE_MIDDLE;
        }

        this.image_ = image;
        this.x_ = 0;
        this.y_ = 0;
        this.direction_ = CHARACTER_DIRECTION_DOWN;
        this.originalPose_ = originalPose;
        this.pose_ = originalPose;
        this.movingCounter_ = 0;
        this.initMovingCounter_ = 0;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    getMaxMovingCounter(/*speed*/) {
        return 15;
    }

    get x() { return this.x_; }
    set x(x) { this.x_ = x; }
    get y() { return this.y_; }
    set y(y) { this.y_ = y; }

    get width() { return this.image_.width / 3; }
    get height() { return this.image_.height / 4; }

    get direction() { return this.direction_; }
    set direction(direction) { this.direction_ = direction; }

    get movingDirectionX() {
        if (!this.isMoving) {
            return 0;
        }
        if (this.direction_ === CHARACTER_DIRECTION_LEFT) {
            return -1;
        }
        if (this.direction_ === CHARACTER_DIRECTION_RIGHT) {
            return 1;
        }
        return 0;
    }

    get movingDirectionY() {
        if (!this.isMoving) {
            return 0;
        }
        if (this.direction_ === CHARACTER_DIRECTION_UP) {
            return -1;
        }
        if (this.direction_ === CHARACTER_DIRECTION_DOWN) {
            return 1;
        }
        return 0;
    }

    get isMoving() {
        return 0 < this.movingCounter_;
    }

    get movingRate() {
        if (this.movingCounter_ === 0) {
            return 0;
        }
        return 1 - this.movingCounter_ / this.initMovingCounter_;
    }

    startMoving(direction) {
        this.direction_ = direction;
        this.movingCounter_ = this.getMaxMovingCounter();
        this.initMovingCounter_ = this.getMaxMovingCounter();
    }

    stopMoving() {
        this.pose_ = this.originalPose_;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    update() {
        if (this.movingCounter_ === 0) {
            return;
        }
        this.movingCounter_--;
        if (this.movingCounter_ === ((this.initMovingCounter_ / 2)|0)) {
            this.pose_ = this.nextPose_;
            this.nextPose_ = (this.nextPose_ === CHARACTER_POSE_LEFT) ? CHARACTER_POSE_RIGHT : CHARACTER_POSE_LEFT;
            return;
        }
        if (this.movingCounter_ === 0) {
            this.pose_ = this.originalPose_;
            return;
        }
    }

    draw(screen) {
        let sx = 0 + this.pose_ * this.width;
        let sy = 0 + this.direction_ * this.height;
        let imageParts = [
            {
                srcX:      sx,
                srcY:      sy,
                srcWidth:  this.width,
                srcHeight: this.height,
                dstX:      this.x,
                dstY:      this.y,
                dstWidth:  this.width,
                dstHeight: this.height,
            }
        ];
        screen.drawImage(this.image_, {imageParts});
    }
}
