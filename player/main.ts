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
    var imgs: {[id: string]: graphics.Image} = {};

    export function byId(game: data.Game, id: string): graphics.Image {
        if (id in imgs) {
            return imgs[id];
        }

        if (id === data.NullImage.id) {
            let image = data.NullImage;
            let img = new Image();
            img.src = image.data;
            return imgs[id] = new graphics.Image(img);
        }
        for (let image of game.images) {
            if (image.id === id) {
                let img = new Image();
                img.src = image.data;
                return imgs[id] = new graphics.Image(img);
            }
        }
        return null;
    }

    // TODO: Deprecate this
    var imgsByName: {[name: string]: graphics.Image} = {};

    export function byName(game: data.Game, name: string): graphics.Image {
        if (name in imgsByName) {
            return imgsByName[name];
        }
        for (let image of game.images) {
            if (image.name === name) {
                let img = new Image();
                img.src = image.data;
                return imgsByName[name] = new graphics.Image(img);
            }
        }
        return null;
    }
}

namespace BitmapFont {
    let mplusImages: {[key:string]: graphics.Image} = {};
    let mplusFontNames = ['latin', 'bmp-0', 'bmp-2', 'bmp-3', 'bmp-4', 'bmp-5', 'bmp-6', 'bmp-7', 'bmp-8', 'bmp-9', 'bmp-15'];
    let arcadeImage: graphics.Image;

    export function initialize(game: data.Game) {
        mplusFontNames.forEach((key) => {
            let img = new Image();
            img.src = './images/mplus-bitmap-images/' + key + '.png';
            img.onload = () => {
                mplusImages[key] = new graphics.Image(img);
            };
            // TODO: Wait until all images are loaded.
        });
        arcadeImage = Images.byId(game, game.system.numberFontImage);
    }

    export namespace Regular {
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

        export function drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color): void {
            let cx = 0;
            let cy = 0;
            let size = textSize(str);
            let keyToImageParts: {[key: string]: graphics.ImagePart[]} = {};
            for (let key in mplusImages) {
                keyToImageParts[key] = [];
            }

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
                    let sx = (code % 32) * TEXT_HALF_WIDTH;
                    let sy = ((code / 32)|0) * TEXT_HEIGHT;
                    let w = TEXT_HALF_WIDTH;
                    let h = TEXT_HEIGHT;
                    keyToImageParts['latin'].push({
                        srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                        dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
                    });
                    cx += TEXT_HALF_WIDTH;
                    continue;
                }
                if (0xffff < code) {
                    cx += TEXT_FULL_WIDTH;
                    continue;
                }
                let page = (code / 4096)|0;
                let key = `bmp-${page}`;
                let sx = (code % 64) * TEXT_FULL_WIDTH;
                let sy = (((code % 4096) / 64)|0) * TEXT_HEIGHT;
                let w = TEXT_FULL_WIDTH;
                let h = TEXT_HEIGHT;
                keyToImageParts[key].push({
                    srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                    dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
                });
                cx += TEXT_FULL_WIDTH;
            }
            let geoM = new graphics.GeometryMatrix();
            geoM.translate(x, y);
            let colorM = new graphics.ColorMatrix();
            colorM.scale(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
            for (let key in keyToImageParts) {
                let img = mplusImages[key];
                screen.drawImage(img, {
                    geoM:       geoM,
                    colorM:     colorM,
                    imageParts: keyToImageParts[key],
                });
            }
        }
    }

    // TODO: Rename
    export namespace Number {
        const TEXT_WIDTH = 8;
        const TEXT_HEIGHT = 8;

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
                if (code < 0x20) {
                    continue
                }
                if (0x80 <= code) {
                    continue;
                }
                currentWidth += TEXT_WIDTH;
                width = Math.max(width, currentWidth);
            }
            return {width, height}
        }

        export function drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color) {
            let cx = 0;
            let cy = 0;
            let size = textSize(str);

            let dstCanvas = <HTMLCanvasElement>document.createElement('canvas');
            dstCanvas.width = size.width;
            dstCanvas.height = size.height;

            let imageParts = <graphics.ImagePart[]>[];
            for (let ch of str) {
                let code = <number>(<any>ch).codePointAt(0);
                if (ch == '\n') {
                    cx = 0;
                    cy += TEXT_HEIGHT;
                    continue;
                }
                if (ch == ' ') {
                    cx += TEXT_WIDTH;
                    continue;
                }
                if (code < 0x20) {
                    continue
                }
                if (0x80 <= code) {
                    continue
                }
                let sx = (code % 16) * TEXT_WIDTH;
                let sy = (((code / 16)|0) - 2) * TEXT_HEIGHT;
                let w = TEXT_WIDTH;
                let h = TEXT_HEIGHT;
                imageParts.push({
                    srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                    dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
                });
                cx += TEXT_WIDTH;
            }

            let geoM = new graphics.GeometryMatrix();
            geoM.translate(x, y);
            let colorM = new graphics.ColorMatrix();
            colorM.scale(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
            screen.drawImage(arcadeImage, {geoM, colorM, imageParts});
        }
    }
}

class Env {
    public static run(f: (CanvasRenderingContext2D) => void): void {
        let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
        let offscreen = new graphics.Image(canvas.width, canvas.height);
        let defaultRenderTarget = graphics.Image.defaultRenderTarget;

        let loop = () => {
            offscreen.clear();
            f(offscreen);

            defaultRenderTarget.clear();
            defaultRenderTarget.drawImage(offscreen);

            window.requestAnimationFrame(loop);
        };
        loop();
    }
}

let $game: data.Game;

(() => {
    const width = 320;
    const height = 240;

    let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
    canvas.width = width;
    canvas.height = height;
    graphics.Image.initialize(canvas);

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
