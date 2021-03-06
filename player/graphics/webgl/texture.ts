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
    export namespace webgl {
        export declare type TextureQuad = {
            textureU0: number;
            textureU1: number;
            textureV0: number;
            textureV1: number;
            vertexX0:  number;
            vertexX1:  number;
            vertexY0:  number;
            vertexY1:  number;
        };

        export function nextPowerOf2(x: number): number {
	    x = (x - 1)|0;
	    x |= (x >> 1);
	    x |= (x >> 2);
	    x |= (x >> 4);
	    x |= (x >> 8);
	    x |= (x >> 16);
	    return x + 1;
        }

        export class Texture {
            private static adjustImage(imageData: ImageData): ImageData {
                let width = nextPowerOf2(imageData.width);
                let height = nextPowerOf2(imageData.height);
                if (width === imageData.width && height === imageData.height) {
                    return imageData;
                }
                let canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                let context = canvas.getContext('2d');
                context.globalCompositeOperation = 'copy';
                context.putImageData(imageData, 0, 0);
                return context.getImageData(0, 0, width, height);
            }

            private gl_: WebGLRenderingContext;
            private native_: WebGLTexture;
            private width_: number;
            private height_: number;

            constructor(gl: WebGLRenderingContext, width: number, height: number);
            constructor(gl: WebGLRenderingContext, imageData: ImageData);
            constructor(gl: WebGLRenderingContext, arg1: any, arg2?: number) {
                this.gl_ = gl;
                let imageData = <ImageData>null;
                if (typeof(arg2) === 'number') {
                    this.width_ = <number>arg1;
                    this.height_ = <number>arg2;
                } else if (arg1 instanceof ImageData) {
                    imageData = <ImageData>arg1;
                    this.width_ = imageData.width;
                    this.height_ = imageData.height;
                    imageData = Texture.adjustImage(imageData);
                } else {
                    throw 'graphics.webgl.Texture.constructor: invalid arguments';
                }

                let t = gl.createTexture();
                if (!t) {
		    throw 'gl.createTexture failed';
	        }

	        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
	        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
	        gl.bindTexture(gl.TEXTURE_2D, t);

	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	        // TODO: Can we use glTexSubImage2D with linear filtering?

                let width = nextPowerOf2(this.width_);
                let height = nextPowerOf2(this.height_);

                let p = <Uint8Array>null;
                if (imageData) {
                    p = new Uint8Array(imageData.data);
                }
	        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, p);
                this.native_ = t;
            }

            public dispose(): void {
                let gl = this.gl_;
                gl.deleteTexture(this.native_);
            }

            public replacePixels(pixels: Uint8Array): void {
                let gl = this.gl_;
                let width = nextPowerOf2(this.width_);
                let height = nextPowerOf2(this.height_);
                gl.bindTexture(gl.TEXTURE_2D, this.native_);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            }

            public get native(): WebGLTexture {
                return this.native_;
            }

            public get width(): number {
                return this.width_;
            }

            public get height(): number {
                return this.height_;
            }
        }
    }
}
