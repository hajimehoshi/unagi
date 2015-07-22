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

module editor {
    export class MapListElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-maplist-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);
        }

        public update(currentMapId: string, maps: data.Map[]): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let ul = shadowRoot.querySelector('ul');
            while (ul.firstChild) {
                ul.removeChild(ul.firstChild);
            }
            for (let map of maps) {
                let li = document.createElement('li');
                let label = document.createElement('label');

                let input = document.createElement('input');
                input.type = 'radio';
                input.name = 'selectedMap';
                input.value = map.id;
                if (map.id === currentMapId) {
                    input.checked = true;
                }
                input.addEventListener('change', (e) => {
                    let input = <HTMLInputElement>e.target;
                    if (!input.checked) {
                        return;
                    }
                    Dispatcher.onCurrentMapChanged(input.value);
                });
                label.appendChild(input);

                let span = document.createElement('span');
                span.textContent = map.name;
                label.appendChild(span);

                li.appendChild(label);

                ul.appendChild(li);
            }
        }
    }
}

(() => {
    (<any>editor.MapListElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-maplist', editor.MapListElement);
})();
