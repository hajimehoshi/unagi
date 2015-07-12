// Copyright 2015 Hajime Hoshi
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module editor {
    export class Store {
        private mainElement_: MainElement;
        private game_: data.Game;
        private currentMap_: Map;
        private selectedTiles_: SelectedTiles;
        private tilesCursorX_: number;
        private tilesCursorY_: number;
        private tilesOffsetX_: number;
        private tilesOffsetY_: number;
        private isPlayingGame_: boolean;

        public constructor(mapEditorMain: MainElement) {
            this.mainElement_ = mapEditorMain;
            this.tilesOffsetX_ = 16;
            this.tilesOffsetY_ = 16;
            this.mainElement_.updateTilesOffset(this.tilesOffsetX_, this.tilesOffsetY_);
            this.isPlayingGame_ = false;
        }

        public updateGame(game: data.Game): void {
            this.game_ = game;
            this.currentMap_ = new Map(this.game_.mapAt(0));
            this.mainElement_.updateMap(this.currentMap_);
        }

        public updateSelectedTiles(s: SelectedTiles): void {
            this.selectedTiles_ = s;
            this.mainElement_.updateSelectedTiles(s);
        }

        public updateTilesCursorPosition(x: number, y: number): void {
            this.tilesCursorX_ = x;
            this.tilesCursorY_ = y;
            this.mainElement_.updateTilesCursorPosition(x, y);
        }

        public drawTiles(): void {
            if (!this.currentMap_) {
                return;
            }
            if (!this.selectedTiles_) {
                return;
            }
            this.currentMap_.replaceTiles(this.selectedTiles_, this.tilesCursorX_, this.tilesCursorY_);
            this.mainElement_.render();
        }

        public moveTilesOffset(x: number, y: number, scale: number, canvasWidth: number, canvasHeight: number): void {
            const ratio = window.devicePixelRatio;
            const marginX = 128;
            const marginY = 128;

            this.tilesOffsetX_ += x;
            this.tilesOffsetY_ += y;
            let minX = -(this.currentMap_.xNum * MainElement.tileWidth * scale - canvasWidth / ratio) - marginX;
            let minY = -(this.currentMap_.yNum * MainElement.tileHeight * scale - canvasHeight / ratio) - marginY;
            let maxX = marginX;
            let maxY = marginY;
            this.tilesOffsetX_ = Math.min(Math.max(this.tilesOffsetX_, minX), maxX);
            this.tilesOffsetY_ = Math.min(Math.max(this.tilesOffsetY_, minY), maxY);
            this.mainElement_.updateTilesOffset(this.tilesOffsetX_, this.tilesOffsetY_);
        }

        public playGame(): void {
            this.isPlayingGame_ = true;
            this.mainElement_.playGame();
        }

        public stopGame(): void {
            this.isPlayingGame_ = false;
            this.mainElement_.stopGame();
        }
    }
}
