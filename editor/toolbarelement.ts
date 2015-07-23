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
        private static menuitemOf(e: HTMLElement): HTMLElement {
            let parent = e.parentElement;
            while (parent) {
                if (parent.nodeName === 'MENUITEM') {
                    return parent;
                }
                parent = parent.parentElement;
            }
            return null;
        }

        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-toolbar-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            shadowRoot.querySelector('#play img').addEventListener('click', (e: MouseEvent) => {
                let img = <HTMLImageElement>e.target;
                let menuitem = ToolbarElement.menuitemOf(img);
                if (!menuitem) {
                    return;
                }
                if (menuitem.getAttribute('disabled')) {
                    return;
                }
                Dispatcher.onPlayGame();
            });
            shadowRoot.querySelector('#stop img').addEventListener('click', (e: MouseEvent) => {
                let img = <HTMLImageElement>e.target;
                let menuitem = ToolbarElement.menuitemOf(img);
                if (!menuitem) {
                    return;
                }
                if (menuitem.getAttribute('disabled')) {
                    return;
                }
                Dispatcher.onStopGame();
            });

            let cond = `input[type=radio][name=tilesEditingMode]`;
            let radioButtons = shadowRoot.querySelectorAll(cond);
            [].forEach.call(radioButtons, (radioButton: HTMLInputElement) => {
                radioButton.addEventListener('change', () => {
                    let mode: TilesEditingMode;
                    switch (radioButton.value) {
                    case 'map':
                        mode = TilesEditingMode.Map;
                        break;
                    case 'event':
                        mode = TilesEditingMode.Event;
                        break;
                    }
                    Dispatcher.onTilesEditingModeChanged(mode);
                })
            });

            window.addEventListener('load', () => {
                this.stopGame();
            });
        }

        public set tilesEditingMode(tilesEditingMode: TilesEditingMode) {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let value = '';
            switch (tilesEditingMode) {
            case TilesEditingMode.Map:
                value = 'map';
                break;
            case TilesEditingMode.Event:
                value = 'event';
                break;
            }
            let cond = `input[type=radio][name=tilesEditingMode][value=${ value }]`;
            let radioButton = <HTMLInputElement>shadowRoot.querySelector(cond);
            radioButton.checked = true;
        }

        public playGame() {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let menuitems = <HTMLElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('menuitem'));
            for (let menuitem of menuitems) {
                if (menuitem.id !== 'stop') {
                    menuitem.setAttribute('disabled', 'disabled');
                } else {
                    menuitem.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('menuitem input'));
            for (let input of inputs) {
                input.disabled = true;
            }
        }

        public stopGame() {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let menuitems = <HTMLElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('menuitem'));
            for (let menuitem of menuitems) {
                if (menuitem.id === 'stop') {
                    menuitem.setAttribute('disabled', 'disabled');
                } else {
                    menuitem.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(shadowRoot.querySelectorAll('menuitem input'));
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
