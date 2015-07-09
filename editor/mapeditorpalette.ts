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
    export class Palette extends HTMLElement {
        public static get tileXNum(): number { return 8; }
        public static get tileYNum(): number { return 32; }
        public static get scale(): number { return 2; }

        private selectedTiles_: SelectedTiles;
        private tileSetImage_: HTMLImageElement;
        private tilesSelectingState_: TilesSelectingState;

        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-palette-template');
            let clone = document.importNode(template.content, true);
            (<HTMLElementES6><any>this).createShadowRoot().appendChild(clone);

            let canvas = <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
            let width = Palette.tileXNum * Main.tileWidth;
            let height = Palette.tileYNum * Main.tileHeight;
            let actualScale = Palette.scale * window.devicePixelRatio;;
            canvas.width = width * actualScale;
            canvas.height = height * actualScale;
            canvas.style.width = (width * Palette.scale) + 'px';
            canvas.style.height = (height * Palette.scale) + 'px';

            this.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
            });
            this.addEventListener('mousedown', (e: MouseEvent) => {
                let x = e.offsetX + this.scrollLeft;
                let y = e.offsetY + this.scrollTop;
                let tx = (((x / Main.tileWidth)|0) / Palette.scale)|0;
                let ty = (((y / Main.tileHeight)|0) / Palette.scale)|0;
                this.tilesSelectingState_ = new TilesSelectingState(tx, ty);
                Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInPalette());
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
                let tx = (((x / Main.tileWidth)|0) / Palette.scale)|0;
                let ty = (((y / Main.tileHeight)|0) / Palette.scale)|0;
                this.tilesSelectingState_.moveTo(tx, ty);
                Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInPalette());
            })
            this.addEventListener('mouseup', (e: MouseEvent) => {
                if (!this.tilesSelectingState_) {
                    return;
                }
                let x = e.offsetX + this.scrollLeft;
                let y = e.offsetY + this.scrollTop;
                let tx = (((x / Main.tileWidth)|0) / Palette.scale)|0;
                let ty = (((y / Main.tileHeight)|0) / Palette.scale)|0;
                this.tilesSelectingState_.moveTo(tx, ty);
                Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInPalette());
                this.tilesSelectingState_ = null;
            })
        }

        private positionToTile(px: number, py: number): number {
            let x = (px / (Main.tileWidth * Palette.scale))|0;
            let y = (py / (Main.tileHeight * Palette.scale))|0;
            return x + y * Palette.tileXNum;
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
}

(() => {
    (<editor.HTMLDocumentES6>document).registerElement('unagi-palette', editor.Palette);
})();
