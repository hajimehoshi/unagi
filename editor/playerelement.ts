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
    export class PlayerElement {
        private game_: data.Game;

        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-player-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let iframe = <HTMLIFrameElement>(shadowRoot.querySelector('iframe'));
            window.addEventListener('message', (e: MessageEvent) => {
                if (e.data === 'quit') {
                    Dispatcher.onStopGame();
                }
            });
            iframe.addEventListener('load', (e) => {
                if (iframe.src === 'about:blank') {
                    return;
                }
                iframe.contentWindow.postMessage(this.game_.toObject(), '*');
            });
        }

        public playGame(game: data.Game) {
            this.game_ = game;
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let iframe = <HTMLIFrameElement>(shadowRoot.querySelector('iframe'));
            iframe.src = './player.html';
            (<HTMLElement><any>this).style.display = 'block';
        }

        public stopGame() {
            this.game_ = null;
            (<HTMLElement><any>this).style.display = 'none';
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let iframe = <HTMLIFrameElement>(shadowRoot.querySelector('iframe'));
            iframe.src = 'about:blank';
        }
    }
}

(() => {
    (<any>editor.PlayerElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-player', editor.PlayerElement);
})();
