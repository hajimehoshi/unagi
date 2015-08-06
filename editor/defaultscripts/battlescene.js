'use strict'

class BattlePlayerWindow {
    constructor(index) {
        this.index_ = index;
        // TODO: Centering?
        //this.window_ = new Window(80 * this.index_, 176, 80, 64);
        this.window_ = new Window(80 * this.index_, 160, 80, 80);
    }

    update() {
        this.window_.update();
    }
    
    drawShadowTextAt(context, text, x, y) {
        BitmapFont.drawAt(context, text, x+1, y+1, 0, 0, 0);
        BitmapFont.drawAt(context, text, x, y, 255, 255, 255);
    }

    draw(context) {
        context.save();

        this.window_.draw(context);
        let actor = $game.actors[this.index_];
        this.drawShadowTextAt(context, actor.name, this.window_.x + 8, this.window_.y + 8 + 16, 255, 255, 255);
        this.drawShadowTextAt(context, "9999", this.window_.x + 8, this.window_.y + 8 + 32, 255, 255, 255);
        this.drawShadowTextAt(context, "999", this.window_.x + 8, this.window_.y + 8 + 48, 255, 255, 255);
        let actorImg = Images.byId($game, actor.image);
        let sx = 24;
        let sy = 64;
        let actorWidth = 24;
        let actorHeight = 32;
        let dx = this.window_.x + (this.window_.width - actorWidth) / 2;
        let dy = this.window_.y - actorHeight + 4 + 16;
        context.drawImage(actorImg, sx, sy, actorWidth, actorHeight, dx, dy, actorWidth, actorHeight);

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

        // TODO: Make a troop
        {
            let enemy = $game.enemies[0];
            let enemyImg = Images.byId($game, enemy.image);
            let dx = (320 - enemyImg.width) / 2;
            let dy = (160 - enemyImg.height) / 2;
            context.drawImage(enemyImg, dx, dy, enemyImg.width, enemyImg.height);
        }

        context.restore();
    }
}
