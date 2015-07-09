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
        private tiles_: Int32Array;
        private xNum_: number;
        private yNum_: number;

        constructor(xNum: number, yNum: number) {
            this.xNum_ = xNum;
            this.yNum_ = yNum;
            this.tiles_ = new Int32Array(xNum * yNum);
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

        public tilePosition(x: number, y: number, scale: number): {x: number, y: number} {
            let tileX = (((x / Main.tileWidth)|0) / scale)|0;
            let tileY = (((y / Main.tileHeight)|0) / scale)|0;
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
                    if (this.xNum_ <= x + i) {
                        continue;
                    }
                    if (this.yNum_ <= y + j) {
                        continue;
                    }
                    this.tiles_[(x + i) + (y + j) * this.xNum_] = tile;
                }
            }
        }

        public renderAt(context: CanvasRenderingContext2D, tileSetImage: HTMLImageElement, scale: number, offsetX: number, offsetY: number): void {
            const ratio = window.devicePixelRatio;
            const actualScale = scale * ratio;
            for (let j = 0; j < this.yNum_; j++) {
                for (let i = 0; i < this.xNum_; i++) {
                    let tile = this.tiles_[i + j * this.xNum_];
                    let srcX = tile % Palette.tileXNum * Main.tileWidth;
                    let srcY = ((tile / Palette.tileXNum)|0) * Main.tileHeight;
                    let srcWidth = Main.tileWidth;
                    let srcHeight = Main.tileHeight;
                    let dstX = i * Main.tileWidth * actualScale + offsetX * ratio;
                    let dstY = j * Main.tileHeight * actualScale + offsetY * ratio;
                    let dstWidth = Main.tileWidth * actualScale;
                    let dstHeight = Main.tileHeight * actualScale;
                    context.drawImage(tileSetImage, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
                }
            }
        }
    }
}
