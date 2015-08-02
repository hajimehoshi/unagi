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
    export class DatabaseContentElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-database-content-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let self = <HTMLElement><any>this;
            let content = shadowRoot.querySelector('div.content');
            while (self.firstChild) {
                content.appendChild(self.firstChild);
            }

            (<HTMLElement><any>this.list).setAttribute('groupname', this.groupName);
            self.addEventListener('selectedItemChanged', (e: CustomEvent) => {
                let id = <string>e.detail.id;
                Dispatcher.onCurrentActorChanged(id);
            });
            self.addEventListener('contextMenuNew', (e: CustomEvent) => {
                Dispatcher.onAddingGameData(this.groupName);
            });

            [].forEach.call(shadowRoot.querySelectorAll('input'), (e: HTMLInputElement) => {
                e.addEventListener('change', () => {
                    let value: any = e.value;
                    if (e.type === 'number') {
                        value = parseInt(value, 10);
                    }
                    let index = this.list.selectedIndex;
                    let path = `${this.groupName}[${index}].${e.name}`;
                    Dispatcher.onUpdatingGameData(path, value);
                });
            });

            [].forEach.call(shadowRoot.querySelectorAll('unagi-image-selector'), (e: HTMLElement) => {
                (<HTMLElement><any>e).addEventListener('change', () => {
                    let index = this.list.selectedIndex;
                    let name = e.getAttribute('name');
                    let imageId = e.getAttribute('imageid');
                    let path = `${this.groupName}[${index}].${name}`;
                    Dispatcher.onUpdatingGameData(path, imageId);
                });
            });
        }

        private get list(): ListBoxElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<ListBoxElement><any>shadowRoot.querySelector('unagi-listbox'));
        }

        private get groupName(): string {
            return (<HTMLElement><any>this).getAttribute('groupname');
        }

        private get inputs(): HTMLInputElement[] {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return [].slice.call(shadowRoot.querySelectorAll('input'));
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
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let content = shadowRoot.querySelector('div.content');
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
                let input = <HTMLInputElement>shadowRoot.querySelector(`input[name="${key}"]`)
                if (input) {
                    input.value = item[key];
                    continue;
                }
                let imageSelector = <HTMLElement>shadowRoot.querySelector(`unagi-image-selector[name="${key}"]`);
                if (imageSelector) {
                    imageSelector.setAttribute('imageid', item[key]);
                    continue
                }
            }

            let imageSelectors = shadowRoot.querySelectorAll(`unagi-image-selector`);
            [].forEach.call(imageSelectors, (imageSelector: ImageSelectorElement) => {
                imageSelector.render(game);
            });
        }
    }
}

(() => {
    (<any>editor.DatabaseContentElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-database-content', editor.DatabaseContentElement);
})();
