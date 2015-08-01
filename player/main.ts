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

// TODO: namespace name?
namespace util {
    let mplusImages: {[key:string]: ImageData} = {};

    let mplusFontNames = ['latin', 'bmp-0', 'bmp-2', 'bmp-3', 'bmp-4', 'bmp-5', 'bmp-6', 'bmp-7', 'bmp-8', 'bmp-9', 'bmp-15'];
    mplusFontNames.forEach((key) => {
        let img = new Image();
        img.src = './images/mplus-bitmap-images/' + key + '.png';
        img.onload = () => {
            let canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            let context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            mplusImages[key] = context.getImageData(0, 0, img.width, img.height);
        };
        // TODO: Wait until all images are loaded.
    });

    function drawBinaryBitmap(dst: ImageData, src: ImageData, dstX: number, dstY: number, width: number, height: number, srcX: number, srcY: number, r: number, g: number, b: number) {
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let srcP = ((srcY + j) * src.width + (srcX + i)) * 4;
                if (src.data[srcP + 3]) {
                    let dstP = ((dstY + j) * dst.width + (dstX + i)) * 4;
                    dst.data[dstP]     = r;
                    dst.data[dstP + 1] = g;
                    dst.data[dstP + 2] = b;
                    dst.data[dstP + 3] = 255;
                }
            }
        }
    }

    export function drawBitmapTextAt(context: CanvasRenderingContext2D, str: string, x: number, y: number, r: number, g: number, b: number): void {
        context.save();

        const fullWidth = 12;
        const halfWidth = 6;
        const height = data.gridSize;
        let cx = x;
        let cy = y;
        let dst = context.getImageData(0, 0, 320, 240);
        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                cx = x;
                cy += height;
                continue;
            }
            if (ch == ' ') {
                cx += halfWidth;
                continue;
            }
            if (code <= 0xff) {
                let img = mplusImages['latin'];
                if (!img) {
                    cx += halfWidth;
                    continue;
                }
                let sx = (code % 32) * halfWidth;
                let sy = ((code / 32)|0) * height;
                drawBinaryBitmap(dst, img, cx, cy, halfWidth, height, sx, sy, r, g, b);
                cx += halfWidth;
                continue;
            }
            if (0xffff < code) {
                cx += fullWidth;
                continue;
            }
            let page = (code / 4096)|0;
            let img = mplusImages[`bmp-${page}`];
            if (!img) {
                cx += fullWidth;
                continue;
            }
            let sx = (code % 64) * fullWidth;
            let sy = (((code % 4096) / 64)|0) * height;
            drawBinaryBitmap(dst, img, cx, cy, fullWidth, height, sx, sy, r, g, b);
            cx += fullWidth;
        }
        context.putImageData(dst, 0, 0);
        context.restore();
    }
}

class Env {
    public static run(f: (CanvasRenderingContext2D) => void): void {
        const width = 320;
        const height = 240;
        const scale = 2;

        let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
        canvas.width = width * scale * window.devicePixelRatio;
        canvas.height = height * scale * window.devicePixelRatio;
        let context = canvas.getContext('2d');
        (<any>context).imageSmoothingEnabled = false;

        let offscreenCanvas = <HTMLCanvasElement>document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;

        let loop = () => {
            let offscreenContext = offscreenCanvas.getContext('2d');
            offscreenContext.save();
            offscreenContext.clearRect(0, 0, width, height);
            f(offscreenContext);
            offscreenContext.restore();

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);

            window.requestAnimationFrame(loop);
        };
        loop();
    }
}

let $game: data.Game;

(() => {
    let canvas = document.body.querySelector('canvas');
    (<HTMLElement>canvas).focus();
    window.addEventListener('message', (e) => {
        let game = <data.Game>e.data;
        $game = game;

        let script = "";
        for (let s of game.scripts) {
            script += s.content;
        }
        // Call 'eval' indirectly so that 'this' variable will be a global window.
        (0, eval)(script);
    });
})();
