namespace game {
    export class TitleScene {
        private menuWindow_: SelectionWindow;

        constructor() {
            // TODO: Define terms at $gameData
            let items = [
                'New Game',
                'Continue',
            ];
            this.menuWindow_ = new SelectionWindow(items, 0, 0);
            this.menuWindow_.x = (320 - this.menuWindow_.width) / 2;
            this.menuWindow_.y = (240 - this.menuWindow_.height) - data.GRID_SIZE;
            this.menuWindow_.setEnabled(1, false);
            this.menuWindow_.open();
        }

        public dispose() {
            this.menuWindow_.dispose();
        }

        public update() {
            this.menuWindow_.update();
            if (this.menuWindow_.isAnimating) {
                return;
            }
            if (this.menuWindow_.isClosed) {
                let initialPosition = $gameData.playerInitialPosition;
                let map = <data.Map>$idToData[initialPosition.mapId];
                $sceneStack.push(new MapScene(map));
                $gameState.moveTo(initialPosition.x, initialPosition.y);
            }
            if ($input.isTrigger(Key.ENTER)) {
                if (this.menuWindow_.currentSelectionIndex === 1) {
                    return;
                }
                this.menuWindow_.close();
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
