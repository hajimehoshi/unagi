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
    export class View {
        constructor() {
            let tileSetImage = new Image();
            tileSetImage.src = './images/tileset.png';
            tileSetImage.addEventListener('load', () => {
                tileSetImage.dataset['loaded'] = 'true';
            });

            this.palette.tileSetImage = tileSetImage;
            this.tiles.tileSetImage = tileSetImage;

            tileSetImage.addEventListener('load', () => {
                this.palette.render();
                this.tiles.render();
            });
            
            window.addEventListener('message', (e: MessageEvent) => {
                if (e.data === 'quit') {
                    Dispatcher.onStopGame();
                }
            });

            (<HTMLElement><any>this.mapList).addEventListener('selectedItemChanged', (e: CustomEvent) => {
                Dispatcher.onCurrentMapChanged(e.detail.id);
            });
        }

        private get toolbar(): ToolbarElement {
            return <ToolbarElement><any>document.querySelector('unagi-toolbar');
        }

        private get palette(): PaletteElement {
            return <PaletteElement><any>document.querySelector('unagi-palette');
        }

        private get mapList(): ListBoxElement {
            return <ListBoxElement><any>document.querySelector('unagi-listbox.maps');
        }

        private get tiles(): TilesElement {
            return <TilesElement><any>document.querySelector('unagi-tiles');
        }

        private get database(): DatabaseElement {
            return <DatabaseElement><any>document.querySelector('unagi-database');
        }

        public render(game: data.Game): void {
            this.database.render(game);
        }

        // TODO: Rename updateCurrentMap?
        public updateMap(map: Map): void {
            this.tiles.map = map;
        }

        // TODO: Why |currentMapId| is passed?
        public updateMapList(currentMapId: string, maps: data.Map[]): void {
            let items = maps.map((map: data.Map): ListBoxItem => {
                return {
                    title: map.name,
                    id:    map.id,
                };
            });
            this.mapList.replaceItems(items);
            this.mapList.select(currentMapId);
        }

        public updateSelectedTiles(s: SelectedTiles): void {
            this.palette.selectedTiles = s;
            this.tiles.selectedTiles = s;
        }

        public updateTilesCursorPosition(x: number, y: number): void {
            this.tiles.updateCursorPosition(x, y);
        }

        public updateTilesOffset(x: number, y: number): void {
            this.tiles.updateOffset(x, y);
        }

        public playGame(game: data.Game): void {
            this.toolbar.playGame();

            let iframe = <HTMLIFrameElement>document.querySelector('iframe.player');
            iframe.src = './player.html';
            iframe.style.display = 'block';
            let f = (e) => {
                iframe.contentWindow.postMessage(game, '*');
                iframe.removeEventListener('load', f);
            };
            iframe.addEventListener('load', f);
        }

        public stopGame(): void {
            this.toolbar.stopGame();

            let iframe = <HTMLIFrameElement>document.querySelector('iframe.player');
            iframe.src = 'about:blank';
            iframe.style.display = 'none';
        }

        public updateEditingMode(editingMode: EditingMode): void {
            this.toolbar.editingMode = editingMode;
            if (editingMode === EditingMode.Database) {
                (<HTMLElement><any>this.database).style.display = 'block';
            } else {
                (<HTMLElement><any>this.database).style.display = 'none';
            }
            this.palette.editingMode = editingMode;
            this.tiles.editingMode = editingMode;
        }

        public updateDatabaseMode(databaseMode: DatabaseMode): void {
            this.database.updateMode(databaseMode);
        }
    }
}
