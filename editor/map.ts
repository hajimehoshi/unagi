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
    export class Map {
        private data_: data.Map;

        constructor(data: data.Map) {
            this.data_ = data;
        }

        public index(maps: data.Map[]): number {
            return maps.indexOf(this.data_);
        }

        public get id(): string {
            return this.data_.id;
        }

        public get name(): string {
            return this.data_.name;
        }

        public get xNum(): number {
            return this.data_.xNum;
        }

        public get yNum(): number {
            return this.data_.yNum;
        }

        public get events(): data.Event[] {
            return this.data_.events;
        }

        public tileAt(x: number, y: number): number {
            return this.data_.tiles[x + this.data_.xNum * y];
        }

        public tilePosition(x: number, y: number, scale: number): {x: number, y: number} {
            if (x < 0 || y < 0) {
                return {x: void(0), y: void(0)};
            }
            let tileX = (((x / data.gridSize)|0) / scale)|0;
            let tileY = (((y / data.gridSize)|0) / scale)|0;
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
                    this.data_.tiles[(x + i) + this.data_.xNum * (y + j)] = tile;
                }
            }
        }

        public renderAt(context: CanvasRenderingContext2D, tileSetImage: HTMLImageElement, scale: number, offsetX: number, offsetY: number, grid: boolean): void {
            for (let j = 0; j < this.yNum; j++) {
                for (let i = 0; i < this.xNum; i++) {
                    let tile = this.tileAt(i, j);
                    let srcX = tile % PaletteElement.tileXNum * data.gridSize;
                    let srcY = ((tile / PaletteElement.tileXNum)|0) * data.gridSize;
                    let srcWidth = data.gridSize;
                    let srcHeight = data.gridSize;
                    let dstX = i * data.gridSize * scale - offsetX;
                    let dstY = j * data.gridSize * scale - offsetY;
                    let dstWidth = data.gridSize * scale;
                    let dstHeight = data.gridSize * scale;
                    context.drawImage(tileSetImage, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
                }
            }
            if (!grid) {
                return;
            }

            context.save();
            context.lineWidth = 2;
            context.strokeStyle = 'rgba(0, 0, 0, 0.26)';

            context.beginPath();
            let minX = -offsetX;
            let maxX = this.xNum * data.gridSize * scale - offsetX;
            let minY = -offsetY;
            let maxY = this.yNum * data.gridSize * scale - offsetY;
            context.moveTo(minX, minY);
            context.lineTo(maxX, minY);
            context.lineTo(maxX, maxY);
            context.lineTo(minX, maxY);
            context.lineTo(minX, minY);
            context.closePath();
            context.clip();

            context.beginPath();
            for (let j = 0; j < this.yNum + 1; j++) {
                let y = j * data.gridSize * scale - offsetY;
                context.moveTo(minX, y);
                context.lineTo(maxX, y);
            }
            for (let i = 0; i < this.xNum + 1; i++) {
                let x = i * data.gridSize * scale - offsetX;
                context.moveTo(x, minY);
                context.lineTo(x, maxY);
            }
            context.closePath();
            context.stroke();
            context.restore();
        }

        public renderEventsAt(context: CanvasRenderingContext2D, images: data.Image[], scale: number, offsetX: number, offsetY: number, translucent: boolean): void {
            context.save();
            context.globalAlpha = translucent ? 0.5 : 1.0;
            context.lineWidth = 2;
            context.strokeStyle = '#f5f5f5';
            context.fillStyle = '#9e9e9e';
            for (let event of this.data_.events) {
                let x = event.x * data.gridSize * scale - offsetX;
                let y = event.y * data.gridSize * scale - offsetY;
                let width = data.gridSize * scale;
                let height = data.gridSize * scale;;
                context.strokeRect(x + 4, y + 4, width - 8, height - 8);
                context.fillRect(x + 5, y + 5, width - 10, height - 10);
                if (event.pages.length === 0) {
                    continue;
                }
                var imageId = event.pages[0].image;
                if (imageId === data.NullImage.id) {
                    continue;
                }
                let image = images.filter(i => i.id === imageId)[0];
                let img = new Image();
                img.src = image.data;
                let imgPartWidth = img.width / 3;
                let imgPartHeight = img.height / 4;
                let w = width - 10;
                let h = height - 10;
                let dx = x + 5;
                let dy = y + 5;
                let eventScale = PaletteElement.scale;
                let sx = (imgPartWidth - w / eventScale) / 2 + event.pages[0].imageX * imgPartWidth;
                let sy = (imgPartHeight - h / eventScale) / 2 + event.pages[0].imageY * imgPartHeight;
                context.drawImage(img, sx, sy, w / eventScale, h / scale, dx, dy, w, h);
            }
            context.globalAlpha = 1.0;
            context.restore();
        }

        public createEventIfNeeded(x: number, y: number): void {
            for (let event of this.data_.events) {
                if (event.x === x && event.y === y) {
                    return;
                }
            }
            this.data_.events.push({
                id:    data.UUID.generate(),
                x:     x,
                y:     y,
                pages: [{
                    image:    data.NullImage.id,
                    imageX:   1,
                    imageY:   2,
                    commands: [],
                }],
            });
        }

        public getEventAt(x: number, y: number): data.Event {
            for (let event of this.data_.events) {
                if (event.x === x && event.y === y) {
                    return event;
                }
            }
            return null;
        }
    }
}
