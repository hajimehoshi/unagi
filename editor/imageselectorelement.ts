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
    export class ImageSelectorElement {
        private images_: data.Image[];

        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-image-selector-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let self = <HTMLElement><any>this;
            self.style.width = self.getAttribute('width') + 'px';
            self.style.height = self.getAttribute('height') + 'px';

            shadowRoot.querySelector('div.image').addEventListener('click', () => {
                let selector = <HTMLElement>shadowRoot.querySelector('div.selector');
                selector.style.display = 'block';
            });
        }

        public render(game: data.Game, imageId: string): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let img = <HTMLImageElement>shadowRoot.querySelector('img');

            if (!imageId) {
                img.src = '';
                return;
            }
            let image = this.imageById(game.images, imageId);
            if (!image) {
                img.src = '';
                return;
            }
            if (img.src === image.data) {
                return;
            }
            img.src = image.data;
        }

        private imageById(images: data.Image[], id: string): data.Image {
            for (let image of images) {
                if (image.id === id) {
                    return image;
                }
            }
            return null;
        }
    }
}

(() => {
    (<any>editor.ImageSelectorElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-image-selector', editor.ImageSelectorElement);
})();
