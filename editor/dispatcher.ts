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
    export class Dispatcher {
        public static onInitialized(game: data.Game): void {
            Store.instance.updateGame(game);
        }

        public static onSelectedTilesChanged(s: SelectedTiles): void {
            Store.instance.updateSelectedTiles(s);
        }

        public static onTilesCursorPositionChanged(x: number, y: number): void {
            Store.instance.updateTilesCursorPosition(x, y);
        }

        public static onDrawingTiles(): void {
            Store.instance.drawTiles();
        }

        public static onTilesWheel(dx: number, dy: number, scale: number, canvasWidth: number, canvasHeight: number): void {
            Store.instance.moveTilesOffset(dx, dy, scale, canvasWidth, canvasHeight);
        }

        public static onPlayGame(): void {
            Store.instance.playGame();
        }

        public static onStopGame(): void {
            Store.instance.stopGame();
        }

        public static onEditingModeChanged(editingMode: EditingMode): void {
            Store.instance.updateEditingMode(editingMode);
        }

        public static onDatabaseModeChanged(editingMode: DatabaseMode): void {
            Store.instance.updateDatabaseMode(editingMode);
        }

        public static onCurrentMapChanged(id: string): void {
            Store.instance.updateCurrentMap(id);
        }

        public static onCurrentActorChanged(id: string): void {
            Store.instance.updateCurrentActor(id);
        }

        public static onUpdatingGameData(path: string, value: any): void {
            Store.instance.updateGameData(path, value);
        }

        public static onAddingGameData(path: string): void {
            Store.instance.addGameData(path);
        }

        public static onCreatingEventIfNeeded(): void {
            Store.instance.createEventIfNeeded();
        }
    }
}
