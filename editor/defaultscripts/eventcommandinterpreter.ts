namespace game {
    declare type EventCommand = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    export class EventCommandInterpreter {
        private commands_: EventCommand[];
        private currentCommand_: EventCommand;
        private message_: string;

        constructor() {
            this.commands_ = [];
            this.currentCommand_ = null;
            this.message_ = null;
        }

        public get isExecuting(): boolean {
            return !!this.currentCommand_;
        }

        public push(sender: EventCharacter, commands: data.EventCommand[]) {
            for (let command of commands) {
                this.commands_.push({
                    sender: sender,
                    data:   command,
                });
            }
        }

        public update() {
            if (!this.currentCommand_ && this.commands_.length === 0) {
                return;
            }
            if (!this.currentCommand_) {
                this.currentCommand_ = this.commands_.shift();
            }
            let command = this.currentCommand_;
            switch (command.data.type) {
            case 'showMessage':
                if (this.message_ === null) {
                    this.message_ = command.data.args['content'];
                }
                if ($input.isTrigger(KEY_ENTER)) {
                    this.message_ = null;
                    this.currentCommand_ = null;
                }
                break;
            }
        }

        public draw(screen: graphics.Image) {
            if (this.message_) {
                BitmapFont.Regular.drawAt(screen, this.message_, 0, 0, {r: 255, g: 255, b: 255, a: 255});
            }
        }
    }
}
