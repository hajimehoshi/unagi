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
    export class MainElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-main-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            window.addEventListener('load', () => {
                let tileSetImage = new Image();
                tileSetImage.src = './images/tileset.png';
                tileSetImage.addEventListener('load', () => {
                    tileSetImage.dataset['loaded'] = 'true';
                });

                let palette = this.palette;
                palette.tileSetImage = tileSetImage;

                let tiles = this.tiles;
                tiles.tileSetImage = tileSetImage;

                tileSetImage.addEventListener('load', () => {
                    this.palette.render();
                    this.tiles.render();
                });
            })
            
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
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <ToolbarElement><any>shadowRoot.querySelector('unagi-toolbar');
        }

        private get palette(): PaletteElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <PaletteElement><any>shadowRoot.querySelector('unagi-palette');
        }

        private get mapList(): ListBoxElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <ListBoxElement><any>shadowRoot.querySelector('unagi-listbox');
        }

        private get tiles(): TilesElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <TilesElement><any>shadowRoot.querySelector('unagi-tiles');
        }

        private get database(): DatabaseElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<DatabaseElement><any>shadowRoot.querySelector('unagi-database'));
        }

        public updateGame(game: data.Game): void {
            this.database.updateGame(game);
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

            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let iframe = <HTMLIFrameElement>(shadowRoot.querySelector('iframe.player'));
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

            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let iframe = <HTMLIFrameElement>(shadowRoot.querySelector('iframe.player'));
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

(() => {
    (<any>editor.MainElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-main', editor.MainElement);
})();
