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

declare namespace graphics {
    export type Color = {
        r: number,
        g: number,
        b: number,
        a: number
    }

    export type ImagePart = {
        srcX:      number;
        srcY:      number;
        srcWidth:  number;
        srcHeight: number;
        dstX:      number;
        dstY:      number;
        dstWidth:  number;
        dstHeight: number;
    }

    export class Image {
        constructor(width: number, height: number);
        constructor(imageData: ImageData);
        constructor(image: HTMLImageElement);
        constructor(canvas: HTMLCanvasElement);

        public width: number;
        public height: number;
        public clear();
        public fill(color: Color);
        public drawImage(image: Image, options?: {[key: string]: any});
        public at(i: number, j: number): Color;
    }

    export class GeometryMatrix {
        constructor(es?: number[]);

        public dim: number;
        public at(i: number, j: number): number;
        public setAt(i: number, j: number, e: number);
        public add(other: GeometryMatrix);
        public concat(other: GeometryMatrix);
        public scale(x: number, y: number);
        public translate(tx: number, ty: number);
        public rotate(theta: number);
    }

    export class ColorMatrix {
        static monochrome(): ColorMatrix;

        constructor(es?: number[]);

        public dim: number;
        public at(i: number, j: number): number;
        public setAt(i: number, j: number, e: number);
        public add(other: GeometryMatrix);
        public concat(other: GeometryMatrix);
        public scale(r: number, g: number, b: number, a: number);
        public translate(r: number, g: number, b: number, a: number);
    }
}
