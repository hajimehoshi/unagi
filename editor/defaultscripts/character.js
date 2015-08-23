'use strict';

const CHARACTER_DIRECTION_UP    = 0;
const CHARACTER_DIRECTION_RIGHT = 1;
const CHARACTER_DIRECTION_DOWN  = 2;
const CHARACTER_DIRECTION_LEFT  = 3;

const CHARACTER_POSE_LEFT   = 0;
const CHARACTER_POSE_MIDDLE = 1;
const CHARACTER_POSE_RIGHT  = 2;

class Character {
    constructor(image, originalPose) {
        if (originalPose === void(0)) {
            originalPose = CHARACTER_POSE_MIDDLE;
        }

        this.image_ = image;
        this.originalPose_ = originalPose;
        this.x_ = 0;
        this.y_ = 0;
        this.direction_ = CHARACTER_DIRECTION_DOWN;
        this.pose_ = originalPose;
        this.movingCounter_ = 0;
        this.initMovingCounter_ = 0;
        this.nextPose_ = CHARACTER_POSE_LEFT;
        this.speed_ = 1;
    }

    getMaxMovingCounter() {
        return 15 / this.speed_;
    }

    get image() { return this.image_; }
    get x() { return this.x_; }
    get y() { return this.y_; }
    get pose() { return this.pose_; }
    get direction() { return this.direction_; }
    set direction(direction) { this.direction_ = direction; }

    forceMove(x, y) {
        this.stopMoving();
        this.x_ = x;
        this.y_ = y;
    }

    get isMoving() {
        return 0 < this.movingCounter_;
    }

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
        this.movingCounter_ = 0;
        this.pose_ = this.originalPose_;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    turn(direction) {
        this.direction_ = direction;
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
            switch (this.direction_) {
            case CHARACTER_DIRECTION_UP:
                this.y_--;
                break;
            case CHARACTER_DIRECTION_RIGHT:
                this.x_++;
                break;
            case CHARACTER_DIRECTION_DOWN:
                this.y_++;
                break;
            case CHARACTER_DIRECTION_LEFT:
                this.x_--;
                break;
            }
            return;
        }
    }
}
