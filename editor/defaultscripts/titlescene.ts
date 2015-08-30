namespace game {
    export class TitleScene {
        private menuWindow_: SelectionWindow;

        constructor() {
            // TODO: Define terms at $gameData
            let items = [
                'New Game',
                'Continue',
                'Exit',
            ];
            this.menuWindow_ = new SelectionWindow(items, 0, 0);
            this.menuWindow_.x = (320 - this.menuWindow_.width) / 2;
            this.menuWindow_.y = (240 - this.menuWindow_.height) - data.GRID_SIZE;
        }

        public update() {
            this.menuWindow_.update();
            if ($input.isTrigger(Key.ENTER)) {
                let initialPosition = $gameData.playerInitialPosition;
                let map = <data.Map>$idToData[initialPosition.mapId];
                $sceneStack.push(new MapScene(map));
                $gameState.moveTo(initialPosition.x, initialPosition.y);
            }
        }

        public draw(screen: graphics.Image) {
            // TODO: Define and use data.System.titleBackgroundImage
            let bgImage = $images.byName('background_field');
            screen.drawImage(bgImage);
            this.menuWindow_.draw(screen);
        }
    }
}
