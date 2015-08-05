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

namespace BitmapText {
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
            mplusImages[key] = context.getImageData(0, 0, canvas.width, canvas.height);
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

    const TEXT_FULL_WIDTH = 12;
    const TEXT_HALF_WIDTH = 6;
    const TEXT_HEIGHT = data.gridSize;

    function textSize(str: string): {width: number, height: number} {
        let width = 0;
        let height = TEXT_HEIGHT;
        let currentWidth = 0;
        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                height += TEXT_HEIGHT;
                continue;
            }
            if (code <= 0xff) {
                currentWidth += TEXT_HALF_WIDTH; 
                width = Math.max(width, currentWidth);
                continue;
            }
            currentWidth += TEXT_FULL_WIDTH;
            width = Math.max(width, currentWidth);
        }
        return {width, height}
    }

    export function drawAt(context: CanvasRenderingContext2D, str: string, x: number, y: number, r: number, g: number, b: number): void {
        context.save();

        let cx = 0;
        let cy = 0;
        let size = textSize(str);

        let dstCanvas = <HTMLCanvasElement>document.createElement('canvas');
        dstCanvas.width = size.width;
        dstCanvas.height = size.height;
        let dstContext = dstCanvas.getContext('2d');
        let dst = dstContext.getImageData(0, 0, size.width, size.height);

        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                cx = 0;
                cy += TEXT_HEIGHT;
                continue;
            }
            if (ch == ' ') {
                cx += TEXT_HALF_WIDTH;
                continue;
            }
            if (code <= 0xff) {
                let img = mplusImages['latin'];
                if (!img) {
                    cx += TEXT_HALF_WIDTH;
                    continue;
                }
                let sx = (code % 32) * TEXT_HALF_WIDTH;
                let sy = ((code / 32)|0) * TEXT_HEIGHT;
                drawBinaryBitmap(dst, img, cx, cy, TEXT_HALF_WIDTH, TEXT_HEIGHT, sx, sy, r, g, b);
                cx += TEXT_HALF_WIDTH;
                continue;
            }
            if (0xffff < code) {
                cx += TEXT_FULL_WIDTH;
                continue;
            }
            let page = (code / 4096)|0;
            let img = mplusImages[`bmp-${page}`];
            if (!img) {
                cx += TEXT_FULL_WIDTH;
                continue;
            }
            let sx = (code % 64) * TEXT_FULL_WIDTH;
            let sy = (((code % 4096) / 64)|0) * TEXT_HEIGHT;
            drawBinaryBitmap(dst, img, cx, cy, TEXT_FULL_WIDTH, TEXT_HEIGHT, sx, sy, r, g, b);
            cx += TEXT_FULL_WIDTH;
        }
        dstContext.putImageData(dst, 0, 0);
        context.drawImage(dstCanvas, x, y);
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
