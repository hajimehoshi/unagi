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

            let img = shadowRoot.querySelector('#play img');
            img.addEventListener('click', () => {
                Dispatcher.onPlayGame();
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
    }
}

(() => {
    (<any>editor.ToolbarElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-toolbar', editor.ToolbarElement);
})();
