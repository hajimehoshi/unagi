namespace game {
    export class TitleScene {
        constructor() {
        }

        public update() {
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
        }
    }
}
