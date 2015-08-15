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

            let styleTemplate = <HTMLTemplateElement>document.getElementById('unagi-dialog-style-template');
            let styleClone = document.importNode(styleTemplate.content, true);
            shadowRoot.appendChild(styleClone);

            let canvas = <HTMLCanvasElement>shadowRoot.querySelector('canvas.current');
            canvas.addEventListener('click', (e: MouseEvent) => {
                let dialog = <any>shadowRoot.querySelector('dialog');
                if (dialog.open) {
                    return;
                }
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
                e.stopPropagation();
                let rect = dialog.getBoundingClientRect();
                if (e.clientY <= rect.top + rect.height && rect.top <= e.clientY &&
                    e.clientX <= rect.left + rect.width && rect.left <= e.clientX) {
                    return;
                }
                dialog.close();
            });

            let dialogList = <HTMLElement>dialog.querySelector('unagi-listbox');
            dialogList.addEventListener('selectedItemChanged', (e: CustomEvent) => {
                Store.instance.updateGameData(this.path, e.detail.id);
            });

            let dialogCanvas = <HTMLCanvasElement>dialog.querySelector('dialog canvas');
            dialogCanvas.width = 383;
            dialogCanvas.height = 384;
        }

        public get path(): string {
            return (<HTMLElement><any>this).getAttribute('path');
        }

        public set path(path: string) {
            (<HTMLElement><any>this).setAttribute('path', path);
        }

        private drawAtCenter(canvas: HTMLCanvasElement, img: HTMLImageElement, offsetX: number, offsetY: number): void {
            let context = canvas.getContext('2d');

            context.save();
            (<any>context).imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            let sx = Math.max(0, (img.width - canvas.width)/2 + offsetX);
            let sy = Math.max(0, (img.height - canvas.height)/2 + offsetY);
            let dx = Math.max(0, (canvas.width - img.width)/2);
            let dy = Math.max(0, (canvas.height - img.height)/2);
            context.drawImage(img, sx, sy, img.width, img.height, dx, dy, img.width, img.height);

            context.restore();
        }

        public render(game: data.Game, imageId: string): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;

            let img = new Image();
            let image = this.imageById(game.images, imageId);
            img.src = image.data;

            let canvas = <HTMLCanvasElement>shadowRoot.querySelector('canvas.current');
            let srcOffsetX = (<HTMLElement><any>this).getAttribute('srcoffsetx');
            let srcOffsetY = (<HTMLElement><any>this).getAttribute('srcoffsety');
            let offsetX = (srcOffsetX !== null) ? parseInt(srcOffsetX, 10) : 0;
            let offsetY = (srcOffsetY !== null) ? parseInt(srcOffsetY, 10) : 0;
            this.drawAtCenter(canvas, img, offsetX, offsetY);

            let dialog = <any>shadowRoot.querySelector('dialog');
            let dialogList = <ListBoxElement><any>dialog.querySelector('unagi-listbox');
            let typesAttr = (<HTMLElement><any>this).getAttribute('types');
            if (typesAttr === null) {
                typesAttr = '';
            }
            let types = typesAttr.split(' ').map(t => data.ImageType[t]);
            let items = game.images.filter(i => types.indexOf(i.type) >= 0).map(i => ({
                title: i.name,
                id:    i.id,
            }));
            items.unshift({
                title: '(None)',
                id:    data.NullImage.id,
            });
            dialogList.replaceItems(items);
            dialogList.selectedId = imageId;

            let dialogCanvas = <HTMLCanvasElement>dialog.querySelector('dialog canvas');
            this.drawAtCenter(dialogCanvas, img, 0, 0);
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
