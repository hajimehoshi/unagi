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
    export interface HTMLTemplateElement extends HTMLElement {
        content: DocumentFragment;
    }

    export interface HTMLElementES6 extends HTMLElement {
        createShadowRoot(): DocumentFragment;
        shadowRoot: DocumentFragment;
    }

    export interface HTMLDocumentES6 extends HTMLDocument {
        registerElement(name: string, proto: Object);
    }

    export class Canvas {
        public static drawFrame(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
            context.save();

            context.lineJoin = 'miter';
            context.beginPath();

            let lineWidth = 4;
            context.lineWidth = lineWidth;
            context.strokeStyle = '#212121';
            context.strokeRect(x + lineWidth / 2,
                               y + lineWidth / 2,
                               width - lineWidth / 2 * 2,
                               height - lineWidth / 2 * 2);

            lineWidth = 2;
            context.lineWidth = lineWidth;
            context.strokeStyle = '#f5f5f5';
            context.strokeRect(x + 1 + lineWidth / 2,
                               y + 1 + lineWidth / 2,
                               width - 2 - lineWidth / 2 * 2,
                               height - 2 - lineWidth / 2 * 2);

            context.restore();
        }
    }

    export class SelectedTiles {
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

            let tile = this.tiles_[0];
            let x = (tile % Palette.tileXNum) * data.GRID_SIZE * Palette.scale;
            let y = ((tile / Palette.tileXNum)|0) * data.GRID_SIZE * Palette.scale;

            Canvas.drawFrame(context, x, y, this.width, this.height);
        }

        public renderFrameAt(context: CanvasRenderingContext2D, x: number, y: number): void {
            Canvas.drawFrame(context, x, y, this.width, this.height);
        }

        // TODO: This class should be immutable?
        public shrink(): void {
            this.tiles_ = [this.tiles_[0]];
            this.xNum_ = 1;
            this.yNum_ = 1;
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
            return this.xNum_ * data.GRID_SIZE * Palette.scale;
        }

        private get height(): number {
            return this.yNum_ * data.GRID_SIZE * Palette.scale;
        }
    }

    export class TilesSelectingState {
        private startX_: number;
        private startY_: number;
        private endX_: number;
        private endY_: number;

        constructor(x: number, y: number) {
            this.startX_ = x;
            this.startY_ = y;
            this.endX_ = x;
            this.endY_ = y;
        }

        public moveTo(x: number, y: number): void {
            this.endX_ = x;
            this.endY_ = y;
        }

        public get startX(): number {
            return this.startX_;
        }

        public get startY(): number {
            return this.startY_;
        }

        private get xMin(): number {
            return Math.min(this.startX_, this.endX_);
        }

        private get yMin(): number {
            return Math.min(this.startY_, this.endY_);
        }

        private get xMax(): number {
            return Math.max(this.startX_, this.endX_);
        }

        private get yMax(): number {
            return Math.max(this.startY_, this.endY_);
        }

        private get width(): number {
            return this.xMax - this.xMin + 1;
        }

        private get height(): number {
            return this.yMax - this.yMin + 1;
        }

        public toSelectedTilesInPalette(): SelectedTiles {
            let xMin = this.xMin;
            let xMax = this.xMax;
            let yMin = this.yMin;
            let yMax = this.yMax;
            let tiles: Array<number> = [];
            for (let j = yMin; j <= yMax; j++) {
                for (let i = xMin; i <= xMax; i++) {
                    tiles.push(i + j * Palette.tileXNum)
                }
            }
            return new SelectedTiles(tiles, this.width, this.height, true);
        }

        public toSelectedTilesInTiles(map: Map): SelectedTiles {
            let xMin = this.xMin;
            let xMax = this.xMax;
            let yMin = this.yMin;
            let yMax = this.yMax;
            let tiles: Array<number> = [];
            for (let j = yMin; j <= yMax; j++) {
                for (let i = xMin; i <= xMax; i++) {
                    tiles.push(map.tileAt(i, j))
                }
            }
            return new SelectedTiles(tiles, this.width, this.height, false);
        }
    }
}

(() => {
    window.addEventListener('load', () => {
        let store = editor.Store.instance;
        store.initialize(new editor.View());
    });
})();
