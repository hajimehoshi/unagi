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

class MapEditorPalette extends HTMLElement {
    public static get tileXNum(): number { return 8; }
    public static get tileYNum(): number { return 32; }
    public static get scale(): number { return 2; }

    private selectedTiles_: SelectedTiles;
    private tileSetImage_: HTMLImageElement;
    private tilesSelectingState_: TilesSelectingState;

    private createdCallback(): void {
        let template = <HTMLTemplateElement>document.getElementById('mapeditor-palette-template');
        let clone = document.importNode(template.content, true);
        (<HTMLElementES6><any>this).createShadowRoot().appendChild(clone);

        let canvas = <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
        let width = MapEditorPalette.tileXNum * MapEditorMain.tileWidth;
        let height = MapEditorPalette.tileYNum * MapEditorMain.tileHeight;
        let actualScale = MapEditorPalette.scale * window.devicePixelRatio;;
        canvas.width = width * actualScale;
        canvas.height = height * actualScale;
        canvas.style.width = (width * MapEditorPalette.scale) + 'px';
        canvas.style.height = (height * MapEditorPalette.scale) + 'px';

        this.addEventListener('mousedown', (e: MouseEvent) => {
            let x = e.offsetX + this.scrollLeft;
            let y = e.offsetY + this.scrollTop;
            let tile = this.positionToTile(x, y);
            this.tilesSelectingState_ = new TilesSelectingState(tile);
            Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTiles());
        })
        this.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.tilesSelectingState_) {
                return;
            }
            if (!e.buttons) {
                this.tilesSelectingState_ = null;
                return;
            }
            let x = e.offsetX + this.scrollLeft;
            let y = e.offsetY + this.scrollTop;
            let tile = this.positionToTile(x, y);
            this.tilesSelectingState_.moveTo(tile);
            Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTiles());
        })
        this.addEventListener('mouseup', (e: MouseEvent) => {
            if (!this.tilesSelectingState_) {
                return;
            }
            let x = e.offsetX + this.scrollLeft;
            let y = e.offsetY + this.scrollTop;
            let tile = this.positionToTile(x, y);
            this.tilesSelectingState_.moveTo(tile);
            Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTiles());
            this.tilesSelectingState_ = null;
        })
    }

    private positionToTile(px: number, py: number): number {
        let x = (px / (MapEditorMain.tileWidth * MapEditorPalette.scale))|0;
        let y = (py / (MapEditorMain.tileHeight * MapEditorPalette.scale))|0;
        return x + y * MapEditorPalette.tileXNum;
    }

    public set selectedTiles(s: SelectedTiles) {
        this.selectedTiles_ = s;
        this.render();
    }

    public set tileSetImage(tileSetImage: HTMLImageElement) {
        this.tileSetImage_ = tileSetImage;
        this.render();
    }

    public render(): void {
        let canvas = <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
        let context = canvas.getContext('2d');
        (<any>context).imageSmoothingEnabled = false;
        if (this.tileSetImage_ && this.tileSetImage_.dataset['loaded'] === 'true') {
            context.drawImage(this.tileSetImage_, 0, 0, canvas.width, canvas.height);
        }
        if (this.selectedTiles_) {
            this.selectedTiles_.renderFrameInPalette(context);
        }
    }
}

(() => {
    (<HTMLDocumentES6>document).registerElement('mapeditor-palette', MapEditorPalette);
})();
