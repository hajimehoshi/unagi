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
        private list_: ListBox;

        constructor(element: HTMLElement) {
            this.element_ = element;

            let listElement = <HTMLElement>this.element_.querySelector('.listBox');
            this.list_ = new ListBox(listElement);
            listElement.addEventListener('selectedItemChanged', (e: CustomEvent) => {
                Store.instance.updateCurrentDataItem();
            });
            listElement.addEventListener('contextMenuNew', (e: CustomEvent) => {
                Store.instance.addGameData(this.groupName);
            });

            let editor = this.element_.querySelector('.databaseEditor');
            [].forEach.call(editor.querySelectorAll('input, select'), (e: HTMLElement) => {
                e.addEventListener('change', () => {
                    let value: any = (<any>e).value;
                    if (e instanceof HTMLInputElement && e.type === 'number') {
                        value = parseInt(value, 10);
                    }
                    let index = this.list_.selectedIndex;
                    let path = `${this.groupName}[${index}].${(<any>e).name}`;
                    Store.instance.updateGameData(path, value);
                });
            });
        }

        private get groupName(): string {
            return this.element_.dataset['groupName'];
        }

        private get inputs(): HTMLInputElement[] {
            return [].slice.call(this.element_.querySelectorAll('.databaseEditor input'));
        }

        private listBoxItems(game: data.Game): ListBoxItem[] {
            return game[this.groupName].map((item: {id: string, name: string}): ListBoxItem => {
                return {
                    title: item.name,
                    id:    item.id,
                };
            })
        }

        private currentItem(game: data.Game): any {
            let index = this.list_.selectedIndex;
            if (index === -1) {
                return null;
            }
            let id = this.listBoxItems(game)[index].id;
            for (let item of game[this.groupName]) {
                if (id === item.id) {
                    return item;
                }
            }
            return null;
        }

        public render(game: data.Game): void {
            this.list_.replaceItems(this.listBoxItems(game));
            let item = this.currentItem(game);
            let editor = this.element_.querySelector('.databaseEditor');
            if (!item) {
                editor.classList.add('disabled');
                for (let input of this.inputs) {
                    input.value = null;
                }
                return;
            }
            editor.classList.remove('disabled');

            for (let key in item) {
                let input = <HTMLInputElement>this.element_.querySelector(`.databaseEditor input[name="${key}"]`);
                if (input) {
                    input.value = item[key];
                    continue;
                }
                let imageSelector = <ImageSelectorElement><any>this.element_.querySelector(`unagi-image-selector[name="${key}"]`);
                if (imageSelector) {
                    let index = this.list_.selectedIndex;
                    imageSelector.path = `${this.groupName}[${index}].${key}`;
                    imageSelector.render(game, item[key], 0, 0);
                    continue;
                }
                let select = <HTMLSelectElement>this.element_.querySelector(`.databaseEditor select[name="${key}"]`);
                if (select) {
                    select.value = item[key];
                    continue;
                }
                let img = <HTMLImageElement>this.element_.querySelector(`.databaseEditor img[data-name="${key}"]`);
                if (img) {
                    img.src = item[key];
                    continue;
                }
            }
        }
    }
}
