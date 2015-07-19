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
        private maps_: {[key: string]: Map};
        private mapIds_: string[];
        private script_: string;

        constructor() {
            this.maps_ = {};
            this.mapIds_ = [];
        }

        public toObject(): GameObject {
            let maps: MapObject[] = [];
            for (let id of this.mapIds_) {
                let map = this.maps_[id];
                maps.push(map.toObject());
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
            this.maps_ = {};
            this.mapIds_ = [];
            for (let mapObj of obj.maps) {
                let id = mapObj.id;
                let map = new Map(id, 0, 0);
                map.fromObject(mapObj);
                this.maps_[id] = map;
                this.mapIds_.push(id);
            }
            this.script_ = obj.script;
        }

        public appendMap(map: Map): void {
            this.maps_[map.id] = map;
            this.mapIds_.push(map.id);
        }

        public mapIdAt(i: number): string {
            return this.mapIds_[i];
        }

        public mapAt(id: string): Map {
            return this.maps_[id];
        }

        public get maps(): Map[] {
            let maps: Map[] = [];
            for (let id of this.mapIds_) {
                maps.push(this.maps_[id]);
            }
            return maps;
        }

        public get script(): string {
            return this.script_;
        }

        public set script(script: string) {
            this.script_ = script;
        }
    }
}
