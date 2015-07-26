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
        }

        public render(): void {
            this.content.render();
        }

        private get toolbar(): ToolbarElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <ToolbarElement><any>shadowRoot.querySelector('unagi-toolbar');
        }

        private get content(): ContentElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <ContentElement><any>shadowRoot.querySelector('unagi-content');
        }

        public updateMap(map: Map) {
            this.content.updateMap(map);
        }

        public updateMapList(currentMapId: string, maps: data.Map[]) {
            this.content.updateMapList(currentMapId, maps);
        }

        public updateSelectedTiles(s: SelectedTiles) {
            this.content.updateSelectedTiles(s);
        }

        public updateTilesCursorPosition(x: number, y: number): void {
            this.content.updateTilesCursorPosition(x, y);
        }

        public updateTilesOffset(x: number, y: number): void {
            this.content.updateTilesOffset(x, y);
        }

        public playGame(game: data.Game): void {
            this.toolbar.playGame();
            this.content.playGame(game);
        }

        public stopGame(): void {
            this.toolbar.stopGame();
            this.content.stopGame();
        }

        public updateTilesEditingMode(tilesEditingMode: TilesEditingMode): void {
            this.content.updateTilesEditingMode(tilesEditingMode);
            this.toolbar.tilesEditingMode = tilesEditingMode;
        }
    }
}

(() => {
    (<any>editor.MainElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-main', editor.MainElement);
})();
