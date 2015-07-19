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
        maps: {[key: string]: MapObject},
        mapIds: string[];
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
            let maps: {[key: string]: MapObject} = {};
            let mapIds: string[] = [];
            for (let id in this.maps_) {
                let map = this.maps_[id];
                maps[id] = map.toObject();
            }
            for (let id of this.mapIds_) {
                mapIds.push(id);
            }
            let obj: GameObject = {
                title: this.title_,
                maps: maps,
                mapIds: mapIds,
                script: this.script_,
            };
            return obj;
        }

        public fromObject(obj: GameObject): void {
            this.title_ = obj.title;
            this.maps_ = {};
            for (let id in obj.maps) {
                let map = new Map(0, 0);
                map.fromObject(obj.maps[id]);
                this.maps_[id] = map;
            }
            this.mapIds_ = [];
            for (let id of obj.mapIds) {
                this.mapIds_.push(id);
            }
            this.script_ = obj.script;
        }

        public appendMap(id: string, map: Map): void {
            this.maps_[id] = map;
            this.mapIds_.push(id);
        }

        public mapIdAt(i: number): string {
            return this.mapIds_[i];
        }

        public mapAt(id: string): Map {
            return this.maps_[id];
        }

        public get script(): string {
            return this.script_;
        }

        public set script(script: string) {
            this.script_ = script;
        }
    }
}
