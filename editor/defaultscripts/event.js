'use strict';

class Event {
    constructor(data) {
        this.data_ = data;
    }

    get x() {
        return this.data_.x;
    }

    get y() {
        return this.data_.y;
    }

    start() {
        this.isProcessing_ = true;
        console.log('start!');
    }

    get isProcessing() {
        return this.isProcessing_;
    }

    get currentPage() {
        // TODO: Choice correct page
        return this.data_.pages[0];
    }

    update() {
        this.isProcessing_ = false;
    }
}
