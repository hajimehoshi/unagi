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
        export class LocationCache {
            private gl_: WebGLRenderingContext;
            private program_: WebGLProgram;
            private uniforms_: {[name: string]: WebGLUniformLocation} = {};
            private attribs_: {[name: string]: number} = {};

            constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
                this.gl_ = gl;
                this.program_ = program;
            }

            public getUniformLocation(location: string): WebGLUniformLocation {
                let gl = this.gl_;
                if (location in this.uniforms_) {
                    return this.uniforms_[location];
                }
                return this.uniforms_[location] = gl.getUniformLocation(this.program_, location);
            }

            public getAttribLocation(location: string): number {
                let gl = this.gl_;
                if (location in this.attribs_) {
                    return this.attribs_[location];
                }
                return this.attribs_[location] = gl.getAttribLocation(this.program_, location);
            }
        }
    }
}
