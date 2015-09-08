namespace game {
    declare type EventCommandData = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    export class EventCommandInterpreter {
        private commands_: EventCommandData[];
        private messageWindow_: MessageWindow;
        private selectionWindow_: CommandWindow;

        constructor() {
            this.commands_ = [];
            this.messageWindow_ = null;
        }

        public get isRunning(): boolean {
            // TODO: Redefine
            return !!this.messageWindow_;
        }

        public push(sender: EventCharacter, commands: data.EventCommand[]) {
            for (let command of commands) {
                this.commands_.push({
                    sender: sender,
                    data:   command,
                });
            }
        }

        private updateMessageWindow(): boolean {
            if (!this.messageWindow_) {
                return false;
            }
            this.messageWindow_.update();
            if (this.messageWindow_.isAnimating) {
                return true;
            }
            if (this.messageWindow_.isClosed) {
                this.messageWindow_ = null;
                return true;
            }
            if (!$input.isTrigger(Key.ENTER)) {
                return true;
            }
            if (this.commands_.length === 0 ||
                (this.commands_[0].data.type !== 'showMessage' &&
                 this.commands_[0].data.type !== 'showSelectionWindow')) {
                this.messageWindow_.close();
                return true;
            }
            return false;
        }

        private updateSelectionWindow(): boolean {
            if (!this.selectionWindow_) {
                return false;
            }
            this.selectionWindow_.update();
            if (this.selectionWindow_.isAnimating) {
                return true;
            }
            if (this.selectionWindow_.isClosed) {
                this.selectionWindow_ = null;
                return true;
            }
            if (!$input.isTrigger(Key.ENTER)) {
                return true;
            }
            this.selectionWindow_.close();
            // |this.selectionWindow_| must be finished when a new command starts.
            return true;
        }

        public update() {
            // TODO: Rename variables?
            let isMessageWindowActive = this.updateMessageWindow();
            let isSelectionWindowActive = this.updateSelectionWindow();
            if (isMessageWindowActive || isSelectionWindowActive) {
                return;
            }
            if (this.commands_.length === 0) {
                return;
            }
            let command = this.commands_.shift();
            switch (command.data.type) {
            case 'showMessage': // TODO: Rename to showMessageWindow?
                let content = command.data.args['content'];
                if (!this.messageWindow_) {
                    this.messageWindow_ = new MessageWindow(content);
                    this.messageWindow_.open();
                    break;
                }
                this.messageWindow_.content = content;
                break;
            case 'showSelectionWindow':
                let options = command.data.args['options'];
                this.selectionWindow_ = new CommandWindow(options, 0, 80);
                this.selectionWindow_.open();
                break;
            case 'showNumberInputWindow':
            case 'showSelectingItemWindow':
            case 'showScrollingMessage':
            case 'modifySwitch':
            case 'modifyVariables':
            case 'modifySelfSwitch':
            case 'useTimer':
            case 'if':
            case 'loop':
            case 'break':
            case 'exit':
            case 'callCommonEvent':
            case 'jump':
            case 'label':
            case 'comment':
            case 'modifyMoney':
            case 'modifyItems':
            case 'modifyParty':
            case 'modifyActors':
            case 'movePlayer':
            case 'setVehiclePosition':
            case 'setEventPosition':
            case 'scrollMap': // move camera?
            case 'movePlayerOrEvent': //?
            case 'useVechicle':
            case 'modifyPlayer':
            case 'showAnimation':
            case 'showPopUp':
            case 'hideEventTemporarily':
            case 'modifyScreen':
            case 'sleep':
            case 'showPicture':
            case 'modifyPicture':
            case 'hidePicture':
            case 'showWeather':
            case 'startBattleScene':
            case 'startShopScene':
            case 'startNameInputScene':
            case 'startMenuScene':
            case 'startSaveScene':
            case 'startGameOverScene':
            case 'startTitleScene':
            case 'modifySystem':
            case 'modifyMap':
            case 'eval':
                console.log('not implemented');
                break;
            case '_cleanUp':
                // TODO: What if the event turns another direction in event commands?
                let originalDirection = command.data.args['originalDirection'];
                command.sender.turn(originalDirection);
                break;
            }
        }

        public draw(screen: graphics.Image) {
            if (this.messageWindow_) {
                this.messageWindow_.draw(screen);
            }
            if (this.selectionWindow_) {
                this.selectionWindow_.draw(screen);
            }
        }
    }
}
