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
        let game = new data.Game();
        game.fromObject(<data.GameObject>e.data);
        game.run();
    });
})();
