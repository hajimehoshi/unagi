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

// TODO: Move to a WebWorker.

declare var ts: { executeCommandLine(args: string[]): void };

namespace mocks {
    export class FS {
        private static fileSystem_: {[filename: string]: string};

        public static get fileSystem(): {[filename: string]: string} {
            if (!FS.fileSystem_) {
                FS.initializeFileSystem();
            }
            return FS.fileSystem_;
        }

        public static initializeFileSystem(): void {
            FS.fileSystem_ = {
                'lib.d.ts': typescript.declarations['lib.d.ts'],
            };
        }

        public writeSync(fd: number, buffer: Buffer, offset: number, toWrite: number): number {
            if (offset !== 0) {
                throw 'offset must be 0';
            }
            if (toWrite !== buffer.length) {
                throw `toWrite must be ${buffer.length}`;
            }
            console.error(buffer.str);
            // Do nothing
            return buffer.length;
        }

        public existsSync(filename: string): boolean {
            if (filename === 'dummy.ts') {
                return true;
            }
            return filename in FS.fileSystem;
        }

        public readFileSync(filename: string): string {
            if (filename === 'dummy.ts') {
                return '';
            }
            if (!(filename in FS.fileSystem)) {
                throw `file ${filename} doesn\'t exist`
            }
            return FS.fileSystem[filename];
        }

        public writeFileSync(filename: string, data: string, encoding: string): void {
            if (encoding !== 'utf8') {
                throw 'encoding must be utf8';
            }
            if (filename === 'dummy.ts') {
                return;
            }
            FS.fileSystem[filename] = data;
        }

        public readdirSync(path: string) {
            throw 'not implemented';
        }

        public statSync(filename: string) {
            throw 'not implemented';
        }

        public watchFile(filename: string, options: Object, fileChanged: any) {
            throw 'not implemented';
        }

        public unwatchFile(filename: string, fileChanged: any) {
            throw 'not implemented';
        }
    }

    export class Path {
        public resolve(path: string): string {
            return path;
        }
    }

    export class OS {
        public platform(): string {
            return 'browser';
        }

        public get EOL(): string {
            return '\n';
        }
    }

    export class Process {
        public get argv(): string[] {
            // These arguments are passed to tsc at the first time.
            // Pass empty TS file not to output anything.
            return [void(0), void(0), 'dummy.ts'];
        }

        public cwd(): string {
            return '.';
        }

        public exit(code): void {
            // Do nothing
        }
    }
}

let require = (name: string): any => {
    if (name === 'fs') {
        return new mocks.FS();
    }
    if (name === 'path') {
        return new mocks.Path();
    }
    if (name === 'os') {
        return new mocks.OS();
    }
    throw `not implemented: ${name}`
};

let module = {
    exports: {},
};

let process = new mocks.Process();

let global = {
    gc: null,
};

let __filename = 'test'; // TODO: What is the correct name?

class Buffer {
    private str_: string;

    constructor(str, encoding) {
        this.str_ = str;
        if (encoding !== 'utf8') {
            throw 'encoding must be utf8';
        }
    }

    get str(): string {
        return this.str_;
    }

    get length(): number {
        let n = 0;
        for (let i = 0; i < this.str_.length; i++) {
            let code = this.str_.charCodeAt(i);
            if (code <= 0x7f) {
                n++;
                continue;
            }
            if (0x80 <= code && code <= 0x7ff) {
                n += 2;
                continue;
            }
            if (0x800 <= code && code <= 0xffff) {
                n += 3;
                continue;
            }
            if (0xD800 <= code && code <= 0xDBFF) {
                continue;
            }
            if (0xDC00 <= code && code <= 0xDFFF) {
                n += 4;
                continue;
            }
        }
        return n;
    }
}

namespace typescript {
    export function compile(files: {name: string, content: string}[]): string {
        let args = ['--out', '__out.js', '--target', 'ES5'];
        mocks.FS.initializeFileSystem();
        for (let file of files) {
            mocks.FS.fileSystem[file.name] = file.content;
            args.push(file.name);
        }
        ts.executeCommandLine(args);
        return mocks.FS.fileSystem['__out.js'];
    }
}
