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
    export class Toolbar {
        private element_: HTMLElement;

        constructor(element: HTMLElement) {
            this.element_ = element;

            this.element_.querySelector('#playButton').addEventListener('click', (e: MouseEvent) => {
                if ((<HTMLElement>e.target).getAttribute('disabled')) {
                    return;
                }
                Store.instance.playGame();
            });
            let stopButton = <HTMLButtonElement>this.element_.querySelector('#stopButton');
            stopButton.addEventListener('click', (e: MouseEvent) => {
                if ((<HTMLElement>e.target).getAttribute('disabled')) {
                    return;
                }
                Store.instance.stopGame();
            });
            stopButton.disabled = true;

            let cond = `input[type=radio][name=editingMode]`;
            let radioButtons = this.element_.querySelectorAll(cond);
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
            let value = {
                [EditingMode.Map]:      'map',
                [EditingMode.Event]:    'event',
                [EditingMode.Database]: 'database',
            }[editingMode];
            let cond = `input[type=radio][name=editingMode][value=${ value }]`;
            let radioButton = <HTMLInputElement>this.element_.querySelector(cond);
            radioButton.checked = true;
        }

        public playGame() {
            let buttons = <HTMLElement[]>Array.prototype.slice.call(this.element_.querySelectorAll('button'));
            for (let button of buttons) {
                if (button.id !== 'stopButton') {
                    button.setAttribute('disabled', 'disabled');
                } else {
                    button.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(this.element_.querySelectorAll('label input'));
            for (let input of inputs) {
                input.disabled = true;
            }
        }

        public stopGame() {
            let buttons = <HTMLElement[]>Array.prototype.slice.call(this.element_.querySelectorAll('button'));
            for (let button of buttons) {
                if (button.id === 'stopButton') {
                    button.setAttribute('disabled', 'disabled');
                } else {
                    button.removeAttribute('disabled');
                }
            }
            let inputs = <HTMLInputElement[]>Array.prototype.slice.call(this.element_.querySelectorAll('label input'));
            for (let input of inputs) {
                input.disabled = false;
            }
        }
    }
}
