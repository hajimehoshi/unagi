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
    export class DatabaseContent {
        private element_: HTMLElement;

        constructor(element: HTMLElement) {
            this.element_ = element;

            (<HTMLElement><any>this.list).setAttribute('groupname', this.groupName);
            (<HTMLElement><any>this.list).addEventListener('selectedItemChanged', (e: CustomEvent) => {
                Store.instance.updateCurrentDataItem();
            });
            (<HTMLElement><any>this.list).addEventListener('contextMenuNew', (e: CustomEvent) => {
                Store.instance.addGameData(this.groupName);
            });

            [].forEach.call(this.element_.querySelectorAll('input'), (e: HTMLInputElement) => {
                e.addEventListener('change', () => {
                    let value: any = e.value;
                    if (e.type === 'number') {
                        value = parseInt(value, 10);
                    }
                    let index = this.list.selectedIndex;
                    let path = `${this.groupName}[${index}].${e.name}`;
                    Store.instance.updateGameData(path, value);
                });
            });
        }

        private get list(): ListBoxElement {
            return <ListBoxElement><any>this.element_.querySelector('unagi-listbox');
        }

        private get groupName(): string {
            return this.element_.dataset['groupName'];
        }

        private get inputs(): HTMLInputElement[] {
            return [].slice.call(this.element_.querySelectorAll('input'));
        }

        public currentItem(game: data.Game): any {
            let id = this.list.selectedId;
            for (let item of game[this.groupName]) {
                if (id === item.id) {
                    return item;
                }
            }
            return null;
        }

        public render(game: data.Game): void {
            this.list.replaceItems(game[this.groupName].map((item: {id: string, name: string}): ListBoxItem => {
                return {
                    title: item.name,
                    id:    item.id,
                };
            }));
            let id = this.list.selectedId;
            let content = this.element_.querySelector('div.content');
            if (!id) {
                content.classList.add('disabled');
                for (let input of this.inputs) {
                    input.value = null;
                }
                return;
            }
            content.classList.remove('disabled');

            let item = this.currentItem(game);
            for (let key in item) {
                let input = <HTMLInputElement>this.element_.querySelector(`input[name="${key}"]`);
                if (input) {
                    input.value = item[key];
                    continue;
                }
                let imageSelector = <ImageSelectorElement><any>this.element_.querySelector(`unagi-image-selector[name="${key}"]`);
                if (imageSelector) {
                    let index = this.list.selectedIndex;
                    imageSelector.path = `${this.groupName}[${index}].${key}`;
                    imageSelector.render(game, item[key], 0, 0);
                    continue;
                }
                let select = <HTMLSelectElement>this.element_.querySelector(`select[name="${key}"]`);
                if (select) {
                    select.value = data.ImageType[item[key]];
                    continue;
                }
                let img = <HTMLImageElement>this.element_.querySelector(`img[data-name="${key}"]`);
                if (img) {
                    img.src = item[key];
                    continue;
                }
            }
        }
    }
}
