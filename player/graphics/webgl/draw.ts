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
        const INDICES_NUM = (2 << 16);
        const QUADS_MAX_NUM = (INDICES_NUM / 6)|0;

        var initialized = false;
        var programForTexture: ProgramForTexture;

        function initialize(gl: WebGLRenderingContext) {
            programForTexture = new ProgramForTexture(gl);

            // 16 [bytse] is an arbitrary number which seems enough to draw anything.
            // Fix this if necessary.
            const stride = 16;
            let b = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.bufferData(gl.ARRAY_BUFFER, 4*stride*QUADS_MAX_NUM, gl.DYNAMIC_DRAW);

            let indices = new Uint16Array(new ArrayBuffer(6 * QUADS_MAX_NUM * Uint16Array.BYTES_PER_ELEMENT));
            for (let i = 0; i < QUADS_MAX_NUM; i++) {
                indices[6*i+0] = 4*i + 0
                indices[6*i+1] = 4*i + 1
                indices[6*i+2] = 4*i + 2
                indices[6*i+3] = 4*i + 1
                indices[6*i+4] = 4*i + 2
                indices[6*i+5] = 4*i + 3
            }
            let indexBufferQuads = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferQuads);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        }

        function transpose(a: number[]): number[] {
            return [
                a[0], a[4], a[8],  a[12],
                a[1], a[5], a[9],  a[13],
                a[2], a[6], a[10], a[14],
                a[3], a[7], a[11], a[15],
            ];
        }

        let verticesBuffer = new ArrayBuffer(4 * 8 * QUADS_MAX_NUM * Int16Array.BYTES_PER_ELEMENT);

        export function drawTexture(
            gl: WebGLRenderingContext,
            texture: WebGLTexture,
            projectionMatrix: number[],
            quads: TextureQuad[],
            geoM: GeometryMatrix,
            colorM: ColorMatrix) {

            // NOTE: WebGL doesn't seem to have Check gl.MAX_ELEMENTS_VERTICES or
            // gl.MAX_ELEMENTS_INDICES so far.
            // Let's use them to compare to quads.length in the future.
            if (!initialized) {
                initialize(gl);
                initialized = true;
            }

            if (quads.length === 0) {
                return;
            }
            if (QUADS_MAX_NUM < quads.length) {
                throw `len(quads) must be equal to or less than ${QUADS_MAX_NUM}`
            }

            let f = programForTexture.use(transpose(projectionMatrix), texture, geoM, colorM);

            let vertices = new Int16Array(verticesBuffer);
            let num = 0
            for (let quad of quads) {
                let x0 = quad.vertexX0;
                let x1 = quad.vertexX1;
                let y0 = quad.vertexY0;
                let y1 = quad.vertexY1;
                let u0 = quad.textureU0;
                let u1 = quad.textureU1;
                let v0 = quad.textureV0;
                let v1 = quad.textureV1;
                if (x0 == x1 || y0 == y1 || u0 == u1 || v0 == v1) {
                    continue
                }
                let a = <any>[x0, y0, u0, v0,
                              x1, y0, u1, v0,
                              x0, y1, u0, v1,
                              x1, y1, u1, v1];
                vertices.set(a, num * 16);
                num++;
            }
            if (num === 0) {
                f();
                return;
            }

            gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices.subarray(0, num * 16));
            gl.drawElements(gl.TRIANGLES, num * 6, gl.UNSIGNED_SHORT, 0);
            f();
        }
    }
}
