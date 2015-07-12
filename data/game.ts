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
    export declare type GameObject = {
        title: string,
        maps: MapObject[],
        script: string,
    };

    export class Game {
        private title_: string;
        private maps_: Map[];
        private script_: string;

        constructor() {
            this.maps_ = [];
        }

        public toObject(): GameObject {
            let maps: MapObject[] = [];
            for (let map of this.maps_) {
                maps.push(map.toObject())
            }
            let obj: GameObject = {
                title: this.title_,
                maps: maps,
                script: this.script_,
            };
            return obj;
        }

        public fromObject(obj: GameObject): void {
            this.title_ = obj.title;
            for (let mapObj of obj.maps) {
                let map = new Map(0, 0);
                map.fromObject(mapObj)
                this.maps_.push(map);
            }
            this.script_ = obj.script;
        }

        public appendMap(map: Map): void {
            this.maps_.push(map);
        }

        public mapAt(i: number): Map {
            return this.maps_[i];
        }

        public set script(script: string) {
            this.script_ = script;
        }

        public run(): void {
            // Call 'eval' indirectly so that 'this' variable will be a global window.
            (0, eval)(this.script_);
        }
    }
}
