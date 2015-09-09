namespace game {
    declare type EventCommandData = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    class WindowManager {
        private messageWindow_: MessageWindow = null;
        private selectionWindow_: CommandWindow = null;
        private isMessageWindowSuspended_: boolean = false;

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
                return false;
            }
            if (!$input.isTrigger(Key.ENTER)) {
                return true;
            }
            return false;
        }

        private updateSelectionWindow() {
            if (!this.selectionWindow_) {
                return;
            }
            this.selectionWindow_.update();
            if (this.selectionWindow_.isAnimating) {
                return;
            }
            if (this.selectionWindow_.isClosed) {
                this.selectionWindow_ = null;
                return;
            }
            if (!$input.isTrigger(Key.ENTER)) {
                return;
            }
            this.selectionWindow_.close();
            // |this.selectionWindow_| must be finished when a new command starts.
            return;
        }

        public get isRunning(): boolean {
            // TODO: Redefine
            return !!this.messageWindow_;
        }

        public setMessageWindowContent(content: string) {
            if (!this.messageWindow_) {
                this.messageWindow_ = new MessageWindow(content);
                this.messageWindow_.open();
                return;
            }
            this.messageWindow_.content = content;
        }

        public setSelectionWindowOptions(options: string[]) {
            if (this.selectionWindow_) {
                throw 'this.selectionWindow_ should be null';
            }
            this.selectionWindow_ = new CommandWindow(options, 0, 80);
            this.selectionWindow_.open();
        }

        public closeMessageWindowIfNeeded() {
            if (this.messageWindow_) {
                this.messageWindow_.close();
            }
        }

        public update(): boolean {
            this.updateMessageWindow();
            this.updateSelectionWindow();
            // TODO: if |isMessageWindowActive| becomes true once, we should keep this until we go to the next command.
            let isMessageWindowActive = this.updateMessageWindow();
            this.updateSelectionWindow();
            return isMessageWindowActive || !!this.selectionWindow_;
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

    export class EventCommandInterpreter {
        private commands_: EventCommandData[];
        private windowManager_: WindowManager;

        constructor() {
            this.commands_ = [];
            this.windowManager_ = new WindowManager();
        }

        public get isRunning(): boolean {
            // TODO: Redefine
            return this.windowManager_.isRunning;
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
            if (this.windowManager_.update()) {
                return;
            }
            if (this.commands_.length === 0) {
                return;
            }
            // TODO: Use a command index
            let command = this.commands_.shift();
            switch (command.data.type) {
            case 'showMessage': // TODO: Rename to showMessageWindow?
                let content = command.data.args['content'];
                this.windowManager_.setMessageWindowContent(content);
                break;
            case 'showSelectionWindow':
                let options = command.data.args['options'];
                this.windowManager_.setSelectionWindowOptions(options);
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
                this.windowManager_.closeMessageWindowIfNeeded();
                // TODO: What if the event turns another direction in event commands?
                let originalDirection = command.data.args['originalDirection'];
                command.sender.turn(originalDirection);
                break;
            }
        }

        public draw(screen: graphics.Image) {
            this.windowManager_.draw(screen);
        }
    }
}
