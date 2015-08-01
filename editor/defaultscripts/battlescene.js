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
    
    drawShadowTextAt(context, text, x, y) {
        BitmapText.drawAt(context, text, x+1, y+1, 0, 0, 0);
        BitmapText.drawAt(context, text, x, y, 255, 255, 255);
    }

    draw(context) {
        context.save();
        this.window_.draw(context);
        let actor = $game.actors[this.index_];
        this.drawShadowTextAt(context, actor.name, this.window_.x + 8, this.window_.y + 8, 255, 255, 255);
        this.drawShadowTextAt(context, "9999", this.window_.x + 8, this.window_.y + 8 + 16, 255, 255, 255);
        this.drawShadowTextAt(context, "999", this.window_.x + 8, this.window_.y + 8 + 32, 255, 255, 255);
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
        context.fillStyle = 'rgba(128, 128, 128, 1)';
        context.fillRect(0, 0, 320, 240);

        for (let window of this.playerWindows_) {
            window.draw(context);
        }
        //this.window_.draw(context);
        //util.drawBitmapTextAt(context, "敵が出現!", this.window_.x + 8, this.window_.y + 8);

        context.restore();
    }
}
