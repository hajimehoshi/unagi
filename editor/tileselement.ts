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
    export class TilesElement {
        private map_: Map;
        private selectedTiles_: SelectedTiles;
        private tilesSelectingState_: TilesSelectingState;
        private tileSetImage_: HTMLImageElement;
        private editingMode_: EditingMode;
        private scale_: number;
        private cursorPositionX_: number;
        private cursorPositionY_: number;
        private isDrawing_: boolean;
        private offsetX_: number;
        private offsetY_: number;

        private createdCallback(): void {
            this.scale_ = 2;
            this.offsetX_ = 0;
            this.offsetY_ = 0;

            let template = <HTMLTemplateElement>document.getElementById('unagi-tiles-template');
            let clone = document.importNode(template.content, true);
            let self = <HTMLElementES6><any>this;
            self.createShadowRoot().appendChild(clone);

            let canvas = this.canvas;
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            window.addEventListener('resize', () => {
                let canvas = this.canvas;
                canvas.width = canvas.offsetWidth * window.devicePixelRatio;
                canvas.height = canvas.offsetHeight * window.devicePixelRatio;
                this.render();
            })

            self.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
            });
            self.addEventListener('mousedown', (e: MouseEvent) => {
                if (!e.buttons) {
                    return;
                }
                if (e.buttons === 1) {
                    this.isDrawing_ = true;
                    Dispatcher.onDrawingTiles();
                }
                if (this.editingMode_ != EditingMode.Map) {
                    return;
                }
                if (e.buttons === 2) {
                    let x = e.offsetX + this.offsetX_;
                    let y = e.offsetY + this.offsetY_;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    this.tilesSelectingState_ = new TilesSelectingState(tx, ty);
                    Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                }
            });
            self.addEventListener('mousemove', (e: MouseEvent) => {
                if (e.buttons !== 2) {
                    let x = e.offsetX + this.offsetX_;
                    let y = e.offsetY + this.offsetY_;
                    let tilePosition = this.map_.tilePosition(x, y, this.scale_);
                    Dispatcher.onTilesCursorPositionChanged(tilePosition.x, tilePosition.y);
                }
                if (e.buttons === 1) {
                    if (!this.isDrawing_) {
                        return;
                    }
                    Dispatcher.onDrawingTiles();
                }
                if (this.editingMode_ != EditingMode.Map) {
                    return;
                }
                if (e.buttons === 2) {
                    if (!this.tilesSelectingState_) {
                        return;
                    }
                    let x = e.offsetX + this.offsetX_;
                    let y = e.offsetY + this.offsetY_;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    let px = Math.min(tx, this.tilesSelectingState_.startX);
                    let py = Math.min(ty, this.tilesSelectingState_.startY)
                    Dispatcher.onTilesCursorPositionChanged(px, py);
                    this.tilesSelectingState_.moveTo(tx, ty);
                    Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                }
            });
            self.addEventListener('mouseup', (e: MouseEvent) => {
                this.isDrawing_ = false;
                if (this.editingMode_ != EditingMode.Map) {
                    return;
                }
                if (e.buttons === 2) {
                    if (!this.tilesSelectingState_) {
                        return;
                    }
                    let x = e.offsetX + this.offsetX_;
                    let y = e.offsetY + this.offsetY_;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    this.tilesSelectingState_.moveTo(tx, ty);
                    Dispatcher.onSelectedTilesChanged(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                    this.tilesSelectingState_ = null;
                }
            });
            self.addEventListener('mouseleave', (e: MouseEvent) => {
                Dispatcher.onTilesCursorPositionChanged(void(0), void(0));
            });

            self.addEventListener('wheel', (e: WheelEvent) => {
                e.preventDefault();
                // TODO: Configure the wheel direction
                Dispatcher.onTilesCursorPositionChanged(void(0), void(0));
                let canvas = this.canvas;
                Dispatcher.onTilesWheel(e.deltaX, e.deltaY, this.scale_, canvas.width, canvas.height);
            });
        }

        private get canvas(): HTMLCanvasElement {
            return <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
        }

        public set map(map: Map) {
            this.map_ = map;
            this.render();
        }

        public set selectedTiles(s: SelectedTiles) {
            this.selectedTiles_ = s;
            this.render();
        }

        public set tileSetImage(tileSetImage: HTMLImageElement) {
            this.tileSetImage_ = tileSetImage;
            this.render();
        }

        public set editingMode(editingMode: EditingMode) {
            this.editingMode_ = editingMode;
            this.render();
        }

        public updateCursorPosition(x: number, y: number): void {
            this.cursorPositionX_ = x;
            this.cursorPositionY_ = y;
            this.render();
        }

        public updateOffset(x: number, y: number): void {
            this.offsetX_ = x;
            this.offsetY_ = y;
            this.render();
        }

        public render(): void {
            let canvas = this.canvas;
            let context = canvas.getContext('2d');
            (<any>context).imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.tileSetImage_ && this.tileSetImage_.dataset['loaded'] === 'true' && this.map_) {
                this.map_.renderAt(context, this.tileSetImage_, this.scale_, this.offsetX_, this.offsetY_, this.editingMode_ == EditingMode.Event);
            }

            if (this.selectedTiles_ && this.cursorPositionX_ !== void(0) && this.cursorPositionY_ !== void(0)) {
                const ratio = window.devicePixelRatio;
                if (this.cursorPositionX_ < 0 || this.cursorPositionY_ < 0) {
                    return;
                }
                if (this.map_.xNum <= this.cursorPositionX_ || this.map_.yNum <= this.cursorPositionY_) {
                    return;
                }
                let x = this.cursorPositionX_ * data.gridSize * this.scale_ * ratio - this.offsetX_ * ratio;
                let y = this.cursorPositionY_ * data.gridSize * this.scale_ * ratio - this.offsetY_ * ratio;
                this.selectedTiles_.renderFrameAt(context, x, y);
            }
        }
    }
}

(() => {
    (<any>editor.TilesElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-tiles', editor.TilesElement);
})();
