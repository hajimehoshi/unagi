namespace game {
    // TODO: Use enum
    export enum CharacterDirection {
        UP    = 0,
        RIGHT = 1,
        DOWN  = 2,
        LEFT  = 3,
    }

    // TODO: Use enum
    export const CHARACTER_POSE_LEFT   = 0;
    export const CHARACTER_POSE_MIDDLE = 1;
    export const CHARACTER_POSE_RIGHT  = 2;

    export class Character {
        private image_: graphics.Image;
        private originalPose_: number;
        private x_: number;
        private y_: number;
        private direction_: CharacterDirection;
        private pose_: number;
        private movingCounter_: number;
        private initMovingCounter_: number;
        private nextPose_: number;
        private speed_: number;

        constructor(image: graphics.Image, originalPose?: number) {
            if (originalPose === void(0)) {
                originalPose = CHARACTER_POSE_MIDDLE;
            }

            this.image_ = image;
            this.originalPose_ = originalPose;
            this.x_ = 0;
            this.y_ = 0;
            this.direction_ = CharacterDirection.DOWN;
            this.pose_ = originalPose;
            this.movingCounter_ = 0;
            this.initMovingCounter_ = 0;
            this.nextPose_ = CHARACTER_POSE_LEFT;
            this.speed_ = 1;
        }

        private getMaxMovingCounter(): number {
            return 15 / this.speed_;
        }

        public get image(): graphics.Image { return this.image_; }
        public get x(): number { return this.x_; }
        public get y(): number { return this.y_; }
        public get pose(): number { return this.pose_; }
        public get direction(): CharacterDirection { return this.direction_; }
        public set direction(direction: CharacterDirection) { this.direction_ = direction; }

        public forceMove(x: number, y: number) {
            this.stopMoving();
            this.x_ = x;
            this.y_ = y;
        }

        public get isMoving(): boolean {
            return 0 < this.movingCounter_;
        }

        public get movingDirectionX(): number {
            if (!this.isMoving) {
                return 0;
            }
            if (this.direction_ === CharacterDirection.LEFT) {
                return -1;
            }
            if (this.direction_ === CharacterDirection.RIGHT) {
                return 1;
            }
            return 0;
        }

        public get movingDirectionY(): number {
            if (!this.isMoving) {
                return 0;
            }
            if (this.direction_ === CharacterDirection.UP) {
                return -1;
            }
            if (this.direction_ === CharacterDirection.DOWN) {
                return 1;
            }
            return 0;
        }

        public get movingRate(): number {
            if (this.movingCounter_ === 0) {
                return 0;
            }
            return 1 - this.movingCounter_ / this.initMovingCounter_;
        }

        public startMoving(direction: CharacterDirection) {
            this.direction_ = direction;
            this.movingCounter_ = this.getMaxMovingCounter();
            this.initMovingCounter_ = this.getMaxMovingCounter();
        }

        public stopMoving() {
            this.movingCounter_ = 0;
            this.pose_ = this.originalPose_;
            this.nextPose_ = CHARACTER_POSE_LEFT;
        }

        public turn(direction: CharacterDirection) {
            this.direction_ = direction;
        }

        public update() {
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
                case CharacterDirection.UP:
                    this.y_--;
                    break;
                case CharacterDirection.RIGHT:
                    this.x_++;
                    break;
                case CharacterDirection.DOWN:
                    this.y_++;
                    break;
                case CharacterDirection.LEFT:
                    this.x_--;
                    break;
                }
                return;
            }
        }
    }
}
