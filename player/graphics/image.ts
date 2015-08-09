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
        private static gl_: WebGLRenderingContext;

        public static initialize(gl: WebGLRenderingContext) {
            Image.gl_ = gl;
        }

        private texture_: webgl.Texture;
        private framebuffer_: webgl.Framebuffer;

        constructor(width: number, height: number) {
            this.texture_ = new webgl.Texture(Image.gl_, width, height);
            this.framebuffer_ = new webgl.Framebuffer(Image.gl_, this.texture_);
            this.clear();
        }

        public get width(): number {
            return this.framebuffer_.width;
        }

        public get height(): number {
            return this.framebuffer_.height;
        }

        public clear(): void {
            this.fill({r: 0, g: 0, b: 0, a: 0});
        }

        public fill(color: Color): void {
            this.framebuffer_.fill(color)
        }

        public drawImage(image: Image, options?: {[key: string]: any}) {
            let geoM = new GeometryMatrix();
            let colorM = new ColorMatrix();
            let w = this.width;
            let h = this.height;
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
                quads.push(webgl.toTextureQuad(imagePart, this.width, this.height));
            }
            this.framebuffer_.drawTexture(this.texture_, quads, geoM, colorM);
        }
    }
}
