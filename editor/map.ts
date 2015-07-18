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
    export class Map {
        private data_: data.Map;

        constructor(data: data.Map) {
            this.data_ = data;
        }

        public get xNum(): number {
            return this.data_.xNum;
        }

        public get yNum(): number {
            return this.data_.yNum;
        }

        public tileAt(x: number, y: number): number {
            return this.data_.tileAt(x, y);
        }

        public tilePosition(x: number, y: number, scale: number): {x: number, y: number} {
            let tileX = (((x / MainElement.tileWidth)|0) / scale)|0;
            let tileY = (((y / MainElement.tileHeight)|0) / scale)|0;
            return {x: tileX, y: tileY};
        }

        public replaceTiles(s: SelectedTiles, x: number, y: number): void {
            for (let j = 0; j < s.yNum; j++) {
                for (let i = 0; i < s.xNum; i++) {
                    let tile = s.at(i, j);
                    if (x + i < 0) {
                        continue;
                    }
                    if (y + j < 0) {
                        continue;
                    }
                    if (this.xNum <= x + i) {
                        continue;
                    }
                    if (this.yNum <= y + j) {
                        continue;
                    }
                    this.data_.setTileAt(tile, x + i, y + j);
                }
            }
        }

        public renderAt(context: CanvasRenderingContext2D, tileSetImage: HTMLImageElement, scale: number, offsetX: number, offsetY: number, grid: boolean): void {
            const ratio = window.devicePixelRatio;
            const actualScale = scale * ratio;
            for (let j = 0; j < this.yNum; j++) {
                for (let i = 0; i < this.xNum; i++) {
                    let tile = this.tileAt(i, j);
                    let srcX = tile % PaletteElement.tileXNum * MainElement.tileWidth;
                    let srcY = ((tile / PaletteElement.tileXNum)|0) * MainElement.tileHeight;
                    let srcWidth = MainElement.tileWidth;
                    let srcHeight = MainElement.tileHeight;
                    let dstX = i * MainElement.tileWidth * actualScale + offsetX * ratio;
                    let dstY = j * MainElement.tileHeight * actualScale + offsetY * ratio;
                    let dstWidth = MainElement.tileWidth * actualScale;
                    let dstHeight = MainElement.tileHeight * actualScale;
                    context.drawImage(tileSetImage, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
                }
            }
            if (!grid) {
                return;
            }

            context.save();
            context.lineWidth = 2 * ratio;
            context.strokeStyle = 'rgba(0, 0, 0, 0.26)';

            context.beginPath();
            let minX = offsetX * ratio;
            let maxX = this.xNum * MainElement.tileWidth * actualScale + offsetX * ratio;
            let minY = offsetY * ratio;
            let maxY = this.yNum * MainElement.tileHeight * actualScale + offsetY * ratio;
            context.moveTo(minX, minY);
            context.lineTo(maxX, minY);
            context.lineTo(maxX, maxY);
            context.lineTo(minX, maxY);
            context.lineTo(minX, minY);
            context.closePath();
            context.clip();

            context.beginPath();
            for (let j = 0; j < this.yNum + 1; j++) {
                let y = j * MainElement.tileHeight * actualScale + offsetY * ratio;
                context.moveTo(minX, y);
                context.lineTo(maxX, y);
            }
            for (let i = 0; i < this.xNum + 1; i++) {
                let x = i * MainElement.tileWidth * actualScale + offsetX * ratio;
                context.moveTo(x, minY);
                context.lineTo(x, maxY);
            }
            context.closePath();
            context.stroke();
            context.restore();
        }
    }
}
