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
    export class Palette {
        public static get tileXNum(): number { return 8; }
        public static get tileYNum(): number { return 32; }
        public static get scale(): number { return 2; }

        private element_: HTMLElement;
        private selectedTiles_: SelectedTiles;
        private tilesSelectingState_: TilesSelectingState;

        constructor(element: HTMLElement) {
            this.element_ = element;

            let canvas = <HTMLCanvasElement>this.element_.querySelector('canvas');
            let width = Palette.tileXNum * data.gridSize;
            let height = Palette.tileYNum * data.gridSize;
            let scale = Palette.scale;
            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.style.width = (width * scale) + 'px';
            canvas.style.height = (height * scale) + 'px';

            this.element_.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
            });
            this.element_.addEventListener('mousedown', (e: MouseEvent) => {
                let x = e.offsetX;
                let y = e.offsetY;
                let tx = (((x / data.gridSize)|0) / Palette.scale)|0;
                let ty = (((y / data.gridSize)|0) / Palette.scale)|0;
                this.tilesSelectingState_ = new TilesSelectingState(tx, ty);
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInPalette());
            })
            this.element_.addEventListener('mousemove', (e: MouseEvent) => {
                if (!this.tilesSelectingState_) {
                    return;
                }
                if (!e.buttons) {
                    this.tilesSelectingState_ = null;
                    return;
                }
                let x = e.offsetX;
                let y = e.offsetY;
                let tx = (((x / data.gridSize)|0) / Palette.scale)|0;
                let ty = (((y / data.gridSize)|0) / Palette.scale)|0;
                this.tilesSelectingState_.moveTo(tx, ty);
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInPalette());
            })
            this.element_.addEventListener('mouseup', (e: MouseEvent) => {
                if (!this.tilesSelectingState_) {
                    return;
                }
                let x = e.offsetX;
                let y = e.offsetY;
                let tx = (((x / data.gridSize)|0) / Palette.scale)|0;
                let ty = (((y / data.gridSize)|0) / Palette.scale)|0;
                this.tilesSelectingState_.moveTo(tx, ty);
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInPalette());
                this.tilesSelectingState_ = null;
            })
        }

        private positionToTile(px: number, py: number): number {
            let x = (px / (data.gridSize * Palette.scale))|0;
            let y = (py / (data.gridSize * Palette.scale))|0;
            return x + y * Palette.tileXNum;
        }

        public set selectedTiles(s: SelectedTiles) {
            this.selectedTiles_ = s;
        }

        public render(info: RenderInfo): void {
            let canvas = <HTMLCanvasElement>this.element_.querySelector('canvas');
            let context = canvas.getContext('2d');
            (<any>context).imageSmoothingEnabled = false;
            if (info.tileSetImage) {
                context.drawImage(info.tileSetImage, 0, 0, canvas.width, canvas.height);
            }
            if (this.selectedTiles_) {
                this.selectedTiles_.renderFrameInPalette(context);
            }
        }
    }
}