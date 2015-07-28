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

namespace editor {
    export enum EditingMode {
        Map,
        Event,
        Database,
    }

    export enum DatabaseMode {
        Actors,
        Skills,
        States,
        Items,
        Enemies,
        Troops,
        System,
    }

    export class Store {
        private mainElement_: MainElement;
        private game_: data.Game;
        private idToMap_: {[id: string]: data.Map};
        private currentMapId_: string;
        private selectedTiles_: SelectedTiles;
        private tilesCursorX_: number;
        private tilesCursorY_: number;
        private tilesOffset_: {[id: string]: {x: number, y: number}};
        private editingMode_: EditingMode;

        public constructor(mapEditorMain: MainElement) {
            this.mainElement_ = mapEditorMain;
            this.updateEditingMode(EditingMode.Map);
            this.updateDatabaseMode(DatabaseMode.Actors);
            this.tilesOffset_ = {};
        }

        private get currentMap(): Map {
            let id = this.currentMapId_;
            // TODO: Map is not a good name because this conflicts with a standard Map.
            return new Map(this.idToMap_[id]);
        }

        public updateGame(game: data.Game): void {
            this.game_ = game;
            this.idToMap_ = {}; // TODO: Use standard Map.
            for (let map of this.game_.maps) {
                this.idToMap_[map.id] = map;
            }
            this.mainElement_.updateGame(this.game_);
            // TODO: What if no map exists?
            if (!this.currentMapId_) {
                this.currentMapId_ = this.game_.maps[0].id;
            }
            this.mainElement_.updateMap(this.currentMap);
            this.mainElement_.updateMapList(this.currentMapId_, this.game_.maps);

            for (let map of this.game_.maps) {
                this.tilesOffset_[map.id] = {x: -16, y: -16};
            }
            let offset = this.tilesOffset_[this.currentMapId_];
            this.mainElement_.updateTilesOffset(offset.x, offset.y);
        }

        public updateCurrentMap(id: string): void {
            this.currentMapId_ = id;
            this.mainElement_.updateMap(this.currentMap);
            this.mainElement_.updateMapList(this.currentMapId_, this.game_.maps);

            let offset = this.tilesOffset_[this.currentMapId_];
            this.mainElement_.updateTilesOffset(offset.x, offset.y);
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
            if (!this.currentMapId_) {
                return;
            }
            if (!this.selectedTiles_) {
                return;
            }
            if (this.editingMode_ != EditingMode.Map) {
                return;
            }
            this.currentMap.replaceTiles(this.selectedTiles_, this.tilesCursorX_, this.tilesCursorY_);
            this.mainElement_.updateMap(this.currentMap);
        }

        public moveTilesOffset(x: number, y: number, scale: number, canvasWidth: number, canvasHeight: number): void {
            const ratio = window.devicePixelRatio;
            const marginX = 128;
            const marginY = 128;

            let offset = this.tilesOffset_[this.currentMapId_];
            offset.x += x;
            offset.y += y;

            let map = this.currentMap;
            let minX = -marginX;
            let minY = -marginY;
            let maxX = Math.max(map.xNum * data.gridSize * scale - canvasWidth / ratio + marginX, marginX / 2);
            let maxY = Math.max(map.yNum * data.gridSize * scale - canvasHeight / ratio + marginY, marginY / 2);
            offset.x = Math.min(Math.max(offset.x, minX), maxX);
            offset.y = Math.min(Math.max(offset.y, minY), maxY);

            this.mainElement_.updateTilesOffset(offset.x, offset.y);
        }

        public playGame(): void {
            this.mainElement_.playGame(this.game_);
        }

        public stopGame(): void {
            this.mainElement_.stopGame();
        }

        public updateEditingMode(editingMode: EditingMode): void {
            this.editingMode_ = editingMode;
            this.mainElement_.updateEditingMode(editingMode);

            if (this.editingMode_ === EditingMode.Event && this.selectedTiles_) {
                this.selectedTiles_.shrink();
                this.updateSelectedTiles(this.selectedTiles_);
            }
        }

        public updateDatabaseMode(databaseMode: DatabaseMode): void {
            this.mainElement_.updateDatabaseMode(databaseMode);
        }
    }
}
