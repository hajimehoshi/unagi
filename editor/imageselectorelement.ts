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
        private path_: string;
        private imageXPath_: string;
        private imageYPath_: string;
        private xNum_: number;
        private yNum_: number;
        private imageWidth_: number;
        private imageHeight_: number;

        private createdCallback(): void {
            this.xNum_ = 1;
            this.yNum_ = 1;
            this.imageWidth_ = 0;
            this.imageHeight_ = 0;

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
                if (e.clientY < rect.top + rect.height && rect.top <= e.clientY &&
                    e.clientX < rect.left + rect.width && rect.left <= e.clientX) {
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
            dialogCanvas.addEventListener('click', (e: MouseEvent) => {
                this.onClickDialogCanvas(e);
            });
        }

        public get path(): string { return this.path_; }
        public set path(path: string) { this.path_ = path; }
        public get imageXPath(): string { return this.imageXPath_; }
        public set imageXPath(path: string) { this.imageXPath_ = path; }
        public get imageYPath(): string { return this.imageYPath_; }
        public set imageYPath(path: string) { this.imageYPath_ = path; }

        public get xNum(): number { return this.xNum_; }
        public set xNum(xNum: number) { this.xNum_ = xNum; }
        public get yNum(): number { return this.yNum_; }
        public set yNum(yNum: number) { this.yNum_ = yNum; }

        private drawAtCenter(canvas: HTMLCanvasElement, img: HTMLImageElement, sx: number, sy: number, width: number, height: number): void {
            let context = canvas.getContext('2d');

            context.save();
            (<any>context).imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            let dx = ((canvas.width - width)/2)|0;
            let dy = ((canvas.height - height)/2)|0;
            context.drawImage(img, sx, sy, width, height, dx, dy, width, height);

            context.restore();
        }

        public render(game: data.Game, imageId: string, imageX: number, imageY: number): void {
            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;

            let img = new Image();
            let image = this.imageById(game.images, imageId);
            img.src = image.data;
            this.imageWidth_ = img.width;
            this.imageHeight_ = img.height;

            let canvas = <HTMLCanvasElement>shadowRoot.querySelector('canvas.current');
            let src = (<HTMLElement><any>this).getAttribute('src');
            if (src !== null) {
                let x = src.split(',');
                let srcX = parseInt(x[0], 10);
                let srcY = parseInt(x[1], 10);
                let srcWidth = parseInt(x[2], 10);
                let srcHeight = parseInt(x[3], 10);
                this.drawAtCenter(canvas, img, srcX, srcY, srcWidth, srcHeight);
            } else {
                let width  = (img.width / this.xNum)|0;
                let height = (img.height / this.yNum)|0;
                let sx = imageX * width;
                let sy = imageY * height;
                this.drawAtCenter(canvas, img, sx, sy, width, height);
            }

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
            this.drawAtCenter(dialogCanvas, img, 0, 0, img.width, img.height);

            if (1 < this.xNum && 1 < this.yNum) {
                let frameWidth  = (img.width / this.xNum_)|0;
                let frameHeight = (img.height / this.yNum_)|0;
                let frameX = (((dialogCanvas.width - img.width)/2)|0) + imageX * frameWidth;
                let frameY = (((dialogCanvas.height - img.height)/2)|0) + imageY * frameHeight;
                let dialogContext = dialogCanvas.getContext('2d');
                Canvas.drawFrame(dialogContext, frameX, frameY, frameWidth, frameHeight);
            }
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

        private onClickDialogCanvas(e: MouseEvent): void {
            e.preventDefault();
            if (this.xNum === 1 && this.yNum === 1) {
                return;
            }

            let shadowRoot = (<HTMLElementES6><any>this).shadowRoot;
            let dialog = <any>shadowRoot.querySelector('dialog');
            let dialogCanvas = <HTMLCanvasElement>dialog.querySelector('dialog canvas');
            let rect = dialogCanvas.getBoundingClientRect();
            let imgX = ((dialogCanvas.width - this.imageWidth_)/2)|0;
            let imgY = ((dialogCanvas.height - this.imageHeight_)/2)|0;
            let x = e.clientX - rect.left - imgX;
            let y = e.clientY - rect.top - imgY;
            if (x < 0 || this.imageWidth_ <= x || y < 0 || this.imageHeight_ <= y) {
                return;
            }
            let newImageX = (x / (this.imageWidth_ / this.xNum_))|0;
            let newImageY = (y / (this.imageHeight_ / this.yNum_))|0;
            Store.instance.updateGameData(this.imageXPath_, newImageX);
            Store.instance.updateGameData(this.imageYPath_, newImageY);
        }
    }
}

(() => {
    (<any>editor.ImageSelectorElement.prototype).__proto__ = HTMLElement.prototype;
    (<editor.HTMLDocumentES6>document).registerElement('unagi-image-selector', editor.ImageSelectorElement);
})();
