namespace game {
    export enum CharacterDirection {
        UP    = 0,
        RIGHT = 1,
        DOWN  = 2,
        LEFT  = 3,
    }

    export enum CharacterPose {
        LEFT   = 0,
        MIDDLE = 1,
        RIGHT  = 2,
    }

    export class Character {
        private image_: graphics.Image;
        private originalPose_: CharacterPose;
        private x_: number;
        private y_: number;
        private direction_: CharacterDirection;
        private pose_: CharacterPose;
        private movingCounter_: number;
        private initMovingCounter_: number;
        private nextPose_: CharacterPose;
        private speed_: number;

        constructor(image: graphics.Image, originalPose?: number) {
            if (originalPose === void(0)) {
                originalPose = CharacterPose.MIDDLE;
            }

            this.image_ = image;
            this.originalPose_ = originalPose;
            this.x_ = 0;
            this.y_ = 0;
            this.direction_ = CharacterDirection.DOWN;
            this.pose_ = originalPose;
            this.movingCounter_ = 0;
            this.initMovingCounter_ = 0;
            this.nextPose_ = CharacterPose.LEFT;
            this.speed_ = 1;
        }

        private getMaxMovingCounter(): number {
            return 15 / this.speed_;
        }

        public get image(): graphics.Image { return this.image_; }
        public get x(): number { return this.x_; }
        public get y(): number { return this.y_; }
        public get pose(): CharacterPose { return this.pose_; }
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
            this.nextPose_ = CharacterPose.LEFT;
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
                this.nextPose_ = (this.nextPose_ === CharacterPose.LEFT) ? CharacterPose.RIGHT : CharacterPose.LEFT;
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
