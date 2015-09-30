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
    export declare type ListBoxItem = {
        title: string,
        id:    string,
    }

    export class ListBox {
        private element_: HTMLElement;
        private namePostfix_: string;

        constructor(element: HTMLElement) {
            this.element_ = element;
            this.namePostfix_ = data.UUID.generate();

            let template = <HTMLTemplateElement>document.getElementById('listbox-template');
            let fragment = <DocumentFragment>document.importNode(template.content, true);
            while (fragment.hasChildNodes()) {
                this.element_.appendChild(fragment.firstChild);
            }

            let ul = <HTMLUListElement>this.element_.querySelector('ul');
            this.element_.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
                if (this.element_.getAttribute('contextmenu') === 'none') {
                    return;
                }
                let menu = <HTMLMenuElement>this.element_.querySelector('menu.context');
                menu.style.display = 'block';
                let rect = this.element_.getBoundingClientRect();
                menu.style.left = (e.pageX - rect.left) + 'px';
                menu.style.top = (e.pageY - rect.top) + 'px';
            });
            // TODO: Want to close the menu on clicking anywhere.
            this.element_.addEventListener('click', (e: MouseEvent) => {
                let menu = <HTMLMenuElement>this.element_.querySelector('menu.context');
                menu.style.display = 'none';
            });
            (<HTMLLIElement>this.element_.querySelector('#contextNew')).addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                let ce = new CustomEvent('contextMenuNew');
                this.element_.dispatchEvent(ce);
            });
        }

        public get selectedIndex(): number {
            let input = <Node>this.element_.querySelector('input:checked');
            let li = input;
            while (li && li.nodeName !== 'LI') {
                li = li.parentNode;
            }
            return [].indexOf.call(this.element_.querySelectorAll('ul li'), li);
        }

        public get selectedId(): string {
            let input = <HTMLInputElement>this.element_.querySelector('input:checked');
            if (!input) {
                return null;
            }
            return input.value;
        }

        public set selectedId(id: string) {
            let li = this.element_.querySelector(`li[data-id="${id}"]`);
            let input = <HTMLInputElement>li.querySelector('input');
            input.checked = true;
        }

        private toItemTitle(item: ListBoxItem): string {
            if (item.title && item.title.trim() !== '') {
                return item.title;
            }
            return '(No Name)';
        }

        public replaceItems(items: ListBoxItem[]): void {
            // TODO: Fix implementation to update items that are only needed
            let ul = this.element_.querySelector('ul');
            let idToLi: {[id: string]: HTMLLIElement} = {};
            while (ul.firstChild) {
                if (ul.firstChild.nodeType !== Node.ELEMENT_NODE) {
                    ul.removeChild(ul.firstChild);
                    continue;
                }
                let li = <HTMLLIElement>ul.firstChild;
                let id = li.dataset['id'];
                idToLi[id] = li;
                ul.removeChild(li);
            }
            for (let item of items) {
                let li = idToLi[item.id];
                if (li) {
                    let span = li.querySelector('span');
                    span.textContent = this.toItemTitle(item);
                    ul.appendChild(li);
                    continue;
                }
                li = document.createElement('li');
                li.dataset['id'] = item.id;
                let label = document.createElement('label');

                let input = document.createElement('input');
                input.type = 'radio';
                input.name = `selectedItem-${this.namePostfix_}`;
                input.value = item.id;
                input.addEventListener('change', (e) => {
                    let input = <HTMLInputElement>e.target;
                    if (!input.checked) {
                        return;
                    }
                    let ce = new CustomEvent('selectedItemChanged', {
                        detail: {
                            id: input.value,
                        },
                    });
                    this.element_.dispatchEvent(ce);
                });
                label.appendChild(input);

                let span = document.createElement('span');
                span.textContent = this.toItemTitle(item);
                label.appendChild(span);

                li.appendChild(label);

                ul.appendChild(li);
            }
        }

        public select(id: string): void {
            // TODO: Check id's syntax
            let input = <HTMLInputElement>this.element_.querySelector(`input[value="${id}"]`);
            input.checked = true;
        }
    }
}
