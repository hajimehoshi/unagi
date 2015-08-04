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
        private createdCallback(): void {
            let template = <HTMLTemplateElement>document.getElementById('unagi-image-selector-template');
            let clone = document.importNode(template.content, true);
            let shadowRoot = (<HTMLElementES6><any>this).createShadowRoot();
            shadowRoot.appendChild(clone);

            let canvas = <HTMLCanvasElement>shadowRoot.querySelector('canvas');
            canvas.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                let dialog = <any>shadowRoot.querySelector('dialog');
                dialog.showModal();
            });
            let width = parseInt((<HTMLElement><any>this).getAttribute('width'), 10);
            let height = parseInt((<HTMLElement><any>this).getAttribute('height'), 10);
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            let dialog = <any>shadowRoot.querySelector('dialog');
            dialog.addEventListener('click', (e: MouseEvent) => {
                var rect = dialog.getBoundingClientRect();
                if (e.clientY <= rect.top + rect.height && rect.top <= e.clientY &&
                    e.clientX <= rect.left + rect.width && rect.left <= e.clientX) {
                    return;
                }
                dialog.close();
            });

            let dialogList = <HTMLElement>dialog.querySelector('unagi-listbox');
            dialogList.addEventListener('selectedItemChanged', (e: CustomEvent) => {
                let ce = new CustomEvent('change', {
                    detail: {
                        id: e.detail.id,
                    }
                });
                (<HTMLElement><any>this).dispatchEvent(ce);
            })
        }

        public render(game: data.Game, imageId: string): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;

            let img = new Image();
            let image = this.imageById(game.images, imageId);
            img.src = image.data;
            img.addEventListener('load', () => {
                let canvas = <HTMLCanvasElement>shadowRoot.querySelector('canvas');
                let context = canvas.getContext('2d');
                (<any>context).imageSmoothingEnabled = false;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
            });

            let dialog = <any>shadowRoot.querySelector('dialog');
            let dialogList = <ListBoxElement><any>dialog.querySelector('unagi-listbox');
            let items = game.images.map((image: data.Image): ListBoxItem => {
                return {
                    title: image.name,
                    id:    image.id,
                };
            });
            items.unshift({
                title: '(None)',
                id:    data.NullImage.id,
            });
            dialogList.replaceItems(items);
            dialogList.selectedId = imageId;

            let dialogImg = <HTMLImageElement>dialog.querySelector('img');
            let dialogImage = this.imageById(game.images, dialogList.selectedId);
            dialogImg.src = dialogImage.data
        }

        private imageById(images: data.Image[], id: string): data.Image {
            if (id === data.NullImage.id) {
                return data.NullImage;
            }
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
