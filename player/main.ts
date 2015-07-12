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

declare type MapObject = {
    xNum: number,
    yNum: number,
};

class Map {
    private tiles_: number[]
    private xNum_: number;
    private yNum_: number;

    public fromObject(obj: MapObject): void {
        //this.tiles_ = json.tiles;
        this.xNum_ = obj.xNum;
        this.yNum_ = obj.yNum;
    }
}

declare type GameObject = {
    title: string,
    maps: MapObject[],
    script: string,
};

class Game {
    private title_: string;
    private maps_: Map[];
    private script_: string;

    constructor() {
        this.maps_ = [];
    }

    public fromObject(obj: GameObject): void {
        this.title_ = obj.title;
        for (let mapObj of obj.maps) {
            let map = new Map();
            map.fromObject(mapObj)
            this.maps_.push(map);
        }
        this.script_ = obj.script;
    }

    public run(): void {
        (0, eval)(this.script_);
    }
}

class GameMain {
    private static width_ = 320;
    private static height_ = 240;
    private static scale_ = 2;

    public static run(f: (CanvasRenderingContext2D) => void): void {
        let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
        canvas.width = GameMain.width_ * GameMain.scale_ * window.devicePixelRatio;
        canvas.height = GameMain.height_ * GameMain.scale_ * window.devicePixelRatio;
        let context = canvas.getContext('2d');
        (<any>context).imageSmoothingEnabled = false;

        let offscreenCanvas = <HTMLCanvasElement>document.createElement('canvas');
        offscreenCanvas.width = GameMain.width_;
        offscreenCanvas.height = GameMain.height_;

        let loop = () => {
            let offscreenContext = offscreenCanvas.getContext('2d');
            offscreenContext.clearRect(0, 0, GameMain.width_, GameMain.height_);
            f(offscreenContext);

            context.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);

            window.requestAnimationFrame(loop);
        };
        loop();
    }
}

(() => {
    window.addEventListener('message', (e) => {
        let game = new Game();
        game.fromObject(<GameObject>e.data);
        game.run();
    });
})();
