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

let $gameData: data.Game = null;
let $idToData: {[id: string]: any} = {};
let $images: Images = null;
let $regularFont: BitmapFont = null;
let $numberFont: BitmapFont = null;

class Images {
    private imgs_: {[id: string]: graphics.Image} = {};
    private imgsByName_: {[name: string]: graphics.Image} = {};

    public byId(id: string): graphics.Image {
        let game = $gameData;

        if (id in this.imgs_) {
            return this.imgs_[id];
        }
        let img = new Image();
        img.src = $idToData[id].data;
        return this.imgs_[id] = new graphics.Image(img);
    }

    // TODO: Deprecate this
    public byName(name: string): graphics.Image {
        let game = $gameData;

        if (name in this.imgsByName_) {
            return this.imgsByName_[name];
        }
        for (let image of game.images) {
            if (image.name === name) {
                let img = new Image();
                img.src = image.data;
                return this.imgsByName_[name] = new graphics.Image(img);
            }
        }
        return null;
    }
}

interface BitmapFont {
    textSize(str: string): {width: number, height: number};
    drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color);
}

class RegularFont {
    private static get TEXT_FULL_WIDTH(): number { return 12; }
    private static get TEXT_HALF_WIDTH(): number { return 6; }
    private static get TEXT_HEIGHT(): number { return data.GRID_SIZE; }

    private images_: {[key:string]: graphics.Image} = {};

    constructor(images: Images, game: data.Game) {
        for (let key of ['latin', 'bmp0', 'bmp2', 'bmp3', 'bmp4', 'bmp5', 'bmp6', 'bmp7', 'bmp8', 'bmp9', 'bmp15']) {
            this.images_[key] = images.byName('mplus_' + key);
        }
    }

    public textSize(str: string): {width: number, height: number} {
        let width = 0;
        let height = RegularFont.TEXT_HEIGHT;
        let currentWidth = 0;
        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                height += RegularFont.TEXT_HEIGHT;
                continue;
            }
            if (code <= 0xff) {
                currentWidth += RegularFont.TEXT_HALF_WIDTH; 
                width = Math.max(width, currentWidth);
                continue;
            }
            currentWidth += RegularFont.TEXT_FULL_WIDTH;
            width = Math.max(width, currentWidth);
        }
        return {width, height}
    }

    public drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color) {
        let cx = 0;
        let cy = 0;
        let size = this.textSize(str);
        let keyToImageParts: {[key: string]: graphics.ImagePart[]} = {};
        for (let key in this.images_) {
            keyToImageParts[key] = [];
        }

        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                cx = 0;
                cy += RegularFont.TEXT_HEIGHT;
                continue;
            }
            if (ch == ' ') {
                cx += RegularFont.TEXT_HALF_WIDTH;
                continue;
            }
            if (code <= 0xff) {
                let sx = (code % 32) * RegularFont.TEXT_HALF_WIDTH;
                let sy = ((code / 32)|0) * RegularFont.TEXT_HEIGHT;
                let w = RegularFont.TEXT_HALF_WIDTH;
                let h = RegularFont.TEXT_HEIGHT;
                keyToImageParts['latin'].push({
                    srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                    dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
                });
                cx += RegularFont.TEXT_HALF_WIDTH;
                continue;
            }
            if (0xffff < code) {
                cx += RegularFont.TEXT_FULL_WIDTH;
                continue;
            }
            let page = (code / 4096)|0;
            let key = `bmp${page}`;
            let sx = (code % 64) * RegularFont.TEXT_FULL_WIDTH;
            let sy = (((code % 4096) / 64)|0) * RegularFont.TEXT_HEIGHT;
            let w = RegularFont.TEXT_FULL_WIDTH;
            let h = RegularFont.TEXT_HEIGHT;
            keyToImageParts[key].push({
                srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
            });
            cx += RegularFont.TEXT_FULL_WIDTH;
        }
        let geoM = new graphics.GeometryMatrix();
        geoM.translate(x, y);
        let colorM = new graphics.ColorMatrix();
        colorM.scale(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
        for (let key in keyToImageParts) {
            let img = this.images_[key];
            screen.drawImage(img, {
                geoM:       geoM,
                colorM:     colorM,
                imageParts: keyToImageParts[key],
            });
        }
    }
}

// TODO: Rename
class NumberFont {
    private static get TEXT_WIDTH(): number { return 8; }
    private static get TEXT_HEIGHT(): number { return 8; }

    private image_: graphics.Image;

    constructor(images: Images, game: data.Game) {
        this.image_ = images.byId(game.system.numberFontImage);
    }

    public textSize(str: string): {width: number, height: number} {
        let width = 0;
        let height = NumberFont.TEXT_HEIGHT;
        let currentWidth = 0;
        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                height += NumberFont.TEXT_HEIGHT;
                continue;
            }
            if (code < 0x20) {
                continue
            }
            if (0x80 <= code) {
                continue;
            }
            currentWidth += NumberFont.TEXT_WIDTH;
            width = Math.max(width, currentWidth);
        }
        return {width, height}
    }

    public drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color) {
        let cx = 0;
        let cy = 0;
        let size = this.textSize(str);

        let dstCanvas = <HTMLCanvasElement>document.createElement('canvas');
        dstCanvas.width = size.width;
        dstCanvas.height = size.height;

        let imageParts = <graphics.ImagePart[]>[];
        for (let ch of str) {
            let code = <number>(<any>ch).codePointAt(0);
            if (ch == '\n') {
                cx = 0;
                cy += NumberFont.TEXT_HEIGHT;
                continue;
            }
            if (ch == ' ') {
                cx += NumberFont.TEXT_WIDTH;
                continue;
            }
            if (code < 0x20) {
                continue
            }
            if (0x80 <= code) {
                continue
            }
            let sx = (code % 16) * NumberFont.TEXT_WIDTH;
            let sy = (((code / 16)|0) - 2) * NumberFont.TEXT_HEIGHT;
            let w = NumberFont.TEXT_WIDTH;
            let h = NumberFont.TEXT_HEIGHT;
            imageParts.push({
                srcX: sx, srcY: sy, srcWidth: w, srcHeight: h,
                dstX: cx, dstY: cy, dstWidth: w, dstHeight: h,
            });
            cx += NumberFont.TEXT_WIDTH;
        }

        let geoM = new graphics.GeometryMatrix();
        geoM.translate(x, y);
        let colorM = new graphics.ColorMatrix();
        colorM.scale(color.r / 255, color.g / 255, color.b / 255, color.a / 255);
        screen.drawImage(this.image_, {geoM, colorM, imageParts});
    }
}

function runLoop(f: (CanvasRenderingContext2D) => void) {
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

window.addEventListener('load', () => {
    // TODO: Use this in game scripts
    const width = 320;
    const height = 240;

    let canvas = <HTMLCanvasElement>window.document.querySelector('canvas');
    canvas.width = width;
    canvas.height = height;
    graphics.Image.initialize(canvas);

    canvas.focus();
    window.addEventListener('message', (e) => {
        $gameData = <data.Game>e.data;
        for (let map of $gameData.maps) {
            $idToData[map.id] = map;
        }
        for (let actor of $gameData.actors) {
            $idToData[actor.id] = actor;
        }
        for (let image of $gameData.images) {
            $idToData[image.id] = image;
        }
        $idToData[data.NullImage.id] = data.NullImage;

        $images = new Images();
        $regularFont = new RegularFont($images, $gameData);
        $numberFont = new NumberFont($images, $gameData);

        let scriptFiles = [];
        scriptFiles.push({
            name:    'graphics.d.ts',
            content: typescript.declarations['graphics.d.ts'],
        });
        // TODO: Rename 'declarations'
        let keys = Object.keys(typescript.declarations);
        scriptFiles = scriptFiles.concat(keys.filter(k => {
            return !!k.match(/^data\//);
        }).map(k => {
            return {
                name:    k,
                content: <string>typescript.declarations[k],
            };
        }));
        scriptFiles.push({
            name: 'player.d.ts',
            content: `
            declare var $gameData: data.Game;
            declare var $idToData: {[id: string]: any};
            declare class Images {
                byId(id: string): graphics.Image;
                byName(name: string): graphics.Image;
            }
            declare var $images: Images;
            declare interface BitmapFont {
                textSize(str: string): {width: number, height: number};
                drawAt(screen: graphics.Image, str: string, x: number, y: number, color: graphics.Color);
            }
            declare var $regularFont: BitmapFont;
            declare var $numberFont: BitmapFont;
            declare function runLoop(f: (CanvasRenderingContext2D) => void);
            `,
        })
        scriptFiles = scriptFiles.concat($gameData.scripts.map(s => {
            return {
                name:    `game/${s.name}.ts`,
                content: s.content,
            };
        }));
        let jsScript = typescript.compile(scriptFiles);
        (<HTMLElement>document.querySelector('#nowLoading')).style.display = 'none';
        // Call 'eval' indirectly so that 'this' variable will be a global window.
        (0, eval)(jsScript);
    });
});
