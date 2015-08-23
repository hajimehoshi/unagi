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

namespace editor {
    export class Database {
        private element_: HTMLElement;
        private toolbar_: DatabaseToolbar;

        constructor(element: HTMLElement) {
            this.element_ = element;
            this.toolbar_ = new DatabaseToolbar(<HTMLElement>document.querySelector('#databaseToolbar'));
        }

        public toggle(show: boolean) {
            if (show) {
                this.element_.style.display = 'block';
            } else {
                this.element_.style.display = 'none';
            }
        }

        public render(game: data.Game): void {
            if (!game) {
                return;
            }
            [].forEach.call(this.element_.querySelectorAll('unagi-database-content'), (e: DatabaseContentElement) => {
                e.render(game);
            });
        }

        public updateMode(mode: DatabaseMode): void {
            let modeStr = DatabaseMode[mode].toLowerCase();
            this.toolbar_.updateMode(mode);
            [].forEach.call(this.element_.querySelectorAll('div.content > *'), (node: Node) => {
                let e = <HTMLElement>node;
                if (e.nodeName.toLowerCase() === "unagi-database-content" && e.getAttribute('groupname') === modeStr) {
                    e.style.display = 'block';
                } else {
                    e.style.display = 'none';
                }
            });
        }
    }
}
