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

namespace graphics {
    export declare type Color = {
        r: number,
        g: number,
        b: number,
        a: number
    };

    export declare type ImagePart = {
        srcX:      number;
        srcY:      number;
        srcWidth:  number;
        srcHeight: number;
        dstX:      number;
        dstY:      number;
        dstWidth:  number;
        dstHeight: number;
    };

    export class Image {
        private static canvas_: HTMLCanvasElement;
        private static gl_: WebGLRenderingContext;
        private static defaultRenderTarget_: Image;

        public static initialize(canvas: HTMLCanvasElement) {
            Image.canvas_ = canvas;
            Image.gl_ = <WebGLRenderingContext>Image.canvas_.getContext('webgl', {
                'alpha':              true,
                'premultipliedAlpha': true,
            });
            let gl = Image.gl_;
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        }

        public static get defaultRenderTarget(): Image {
            if (Image.defaultRenderTarget_) {
                return Image.defaultRenderTarget_;
            }
            let framebuffer = new webgl.Framebuffer(Image.gl_, Image.canvas_.width, Image.canvas_.height);
            return Image.defaultRenderTarget_ = new Image(framebuffer);
        }

        private texture_: webgl.Texture;
        private framebuffer_: webgl.Framebuffer;
        private pixels_: Uint8Array;

        constructor(width: number, height: number);
        constructor(imageData: ImageData);
        constructor(image: HTMLImageElement);
        constructor(canvas: HTMLCanvasElement);
        constructor(framebuffer: webgl.Framebuffer);
        constructor(arg1: any, arg2?: number) {
            this.pixels_ = null;
            if (typeof(arg1) === 'number' && typeof(arg2) === 'number') {
                let width = <number>arg1;
                let height = <number>arg2;
                this.texture_ = new webgl.Texture(Image.gl_, width, height);
                this.framebuffer_ = new webgl.Framebuffer(Image.gl_, this.texture_);
                this.clear();
                return;
            }
            if ((arg1 instanceof ImageData) && typeof(arg2) === 'undefined') {
                let imageData = <ImageData>arg1;
                this.texture_ = new webgl.Texture(Image.gl_, imageData);
                this.framebuffer_ = new webgl.Framebuffer(Image.gl_, this.texture_);
                return;
            }
            if ((arg1 instanceof HTMLImageElement) && typeof(arg2) === 'undefined') {
                let img = <HTMLImageElement>arg1;
                let canvas = <HTMLCanvasElement>document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                canvas.width = width;
                canvas.height = height;
                let context = canvas.getContext('2d');
                context.globalCompositeOperation = 'copy';
                context.drawImage(img, 0, 0);
                let imageData = context.getImageData(0, 0, width, height);
                this.texture_ = new webgl.Texture(Image.gl_, imageData);
                this.framebuffer_ = new webgl.Framebuffer(Image.gl_, this.texture_);
                return;
            }
            if ((arg1 instanceof HTMLCanvasElement) && typeof(arg2) === 'undefined') {
                let canvas = <HTMLCanvasElement>arg1;
                let context = canvas.getContext('2d');
                let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                this.texture_ = new webgl.Texture(Image.gl_, imageData);
                this.framebuffer_ = new webgl.Framebuffer(Image.gl_, this.texture_);
                return;
            }
            if ((arg1 instanceof <any>webgl.Framebuffer) && typeof(arg2) === 'undefined') {
                this.texture_ = null;
                this.framebuffer_ = arg1;
                return;
            }
            throw 'graphics.Image.constructor: invalid argments';
        }

        public get width(): number {
            return this.framebuffer_.width;
        }

        public get height(): number {
            return this.framebuffer_.height;
        }

        public clear(): void {
            this.pixels_ = null;
            this.fill({r: 0, g: 0, b: 0, a: 0});
        }

        public fill(color: Color): void {
            this.pixels_ = null;
            this.framebuffer_.fill(color)
        }

        // TODO: Define type of options type
        public drawImage(image: Image, options?: {[key: string]: any}) {
            this.pixels_ = null;
            let geoM = new GeometryMatrix();
            let colorM = new ColorMatrix();
            let w = image.width;
            let h = image.height;
            let imageParts = [
                {
                    srcX:      0,
                    srcY:      0,
                    srcWidth:  w,
                    srcHeight: h,
                    dstX:      0,
                    dstY:      0,
                    dstWidth:  w,
                    dstHeight: h,
                },
            ];
            if (options) {
                if ('geoM' in options) {
                    geoM = <GeometryMatrix>options['geoM'];
                }
                if ('colorM' in options) {
                    colorM = <ColorMatrix>options['colorM'];
                }
                if ('imageParts' in options) {
                    imageParts = <ImagePart[]>options['imageParts'];
                }
            }
            let quads = <webgl.TextureQuad[]>[];
            for (let imagePart of imageParts) {
                quads.push(webgl.toTextureQuad(imagePart, image.width, image.height));
            }
            this.framebuffer_.drawTexture(image.texture_, quads, geoM, colorM);
        }

        public at(i: number, j: number): Color {
            if (this.pixels_ === null) {
                this.pixels_ = this.framebuffer_.pixels;
            }
            let width = webgl.nextPowerOf2(this.width);
            let idx = (4 * j * width) + 4 * i;
            return {
                r: this.pixels_[idx],
                g: this.pixels_[idx+1],
                b: this.pixels_[idx+2],
                a: this.pixels_[idx+3],
            };
        }
    }
}
