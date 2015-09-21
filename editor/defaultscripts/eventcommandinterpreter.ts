namespace game {
    declare type EventCommand = {
        sender: EventCharacter,
        data:   data.EventCommand,
    }

    class WindowManager {
        private messageWindow_: MessageWindow = null;
        private selectionWindow_: SelectionWindow = null;
        private selectionIndex_: number = 0;
        private isMessageWindowWaiting_: boolean = false;

        private messageWindowWaiting_: () => void = null;
        private selectionWindowClosed_: (selectionIndex: number) => void = null;
        private messageWindowClosed_: () => void = null;

        public dispose() {
            if (this.messageWindow_) {
                this.messageWindow_.dispose();
                this.messageWindow_ = null;
            }
            if (this.selectionWindow_) {
                this.selectionWindow_.dispose();
                this.selectionWindow_ = null;
            }
        }

        public get isTerminated(): boolean {
            if (this.messageWindow_) {
                return false;
            }
            if (this.selectionWindow_) {
                return false;
            }
            return true;
        }

        private updateMessageWindow() {
            if (this.isMessageWindowWaiting_) {
                return;
            }
            if (!this.messageWindow_) {
                return;
            }
            this.messageWindow_.update();
            if (this.messageWindow_.isAnimating) {
                return;
            }
            if (this.messageWindow_.isClosed) {
                this.messageWindow_.dispose();
                this.messageWindow_ = null;
                if (this.messageWindowClosed_) {
                    this.messageWindowClosed_();
                }
                return;
            }
            if ($input.isTrigger(Key.ENTER)) {
                this.isMessageWindowWaiting_ = true;
                if (this.messageWindowWaiting_) {
                    this.messageWindowWaiting_();
                }
            }
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
                this.selectionWindow_.dispose();
                this.selectionWindow_ = null;
                if (this.selectionWindowClosed_) {
                    this.selectionWindowClosed_(this.selectionIndex_);
                }
                this.selectionIndex_ = 0;
                return;
            }
            if ($input.isTrigger(Key.ENTER)) {
                this.selectionIndex_ = this.selectionWindow_.currentSelectionIndex;
                this.selectionWindow_.close();
            }
        }

        public setMessageWindowContent(content: string, waiting: () => void) {
            this.isMessageWindowWaiting_ = false;
            this.messageWindowWaiting_ = waiting;
            if (!this.messageWindow_) {
                this.messageWindow_ = new MessageWindow(content);
                this.messageWindow_.open();
                return;
            }
            this.messageWindow_.content = content;
        }

        public setSelectionWindowOptions(options: string[], closed: (index: number) => void) {
            this.selectionWindowClosed_ = closed;
            if (this.selectionWindow_) {
                throw 'this.selectionWindow_ should be null';
            }
            this.selectionWindow_ = new SelectionWindow(options, 0, 80);
            this.selectionWindow_.open();
        }

        public closeMessageWindowIfNeeded(closed: () => void) {
            this.messageWindowClosed_ = closed;
            this.isMessageWindowWaiting_ = false;
            if (this.messageWindow_) {
                this.messageWindow_.close();
            }
        }

        public get isWaitingForNextCommand(): boolean {
            if (this.messageWindow_ && !this.isMessageWindowWaiting_) {
                return false;
            }
            if (this.selectionWindow_) {
                return false;
            }
            return true;
        }

        public update() {
            this.updateMessageWindow();
            this.updateSelectionWindow();
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
        private commands_: EventCommand[] = [];
        private index_: number = -1;
        private nextIndex_: number = 0;
        private windowManager_: WindowManager = new WindowManager();

        constructor(sender: EventCharacter, commands: data.EventCommand[]) {
            // TODO: Compile to asm-like language?
            for (let command of commands) {
                this.commands_.push({
                    sender: sender,
                    data:   command,
                });
            }
        }

        public dispose() {
            this.windowManager_.dispose();
        }

        public get isTerminated(): boolean {
            if (!this.windowManager_.isTerminated) {
                return false;
            }
            return this.commands_.length <= this.index_;
        }

        public update() {
            this.windowManager_.update();
            if (!this.windowManager_.isWaitingForNextCommand) {
                return;
            }
            let command: EventCommand = null;
            while (this.index_ !== this.nextIndex_) {
                this.index_ = this.nextIndex_;
                if (this.isTerminated) {
                    break;
                }
                command = this.commands_[this.index_];
                switch (command.data.type) {
                case 'showMessageWindow': {
                    let content = command.data.args['content'];
                    this.windowManager_.setMessageWindowContent(content, () => {
                        this.nextIndex_ = this.index_ + 1;
                    });
                    break;
                }
                case 'showSelectionWindow': {
                    let options = command.data.args['options'];
                    this.windowManager_.setSelectionWindowOptions(options, (selectionIndex: number) => {
                        let nextIndent = command.data.indent + 1;
                        for (let commandIndex = this.index_ + 1;
                             commandIndex < this.commands_.length;
                             commandIndex++) {
                            let nextCommand = this.commands_[commandIndex]
                            if (nextCommand.data.indent !== nextIndent) {
                                continue;
                            }
                            if (nextCommand.data.type !== 'case') {
                                continue;
                            }
                            if (nextCommand.data.args['content'] !== selectionIndex) {
                                continue;
                            }
                            this.nextIndex_ = commandIndex;
                            return;
                        }
                        throw `case ${selectionIndex} must exist for showSelectionWindow but not`;
                    });
                    break;
                }
                case 'case':
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
                case 'goto':
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
                    console.log(`not implemented command: ${command.data.type}`);
                    this.nextIndex_ = this.index_ + 1;
                    break;
                case '_cleanUp':
                    this.windowManager_.closeMessageWindowIfNeeded(() => {
                        this.nextIndex_ = this.index_ + 1;
                    });
                    // TODO: What if the event turns another direction in event commands?
                    let originalDirection = command.data.args['originalDirection'];
                    command.sender.turn(originalDirection);
                    break;
                default:
                    throw `invalid event command type ${command.data.type}`;
                    break;
                }
            }
        }

        public draw(screen: graphics.Image) {
            this.windowManager_.draw(screen);
        }
    }
}
