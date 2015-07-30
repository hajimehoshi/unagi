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
    export class DatabaseContentElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-database-content-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let self = <HTMLElement><any>this;
            let content = shadowRoot.querySelector('div.content');
            while (self.firstChild) {
                content.appendChild(self.firstChild);
            }

            (<HTMLElement><any>this.list).addEventListener('selectedItemChanged', (e: CustomEvent) => {
                let id = <string>e.detail.id;
                Dispatcher.onCurrentActorChanged(id);
            });
        }

        private get list(): ListBoxElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<ListBoxElement><any>shadowRoot.querySelector('unagi-listbox'));
        }

        private get groupName(): string {
            return (<HTMLElement><any>this).getAttribute('groupname');
        }

        private input(name: string): HTMLInputElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return <HTMLInputElement>shadowRoot.querySelector(`input[name="${name}"]`)
        }

        private currentActor(game: data.Game): any {
            let id = this.list.selectedId;
            for (let item of game[this.groupName]) {
                if (id === item.id) {
                    return item;
                }
            }
            return null;
        }

        public updateGame(game: data.Game): void {
            this.list.replaceItems(game[this.groupName].map((item: {id: string, name: string}): ListBoxItem => {
                return {
                    title: item.name,
                    id:    item.id,
                };
            }));
            let id = this.list.selectedId;
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let content = shadowRoot.querySelector('div.content');
            if (!id) {
                content.classList.add('disabled');
                this.input('name').value = '';
                this.input('initialLevel').value = '1';
                return;
            }
            content.classList.remove('disabled');
            let actor = this.currentActor(game);
            this.input('name').value = actor.name;
            this.input('initialLevel').value = actor.initialLevel.toString();
        }
    }
}

(() => {
    (<any>editor.DatabaseContentElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-database-content', editor.DatabaseContentElement);
})();
