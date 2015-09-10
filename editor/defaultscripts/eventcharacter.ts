namespace game {
    export class EventCharacter {
        private data_: data.Event;
        private character_: Character;

        constructor(data: data.Event) {
            this.data_ = data;
            let page = this.currentPage;
            let image = $images.byId(page.image);
            let character = new Character(image, page.imageX);
            character.forceMove(this.data_.x, this.data_.y);
            character.direction = page.imageY;
            this.character_ = character;
        }

        public get image(): graphics.Image { return this.character_.image; }
        public get x(): number { return this.character_.x; }
        public get y(): number { return this.character_.y; }
        public get pose(): CharacterPose { return this.character_.pose; }
        public get direction(): CharacterDirection { return this.character_.direction; }
        public get isMoving(): boolean { return this.character_.isMoving; }
        public get movingRate(): number { return this.character_.movingRate; }

        public turn(direction: CharacterDirection) {
            this.character_.turn(direction);
        }

        public get currentPage(): data.EventPage {
            // TODO: Choice correct page
            return this.data_.pages[0];
        }

        public get isPassable(): boolean {
            return this.currentPage.passable;
        }

        public update() {
            this.character_.update();
            // TODO: Updating the current page
        }

        public get isCommandsStartable(): boolean {
            return $input.isTrigger(Key.ENTER);
        }

        public startCommands(): EventCommandInterpreter {
            let origDirection = this.character_.direction;

            // TODO: Whether the event turns or not depends on the trigger.
            let x = $gameState.playerCharacter.x;
            let y = $gameState.playerCharacter.y;
            if (this.x !== x || this.y !== y) {
                if (this.x + 1 === x && this.y === y) {
                    this.character_.turn(CharacterDirection.RIGHT);
                } else if (this.x - 1 === x && this.y === y) {
                    this.character_.turn(CharacterDirection.LEFT);
                } else if (this.x === x && this.y + 1 === y) {
                    this.character_.turn(CharacterDirection.DOWN);
                } else if (this.x === x && this.y - 1 === y) {
                    this.character_.turn(CharacterDirection.UP);
                }
            }

            let commands = this.currentPage.commands;
            commands = commands.concat({
                type: '_cleanUp',
                args: {
                    originalDirection: origDirection,
                },
            });
            return new EventCommandInterpreter(this, commands);
        }
    }
}
