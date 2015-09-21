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
    export class View {
        private toolbar_: Toolbar;
        private palette_: Palette;
        private tiles_: Tiles;
        private database_: Database;
        private mapList_: ListBox;

        // TODO: Remove this
        private tileSetImage_: HTMLImageElement;

        constructor() {
            // TODO: Remove this
            let styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-dialog-style-template');
            let styleClone = document.importNode(styleTemplate.content, true);
            document.querySelector('head').appendChild(styleClone);
            styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-listbox-style-template');
            styleClone = document.importNode(styleTemplate.content, true);
            document.querySelector('head').appendChild(styleClone);

            this.toolbar_ = new Toolbar(<HTMLElement>document.querySelector('#toolbar'));
            this.palette_ = new Palette(<HTMLElement>document.querySelector('#palette'));
            this.tiles_ = new Tiles(<HTMLElement>document.querySelector('#tiles'));
            this.database_ = new Database(<HTMLElement>document.querySelector('#database'));

            this.tileSetImage_ = new Image();
            this.tileSetImage_.src = defaultImages.filter(x => x.name === 'tileset')[0].data;

            window.addEventListener('message', (e: MessageEvent) => {
                if (e.data === 'quit') {
                    Store.instance.stopGame();
                }
            });

            this.mapList_ = new ListBox();
            this.mapList_.element.addEventListener('selectedItemChanged', (e: CustomEvent) => {
                Store.instance.updateCurrentMap(e.detail.id);
            });
            this.mapList_.element.addEventListener('contextMenuNew', (e: CustomEvent) => {
                console.log('New Map: not implemented yet');
            });

            let div = document.createElement('div');
            div.innerHTML = '<div style="width: 256px; height: 256px;">';
            div.style.height = '128px';
            div.style.width = '128px';

            document.body.appendChild(div);
            div.style.overflow = 'scroll';
            let scrollBarWidth = div.offsetWidth - div.clientWidth;
            document.body.removeChild(div);

            let palette = <HTMLElement>document.querySelector('#palette')
            palette.style.width = `calc(256px + ${scrollBarWidth}px)`;

            let maps = <HTMLElement>document.querySelector('.maps');
            maps.appendChild(this.mapList_.element);
            maps.style.width = `calc(256px + ${scrollBarWidth}px)`;

            let tiles = <HTMLElement>document.querySelector('#tiles')
            tiles.style.left = `calc(256px + ${scrollBarWidth}px + 1px)`;
            tiles.style.width = `calc(100% - 256px - ${scrollBarWidth}px - 1px)`;
        }

        private get mapList(): ListBox {
            return this.mapList_;
        }

        public render(game: data.Game, info: RenderInfo): void {
            this.toolbar_.render(info);
            this.database_.render(game, info);

            let maps = game ? game.maps : [];
            let items = maps.map((map: data.Map): ListBoxItem => {
                return {
                    title: map.name,
                    id:    map.id,
                };
            });
            this.mapList.replaceItems(items);
            if (info.mapId) {
                this.mapList.select(info.mapId);
            }

            // TODO: Move this to store?
            info.tileSetImage = this.tileSetImage_;

            this.tiles_.render(game, info);
            this.palette_.render(info);
        }

        public playGame(game: data.Game): void {
            this.toolbar_.playGame();

            let iframe = <HTMLIFrameElement>document.querySelector('iframe.player');
            let host = window.location.host;
            iframe.src = `//player.${host}/player.html`;
            iframe.style.display = 'block';
            let f = (e) => {
                iframe.contentWindow.postMessage(game, '*');
                iframe.removeEventListener('load', f);
            };
            iframe.addEventListener('load', f);
        }

        public stopGame(): void {
            this.toolbar_.stopGame();

            let iframe = <HTMLIFrameElement>document.querySelector('iframe.player');
            iframe.src = 'about:blank';
            iframe.style.display = 'none';
        }
    }
}
