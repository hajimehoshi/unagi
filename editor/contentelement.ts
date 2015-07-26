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
    export class ContentElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-content-template');
            let clone = document.importNode(template.content, true);
            let self = (<HTMLElementES6><any>this);
            self.createShadowRoot().appendChild(clone);

            
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
                    this.render();
                });
            })
        }

        private get palette(): PaletteElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <PaletteElement><any>shadowRoot.querySelector('unagi-palette');
        }

        private get mapList(): MapListElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <MapListElement><any>shadowRoot.querySelector('unagi-maplist');
        }

        private get tiles(): TilesElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <TilesElement><any>shadowRoot.querySelector('unagi-tiles');
        }

        private get player(): PlayerElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<PlayerElement><any>shadowRoot.querySelector('unagi-player'));
        }

        public render() {
            this.palette.render();
            this.tiles.render();
        }

        public updateMap(map: Map) {
            this.tiles.map = map;
        }

        public updateMapList(currentMapId: string, maps: data.Map[]) {
            this.mapList.update(currentMapId, maps);
        }

        public updateSelectedTiles(s: SelectedTiles) {
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
            this.player.playGame(game);
        }

        public stopGame(): void {
            this.player.stopGame();
        }

        public updateTilesEditingMode(tilesEditingMode: TilesEditingMode): void {
            this.palette.tilesEditingMode = tilesEditingMode;
            this.tiles.tilesEditingMode = tilesEditingMode;
        }
    }
}

(() => {
    (<any>editor.ContentElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-content', editor.ContentElement);
})();
