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

// This can be compiled with TypeScript 1.5.3 or higher.

interface HTMLTemplateElement extends HTMLElement {
    content: DocumentFragment;
}

interface HTMLElementES6 extends HTMLElement {
    createShadowRoot(): DocumentFragment;
    shadowRoot: DocumentFragment;
}

interface HTMLDocumentES6 extends HTMLDocument {
    registerElement(name: string, proto: Object);
}

class MapEditorMain extends HTMLElement {
    public static get tileWidth(): number { return 16; }
    public static get tileHeight(): number { return 16; }

    private createdCallback(): void {
        let template = <HTMLTemplateElement>document.getElementById('mapeditor-main-template');
        let clone = document.importNode(template.content, true);
        let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
        shadowRoot.appendChild(clone);

        window.addEventListener('load', () => {
            let tileSetImage = new Image();
            tileSetImage.src = 'tileset.png';
            tileSetImage.addEventListener('load', () => {
                tileSetImage.dataset['loaded'] = 'true';
            });

            let palette = this.palette;
            palette.tileSetImage = tileSetImage;

            let tiles = this.tiles;
            tiles.tileSetImage = tileSetImage;

            // TODO: ?
            tileSetImage.addEventListener('load', () => {
                this.render();
            });
        })
    }

    public render(): void {
        this.palette.render();
        this.tiles.render();
    }

    private get palette(): MapEditorPalette {
        let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
        return <MapEditorPalette>shadowRoot.querySelector('mapeditor-palette');
    }

    private get tiles(): MapEditorTiles {
        let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
        return <MapEditorTiles>shadowRoot.querySelector('mapeditor-tiles');
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
}

class Canvas {
    public static drawFrame(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        const ratio = window.devicePixelRatio;

        context.lineJoin = 'miter';
        context.beginPath();

        let lineWidth = 4 * ratio;
        context.beginPath();
        context.lineWidth = lineWidth;
        context.rect(x + lineWidth / 2,
                     y + lineWidth / 2,
                     width - lineWidth / 2 * 2,
                     height - lineWidth / 2 * 2);
        context.strokeStyle = '#000';
        context.stroke();

        lineWidth = 2 * ratio;
        context.beginPath();
        context.lineWidth = lineWidth;
        context.rect(x + 1 * ratio + lineWidth / 2,
                     y + 1 * ratio + lineWidth / 2,
                     width - 2 * ratio - lineWidth / 2 * 2,
                     height - 2 * ratio - lineWidth / 2 * 2);
        context.strokeStyle = '#fff';
        context.stroke();
    }
}

class SelectedTiles {
    private tiles_: number[];
    private xNum_: number;
    private yNum_: number;
    private isInPalette_: boolean;

    constructor(tiles: number[], xNum: number, yNum: number, isInPalette: boolean) {
        this.tiles_ = tiles;
        this.xNum_ = xNum;
        this.yNum_ = yNum;
        this.isInPalette_ = isInPalette;
    }

    public renderFrameInPalette(context: CanvasRenderingContext2D): void {
        if (!this.isInPalette_)
            return;

        const ratio = window.devicePixelRatio;

        let tile = this.tiles_[0];
        let x = (tile % MapEditorPalette.tileXNum) * MapEditorMain.tileWidth * MapEditorPalette.scale * ratio;
        let y = ((tile / MapEditorPalette.tileXNum)|0) * MapEditorMain.tileHeight * MapEditorPalette.scale * ratio;

        Canvas.drawFrame(context, x, y, this.width, this.height);
    }

    public renderFrameAt(context: CanvasRenderingContext2D, x: number, y: number): void {
        Canvas.drawFrame(context, x, y, this.width, this.height);
    }

    public get xNum(): number {
        return this.xNum_;
    }

    public get yNum(): number {
        return this.yNum_;
    }

    public at(x: number, y: number): number {
        return this.tiles_[x + y * this.xNum_];
    }

    private get width(): number {
        const ratio = window.devicePixelRatio;
        return this.xNum_ * MapEditorMain.tileWidth * MapEditorPalette.scale * ratio;
    }

    private get height(): number {
        const ratio = window.devicePixelRatio;
        return this.yNum_ * MapEditorMain.tileHeight * MapEditorPalette.scale * ratio;
    }
}

class TilesSelectingState {
    private startTile_: number;
    private endTile_: number;

    constructor(tile: number) {
        this.startTile_ = tile;
        this.endTile_ = tile;
    }

    public moveTo(tile: number): void {
        this.endTile_ = tile;
    }

    public toSelectedTiles(): SelectedTiles {
        let x1 = this.startTile_ % MapEditorPalette.tileXNum;
        let x2 = this.endTile_ % MapEditorPalette.tileXNum;
        let y1 = (this.startTile_ / MapEditorPalette.tileXNum)|0;
        let y2 = (this.endTile_ / MapEditorPalette.tileXNum)|0;
        let xMin = Math.min(x1, x2);
        let xMax = Math.max(x1, x2);
        let yMin = Math.min(y1, y2);
        let yMax = Math.max(y1, y2);
        let width = xMax - xMin + 1;
        let height = yMax - yMin + 1;
        let tiles: Array<number> = [];
        for (let j = yMin; j <= yMax; j++) {
            for (let i = xMin; i <= xMax; i++) {
                tiles.push(i + j * MapEditorPalette.tileXNum)
            }
        }
        return new SelectedTiles(tiles, width, height, true);
    }
}

(() => {
    (<HTMLDocumentES6>document).registerElement('mapeditor-main', MapEditorMain);

    window.addEventListener('load', () => {
        let mapEditorMain = <MapEditorMain>document.querySelector('mapeditor-main');
        let store = new Store(mapEditorMain);
        Dispatcher.store = store;
        Dispatcher.onMapChanged(new Map(100, 100));
    });
})();
