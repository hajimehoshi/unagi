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
        private static store_: Store;

        public static set store(store: Store) {
            Dispatcher.store_ = store;
        }

        public static onInitialized(game: data.Game): void {
            Dispatcher.store_.updateGame(game);
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

        public static onTilesWheel(dx: number, dy: number, scale: number, canvasWidth: number, canvasHeight: number): void {
            Dispatcher.store_.moveTilesOffset(dx, dy, scale, canvasWidth, canvasHeight);
        }

        public static onPlayGame(): void {
            Dispatcher.store_.playGame();
        }

        public static onStopGame(): void {
            Dispatcher.store_.stopGame();
        }

        public static onEditingModeChanged(editingMode: EditingMode): void {
            Dispatcher.store_.updateEditingMode(editingMode);
        }

        public static onDatabaseModeChanged(editingMode: DatabaseMode): void {
            Dispatcher.store_.updateDatabaseMode(editingMode);
        }

        public static onCurrentMapChanged(id: string): void {
            Dispatcher.store_.updateCurrentMap(id);
        }

        public static onCurrentActorChanged(id: string): void {
            Dispatcher.store_.updateCurrentActor(id);
        }

        public static onUpdatingGameData(path: string, value: any): void {
            Dispatcher.store_.updateGameData(path, value);
        }

        public static onAddingGameData(path: string): void {
            Dispatcher.store_.addGameData(path);
        }
    }
}
