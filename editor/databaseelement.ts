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
    export class DatabaseElement {
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-database-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);
        }

        private get toolbar(): DatabaseToolbarElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<DatabaseToolbarElement><any>shadowRoot.querySelector('unagi-database-toolbar'));
        }

        private get actors(): DatabaseActorsElement {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            return (<DatabaseActorsElement><any>shadowRoot.querySelector('unagi-database-actors'));
        }

        public updateGame(game: data.Game): void {
            this.actors.updateGame(game);
        }

        public updateMode(mode: DatabaseMode): void {
            let modeStr = DatabaseMode[mode].toLowerCase();
            this.toolbar.updateMode(mode);
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            [].forEach.call(shadowRoot.querySelectorAll('div.content > *'), (node: Node) => {
                let e = <HTMLElement>node;
                if (e.nodeName.toLowerCase() === `unagi-database-${modeStr}`) {
                    e.style.display = 'block';
                } else {
                    e.style.display = 'none';
                }
            });
        }
    }
}

(() => {
    (<any>editor.DatabaseElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-database', editor.DatabaseElement);
})();
