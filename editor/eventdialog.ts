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
        private static commandToString(command: data.EventCommand): string {
            let indent = '';
            for (let i = 0; i < command.indent; i++) {
                indent += '    ';
            }
            return `${indent}${command.type} ${JSON.stringify(command.args)}`;
        }

        private static stringToCommand(str: string): data.EventCommand {
            let m = str.match(/^( *)([^ ]+) (.+)$/);
            return {
                type:   m[2],
                args:   JSON.parse(m[3]),
                indent: m[1].length / 2,
            };
        }

        // TODO: Use HTMLDialogElement class in the future
        private element_: any;
        private pagePath_: string;
        private commands_: ListBox;

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

            let passableCheckbox = <HTMLInputElement>this.element_.querySelector("input[name='passable']");
            passableCheckbox.addEventListener('change', () => {
                let path = `${this.pagePath_}.passable`
                Store.instance.updateGameData(path, passableCheckbox.checked);
            });

            this.commands_ = new ListBox(<HTMLElement>this.element_.querySelector('.commands'));
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
            this.pagePath_ = `maps[${mapIndex}].events[${eventIndex}].pages[${pageIndex}]`;
            eventImageSelector.path = `${this.pagePath_}.image`;
            eventImageSelector.imageXPath = `${this.pagePath_}.imageX`;
            eventImageSelector.imageYPath = `${this.pagePath_}.imageY`;
            let page = event.pages[pageIndex];
            if (page.image !== data.NullImage.id) {
                eventImageSelector.xNum = 3;
                eventImageSelector.yNum = 4;
            } else {
                eventImageSelector.xNum = 1;
                eventImageSelector.yNum = 1;
            }
            eventImageSelector.render(game, page.image, page.imageX, page.imageY);

            let passableCheckbox = <HTMLInputElement>this.element_.querySelector("input[name='passable']");
            passableCheckbox.checked = page.passable;

            let commandItems = [];
            for (let i = 0; i < page.commands.length; i++) {
                commandItems.push({
                    title: EventDialog.commandToString(page.commands[i]),
                    tag:   i,
                });
            }
            this.commands_.replaceItems(commandItems);
        }
    }
}
