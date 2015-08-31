namespace game {
    declare type EventCommandData = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    export class EventCommandInterpreter {
        private commands_: EventCommandData[];
        private messageWindow_: MessageWindow;

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

        public update() {
            if (this.messageWindow_) {
                this.messageWindow_.update();
                if (this.messageWindow_.isAnimating) {
                    return;
                }
                if (this.messageWindow_.isClosed) {
                    this.messageWindow_ = null;
                    return;
                }
                if (!$input.isTrigger(Key.ENTER)) {
                    return;
                }
                if (this.commands_.length === 0) {
                    this.messageWindow_.close();
                    return;
                }
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
            case 'showSelectionsWindow':
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
            }
        }

        public draw(screen: graphics.Image) {
            if (this.messageWindow_) {
                this.messageWindow_.draw(screen);
            }
        }
    }
}
