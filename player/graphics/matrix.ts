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
    interface AffineMatrix {
        at(i, j: number): number;
        dim: number;
    }

    function add(lhs: AffineMatrix, rhs: AffineMatrix): number[] {
        let dim = lhs.dim;
        let result = <number[]>new Array(dim * (dim - 1));
        for (let i = 0; i < dim-1; i++) {
            for (let j = 0; j < dim; j++) {
                result[i * dim + j] = lhs.at(i, j) + rhs.at(i, j);
            }
        }
        return result;
    }

    function mul(lhs: AffineMatrix, rhs: AffineMatrix): number[] {
        let dim = lhs.dim;
        let result = <number[]>new Array(dim * (dim - 1));
        for (let i = 0; i < dim-1; i++) {
            for (let j = 0; j < dim; j++) {
                let e = 0;
                for (let k = 0; k < dim-1; k++) {
                    e += lhs.at(i, k) * rhs.at(k, j);
                }
                if (j === dim-1) {
                    e += lhs.at(i, j);
                }
                result[i * dim + j] = e;
            }
        }
        return result;
    }

    export class GeometryMatrix implements AffineMatrix {
        private es_: number[];

        constructor(es?: number[]) {
            this.es_ = [];
            this.es_.length = this.dim * (this.dim - 1);
            if (!es) {
                for (let i = 0; i < this.es_.length; i++) {
                    if (i === 0 || i === 4) {
                        this.es_[i] = 1;
                        continue;
                    }
                    this.es_[i] = 0;
                }
                return;
            }
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public get dim(): number {
            return 3;
        }

        public at(i: number, j: number): number {
            return this.es_[i * this.dim + j];
        }

        public setAt(i: number, j: number, e: number): void {
            this.es_[i * this.dim + j] = e;
        }

        public add(other: GeometryMatrix) {
            let es = add(this, other);
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public concat(other: GeometryMatrix) {
            let es = mul(this, other);
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public scale(x: number, y: number) {
            let dim = this.dim;
            for (let i = 0; i < dim; i++) {
                this.es_[0 * dim + i] *= x;
                this.es_[1 * dim + i] *= y;
            }
        }

        public translate(tx: number, ty: number) {
            let dim = this.dim;
            this.es_[0 * dim + 2] += tx;
            this.es_[1 * dim + 2] += ty;
        }

        public rotate(theta: number) {
            let sin = Math.sin(theta);
            let cos = Math.cos(theta);
            let r = new GeometryMatrix([
                cos, -sin, 0,
                sin, cos, 0,
            ]);
            this.concat(r);
        }
    }

    export class ColorMatrix implements AffineMatrix {
        public static monochrome(): ColorMatrix {
            const r = 6968.0 / 32768.0
            const g = 23434.0 / 32768.0
            const b = 2366.0 / 32768.0
            return new ColorMatrix([
                r, g, b, 0, 0,
                r, g, b, 0, 0,
                r, g, b, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }

        private es_: number[];

        constructor(es?: number[]) {
            this.es_ = [];
            this.es_.length = this.dim * (this.dim - 1);
            if (!es) {
                for (let i = 0; i < this.es_.length; i++) {
                    if (i === 0 || i === 6 || i === 12 || i === 18) {
                        this.es_[i] = 1;
                        continue;
                    }
                    this.es_[i] = 0;
                }
                return;
            }
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public get dim(): number {
            return 5;
        }

        public at(i: number, j: number): number {
            return this.es_[i * this.dim + j];
        }

        public setAt(i: number, j: number, e: number): void {
            this.es_[i * this.dim + j] = e;
        }

        public add(other: ColorMatrix) {
            let es = add(this, other);
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public concat(other: ColorMatrix) {
            let es = mul(this, other);
            for (let i = 0; i < this.es_.length; i++) {
                this.es_[i] = es[i];
            }
        }

        public scale(r: number, g: number, b: number, a: number) {
            let dim = this.dim;
            for (let i = 0; i < dim; i++) {
                this.es_[0 * dim + i] *= r;
                this.es_[1 * dim + i] *= g;
                this.es_[2 * dim + i] *= b;
                this.es_[3 * dim + i] *= a;
            }
        }

        public translate(r: number, g: number, b: number, a: number) {
            let dim = this.dim;
            this.es_[0 * dim + 4] += r;
            this.es_[1 * dim + 4] += g;
            this.es_[2 * dim + 4] += b;
            this.es_[3 * dim + 4] += a;
        }
    }
}
