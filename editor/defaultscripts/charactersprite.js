'use strict';

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
        this.poseCounter_ = 0;
        this.initPoseCounter_ = 0;
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
        return this.image_.width / 3;
    }

    get height() {
        return this.image_.height / 4;
    }

    startMoving(direction, poseTime) {
        this.direction_ = direction;
        this.poseCounter_ = poseTime;
        this.initPoseCounter_ = poseTime;
    }

    stopMoving() {
        this.pose_ = CHARACTER_POSE_MIDDLE;
        this.nextPose_ = CHARACTER_POSE_LEFT;
    }

    update() {
        if (this.poseCounter_ === 0) {
            return;
        }
        this.poseCounter_--;
        if (this.poseCounter_ === ((this.initPoseCounter_ / 2)|0)) {
            this.pose_ = this.nextPose_;
            this.nextPose_ = (this.nextPose_ === CHARACTER_POSE_LEFT) ? CHARACTER_POSE_RIGHT : CHARACTER_POSE_LEFT;
            return;
        }
        if (this.poseCounter_ === 0) {
            this.pose_ = CHARACTER_POSE_MIDDLE;
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
