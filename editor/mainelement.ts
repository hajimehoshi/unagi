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
    export class MainElement extends HTMLElement {
        public static get tileWidth(): number { return 16; }
        public static get tileHeight(): number { return 16; }

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
                    this.render();
                });
            })
        }

        public render(): void {
            this.palette.render();
            this.tiles.render();
        }

        private get toolbar(): ToolbarElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <ToolbarElement>shadowRoot.querySelector('unagi-toolbar');
        }

        private get palette(): PaletteElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <PaletteElement>shadowRoot.querySelector('unagi-palette');
        }

        private get tiles(): TilesElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <TilesElement>shadowRoot.querySelector('unagi-tiles');
        }

        public updateMap(map: Map) {
            this.tiles.map = map;
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
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            (<PlayerElement>shadowRoot.querySelector('unagi-player')).playGame(game);
        }

        public stopGame(): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            (<PlayerElement>shadowRoot.querySelector('unagi-player')).stopGame();
        }

        public updateTilesEditingMode(tilesEditingMode: TilesEditingMode): void {
            this.toolbar.tilesEditingMode = tilesEditingMode;
            this.palette.tilesEditingMode = tilesEditingMode;
            this.tiles.tilesEditingMode = tilesEditingMode;
        }
    }
}

(() => {
    (<editor.HTMLDocumentES6>document).registerElement('unagi-main', editor.MainElement);
})();
