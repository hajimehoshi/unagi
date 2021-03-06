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
        private contents_: DatabaseContent[];

        constructor(element: HTMLElement) {
            this.element_ = element;
            this.toolbar_ = new DatabaseToolbar(<HTMLElement>document.querySelector('#databaseToolbar'));
            this.contents_ = [].map.call(document.querySelectorAll('.databaseContent'), e => {
                return new DatabaseContent(<HTMLElement>e);
            });
        }

        public render(game: data.Game, info: RenderInfo): void {
            if (info.editingMode === EditingMode.Database) {
                this.element_.style.display = 'block';
            } else {
                this.element_.style.display = 'none';
                return;
            }

            let modeStr = DatabaseMode[info.databaseMode].toLowerCase();
            this.toolbar_.updateMode(info.databaseMode);
            [].forEach.call(this.element_.querySelectorAll('div.databaseContent'), (node: Node) => {
                let e = <HTMLElement>node;
                if (e.dataset['groupName'] === modeStr) {
                    e.style.display = 'block';
                } else {
                    e.style.display = 'none';
                }
            });

            if (!game) {
                return;
            }
            for (let content of this.contents_) {
                content.render(game);
            }
        }
    }
}
