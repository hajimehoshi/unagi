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
        private messageWindow_: MessageWindow;
        private isClosingStarted_: boolean;

        constructor(message: string) {
            this.isTerminated_ = false;
            this.messageWindow_ = new MessageWindow(message);
            this.isClosingStarted_ = false;
            this.messageWindow_.open();
        }

        public get isTerminated() { return this.isTerminated_; }

        public update() {
            this.messageWindow_.update();
            if (this.messageWindow_.isAnimating) {
                return;
            }
            if (this.isClosingStarted_) {
                this.isTerminated_ = true;
                return;
            }
            if ($input.isTrigger(KEY_ENTER)) {
                this.messageWindow_.close();
                this.isClosingStarted_ = true;
            }
        }

        public draw(screen: graphics.Image) {
            this.messageWindow_.draw(screen);
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
