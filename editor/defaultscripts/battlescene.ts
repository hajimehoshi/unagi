namespace game {
    export class BattlePlayerWindow {
        private actor_: Actor;
        private window_: Window;

        constructor(index) {
            this.actor_ = $gameState.getPartyMember(index);
            // TODO: Centering?
            this.window_ = new Window(80 * index, 160, 80, 80);
            this.window_.opaque = 128;
        }

        public update() {
            this.window_.update();
        }
        
        public drawShadowTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            BitmapFont.Regular.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            BitmapFont.Regular.drawAt(screen, text, x, y, color);
        }

        public drawShadowNumberTextAt(screen: graphics.Image, text: string, x: number, y: number, color: graphics.Color) {
            BitmapFont.Number.drawAt(screen, text, x+1, y+1, {r: 0, g: 0, b: 0, a: 255});
            BitmapFont.Number.drawAt(screen, text, x, y, color);
        }

        public draw(screen: graphics.Image) {
            this.window_.draw(screen);
            this.drawShadowTextAt(screen, this.actor_.name, this.window_.x + 8, this.window_.y + 32,
                                  {r: 255, g: 255, b: 192, a: 255});
            let x = this.window_.x + 8;
            let y = this.window_.y + 52;
            this.drawShadowNumberTextAt(screen, "HP", x, y, {r: 192, g: 192, b: 255, a: 255});
            this.drawShadowNumberTextAt(screen, "9999", x + 32, y, {r: 255, g: 255, b: 255, a: 255});
            y += 12;
            this.drawShadowNumberTextAt(screen, "MP", x, y, {r: 192, g: 192, b: 255, a: 255});
            this.drawShadowNumberTextAt(screen, " 999", x + 32, y, {r: 255, g: 255, b: 255, a: 255});
            let actorImg = this.actor_.image;
            let sx = 24;
            let sy = 64;
            let actorWidth = 24; // TODO: Need to define const in 'data'
            let actorHeight = 32;
            let dx = this.window_.x + (this.window_.width - actorWidth) / 2;
            let dy = this.window_.y - actorHeight + 32;
            let imageParts = [{
                srcX: sx,
                srcY: sy,
                srcWidth: actorWidth,
                srcHeight: actorHeight,
                dstX: dx,
                dstY: dy,
                dstWidth: actorWidth,
                dstHeight: actorHeight,
            }];
            screen.drawImage(actorImg, {imageParts})
        }
    }

    export class BattleScene {
        private playerWindows_: BattlePlayerWindow[];

        constructor() {
            this.playerWindows_ = [];
            for (let i = 0; i < $gameState.partySize; i++) {
                this.playerWindows_.push(new BattlePlayerWindow(i));
            }
        }

        public update() {
            for (let window of this.playerWindows_) {
                window.update();
            }
        }

        public draw(screen: graphics.Image) {
            // TODO: Do not use name to specify an image. We should use ID in any cases.
            let bgImg = Images.byName('background_field');
            screen.drawImage(bgImg);

            // TODO: Make a troop
            {
                let enemy = $gameData.enemies[0];
                let enemyImg = Images.byId(enemy.image);
                let dx = (320 - enemyImg.width) / 2;
                let dy = (160 - enemyImg.height) / 2;
                let geoM = new graphics.GeometryMatrix();
                geoM.translate(dx, dy);
                screen.drawImage(enemyImg, {geoM});
            }

            for (let window of this.playerWindows_) {
                window.draw(screen);
            }
            //this.window_.draw(context);
            //util.drawBitmapTextAt(context, "敵が出現!", this.window_.x + 8, this.window_.y + 8);
        }
    }
}
