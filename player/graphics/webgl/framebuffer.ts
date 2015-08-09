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
        function u(x: number, width: number): number {
            return ((1 << 15) * x / nextPowerOf2(width))|0;
        }

        function v(y: number, height: number): number {
            return ((1 << 15) * y / nextPowerOf2(height))|0;
        }

        export function toTextureQuad(parts: ImagePart, width: number, height: number): TextureQuad {
            let x0 = parts.srcX;
            let x1 = x0 + parts.srcWidth;
            let y0 = parts.srcY;
            let y1 = y0 + parts.srcHeight;
            return {
                textureU0: u(x0, width),
                textureU1: u(x1, width),
                textureV0: v(y0, height),
                textureV1: v(y1, height),
                vertexX0: parts.dstX,
                vertexX1: parts.dstX + parts.dstWidth,
                vertexY0: parts.dstY,
                vertexY1: parts.dstY + parts.dstHeight,
            };
        }

        export class Framebuffer {
            private static lastFramebuffer_: WebGLFramebuffer;

            private static bind(gl: WebGLRenderingContext, f: WebGLFramebuffer): void {
                if (Framebuffer.lastFramebuffer_ === f) {
                    return;
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, f);
                Framebuffer.lastFramebuffer_ = f;
            }

            private static orthoProjectionMatrix(left: number, right: number, bottom: number, top: number): number[] {
	        let e11 = 2 / (right-left);
	        let e22 = 2 / (top-bottom);
	        let e14 = -1 * (right+left) / (right-left);
	        let e24 = -1 * (top+bottom) / (top-bottom);

	        return [
		    e11, 0, 0, e14,
		    0, e22, 0, e24,
		    0, 0, 1, 0,
		    0, 0, 0, 1,
                ];
            }

            private gl_: WebGLRenderingContext;
            private native_: WebGLFramebuffer;
            private width_: number;
            private height_: number;
            private flipY_: boolean;
            private projectionMatrix_: number[];

            constructor(gl: WebGLRenderingContext, width: number, height: number);
            constructor(gl: WebGLRenderingContext, texture: Texture);
            constructor(gl: WebGLRenderingContext, arg1: any, arg2?: number) {
                this.gl_ = gl;
                if (typeof(arg2) !== 'number') {
                    let texture = <Texture>arg1;
                    this.width_ = texture.width;
                    this.height_ = texture.height;
                    this.flipY_ = false;

                    let f = gl.createFramebuffer();
                    Framebuffer.bind(gl, f);
	            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.native, 0)
	            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                        throw 'creating framebuffer failed'
	            }
                    this.native_ = f;
                    return;
                }

                let width = <number>arg1;
                let height = <number>arg2;
                this.native_ = 0;
                this.width_ = width;
                this.height_ = height;
                this.flipY_ = true;
            }

            public get width(): number {
                return this.width_;
            }

            public get height(): number {
                return this.height_;
            }

            public dispose(): void {
                if (this.native_ === 0) {
                    return;
                }
                let gl = this.gl_;
                gl.deleteFramebuffer(this.native_);
            }

            private setAsViewport(): void {
                let width = nextPowerOf2(this.width_);
                let height = nextPowerOf2(this.height_);
                let gl = this.gl_;
                Framebuffer.bind(gl, this.native_);
                gl.viewport(0, 0, width, height);
            }

            private get projectionMatrix(): number[] {
                if (this.projectionMatrix_) {
                    return this.projectionMatrix_;
                }
                let width = nextPowerOf2(this.width_);
                let height = nextPowerOf2(this.height_);
                let m = Framebuffer.orthoProjectionMatrix(0, width, 0, height);
                if (this.flipY_) {
                    m[5] *= -1;
                    m[7] += this.height_ / height * 2;
                }
                return this.projectionMatrix_ = Object.freeze(m);
            }

            public fill(color: Color): void {
                let gl = this.gl_;
                let r = color.r / 255;
                let g = color.g / 255;
                let b = color.b / 255;
                let a = color.a / 255;
                gl.clearColor(r, g, b, a);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }

            public drawTexture(texture: Texture, quads: TextureQuad[], geoM: GeometryMatrix, colorM: ColorMatrix) {
                this.setAsViewport();

                let proj = this.projectionMatrix;
                webgl.drawTexture(this.gl_, texture, proj, quads, geoM, colorM);
            }

            public get pixels(): Uint8Array {
                let width = nextPowerOf2(this.width_);
                let height = nextPowerOf2(this.height_);
                let gl = this.gl_;
                gl.flush();
                Framebuffer.bind(gl, this.native_);
                let pixels = new Uint8Array(4 * width * height);
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                let error = gl.getError();
                if (error != gl.NO_ERROR) {
                    throw `gl error: ${error}`;
                }
                return pixels;
            }
        }
    }
}

