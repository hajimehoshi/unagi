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
    export class EventDialog {
        // TODO: Use HTMLDialogElement in the future
        private element_: any;

        constructor(element: any) {
            this.element_ = element;

            this.element_.addEventListener('click', (e: MouseEvent) => {
                e.stopPropagation();
                let rect = this.element_.getBoundingClientRect();
                if (e.clientY <= rect.top + rect.height && rect.top <= e.clientY &&
                    e.clientX <= rect.left + rect.width && rect.left <= e.clientX) {
                    return;
                }
                this.element_.close();
            });
        }

        public get open(): boolean {
            return this.element_.open;
        }

        public showModal(): void {
            this.element_.showModal();
        }

        public render(game: data.Game, map: Map, event: data.Event): void {
            let eventImageSelector = <ImageSelectorElement>this.element_.querySelector('unagi-image-selector');
            let mapIndex = map.index(game.maps);
            let eventIndex = map.events.indexOf(event);
            let pageIndex = 0;
            let basePath = `maps[${mapIndex}].events[${eventIndex}].pages[${pageIndex}]`;
            eventImageSelector.path = `${basePath}.image`;
            eventImageSelector.imageXPath = `${basePath}.imageX`;
            eventImageSelector.imageYPath = `${basePath}.imageY`;
            let page = event.pages[pageIndex];
            if (page.image !== data.NullImage.id) {
                eventImageSelector.xNum = 3;
                eventImageSelector.yNum = 4;
            } else {
                eventImageSelector.xNum = 1;
                eventImageSelector.yNum = 1;
            }
            eventImageSelector.render(game, page.image, page.imageX, page.imageY);

            let commandsTextArea = <HTMLTextAreaElement>this.element_.querySelector('textarea.commands');
            commandsTextArea.value = JSON.stringify(page.commands, null, '  ');
            commandsTextArea.onchange = (e) => {
                try {
                    let commands = JSON.parse(commandsTextArea.value);
                    let path = `${basePath}.commands`;
                    Store.instance.updateGameData(path, commands);
                } catch (e) {
                    if (e instanceof SyntaxError) {
                        console.error(e);
                        return;
                    }
                    throw e;
                }
            };
        }
    }
}
