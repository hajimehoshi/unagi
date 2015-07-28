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
        }

        public replaceItems(items: ListBoxItem[]): void {
            // TODO: Fix implementation to update items that are only needed
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let ul = shadowRoot.querySelector('ul');
            while (ul.firstChild) {
                ul.removeChild(ul.firstChild);
            }
            for (let item of items) {
                let li = document.createElement('li');
                let label = document.createElement('label');

                let input = document.createElement('input');
                input.type = 'radio';
                input.name = 'selectedItem';
                input.value = item.id;
                input.addEventListener('change', (e) => {
                    let input = <HTMLInputElement>e.target;
                    if (!input.checked) {
                        return;
                    }
                    let ce = new CustomEvent('itemSelected', {
                        detail: {
                            id: input.value,
                        },
                    });
                    (<HTMLElement><any>this).dispatchEvent(ce);
                });
                label.appendChild(input);

                let span = document.createElement('span');
                span.textContent = item.title;
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
