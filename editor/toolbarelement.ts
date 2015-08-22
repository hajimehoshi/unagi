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
    export class ToolbarElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-toolbar-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-toolbar-style-template');
            let styleClone = document.importNode(styleTemplate.content, true);
            shadowRoot.appendChild(styleClone);

            shadowRoot.querySelector('#play').addEventListener('click', (e: MouseEvent) => {
                if ((<HTMLElement>e.target).getAttribute('disabled')) {
                    return;
                }
                Store.instance.playGame();
            });
            shadowRoot.querySelector('#stop').addEventListener('click', (e: MouseEvent) => {
                if ((<HTMLElement>e.target).getAttribute('disabled')) {
                    return;
                }
                Store.instance.stopGame();
            });

            let cond = `input[type=radio][name=editingMode]`;
            let radioButtons = shadowRoot.querySelectorAll(cond);
            [].forEach.call(radioButtons, (radioButton: HTMLInputElement) => {
                radioButton.addEventListener('change', () => {
                    let mode = {
                        map:      EditingMode.Map,
                        event:    EditingMode.Event,
                        database: EditingMode.Database,
                    }[radioButton.value];
                    Store.instance.updateEditingMode(mode);
                })
            });

            window.addEventListener('load', () => {
                this.stopGame();
            });
        }

        public render(info: RenderInfo) {
            let editingMode = info.editingMode;
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let value = {
                [EditingMode.Map]:      'map',
                [EditingMode.Event]:    'event',
                [EditingMode.Database]: 'database',
            }[editingMode];
            let cond = `input[type=radio][name=editingMode][value=${ value }]`;
            let radioButton = <HTMLInputElement>shadowRoot.querySelector(cond);
            radioButton.checked = true;
        }

        public playGame() {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let buttons = <HTMLElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('button'));
            for (let button of buttons) {
                if (button.id !== 'stop') {
                    button.setAttribute('disabled', 'disabled');
                } else {
                    button.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('label input'));
            for (let input of inputs) {
                input.disabled = true;
            }
        }

        public stopGame() {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let buttons = <HTMLElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('button'));
            for (let button of buttons) {
                if (button.id === 'stop') {
                    button.setAttribute('disabled', 'disabled');
                } else {
                    button.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('label input'));
            for (let input of inputs) {
                input.disabled = false;
            }
        }
    }
}

(() => {
    (<any>editor.ToolbarElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-toolbar', editor.ToolbarElement);
})();
