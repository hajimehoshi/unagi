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

class Store {
    private mapEditorMain_: MapEditorMain;
    private selectedTiles_: SelectedTiles;
    private tilesCursorX_: number;
    private tilesCursorY_: number;
    private tilesOffsetX_: number;
    private tilesOffsetY_: number;
    private map_: Map;

    public constructor(mapEditorMain: MapEditorMain) {
        this.mapEditorMain_ = mapEditorMain;
        this.tilesOffsetX_ = 0;
        this.tilesOffsetY_ = 0;
    }

    public updateMap(map: Map): void {
        this.map_ = map;
        this.mapEditorMain_.updateMap(map);
    }

    public updateSelectedTiles(s: SelectedTiles): void {
        this.selectedTiles_ = s;
        this.mapEditorMain_.updateSelectedTiles(s);
    }

    public updateTilesCursorPosition(x: number, y: number): void {
        this.tilesCursorX_ = x;
        this.tilesCursorY_ = y;
        this.mapEditorMain_.updateTilesCursorPosition(x, y);
    }

    public drawTiles(): void {
        if (!this.map_) {
            return;
        }
        if (!this.selectedTiles_) {
            return;
        }
        this.map_.replaceTiles(this.selectedTiles_, this.tilesCursorX_, this.tilesCursorY_);
        this.mapEditorMain_.render();
    }

    public moveTilesOffset(x: number, y: number): void {
        this.tilesOffsetX_ += x;
        this.tilesOffsetY_ += y;
        this.mapEditorMain_.updateTilesOffset(this.tilesOffsetX_, this.tilesOffsetY_);
    }
}

class Dispatcher {
    private static store_: Store;

    public static set store(store: Store) {
        Dispatcher.store_ = store;
    }

    public static onMapChanged(map: Map): void {
        Dispatcher.store_.updateMap(map);
    }

    public static onSelectedTilesChanged(s: SelectedTiles): void {
        Dispatcher.store_.updateSelectedTiles(s);
    }

    public static onTilesCursorPositionChanged(x: number, y: number): void {
        Dispatcher.store_.updateTilesCursorPosition(x, y);
    }

    public static onDrawingTiles(): void {
        Dispatcher.store_.drawTiles();
    }

    public static onTilesWheel(dx: number, dy: number): void {
        Dispatcher.store_.moveTilesOffset(dx, dy);
    }
}
