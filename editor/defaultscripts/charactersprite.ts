namespace game {
    // TODO: Renmae this not to use 'I' prefix
    export interface ICharacter {
        image: graphics.Image;
        x: number;
        y: number;
        direction: CharacterDirection;
        pose: CharacterPose;
        isMoving: boolean;
        movingRate: number;
    }

    export class CharacterSprite {
        private character_: ICharacter;

        constructor(character: ICharacter) {
            this.character_ = character;
        }

        public get width(): number { return this.character_.image.width / 3; }
        public get height(): number { return this.character_.image.height / 4; }

        private get movingDirectionX(): number {
            if (!this.character_.isMoving) {
                return 0;
            }
            if (this.character_.direction === CharacterDirection.LEFT) {
                return -1;
            }
            if (this.character_.direction === CharacterDirection.RIGHT) {
                return 1;
            }
            return 0;
        }

        private get movingDirectionY(): number {
            if (!this.character_.isMoving) {
                return 0;
            }
            if (this.character_.direction === CharacterDirection.UP) {
                return -1;
            }
            if (this.character_.direction === CharacterDirection.DOWN) {
                return 1;
            }
            return 0;
        }

        public get x(): number {
            let x = this.character_.x * data.gridSize - (this.width - data.gridSize) / 2;
            let nextX = x + this.movingDirectionX * data.gridSize;
            if (x !== nextX) {
                let rate = this.character_.movingRate;
                x = ((1 - rate) * x + rate * nextX)|0;
            }
            return x;
        }

        public get y(): number {
            let y = this.character_.y * data.gridSize - this.height + data.gridSize;
            let nextY = y + this.movingDirectionY * data.gridSize;
            if (y !== nextY) {
                let rate = this.character_.movingRate;
                y = ((1 - rate) * y + rate * nextY)|0;
            }
            return y;
        }

        public draw(screen: graphics.Image, options: {[key: string]: any}) {
            if (!options) {
                options = {};
            }
            let sx = this.character_.pose * this.width;
            let sy = this.character_.direction * this.height;
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
            options['imageParts'] = imageParts;
            screen.drawImage(this.character_.image, options);
        }
    }
}