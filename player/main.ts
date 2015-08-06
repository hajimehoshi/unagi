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

namespace Images {
    var imgs: {[id: string]: HTMLImageElement} = {};

    export function byId(game: data.Game, id: string): HTMLImageElement {
        if (id in imgs) {
            return imgs[id];
        }

        if (id === data.NullImage.id) {
            let image = data.NullImage;
            let img = new Image();
            img.src = image.data;
            imgs[id] = img;
            return img;
        }
        for (let image of game.images) {
            if (image.id === id) {
                let img = new Image();
                img.src = image.data;
                imgs[id] = img;
                return img;
            }
        }
        return null;
    }
}

namespace BitmapFont {
    let mplusImages: {[key:string]: HTMLImageElement} = {};
    let mplusFontNames = ['latin', 'bmp-0', 'bmp-2', 'bmp-3', 'bmp-4', 'bmp-5', 'bmp-6', 'bmp-7', 'bmp-8', 'bmp-9', 'bmp-15'];
    let arcadeImage: HTMLImageElement;

    export function initialize(game: data.Game) {
        mplusFontNames.forEach((key) => {
            let img = new Image();
            img.src = './images/mplus-bitmap-images/' + key + '.png';
            img.onload = () => {
                mplusImages[key] = img;
            };
            // TODO: Wait until all images are loaded.
        });
        arcadeImage = Images.byId(game, game.system.numberFontImage);
    }

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
        let dst = dstCanvas.getContext('2d');

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
                let w = TEXT_HALF_WIDTH;
                let h = TEXT_HEIGHT;
                dst.drawImage(img, sx, sy, w, h, cx, cy, w, h);
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
            let w = TEXT_FULL_WIDTH;
            let h = TEXT_HEIGHT;
            dst.drawImage(img, sx, sy, w, h, cx, cy, w, h);
            cx += TEXT_FULL_WIDTH;
        }
        dst.globalCompositeOperation = 'source-in';
        dst.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        dst.fillRect(0, 0, size.width, size.height);
        context.drawImage(dstCanvas, x, y);
        context.restore();
    }
}

class Env {
    public static run(f: (CanvasRenderingContext2D) => void): void {
        const width = 320;
        const height = 240;

        let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext('2d');
        (<any>context).imageSmoothingEnabled = false;

        let offscreenCanvas = <HTMLCanvasElement>document.createElement('canvas');
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        let offscreenContext = offscreenCanvas.getContext('2d');

        let loop = () => {
            offscreenContext.save();
            offscreenContext.clearRect(0, 0, width, height);
            f(offscreenContext);
            offscreenContext.restore();

            context.clearRect(0, 0, width, height);
            context.drawImage(offscreenCanvas, 0, 0, width, height);

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
        BitmapFont.initialize($game);

        let script = "";
        for (let s of game.scripts) {
            script += s.content;
        }
        // Call 'eval' indirectly so that 'this' variable will be a global window.
        (0, eval)(script);
    });
})();
