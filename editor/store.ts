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
        Images,
    }

    export declare type RenderInfo = {
        editingMode:     EditingMode;
        databaseMode:    DatabaseMode;
        mapId:           string;
        map:             Map; // TODO: Calc from mapId
        offsetX:         number;
        offsetY:         number;
        cursorPositionX: number;
        cursorPositionY: number;
        selectedTiles:   SelectedTiles;
        tileSetImage:    HTMLImageElement;
    }

    export class Store {
        private static instance_: Store;

        public static get instance(): Store {
            if (Store.instance_) {
                return Store.instance_;
            }
            return Store.instance_ = new Store();
        }

        private view_: View;
        private game_: data.Game;
        private idToMap_: {[id: string]: data.Map};
        private currentMapId_: string;
        private selectedTiles_: SelectedTiles;
        private tilesCursorX_: number;
        private tilesCursorY_: number;
        private tilesOffset_: {[id: string]: {x: number, y: number}};
        private editingMode_: EditingMode;
        private databaseMode_: DatabaseMode;
        private needToSave_: boolean;

        constructor() {
            if (Store.instance_) {
                throw 'Store instance already exists';
            }
        }

        public initialize(view: View): void {
            this.view_ = view;
            this.tilesOffset_ = {};
            this.editingMode_ = EditingMode.Map;
            this.databaseMode_ = DatabaseMode.Actors;

            let game: data.Game = null;
            // TODO: Clear localStorage when data.Game is fixed breaking compatibility.
            /*let str = localStorage.getItem('temporary');
            if (str) {
                game = JSON.parse(str);
                game.scripts = editor.initialGame.scripts;
            } else {
                game = editor.initialGame;
            }*/
            game = editor.initialGame;
            this.updateGame(game);
            this.needToSave_ = true;
            setInterval(() => {
                if (!this.needToSave_) {
                    return;
                }
                // TODO: Use MessagePack if needed.
                localStorage.setItem('temporary', JSON.stringify(this.game_));
                this.needToSave_ = false;
            }, 1000);
        }

        private get currentMap(): Map {
            let id = this.currentMapId_;
            if (!id) {
                return null;
            }
            // TODO: Map is not a good name because this conflicts with a standard Map.
            return new Map(this.idToMap_[id]);
        }

        private render(): void {
            let offset = this.tilesOffset_[this.currentMapId_];
            let offsetX = offset ? offset.x : void(0);
            let offsetY = offset ? offset.y : void(0);
            this.view_.render(this.game_, {
                editingMode:     this.editingMode_,
                databaseMode:    this.databaseMode_,
                mapId:           this.currentMapId_,
                map:             this.currentMap,
                offsetX:         offsetX,
                offsetY:         offsetY,
                cursorPositionX: this.tilesCursorX_,
                cursorPositionY: this.tilesCursorY_,
                selectedTiles:   this.selectedTiles_,
                tileSetImage:    null,
            });
            this.needToSave_ = true;
        }

        private updateGame(game: data.Game): void {
            this.game_ = game;
            this.idToMap_ = {}; // TODO: Use standard Map.
            for (let map of this.game_.maps) {
                this.idToMap_[map.id] = map;
            }
            // TODO: What if no map exists?
            if (!this.currentMapId_) {
                this.currentMapId_ = this.game_.maps[0].id;
            }
            for (let map of this.game_.maps) {
                this.tilesOffset_[map.id] = {x: -16, y: -16};
            }
            this.render();
        }

        public updateCurrentMap(id: string): void {
            this.currentMapId_ = id;
            this.render();
        }

        public updateSelectedTiles(s: SelectedTiles): void {
            this.selectedTiles_ = s;
            this.render();
        }

        public updateTilesCursorPosition(x: number, y: number): void {
            this.tilesCursorX_ = x;
            this.tilesCursorY_ = y;
            this.render();
        }

        public drawTiles(): void {
            if (!this.currentMapId_) {
                return;
            }
            if (!this.selectedTiles_) {
                return;
            }
            if (this.editingMode_ !== EditingMode.Map) {
                return;
            }
            this.currentMap.replaceTiles(this.selectedTiles_, this.tilesCursorX_, this.tilesCursorY_);
            this.render();
        }

        public moveTilesOffset(x: number, y: number, scale: number, canvasWidth: number, canvasHeight: number): void {
            const marginX = 128;
            const marginY = 128;

            let offset = this.tilesOffset_[this.currentMapId_];
            offset.x += x;
            offset.y += y;

            let map = this.currentMap;
            let minX = -marginX;
            let minY = -marginY;
            let maxX = Math.max(map.xNum * data.GRID_SIZE * scale - canvasWidth + marginX, marginX / 2);
            let maxY = Math.max(map.yNum * data.GRID_SIZE * scale - canvasHeight + marginY, marginY / 2);
            offset.x = Math.min(Math.max(offset.x, minX), maxX);
            offset.y = Math.min(Math.max(offset.y, minY), maxY);

            this.render();
        }

        public playGame(): void {
            this.view_.playGame(this.game_);
        }

        public stopGame(): void {
            this.view_.stopGame();
        }

        public updateEditingMode(editingMode: EditingMode): void {
            this.editingMode_ = editingMode;
            this.render();
        }

        public updateDatabaseMode(databaseMode: DatabaseMode): void {
            this.databaseMode_ = databaseMode;
            this.render();
        }

        public updateCurrentDataItem(): void {
            this.render();
        }

        private getFromPath(path: string): any {
            let current = this.game_;
            let keys = path.split('.');
            let updated = false;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let m = key.match(/^(.+?)\[(\d?)\]$/);
                let index = -1;
                if (m) {
                    key = m[1];
                    index = parseInt(m[2], 10);
                }
                if (0 <= index) {
                    current = current[key][index];
                } else {
                    current = current[key];
                }
            }
            return current;
        }

        public updateGameData(path: string, value: any): void {
            let current = this.game_;
            let keys = path.split('.');
            let updated = false;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let m = key.match(/^(.+?)\[(\d?)\]$/);
                let index = -1;
                if (m) {
                    key = m[1];
                    index = parseInt(m[2], 10);
                }
                if (i < keys.length - 1) {
                    if (0 <= index) {
                        current = current[key][index];
                    } else {
                        current = current[key];
                    }
                    continue
                }
                if (0 <= index) {
                    if (current[key][index] !== value) {
                        current[key][index] = value;
                        updated = true;
                    }
                } else {
                    if (current[key] !== value) {
                        current[key] = value;
                        updated = true;
                    }
                }
            }
            if (updated) {
                this.render();
            }
        }

        public addGameData(path: string): void {
            (<any[]>this.getFromPath(path)).push({
                id:   data.UUID.generate(),
                name: '',
            });
            this.render();
        }

        public createEventIfNeeded(): void {
            let x = this.tilesCursorX_;
            let y = this.tilesCursorY_;
            this.currentMap.createEventIfNeeded(x, y);
            this.render();
        }
    }
}
