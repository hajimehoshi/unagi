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
    export declare type TilesRenderInfo = {
        mapId:           string;
        map:             Map; // TODO: Calc from mapId
        offsetX:         number;
        offsetY:         number;
        cursorPositionX: number;
        cursorPositionY: number;
        selectedTiles:   SelectedTiles;
        tileSetImage:    HTMLImageElement;
    }

    export class TilesElement {
        private map_: Map;
        private tilesSelectingState_: TilesSelectingState;
        private editingMode_: EditingMode;
        private scale_: number;
        private isDrawing_: boolean;
        private offsetX_: number;
        private offsetY_: number;
        private eventDialog_: EventDialog;

        private createdCallback(): void {
            this.scale_ = 2;
            this.offsetX_ = 0;
            this.offsetY_ = 0;

            let template = <HTMLTemplateElement>document.getElementById('unagi-tiles-template');
            let clone = document.importNode(template.content, true);
            let self = <HTMLElementES6><any>this;
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-dialog-style-template');
            let styleClone = document.importNode(styleTemplate.content, true);
            shadowRoot.appendChild(styleClone);

            let eventDialogElement = <any>(<HTMLElementES6><any>this).shadowRoot.querySelector('dialog.event');
            this.eventDialog_ = new EventDialog(eventDialogElement);

            let canvas = this.canvas;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            window.addEventListener('resize', () => {
                let canvas = this.canvas;
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            })
            self.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
            });
            self.addEventListener('mousedown', (e: MouseEvent) => {
                this.onMouseDown(e);
            });
            self.addEventListener('mousemove', (e: MouseEvent) => {
                this.onMouseMove(e);
            });
            self.addEventListener('mouseup', (e: MouseEvent) => {
                this.onMouseUp(e);
            });
            self.addEventListener('mouseleave', (e: MouseEvent) => {
                this.onMouseLeave(e);
            });
            self.addEventListener('dblclick', (e: MouseEvent) => {
                this.onDblClick(e);
            });
            self.addEventListener('wheel', (e: WheelEvent) => {
                this.onWheel(e);
            });
        }

        private get canvas(): HTMLCanvasElement {
            return <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
        }

        public set editingMode(editingMode: EditingMode) {
            this.editingMode_ = editingMode;
        }

        public render(game: data.Game, info: TilesRenderInfo): void {
            this.map_ = info.map;
            this.offsetX_ = info.offsetX;
            this.offsetY_ = info.offsetY;

            let canvas = this.canvas;
            let context = canvas.getContext('2d');
            (<any>context).imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (info.tileSetImage && this.map_) {
                this.map_.renderAt(context, info.tileSetImage, this.scale_, info.offsetX, info.offsetY, this.editingMode_ === EditingMode.Event);
                this.map_.renderEventsAt(context, game.images, this.scale_, info.offsetX, info.offsetY, this.editingMode_ !== EditingMode.Event);
            }

            if ((this.editingMode_ === EditingMode.Event) ||
                (info.selectedTiles && info.cursorPositionX !== void(0))) {
                let x = info.cursorPositionX * data.gridSize * this.scale_ - info.offsetX;
                let y = info.cursorPositionY * data.gridSize * this.scale_ - info.offsetY;
                if (this.editingMode_ !== EditingMode.Event) {
                    info.selectedTiles.renderFrameAt(context, x, y);
                } else {
                    let width = data.gridSize * this.scale_;
                    let height = data.gridSize * this.scale_;
                    Canvas.drawFrame(context, x, y, width, height);
                }
            }

            // Event dialog
            if (this.map_) {
                let event = this.map_.getEventAt(info.cursorPositionX, info.cursorPositionY);
                // TODO: Draw event image
                if (event) {
                    this.eventDialog_.render(game, this.map_, event);
                }
            }
        }

        private onMouseDown(e: MouseEvent): void {
            if (this.eventDialog_.open) {
                return;
            }
            if (!e.buttons) {
                return;
            }
            if (e.buttons === 1) {
                this.isDrawing_ = true;
                Store.instance.drawTiles();
                return;
            }
            if (this.editingMode_ !== EditingMode.Map) {
                return;
            }
            if (e.buttons === 2) {
                let x = e.offsetX + this.offsetX_;
                let y = e.offsetY + this.offsetY_;
                let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                this.tilesSelectingState_ = new TilesSelectingState(tx, ty);
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
            }
        }

        private onMouseMove(e: MouseEvent): void {
            if (this.eventDialog_.open) {
                return;
            }
            if (e.buttons !== 2) {
                let x = e.offsetX + this.offsetX_;
                let y = e.offsetY + this.offsetY_;
                let tilePosition = this.map_.tilePosition(x, y, this.scale_);
                Store.instance.updateTilesCursorPosition(tilePosition.x, tilePosition.y);
            }
            if (e.buttons === 1) {
                if (!this.isDrawing_) {
                    return;
                }
                Store.instance.drawTiles();
                return;
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
                let py = Math.min(ty, this.tilesSelectingState_.startY);
                Store.instance.updateTilesCursorPosition(px, py);
                this.tilesSelectingState_.moveTo(tx, ty);
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
            }
        }

        private onMouseUp(e: MouseEvent): void {
            if (this.eventDialog_.open) {
                return;
            }
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
                Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                this.tilesSelectingState_ = null;
            }
        }

        private onMouseLeave(e: MouseEvent): void {
            if (this.eventDialog_.open) {
                return;
            }
            Store.instance.updateTilesCursorPosition(void(0), void(0));
        }

        private onDblClick(e: MouseEvent): void {
            if (this.editingMode_ !== EditingMode.Event) {
                return;
            }
            Store.instance.createEventIfNeeded();
            if (this.eventDialog_.open) {
                return;
            }
            this.eventDialog_.showModal();
        }

        private onWheel(e: WheelEvent): void {
            e.preventDefault();

            if (this.eventDialog_.open) {
                return;
            }

            // TODO: Configure the wheel direction
            Store.instance.updateTilesCursorPosition(void(0), void(0));
            let canvas = this.canvas;
            Store.instance.moveTilesOffset(e.deltaX, e.deltaY, this.scale_, canvas.width, canvas.height);
        }
    }
}

(() => {
    (<any>editor.TilesElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-tiles', editor.TilesElement);
})();
