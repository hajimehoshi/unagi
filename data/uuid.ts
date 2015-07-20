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

module data {
    export class UUID {
        private static rand16(): number[] {
            let a = new Uint8Array(16);
            crypto.getRandomValues(a);
            let r = [];
            for (let i = 0; i < a.length; i++) {
                r[2*i] = a[i] & 0x0f;
                r[2*i+1] = a[i] >> 4;
            }
            return r;
        }

        public static generate(): string {
            let rand = UUID.rand16();
            let i = 0;
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string): string => {
                let r = rand[i];
                i++;
                if (c === 'y') {
                    r = r & 0x3 | 0x8;
                }
                return r.toString(16);
            });
        }
    }
}
