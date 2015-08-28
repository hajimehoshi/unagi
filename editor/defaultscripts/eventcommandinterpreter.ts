namespace game {
    interface EventCommand {
        isTerminated: boolean;
        update();
        draw(screen: graphics.Image);
    }

    declare type EventCommandData = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    class ShowMessageEventCommand {
        private isTerminated_: boolean;
        private message_: string

        constructor(message: string) {
            this.isTerminated_ = false;
            this.message_ = message;
        }

        public get isTerminated() { return this.isTerminated_; }

        public update() {
            if ($input.isTrigger(KEY_ENTER)) {
                this.isTerminated_ = true;
            }
        }

        public draw(screen: graphics.Image) {
            BitmapFont.Regular.drawAt(screen, this.message_, 0, 0, {r: 255, g: 255, b: 255, a: 255});
        }
    }

    export class EventCommandInterpreter {
        private commands_: EventCommandData[];
        private currentCommand_: EventCommand;

        constructor() {
            this.commands_ = [];
            this.currentCommand_ = null;
        }

        public get isRunning(): boolean {
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
            if (this.currentCommand_) {
                this.currentCommand_.update();
                if (this.currentCommand_.isTerminated) {
                    this.currentCommand_ = null;
                }
                return;
            }
            let command = this.commands_.shift();
            switch (command.data.type) {
            case 'showMessage':
                this.currentCommand_ = new ShowMessageEventCommand(command.data.args['content']);
                break;
            }
        }

        public draw(screen: graphics.Image) {
            if (!this.currentCommand_) {
                return;
            }
            this.currentCommand_.draw(screen);
        }
    }
}
