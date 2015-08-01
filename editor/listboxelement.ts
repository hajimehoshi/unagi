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

    export class ListBoxElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-listbox-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let ul = <HTMLUListElement>shadowRoot.querySelector('ul.list');
            let self = <HTMLElement><any>this;
            self.addEventListener('contextmenu', (e: MouseEvent) => {
                e.preventDefault();
                let menu = <HTMLMenuElement>shadowRoot.querySelector('menu.context');
                menu.style.display = 'block';
                let rect = self.getBoundingClientRect();
                menu.style.left = (e.pageX - rect.left) + 'px';
                menu.style.top = (e.pageY - rect.top) + 'px';
            });
            // TODO: Want to close the menu on clicking anywhere.
            self.addEventListener('click', (e: MouseEvent) => {
                let menu = <HTMLMenuElement>shadowRoot.querySelector('menu.context');
                menu.style.display = 'none';
            });
            (<HTMLLIElement>shadowRoot.querySelector('#contextNew')).addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                Dispatcher.onAddingGameData(this.groupName);
            });
        }

        public get selectedIndex(): number {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let input = <Node>shadowRoot.querySelector('input:checked');
            let li = input;
            while (li && li.nodeName !== 'LI') {
                li = li.parentNode;
            }
            return [].indexOf.call(shadowRoot.querySelectorAll('ul.list li'), li);
        }

        public get groupName(): string {
            return (<HTMLElement><any>this).getAttribute('groupname');
        }

        public set groupName(groupName: string) {
            (<HTMLElement><any>this).setAttribute('groupname', groupName);
        }

        public get selectedId(): string {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let input = <HTMLInputElement>shadowRoot.querySelector('input:checked');
            if (!input) {
                return null;
            }
            return input.value;
        }

        private toItemTitle(item: ListBoxItem): string {
            if (item.title && item.title.trim() !== '') {
                return item.title;
            }
            return '(No Name)';
        }

        public replaceItems(items: ListBoxItem[]): void {
            // TODO: Fix implementation to update items that are only needed
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let ul = shadowRoot.querySelector('ul.list');
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
            let groupName = this.groupName;
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
                input.name = `selectedItem-${groupName}`;
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
                    (<HTMLElement><any>this).dispatchEvent(ce);
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
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let input = <HTMLInputElement>shadowRoot.querySelector(`input[value="${id}"]`);
            input.checked = true;
        }
    }
}

(() => {
    (<any>editor.ListBoxElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-listbox', editor.ListBoxElement);
})();
