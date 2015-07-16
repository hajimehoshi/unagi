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

module data {
    export declare type MapObject = {
        tiles: Int16Array,
        xNum: number,
        yNum: number,
    };

    export class Map {
        private tiles_: Int16Array;
        private xNum_: number;
        private yNum_: number;

        constructor(xNum: number, yNum: number) {
            this.xNum_ = xNum;
            this.yNum_ = yNum;
            this.tiles_ = new Int16Array(xNum * yNum);
        }

        public toObject(): MapObject {
            return {
                tiles: this.tiles_,
                xNum: this.xNum_,
                yNum: this.yNum_,
            };
        }

        public fromObject(obj: MapObject): void {
            this.tiles_ = obj.tiles;
            this.xNum_ = obj.xNum;
            this.yNum_ = obj.yNum;
        }

        public get xNum(): number {
            return this.xNum_;
        }

        public get yNum(): number {
            return this.yNum_;
        }

        public tileAt(x: number, y: number): number {
            return this.tiles_[x + y * this.xNum_];
        }

        public setTileAt(tile: number, x: number, y: number): void {
            this.tiles_[x + y * this.xNum_] = tile;
        }
    }
}
