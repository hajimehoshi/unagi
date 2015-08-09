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
        // TODO: Check gl.getShaderPrecisionFormat
        const shaders = {
            'vertexModelView': `
uniform highp mat4 projection_matrix;
uniform highp mat4 modelview_matrix;
attribute highp vec2 vertex;
attribute highp vec2 tex_coord;
varying highp vec2 vertex_out_tex_coord;

void main(void) {
  vertex_out_tex_coord = tex_coord;
  gl_Position = projection_matrix * modelview_matrix * vec4(vertex, 0, 1);
}`,
            'fragmentTexture': `
uniform lowp sampler2D texture;
uniform lowp mat4 color_matrix;
uniform lowp vec4 color_matrix_translation;
varying highp vec2 vertex_out_tex_coord;

void main(void) {
  lowp vec4 color = texture2D(texture, vertex_out_tex_coord);

  if (color_matrix != mat4(1.0) || color_matrix_translation != vec4(0.0)) {
    // Un-premultiply alpha
    color.rgb /= color.a;
    // Apply the color matrix
    color = (color_matrix * color) + color_matrix_translation;
    color = clamp(color, 0.0, 1.0);
    // Premultiply alpha
    color.rgb *= color.a;
  }

  gl_FragColor = color;
}`,
        };

        function newShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
            let s = gl.createShader(type);
            if (s === null) {
                throw 'gl.createShader failed'
            }
            gl.shaderSource(s, source);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                let log = gl.getShaderInfoLog(s);
                throw `shader compile failed: ${log}`;
            }
            return s;
        }

        function areSameArrays(a: number[], b: number[]): boolean {
            if (a === null) {
                return b === null;
            }
            if (a.length !== b.length) {
                return false;
            }
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        }

        function copyArray(src: number[]): number[] {
            let dst = [];
            dst.length = src.length;
            for (let i = 0; i < dst.length; i++) {
                dst[i] = src[i];
            }
            return dst;
        }

        var lastProgram: any = null;

        interface ProgramFinisher {
            (): void;
        };

        export class ProgramForTexture {
            private gl_: WebGLRenderingContext;
            private locationCache_: LocationCache;
            private program_: WebGLProgram;

            private lastProjectionMatrix_: number[];
            private lastModelviewMatrix_: number[];
            private lastColorMatrix_: number[];
            private lastColorMatrixTranslation_: number[];

            constructor(gl: WebGLRenderingContext) {
                this.gl_ = gl;

                let shaderVertexModelviewNative = newShader(gl, gl.VERTEX_SHADER, shaders['vertexModelView']);
                let shaderFragmentTextureNative = newShader(gl, gl.FRAGMENT_SHADER, shaders['fragmentTexture']);
                let p = gl.createProgram();
                if (p === null) {
                    throw `gl.createProgram failed`;
                }
                gl.attachShader(p, shaderVertexModelviewNative);
                gl.attachShader(p, shaderFragmentTextureNative);
                gl.linkProgram(p);
                if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
                    throw `program error`;
                }
                this.program_ = p;
                gl.deleteShader(shaderFragmentTextureNative);
                gl.deleteShader(shaderVertexModelviewNative);

                this.locationCache_ = new LocationCache(gl, this.program_);

                this.resetStates();
            }

            private resetStates(): void {
                this.lastProjectionMatrix_ = null;
                this.lastModelviewMatrix_ = null;
                this.lastColorMatrix_ = null;
                this.lastColorMatrixTranslation_ = null;
            }

            public use(projectionMatrix: number[], texture: WebGLTexture, geoM: GeometryMatrix, colorM: ColorMatrix): ProgramFinisher {
                let gl = this.gl_;
                if (lastProgram !== this.program_) {
                    gl.useProgram(this.program_);
                    lastProgram = this.program_;
                    this.resetStates();
                }
                //gl.bindElementArrayBuffer(indexBufferQuads);
                
                if (!areSameArrays(this.lastProjectionMatrix_, projectionMatrix)) {
                    let location = this.locationCache_.getUniformLocation('projection_matrix');
                    gl.uniformMatrix4fv(location, false, projectionMatrix);
                    this.lastProjectionMatrix_ = copyArray(projectionMatrix);
                }

                let ma = geoM.at(0, 0);
                let mb = geoM.at(0, 1);
                let mc = geoM.at(1, 0);
                let md = geoM.at(1, 1);
                let tx = geoM.at(0, 2);
                let ty = geoM.at(1, 2);
                let modelviewMatrix = [
                    ma, mc, 0, 0,
                    mb, md, 0, 0,
                    0,  0,  1, 0,
                    tx, ty, 0, 1,
                ];
                if (!areSameArrays(this.lastModelviewMatrix_, modelviewMatrix)) {
                    let location = this.locationCache_.getUniformLocation('modelview_matrix');
                    gl.uniformMatrix4fv(location, false, modelviewMatrix);
                    this.lastModelviewMatrix_ = copyArray(modelviewMatrix);
                }
                gl.uniform1i(this.locationCache_.getUniformLocation('texture'), 0);

                let c = colorM;
                let colorMatrix = [
                    c.at(0, 0), c.at(1, 0), c.at(2, 0), c.at(3, 0),
                    c.at(0, 1), c.at(1, 1), c.at(2, 1), c.at(3, 1),
                    c.at(0, 2), c.at(1, 2), c.at(2, 2), c.at(3, 2),
                    c.at(0, 3), c.at(1, 3), c.at(2, 3), c.at(3, 3),
                ];
                if (!areSameArrays(this.lastColorMatrix_, colorMatrix)) {
                    let location = this.locationCache_.getUniformLocation('color_matrix');
                    gl.uniformMatrix4fv(location, false, colorMatrix);
                    this.lastColorMatrix_ = copyArray(colorMatrix);
                }

                let colorMatrixTranslation = [
                    c.at(0, 4), c.at(1, 4), c.at(2, 4), c.at(3, 4),
                ];
                if (!areSameArrays(this.lastColorMatrixTranslation_, colorMatrixTranslation)) {
                    let location = this.locationCache_.getUniformLocation('color_matrix_translation');
                    gl.uniform4fv(location, colorMatrixTranslation);
                    this.lastColorMatrixTranslation_ = copyArray(colorMatrixTranslation);
                }

                // We don't have to call gl.ActiveTexture here: GL_TEXTURE0 is
                // the default active texture.
                // See also: https://www.opengl.org/sdk/docs/man2/xhtml/glActiveTexture.xml
                gl.bindTexture(gl.TEXTURE_2D, texture);

                gl.enableVertexAttribArray(this.locationCache_.getAttribLocation('vertex'));
                gl.enableVertexAttribArray(this.locationCache_.getAttribLocation('tex_coord'));

                let int16Size = Int16Array.BYTES_PER_ELEMENT;
                gl.vertexAttribPointer(
                    this.locationCache_.getAttribLocation('vertex'),
                    2, gl.SHORT, false, int16Size*4, int16Size*0);
                gl.vertexAttribPointer(
                    this.locationCache_.getAttribLocation('tex_coord'),
                    2, gl.SHORT, true, int16Size*4, int16Size*2);

                return () => {
                    gl.disableVertexAttribArray(this.locationCache_.getAttribLocation('tex_coord'));
                    gl.disableVertexAttribArray(this.locationCache_.getAttribLocation('vertex'));
                };
            }
        }
    }
}
