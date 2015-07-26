'use strict'

class BattlePlayerWindow {
    constructor(index) {
        this.index_ = index;
        // TODO: Centering?
        this.window_ = new Window(80 * this.index_, 160, 80, 80);
    }

    update() {
        this.window_.update();
    }

    draw(context) {
        context.save();
        this.window_.draw(context);
        util.drawBitmapTextAt(context, "名前名前あ", this.window_.x + 8, this.window_.y + 8);
        util.drawBitmapTextAt(context, "HP 100", this.window_.x + 8, this.window_.y + 8 + 16);
        util.drawBitmapTextAt(context, "MP 100", this.window_.x + 8, this.window_.y + 8 + 32);
        context.restore();
    }
}

class BattleScene {
    constructor() {
        this.playerWindows_ = [];
        for (let i = 0; i < $gameState.party.length; i++) {
            this.playerWindows_.push(new BattlePlayerWindow(i));
        }
    }

    update() {
        for (let window of this.playerWindows_) {
            window.update();
        }
    }

    draw(context) {
        context.save();

        // background
        context.fillStyle = 'rgba(192, 192, 192, 1)';
        context.fillRect(0, 0, 320, 240);

        for (let window of this.playerWindows_) {
            window.draw(context);
        }
        //this.window_.draw(context);
        //util.drawBitmapTextAt(context, "敵が出現!", this.window_.x + 8, this.window_.y + 8);

        context.restore();
    }
}
