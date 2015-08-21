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

        private createdCallback(): void {
            this.scale_ = 2;

            let template = <HTMLTemplateElement>document.getElementById('unagi-tiles-template');
            let clone = document.importNode(template.content, true);
            let self = <HTMLElementES6><any>this;
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-dialog-style-template');
            let styleClone = document.importNode(styleTemplate.content, true);
            shadowRoot.appendChild(styleClone);

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
        }

        private get canvas(): HTMLCanvasElement {
            return <HTMLCanvasElement>(<HTMLElementES6><any>this).shadowRoot.querySelector('canvas');
        }

        public updateMap(map: Map): void {
            this.map_ = map;
        }

        public set editingMode(editingMode: EditingMode) {
            this.editingMode_ = editingMode;
        }

        public render(game: data.Game, info: TilesRenderInfo): void {
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
                    let eventDialog = <any>(<HTMLElementES6><any>this).shadowRoot.querySelector('dialog.event');
                    let eventImageSelector = <ImageSelectorElement>eventDialog.querySelector('unagi-image-selector');
                    let mapIndex = this.map_.index(game.maps);
                    let eventIndex = this.map_.events.indexOf(event);
                    let pageIndex = 0;
                    let basePath = `maps[${mapIndex}].events[${eventIndex}].pages[${pageIndex}]`;
                    eventImageSelector.path = `${basePath}.image`;
                    eventImageSelector.imageXPath = `${basePath}.imageX`;
                    eventImageSelector.imageYPath = `${basePath}.imageY`;
                    let page = event.pages[pageIndex];
                    if (page.image !== data.NullImage.id) {
                        eventImageSelector.xNum = 3;
                        eventImageSelector.yNum = 4;
                    } else {
                        eventImageSelector.xNum = 1;
                        eventImageSelector.yNum = 1;
                    }
                    eventImageSelector.render(game, page.image, page.imageX, page.imageY);

                    let commandsTextArea = <HTMLTextAreaElement>eventDialog.querySelector('textarea.commands');
                    commandsTextArea.value = JSON.stringify(page.commands, null, '  ');
                    commandsTextArea.onchange = (e) => {
                        try {
                            let commands = JSON.parse(commandsTextArea.value);
                            let path = `${basePath}.commands`;
                            Store.instance.updateGameData(path, commands);
                        } catch (e) {
                            if (e instanceof SyntaxError) {
                                console.error(e);
                                return;
                            }
                            throw e;
                        }
                    };
                }
            }

            let self = <HTMLElementES6><any>this;
            let eventDialog = <any>(<HTMLElementES6><any>this).shadowRoot.querySelector('dialog.event');
            self.onmousedown = (e: MouseEvent) => {
                if (eventDialog.open) {
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
                    let x = e.offsetX + info.offsetX;
                    let y = e.offsetY + info.offsetY;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    this.tilesSelectingState_ = new TilesSelectingState(tx, ty);
                    Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                }
            };
            self.onmousemove = (e: MouseEvent) => {
                if (eventDialog.open) {
                    return;
                }
                if (e.buttons !== 2) {
                    let x = e.offsetX + info.offsetX;
                    let y = e.offsetY + info.offsetY;
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
                    let x = e.offsetX + info.offsetX;
                    let y = e.offsetY + info.offsetY;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    let px = Math.min(tx, this.tilesSelectingState_.startX);
                    let py = Math.min(ty, this.tilesSelectingState_.startY);
                    Store.instance.updateTilesCursorPosition(px, py);
                    this.tilesSelectingState_.moveTo(tx, ty);
                    Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                }
            };
            self.onmouseup = (e: MouseEvent) => {
                if (eventDialog.open) {
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
                    let x = e.offsetX + info.offsetX;
                    let y = e.offsetY + info.offsetY;
                    let tx = (((x / data.gridSize)|0) / this.scale_)|0;
                    let ty = (((y / data.gridSize)|0) / this.scale_)|0;
                    this.tilesSelectingState_.moveTo(tx, ty);
                    Store.instance.updateSelectedTiles(this.tilesSelectingState_.toSelectedTilesInTiles(this.map_));
                    this.tilesSelectingState_ = null;
                }
            };
            self.onmouseleave = (e: MouseEvent) => {
                Store.instance.updateTilesCursorPosition(void(0), void(0));
            };

            self.ondblclick = (e: MouseEvent) => {
                if (this.editingMode_ !== EditingMode.Event) {
                    return;
                }
                Store.instance.createEventIfNeeded();
                if (eventDialog.open) {
                    return;
                }
                eventDialog.showModal();
            };
            eventDialog.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                let rect = eventDialog.getBoundingClientRect();
                if (e.clientY <= rect.top + rect.height && rect.top <= e.clientY &&
                    e.clientX <= rect.left + rect.width && rect.left <= e.clientX) {
                    return;
                }
                eventDialog.close();
            };

            self.onwheel = (e: WheelEvent) => {
                e.preventDefault();

                if (eventDialog.open) {
                    return;
                }

                // TODO: Configure the wheel direction
                Store.instance.updateTilesCursorPosition(void(0), void(0));
                let canvas = this.canvas;
                Store.instance.moveTilesOffset(e.deltaX, e.deltaY, this.scale_, canvas.width, canvas.height);
            };
        }
    }
}

(() => {
    (<any>editor.TilesElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-tiles', editor.TilesElement);
})();
